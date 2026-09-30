import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cn, formatSize } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import api from '@/services/api';
import type { ApiProduct, ApiProductSize, ApiAddon, FriesSize, CartItemAddon } from '@/types';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';
import { Button, IconButton, Icon, Badge, Stepper } from '@/components/shisa';
import { art } from '@/components/shisa/art';

export default function ProductDetail() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, replaceCart } = useCart();
  const { store, loadStore } = useStore();

  const handleBack = useCallback(() => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(slug ? `/store/${slug}` : '/', { replace: true });
    }
  }, [navigate, location.key, slug]);

  const [product, setProduct] = useState<ApiProduct | null>(
    (location.state as { product?: ApiProduct })?.product || null
  );
  const [isLoading, setIsLoading] = useState(!product);
  const [selectedSize, setSelectedSize] = useState<ApiProductSize | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ApiAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (slug) loadStore(slug);

    if (!product && id && slug) {
      fetchProduct(slug, id);
    } else if (product && product.sizes.length > 0) {
      const defaultSize = product.sizes.find((s) => s.size === 'medium') || product.sizes[0];
      setSelectedSize(defaultSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, id, slug]);

  const fetchProduct = async (storeSlug: string, productId: string) => {
    setIsLoading(true);
    try {
      const response = await api.getStoreProduct(storeSlug, productId);
      if (response.data?.product) {
        setProduct(response.data.product);
        const defaultSize = response.data.product.sizes.find((s) => s.size === 'medium') || response.data.product.sizes[0];
        setSelectedSize(defaultSize);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAddon = (addon: ApiAddon) => {
    setSelectedAddons((prev) => {
      const isSelected = prev.some((a) => a.id === addon.id);
      if (isSelected) return prev.filter((a) => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize || !store) return;

    const cartAddons: CartItemAddon[] = selectedAddons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    }));

    const itemPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : selectedSize.price;

    const input = {
      name: product.name,
      size: formatSize(selectedSize.size) as FriesSize,
      quantity,
      price: itemPrice,
      productSizeId: selectedSize.id,
      addons: cartAddons.length > 0 ? cartAddons : undefined,
      imageUrl: product.image_url,
      storeId: store.id,
      storeSlug: store.slug,
      storeName: store.name,
    };

    const result = addToCart(input);

    if (!result.ok) {
      const confirmed = window.confirm(
        `Your cart has items from ${result.existingStoreName}. Starting an order from ${store.name} will clear your current cart. Continue?`
      );
      if (!confirmed) return;
      replaceCart(input);
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      handleBack();
    }, 1000);
  };

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const hasSalePrice = product && product.sale_price !== null && product.sale_price !== undefined;
  const basePrice = hasSalePrice ? product!.sale_price! : selectedSize ? selectedSize.price : 0;
  const totalPrice = (basePrice + addonsTotal) * quantity;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
        <div
          className="animate-spin"
          style={{ width: 48, height: 48, border: '4px solid var(--flame)', borderTopColor: 'transparent', borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-4" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
        <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
          Product not found
        </p>
        <Button onClick={() => navigate('/')}>Go home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <div className="relative h-80">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <img src={art('kota')} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}

        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: 'env(safe-area-inset-top)', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)' }}
        />

        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
        >
          <IconButton icon="x" label="Close" onClick={handleBack} />
          <IconButton icon="arrow-up-right" label="Share" />
        </div>
      </div>

      <div
        className="flex-1 relative z-10"
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', marginTop: -32, boxShadow: 'var(--shadow-float)' }}
      >
        <div className="px-5 pt-6 pb-32">
          <h1 style={{ font: '600 26px/32px var(--font-display)', color: 'var(--ink)', marginBottom: 4 }}>{product.name}</h1>

          {product.description && (
            <p className="mb-2" style={{ color: 'var(--ink-muted)' }}>
              {product.description}
            </p>
          )}

          <div className="mb-6">
            {hasSalePrice ? (
              <div className="flex items-center gap-3">
                <p className="sh-fee" style={{ fontSize: 20 }}>
                  R{product.sale_price!.toFixed(2)}
                </p>
                <p className="text-lg line-through" style={{ color: 'var(--ink-subtle)' }}>
                  R{selectedSize?.price.toFixed(2) || product.sizes[0]?.price.toFixed(2)}
                </p>
                <Badge tone="mielie">Sale</Badge>
              </div>
            ) : (
              <p style={{ font: '700 20px/26px var(--font-body)', color: 'var(--ink)' }}>
                R{selectedSize?.price.toFixed(2) || product.sizes[0]?.price.toFixed(2)}
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>Select option</h3>
              <Badge tone="neutral">Required</Badge>
            </div>

            <div className="space-y-3">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className="w-full flex items-center justify-between transition-colors"
                  style={{ padding: 16, borderRadius: 'var(--radius-md)', border: `1px solid ${selectedSize?.id === size.id ? 'var(--ink)' : 'var(--line)'}` }}
                >
                  <div className="text-left">
                    <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{formatSize(size.size)}</p>
                  </div>
                  <div
                    className="flex items-center justify-center transition-colors"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: `2px solid ${selectedSize?.id === size.id ? 'var(--ink)' : 'var(--line-strong)'}`,
                      background: selectedSize?.id === size.id ? 'var(--ink)' : 'transparent',
                    }}
                  >
                    {selectedSize?.id === size.id && <Icon name="check" size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {product.addons && product.addons.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>Add extras</h3>
                <Badge tone="neutral">Optional</Badge>
              </div>

              <div className="space-y-3">
                {product.addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={cn('w-full flex items-center justify-between transition-colors')}
                      style={{
                        padding: 16,
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isSelected ? 'var(--ink)' : 'var(--line)'}`,
                        background: isSelected ? 'var(--surface-sunken)' : 'transparent',
                      }}
                    >
                      <div className="text-left">
                        <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{addon.name}</p>
                        {addon.description && (
                          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            {addon.description}
                          </p>
                        )}
                      </div>
                      <div
                        className="flex items-center justify-center transition-colors"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: `2px solid ${isSelected ? 'var(--ink)' : 'var(--line-strong)'}`,
                          background: isSelected ? 'var(--ink)' : 'transparent',
                        }}
                      >
                        {isSelected && <Icon name="check" size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-3" style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>
              Quantity
            </h3>
            <Stepper value={quantity} min={MIN_QUANTITY} max={MAX_QUANTITY} onChange={setQuantity} />
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--surface)',
          padding: 16,
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        <Button block disabled={!selectedSize || isAdded} onClick={handleAddToCart}>
          {isAdded ? (
            <span className="flex items-center justify-center gap-2">
              <Icon name="check" size={18} />
              Added to cart!
            </span>
          ) : (
            `Add ${quantity} to order • R${totalPrice.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}
