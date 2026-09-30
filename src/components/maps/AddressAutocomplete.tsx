import { useState, useRef, useEffect, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { Loader2, Navigation, Building2, Home, MapPinned } from 'lucide-react';
import { Icon } from '@/components/shisa';

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

const fieldStyle = (padLeft: number, padRight: number, hasError?: boolean): React.CSSProperties => ({
  width: '100%',
  background: 'var(--surface)',
  border: `1px solid ${hasError ? 'var(--danger)' : 'var(--line-strong)'}`,
  borderRadius: 'var(--radius-md)',
  padding: `14px ${padRight}px 14px ${padLeft}px`,
  font: '400 15px/22px var(--font-body)',
  color: 'var(--ink)',
  outline: 'none',
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  font: '700 13px/18px var(--font-body)',
  color: 'var(--ink-muted)',
  marginBottom: 8,
};

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

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  };

  const handleSelectPrediction = useCallback(
    (prediction: Prediction) => {
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

            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          } else {
            setInputValue(prediction.description);
            onChange(prediction.description);
          }

          setPredictions([]);
          setActiveIndex(-1);
        }
      );
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
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

  const renderFallbackInput = (showWarning = false) => (
    <div className="w-full">
      {label && <label style={labelStyle}>{label}</label>}
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
          style={{ ...fieldStyle(44, 16, !!error), opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : undefined }}
        />
        <Icon
          name="map-pin"
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--ink-subtle)' }}
        />
      </div>
      {showWarning && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--mielie)' }}>
          Address suggestions unavailable. Please type your full address.
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );

  if (loadError) {
    return renderFallbackInput(true);
  }

  if (!isLoaded) {
    return (
      <div className="w-full">
        {label && <label style={labelStyle}>{label}</label>}
        <div className="relative">
          <div style={{ ...fieldStyle(44, 16), display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-subtle)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
          <Icon
            name="map-pin"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--ink-subtle)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {label && <label style={labelStyle}>{label}</label>}

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
          style={{ ...fieldStyle(44, 40, !!error), opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : undefined }}
        />
        <Icon
          name="map-pin"
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--ink-subtle)' }}
        />

        {isSearching && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin"
            style={{ color: 'var(--ink-subtle)' }}
          />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute z-50 w-full mt-2 overflow-hidden dropdown-appear"
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-float)' }}
        >
          <ul className="py-1 max-h-64 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelectPrediction(prediction)}
                onMouseEnter={() => setActiveIndex(index)}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{ background: index === activeIndex ? 'var(--surface-sunken)' : 'transparent' }}
              >
                <div
                  className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5')}
                  style={{
                    background: index === activeIndex ? 'var(--ink)' : 'var(--surface-sunken)',
                    color: index === activeIndex ? 'var(--surface)' : 'var(--ink-muted)',
                  }}
                >
                  {getPlaceIcon(prediction.types)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--ink)' }}>
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-sm truncate" style={{ color: 'var(--ink-muted)' }}>
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 py-2" style={{ background: 'var(--surface-sunken)', borderTop: '1px solid var(--line)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--ink-subtle)' }}>
              Select an address from the list
            </p>
          </div>
        </div>
      )}

      {isOpen && predictions.length === 0 && inputValue.length >= 3 && !isSearching && (
        <div
          className="absolute z-50 w-full mt-2 p-4"
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-float)' }}
        >
          <div className="flex items-center gap-3" style={{ color: 'var(--ink-muted)' }}>
            <Icon name="map-pin" size={20} />
            <p className="text-sm">No addresses found. Try a different search.</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
