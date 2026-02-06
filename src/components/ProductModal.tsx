import { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import { cn, formatSize } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { ApiProduct, ApiProductSize, ApiAddon, FriesSize, CartItemAddon } from '@/types';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';

interface ProductModalProps {
  product: ApiProduct;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ApiProductSize | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ApiAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Set default size when product changes
  useEffect(() => {
    if (product && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.size === 'medium') || product.sizes[0];
      setSelectedSize(defaultSize);
    }
    // Reset state when modal opens
    setSelectedAddons([]);
    setQuantity(1);
    setIsAdded(false);
  }, [product, isOpen]);

  // Handle escape key
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
    setSelectedAddons(prev => {
      const isSelected = prev.some(a => a.id === addon.id);
      if (isSelected) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;

    const cartAddons: CartItemAddon[] = selectedAddons.map(addon => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    }));

    const itemPrice = (product.sale_price !== null && product.sale_price !== undefined)
      ? product.sale_price
      : selectedSize.price;

    addToCart(
      product.name,
      formatSize(selectedSize.size) as FriesSize,
      quantity,
      itemPrice,
      selectedSize.id,
      cartAddons.length > 0 ? cartAddons : undefined,
      product.image_url
    );

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const hasSalePrice = product.sale_price !== null && product.sale_price !== undefined;
  const basePrice = hasSalePrice ? product.sale_price! : (selectedSize ? selectedSize.price : 0);
  const totalPrice = (basePrice + addonsTotal) * quantity;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left side - Image */}
        <div className="w-1/2 flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-orange-400 to-orange-300 flex items-center justify-center">
              <span className="text-[120px]">🍟</span>
            </div>
          )}
        </div>

        {/* Right side - Details */}
        <div className="w-1/2 flex flex-col max-h-[90vh]">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Product Title & Price */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>

            <div className="mb-4">
              {hasSalePrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-orange-500">R{product.sale_price!.toFixed(2)}</span>
                  <span className="text-lg text-gray-400 line-through">R{selectedSize?.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">R{selectedSize?.price.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 mb-6">{product.description}</p>
            )}

            {/* Size Selection */}
            {product.sizes.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Select Option</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Required</span>
                </div>
                <div className="space-y-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{formatSize(size.size)}</span>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        selectedSize?.id === size.id
                          ? 'border-black bg-black'
                          : 'border-gray-300'
                      )}>
                        {selectedSize?.id === size.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {product.addons && product.addons.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Add extras</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
                </div>
                <div className="space-y-2">
                  {product.addons.map((addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                          isSelected
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="font-medium text-gray-900">{addon.name}</span>
                        <div className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          isSelected
                            ? 'border-black bg-black'
                            : 'border-gray-300'
                        )}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(MIN_QUANTITY, quantity - 1))}
                  disabled={quantity <= MIN_QUANTITY}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                    quantity <= MIN_QUANTITY
                      ? 'border-gray-200 text-gray-300'
                      : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                  )}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                    quantity >= MAX_QUANTITY
                      ? 'border-gray-200 text-gray-300'
                      : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                  )}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Fixed bottom - Add to cart button */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || isAdded}
              className={cn(
                'w-full py-4 rounded-xl font-semibold text-base transition-all',
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-gray-800',
                (!selectedSize || isAdded) && 'opacity-70'
              )}
            >
              {isAdded ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Added!
                </span>
              ) : (
                `Add ${quantity} to order • R${totalPrice.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
