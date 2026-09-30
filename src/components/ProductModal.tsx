import { useState, useEffect } from 'react';
import { cn, formatSize } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { ApiProduct, ApiProductSize, ApiAddon, ApiStore, FriesSize, CartItemAddon } from '@/types';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';
import { IconButton, Icon, Stepper, Button, Badge } from '@/components/shisa';
import { art } from '@/components/shisa/art';

interface ProductModalProps {
  product: ApiProduct;
  store: ApiStore;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, store, isOpen, onClose }: ProductModalProps) {
  const { addToCart, replaceCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ApiProductSize | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ApiAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product && product.sizes.length > 0) {
      const defaultSize = product.sizes.find((s) => s.size === 'medium') || product.sizes[0];
      setSelectedSize(defaultSize);
    }
    setSelectedAddons([]);
    setQuantity(1);
    setIsAdded(false);
  }, [product, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAddon = (addon: ApiAddon) => {
    setSelectedAddons((prev) => {
      const isSelected = prev.some((a) => a.id === addon.id);
      if (isSelected) return prev.filter((a) => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;

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
      onClose();
    }, 800);
  };

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const hasSalePrice = product.sale_price !== null && product.sale_price !== undefined;
  const basePrice = hasSalePrice ? product.sale_price! : selectedSize ? selectedSize.price : 0;
  const totalPrice = (basePrice + addonsTotal) * quantity;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />

      <div
        className="relative max-w-4xl w-full mx-4 flex"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-float)',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        <div className="absolute top-4 left-4 z-10">
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>

        <div className="w-1/2 flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <img src={art('kota')} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="w-1/2 flex flex-col" style={{ maxHeight: '90vh' }}>
          <div className="flex-1 overflow-y-auto p-6">
            <h2 style={{ font: '600 22px/28px var(--font-display)', color: 'var(--ink)', marginBottom: 8 }}>
              {product.name}
            </h2>

            <div className="mb-4">
              {hasSalePrice ? (
                <div className="flex items-center gap-2">
                  <span className="sh-fee" style={{ fontSize: 20 }}>
                    R{product.sale_price!.toFixed(2)}
                  </span>
                  <span className="text-lg line-through" style={{ color: 'var(--ink-subtle)' }}>
                    R{selectedSize?.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span style={{ font: '700 20px/26px var(--font-body)', color: 'var(--ink)' }}>
                  R{selectedSize?.price.toFixed(2)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mb-6" style={{ color: 'var(--ink-muted)' }}>
                {product.description}
              </p>
            )}

            {product.sizes.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>Select option</h3>
                  <Badge tone="neutral">Required</Badge>
                </div>
                <div className="space-y-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className="w-full flex items-center justify-between transition-colors"
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${selectedSize?.id === size.id ? 'var(--ink)' : 'var(--line)'}`,
                      }}
                    >
                      <span style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>
                        {formatSize(size.size)}
                      </span>
                      <SelectDot selected={selectedSize?.id === size.id} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.addons && product.addons.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>Add extras</h3>
                  <Badge tone="neutral">Optional</Badge>
                </div>
                <div className="space-y-2">
                  {product.addons.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className="w-full flex items-center justify-between transition-colors"
                        style={{
                          padding: 12,
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isSelected ? 'var(--ink)' : 'var(--line)'}`,
                          background: isSelected ? 'var(--surface-sunken)' : 'transparent',
                        }}
                      >
                        <span style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{addon.name}</span>
                        <SelectDot selected={isSelected} square />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-2">
              <h3 className="mb-3" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
                Quantity
              </h3>
              <Stepper
                value={quantity}
                min={MIN_QUANTITY}
                max={MAX_QUANTITY}
                onChange={setQuantity}
              />
            </div>
          </div>

          <div className="p-6" style={{ borderTop: '1px solid var(--line)' }}>
            <Button block disabled={!selectedSize || isAdded} onClick={handleAddToCart}>
              {isAdded ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="check" size={18} />
                  Added!
                </span>
              ) : (
                `Add ${quantity} to order • R${totalPrice.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectDot({ selected, square }: { selected: boolean; square?: boolean }) {
  return (
    <div
      className={cn('flex items-center justify-center transition-colors')}
      style={{
        width: 20,
        height: 20,
        borderRadius: square ? 4 : '50%',
        border: `2px solid ${selected ? 'var(--ink)' : 'var(--line-strong)'}`,
        background: selected ? 'var(--ink)' : 'transparent',
      }}
    >
      {selected && <Icon name="check" size={12} className="text-white" />}
    </div>
  );
}
