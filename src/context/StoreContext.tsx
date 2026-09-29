import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import api from '@/services/api';
import type { ApiStore } from '@/types';

interface StoreContextType {
  store: ApiStore | null;
  isLoading: boolean;
  error: string | null;
  /** Fetches and sets the active store by slug. No-ops if it's already loaded. */
  loadStore: (slug: string) => Promise<ApiStore | null>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ApiStore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingSlug = useRef<string | null>(null);

  const loadStore = useCallback(async (slug: string): Promise<ApiStore | null> => {
    // Already loaded or already in flight for this exact store — no-op.
    if (store?.slug === slug || loadingSlug.current === slug) {
      return store?.slug === slug ? store : null;
    }

    loadingSlug.current = slug;
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getStore(slug);
      if (response.data?.data) {
        setStore(response.data.data);
        return response.data.data;
      }
      setError(response.error || 'Store not found');
      setStore(null);
      return null;
    } catch (err) {
      setError('Failed to load store');
      setStore(null);
      return null;
    } finally {
      setIsLoading(false);
      loadingSlug.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  return (
    <StoreContext.Provider value={{ store, isLoading, error, loadStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Helper hook mirroring the old useDeliverySettings() shape, now store-scoped.
export function useDeliverySettings() {
  const { store, isLoading } = useStore();

  return {
    isLoading,
    deliveryFee: store?.delivery_fee ?? 0,
    deliveryRadiusKm: store?.delivery_radius_km ?? 0,
    storeLatitude: store?.latitude ?? null,
    storeLongitude: store?.longitude ?? null,
    minimumOrderAmount: store?.minimum_order_amount ?? 0,
    isStoreOpen: store?.is_open ?? true,
  };
}
