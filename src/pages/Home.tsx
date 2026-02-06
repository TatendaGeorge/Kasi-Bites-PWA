import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Loader2, RefreshCw } from 'lucide-react';
import Logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import api from '@/services/api';
import type { ApiProduct } from '@/types';

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🍽️' },
  { id: 'fries', name: 'Fries', emoji: '🍟' },
  { id: 'combos', name: 'Combos', emoji: '🍔' },
  { id: 'drinks', name: 'Drinks', emoji: '🥤' },
];

export default function Home() {
  const { itemCount } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getProducts();
      if (response.data?.products) {
        setProducts(response.data.products);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' ||
        product.name.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory && product.is_available;
    });
  }, [products, searchQuery, selectedCategory]);

  // Featured products - those marked as featured in the admin
  const featuredProducts = useMemo(() => {
    return products.filter(product => product.is_featured && product.is_available);
  }, [products]);

  const handleOpenModal = (product: ApiProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

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
          onClick={fetchProducts}
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
          <div>
            <img src={Logo} alt="Logo" className="w-15 h-15" />
          </div>
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
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Category Pills - Mobile */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Desktop Category Icons */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="px-8 py-4">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex flex-col items-center gap-2 min-w-fit transition-opacity',
                  selectedCategory === category.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                )}
              >
                <div className={cn(
                  'text-4xl transition-transform',
                  selectedCategory === category.id && 'scale-110'
                )}>
                  {category.emoji}
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  selectedCategory === category.id ? 'text-black' : 'text-gray-600'
                )}>
                  {category.name}
                </span>
                {selectedCategory === category.id && (
                  <div className="h-0.5 w-full bg-black rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-4 lg:px-8 py-3 lg:py-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 lg:p-6 text-white flex items-center justify-between lg:max-w-2xl">
          <div>
            <h3 className="text-lg lg:text-xl font-bold">Free Delivery</h3>
            <p className="text-sm lg:text-base opacity-90">On orders over R150</p>
          </div>
          <div className="text-4xl lg:text-5xl">🚚</div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-4 lg:py-6">
          <div className="flex justify-between items-center px-4 lg:px-8 mb-3 lg:mb-4">
            <h2 className="text-xl lg:text-2xl font-bold">Featured</h2>
            <Link to="/" className="text-orange-500 text-sm font-medium hover:underline">
              See all
            </Link>
          </div>
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="overflow-x-auto no-scrollbar lg:overflow-visible">
            <div className="flex gap-3 px-4 lg:hidden">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-40 flex-shrink-0">
                  <ProductCard product={product} onOpenModal={handleOpenModal} />
                </div>
              ))}
            </div>
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onOpenModal={handleOpenModal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products Grid */}
      <section className="py-4 lg:py-6 px-4 lg:px-8">
        <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">All Items</h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onOpenModal={handleOpenModal} />
            ))}
          </div>
        )}
      </section>

      {/* Product Modal (Desktop only) */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
