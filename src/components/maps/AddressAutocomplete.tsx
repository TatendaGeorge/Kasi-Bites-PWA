import { useState, useRef, useEffect, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { MapPin, Loader2, Navigation, Building2, Home, MapPinned } from 'lucide-react';

const libraries: ('places')[] = ['places'];

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

// Get appropriate icon based on place type
function getPlaceIcon(types: string[]) {
  if (types.includes('street_address') || types.includes('route')) {
    return <Navigation className="w-4 h-4" />;
  }
  if (types.includes('establishment') || types.includes('point_of_interest')) {
    return <Building2 className="w-4 h-4" />;
  }
  if (types.includes('premise') || types.includes('subpremise')) {
    return <Home className="w-4 h-4" />;
  }
  return <MapPinned className="w-4 h-4" />;
}

export function AddressAutocomplete({
  value,
  onChange,
  error,
  label,
  placeholder = 'Start typing your address...',
  disabled = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  // Initialize services when loaded
  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required but not displayed)
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteServiceRef.current || input.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'za' },
        sessionToken: sessionTokenRef.current!,
        types: ['address'],
      },
      (results, status) => {
        setIsSearching(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results as Prediction[]);
          setIsOpen(true);
          setActiveIndex(-1);
        } else {
          setPredictions([]);
          setIsOpen(false);
        }
      }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent without coordinates

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  };

  const handleSelectPrediction = useCallback((prediction: Prediction) => {
    if (!placesServiceRef.current) return;

    setIsSearching(true);
    setIsOpen(false);

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['formatted_address', 'geometry'],
        sessionToken: sessionTokenRef.current!,
      },
      (place, status) => {
        setIsSearching(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const address = place.formatted_address || prediction.description;
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();

          setInputValue(address);
          onChange(address, lat, lng);

          // Create new session token for next search
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        } else {
          // Fallback to prediction description
          setInputValue(prediction.description);
          onChange(prediction.description);
        }

        setPredictions([]);
        setActiveIndex(-1);
      }
    );
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < predictions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : predictions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < predictions.length) {
          handleSelectPrediction(predictions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (predictions.length > 0) {
      setIsOpen(true);
    }
  };

  // Fallback input for errors or loading
  const renderFallbackInput = (showWarning = false) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full bg-gray-100 border border-gray-200 rounded-xl',
            'pl-11 pr-4 py-3.5 text-base text-black placeholder-gray-400',
            'outline-none transition-all duration-150',
            'focus:border-black focus:ring-2 focus:ring-black/10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      {showWarning && (
        <p className="mt-1.5 text-sm text-amber-600">
          Address suggestions unavailable. Please type your full address.
        </p>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );

  if (loadError) {
    return renderFallbackInput(true);
  }

  if (!isLoaded) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <div
            className={cn(
              'w-full bg-gray-100 border border-gray-200 rounded-xl',
              'pl-11 pr-4 py-3.5 text-base text-gray-400',
              'flex items-center gap-2'
            )}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={cn(
            'w-full bg-gray-100 border border-gray-200 rounded-xl',
            'pl-11 pr-10 py-3.5 text-base text-black placeholder-gray-400',
            'outline-none transition-all duration-150',
            'focus:border-black focus:ring-2 focus:ring-black/10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

        {/* Loading indicator */}
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Custom Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          className={cn(
            'absolute z-50 w-full mt-2',
            'bg-white rounded-xl border border-gray-200',
            'shadow-lg shadow-black/10',
            'overflow-hidden',
            'dropdown-appear'
          )}
        >
          <ul className="py-1 max-h-64 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelectPrediction(prediction)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                  index === activeIndex
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                  index === activeIndex
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {getPlaceIcon(prediction.types)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium truncate',
                    index === activeIndex ? 'text-black' : 'text-gray-900'
                  )}>
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Subtle footer - optional, can be removed entirely */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Select an address from the list
            </p>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && predictions.length === 0 && inputValue.length >= 3 && !isSearching && (
        <div
          className={cn(
            'absolute z-50 w-full mt-2',
            'bg-white rounded-xl border border-gray-200',
            'shadow-lg shadow-black/10 p-4'
          )}
        >
          <div className="flex items-center gap-3 text-gray-500">
            <MapPin className="w-5 h-5" />
            <p className="text-sm">No addresses found. Try a different search.</p>
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
