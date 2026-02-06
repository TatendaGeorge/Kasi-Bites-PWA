import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/services/api';

interface StoreSettings {
  store_name: string;
  store_address: string | null;
  store_phone: string | null;
  store_latitude: number | null;
  store_longitude: number | null;
  delivery_fee: number;
  delivery_radius_km: number;
  minimum_order_amount: number;
  is_store_open: boolean;
}

interface StoreSettingsContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Default values (fallback)
const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Kasi Bites',
  store_address: null,
  store_phone: null,
  store_latitude: -33.011664,
  store_longitude: 27.866664,
  delivery_fee: 30,
  delivery_radius_km: 0.5,
  minimum_order_amount: 0,
  is_store_open: true,
};

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getStoreSettings();
      if (response.data?.data) {
        setSettings({
          store_name: response.data.data.store_name || DEFAULT_SETTINGS.store_name,
          store_address: response.data.data.store_address,
          store_phone: response.data.data.store_phone,
          store_latitude: response.data.data.store_latitude ?? DEFAULT_SETTINGS.store_latitude,
          store_longitude: response.data.data.store_longitude ?? DEFAULT_SETTINGS.store_longitude,
          delivery_fee: response.data.data.delivery_fee ?? DEFAULT_SETTINGS.delivery_fee,
          delivery_radius_km: response.data.data.delivery_radius_km ?? DEFAULT_SETTINGS.delivery_radius_km,
          minimum_order_amount: response.data.data.minimum_order_amount ?? DEFAULT_SETTINGS.minimum_order_amount,
          is_store_open: response.data.data.is_store_open ?? DEFAULT_SETTINGS.is_store_open,
        });
      } else {
        // Use defaults if API returns no data
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error('Failed to fetch store settings:', err);
      setError('Failed to load store settings');
      // Use defaults on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ settings, isLoading, error, refetch: fetchSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): StoreSettingsContextType {
  const context = useContext(StoreSettingsContext);
  if (context === undefined) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
}

// Helper hook to get specific settings with defaults
export function useDeliverySettings() {
  const { settings, isLoading } = useStoreSettings();

  return {
    isLoading,
    deliveryFee: settings?.delivery_fee ?? DEFAULT_SETTINGS.delivery_fee,
    deliveryRadiusKm: settings?.delivery_radius_km ?? DEFAULT_SETTINGS.delivery_radius_km,
    storeLatitude: settings?.store_latitude ?? DEFAULT_SETTINGS.store_latitude,
    storeLongitude: settings?.store_longitude ?? DEFAULT_SETTINGS.store_longitude,
    minimumOrderAmount: settings?.minimum_order_amount ?? DEFAULT_SETTINGS.minimum_order_amount,
    isStoreOpen: settings?.is_store_open ?? DEFAULT_SETTINGS.is_store_open,
  };
}
