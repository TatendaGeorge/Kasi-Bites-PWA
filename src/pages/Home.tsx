import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Loader2, RefreshCw, Store as StoreIcon } from 'lucide-react';
import Logo from '@/assets/kasibites-logo.svg';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import type { ApiStore } from '@/types';

export default function Home() {
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
    } catch (err) {
      setError('Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stores, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchStores}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-nav lg:pb-0">
      {/* Header - Mobile only */}
      <header className="sticky top-0 z-40 bg-white safe-top lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <img src={Logo} alt="Kasi Bites" className="h-10" />
          <Link
            to="/cart"
            className="relative w-10 h-10 flex items-center justify-center"
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search Bar - Mobile */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold mb-1">Stores near you</h1>
          <p className="text-gray-500">Order from any store on Kasi Bites</p>
        </div>
        <div className="px-8 pb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <section className="py-4 lg:py-6 px-4 lg:px-8">
        {filteredStores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No stores found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                to={`/store/${store.slug}`}
                className="block group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full aspect-[16/9] bg-gray-100">
                  {store.cover_image_url ? (
                    <img
                      src={store.cover_image_url}
                      alt={store.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                      <StoreIcon className="w-10 h-10 text-orange-300" />
                    </div>
                  )}
                  {!store.is_open && (
                    <span className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Closed
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-base line-clamp-1">{store.name}</p>
                  {store.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">{store.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Delivery from R{store.delivery_fee.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
