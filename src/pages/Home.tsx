import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import type { ApiStore } from '@/types';
import { MobileHeader, SearchField, SectionHeader, StoreCard, PromoBanner, Button } from '@/components/shisa';

export default function Home() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [stores, setStores] = useState<ApiStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getStores();
      if (response.data?.data) {
        setStores(response.data.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch {
      setError('Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStores = useMemo(
    () => stores.filter((store) => store.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [stores, searchQuery]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--flame)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4" style={{ minHeight: '100dvh' }}>
        <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
          {error}
        </p>
        <Button onClick={fetchStores}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="pb-nav lg:pb-0" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Mobile header */}
      <div className="lg:hidden safe-top sh-pad" style={{ background: 'var(--bg)' }}>
        <MobileHeader cart={itemCount} onSearchClick={() => {}} onCartClick={() => navigate('/cart')} />
        <div className="mt-3">
          <SearchField
            placeholder="Search for stores…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sh-pad lg:px-8 lg:py-6 sh-stack">
        <div className="hidden lg:block">
          <PromoBanner
            title="Kasi food, hot from the corner."
            body="Order from spaza shops, kota spots and shisanyama near you."
            cta="Browse stores"
            image="shisanyama"
          />
        </div>

        <SectionHeader title="Stores near you" action={false} />

        {filteredStores.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--ink-muted)' }}>
            No stores found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                name={store.name}
                image={store.cover_image_url || 'shisanyama'}
                fee={store.delivery_fee > 0 ? `R${store.delivery_fee.toFixed(0)} delivery` : 'R0 delivery'}
                distance={!store.is_open ? 'Closed' : undefined}
                cta={false}
                width="100%"
                onClick={() => navigate(`/store/${store.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
