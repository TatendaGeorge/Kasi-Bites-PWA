import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import api from '@/services/api';
import type { ApiProduct } from '@/types';
import { Header } from '@/components/layout/Header';
import { SearchField, Chip, SectionHeader, IconButton, Button, Icon } from '@/components/shisa';

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
    } catch {
      setError('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

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

  const featuredProducts = useMemo(
    () => products.filter((product) => product.is_featured && product.is_available),
    [products]
  );

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
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--flame)' }} />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center p-4" style={{ minHeight: '100dvh' }}>
        <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
          {error || 'Store not found'}
        </p>
        <Button onClick={() => (slug ? fetchProducts(slug) : navigate('/'))}>Try again</Button>
      </div>
    );
  }

  const CategoryRail = (
    <div className="sh-hscroll">
      {categories.map((category) => (
        <Chip
          key={category.slug}
          label={category.name}
          variant="filter"
          active={selectedCategory === category.slug}
          onClick={() => setSelectedCategory(category.slug)}
        />
      ))}
    </div>
  );

  return (
    <div className="pb-nav lg:pb-0" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Mobile header */}
      <div className="lg:hidden">
        <Header
          title={store.name}
          showBack
          rightContent={<IconButton icon="shopping-cart" label="Cart" badge={itemCount} onClick={() => navigate('/cart')} />}
        />
        <div className="sh-pad" style={{ paddingTop: 0 }}>
          <SearchField
            placeholder={`Search ${store.name}…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {categories.length > 1 && <div className="px-4 pb-3">{CategoryRail}</div>}
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block sh-pad lg:px-8 lg:py-6" style={{ borderBottom: '1px solid var(--line)' }}>
        <Link to="/" className="sh-link inline-flex items-center gap-2 mb-3">
          <Icon name="arrow-left" size={16} />
          All stores
        </Link>
        <h1 style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>{store.name}</h1>
        {store.description && (
          <p className="mt-1" style={{ color: 'var(--ink-muted)' }}>
            {store.description}
          </p>
        )}
        {categories.length > 1 && <div className="mt-4">{CategoryRail}</div>}
      </div>

      {!store.is_open && (
        <div
          className="mx-4 lg:mx-8 mt-3 lg:mt-4"
          style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--mielie)', color: 'var(--ink)', fontSize: 14 }}
        >
          This store is currently closed — you can browse, but ordering isn't available right now.
        </div>
      )}

      {featuredProducts.length > 0 && (
        <section className="py-4 lg:py-6">
          <div className="sh-pad lg:px-8">
            <SectionHeader title="Featured" action={false} />
          </div>
          <div className="lg:hidden sh-hscroll px-4">
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
        </section>
      )}

      <section className="py-4 lg:py-6 sh-pad lg:px-8">
        <SectionHeader title="Menu" action={false} />
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--ink-muted)' }}>
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 mt-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={store.slug} onOpenModal={handleOpenModal} />
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <ProductModal product={selectedProduct} store={store} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
