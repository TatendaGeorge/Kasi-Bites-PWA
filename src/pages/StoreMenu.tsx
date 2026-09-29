import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import api from '@/services/api';
import type { ApiProduct } from '@/types';

export default function StoreMenu() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { store, loadStore, isLoading: isLoadingStore } = useStore();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadStore(slug);
    fetchProducts(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProducts = async (storeSlug: string) => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const response = await api.getStoreProducts(storeSlug);
      if (response.data?.products) {
        setProducts(response.data.products);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Categories derived from this store's own products (each store has its own menu structure)
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      if (product.category) {
        seen.set(product.category.slug, product.category.name);
      }
    }
    return [{ slug: 'all', name: 'All' }, ...Array.from(seen, ([slug, name]) => ({ slug, name }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category?.slug === selectedCategory;
      return matchesSearch && matchesCategory && product.is_available;
    });
  }, [products, searchQuery, selectedCategory]);

  const featuredProducts = useMemo(() => {
    return products.filter((product) => product.is_featured && product.is_available);
  }, [products]);

  const handleOpenModal = (product: ApiProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const isLoading = isLoadingStore || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">{error || 'Store not found'}</p>
        <button
          onClick={() => (slug ? fetchProducts(slug) : navigate('/'))}
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
          <Link to="/" className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bold text-lg line-clamp-1 flex-1 text-center px-2">{store.name}</h1>
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
              placeholder={`Search ${store.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Category Pills - Mobile */}
        {categories.length > 1 && (
          <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedCategory === category.slug
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="px-8 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-3">
            <ArrowLeft className="w-4 h-4" />
            All stores
          </Link>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          {store.description && <p className="text-gray-500 mt-1">{store.description}</p>}
        </div>

        {categories.length > 1 && (
          <div className="px-8 pb-4">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedCategory === category.slug
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!store.is_open && (
        <div className="mx-4 lg:mx-8 mt-3 lg:mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
          This store is currently closed — you can browse, but ordering isn't available right now.
        </div>
      )}

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-4 lg:py-6">
          <div className="flex justify-between items-center px-4 lg:px-8 mb-3 lg:mb-4">
            <h2 className="text-xl lg:text-2xl font-bold">Featured</h2>
          </div>
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="overflow-x-auto no-scrollbar lg:overflow-visible">
            <div className="flex gap-3 px-4 lg:hidden">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-40 flex-shrink-0">
                  <ProductCard product={product} storeSlug={store.slug} onOpenModal={handleOpenModal} />
                </div>
              ))}
            </div>
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} storeSlug={store.slug} onOpenModal={handleOpenModal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products Grid */}
      <section className="py-4 lg:py-6 px-4 lg:px-8">
        <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Menu</h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={store.slug} onOpenModal={handleOpenModal} />
            ))}
          </div>
        )}
      </section>

      {/* Product Modal (Desktop only) */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          store={store}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
