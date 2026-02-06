import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { X, Share2, Minus, Plus, Check } from 'lucide-react';
import { cn, formatSize } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import type { ApiProduct, ApiProductSize, ApiAddon, FriesSize, CartItemAddon } from '@/types';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Safe back navigation - handles PWA opened directly to this page
  const handleBack = useCallback(() => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, location.key]);

  const [product, setProduct] = useState<ApiProduct | null>(
    (location.state as { product?: ApiProduct })?.product || null
  );
  const [isLoading, setIsLoading] = useState(!product);
  const [selectedSize, setSelectedSize] = useState<ApiProductSize | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ApiAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!product && id) {
      fetchProduct();
    } else if (product && product.sizes.length > 0) {
      // Default to medium or first size
      const defaultSize = product.sizes.find(s => s.size === 'medium') || product.sizes[0];
      setSelectedSize(defaultSize);
    }
  }, [product, id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProducts();
      if (response.data?.products) {
        const found = response.data.products.find(p => p.id === Number(id));
        if (found) {
          setProduct(found);
          const defaultSize = found.sizes.find(s => s.size === 'medium') || found.sizes[0];
          setSelectedSize(defaultSize);
        }
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

    // Convert selected addons to cart format
    const cartAddons: CartItemAddon[] = selectedAddons.map(addon => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    }));

    // Use sale_price if available, otherwise use selected size price
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

    // Show added feedback
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      handleBack();
    }, 1000);
  };

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  // Use sale_price if available, otherwise use selected size price
  const hasSalePrice = product && product.sale_price !== null && product.sale_price !== undefined;
  const basePrice = hasSalePrice ? product!.sale_price! : (selectedSize ? selectedSize.price : 0);
  const totalPrice = (basePrice + addonsTotal) * quantity;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <p className="text-gray-600 mb-4">Product not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Image Section */}
      <div className="relative h-80">
        {/* Product Image - Full bleed */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-orange-400 to-orange-300 flex items-center justify-center">
            <span className="text-[150px] drop-shadow-lg">🍟</span>
          </div>
        )}

        {/* Safe area background for status bar */}
        <div className="absolute top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-gradient-to-b from-black/30 to-transparent" />

        {/* Top Navigation Bar - floating on top of image */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top)+16px)] z-10">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
          <button
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Content Card - slides up over the image */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-8 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="px-5 pt-6 pb-32">
          {/* Product Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>

          {/* Description */}
          {product.description && (
            <p className="text-gray-500 text-base mb-2">{product.description}</p>
          )}

          {/* Price */}
          <div className="mb-6">
            {product.sale_price !== null && product.sale_price !== undefined ? (
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-orange-500">
                  R{product.sale_price.toFixed(2)}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  R{selectedSize?.price.toFixed(2) || product.sizes[0]?.price.toFixed(2)}
                </p>
                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded">
                  Sale
                </span>
              </div>
            ) : (
              <p className="text-xl font-bold text-gray-900">
                R{selectedSize?.price.toFixed(2) || product.sizes[0]?.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Select Option Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Select Option</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Required</span>
            </div>

            <div className="space-y-3">
              {product.sizes.map((size) => {
                const priceDiff = selectedSize ? size.price - selectedSize.price : 0;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{formatSize(size.size)} Fries</p>
                      {priceDiff !== 0 && (
                        <p className="text-sm text-gray-500">
                          {priceDiff > 0 ? '+' : ''}R{priceDiff.toFixed(2)}
                        </p>
                      )}
                      <p className="text-sm text-orange-500">Popular</p>
                    </div>
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedSize?.id === size.id
                        ? 'border-black bg-black'
                        : 'border-gray-300'
                    )}>
                      {selectedSize?.id === size.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons Section */}
          {product.addons && product.addons.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Add extras</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
              </div>

              <div className="space-y-3">
                {product.addons.map((addon) => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-xl border transition-colors',
                        isSelected
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{addon.name}</p>
                        {addon.description && (
                          <p className="text-sm text-gray-500">{addon.description}</p>
                        )}
                        <p className="text-sm text-orange-500">+R{addon.price.toFixed(2)}</p>
                      </div>
                      <div className={cn(
                        'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                        isSelected
                          ? 'border-black bg-black'
                          : 'border-gray-300'
                      )}>
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(MIN_QUANTITY, quantity - 1))}
                disabled={quantity <= MIN_QUANTITY}
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                  quantity <= MIN_QUANTITY
                    ? 'border-gray-200 text-gray-300'
                    : 'border-gray-300 text-gray-600 hover:border-black hover:text-black active:scale-95'
                )}
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))}
                disabled={quantity >= MAX_QUANTITY}
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                  quantity >= MAX_QUANTITY
                    ? 'border-gray-200 text-gray-300'
                    : 'border-gray-300 text-gray-600 hover:border-black hover:text-black active:scale-95'
                )}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]" style={{ paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))` }}>
        <button
          onClick={handleAddToCart}
          disabled={!selectedSize || isAdded}
          className={cn(
            'w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98]',
            isAdded
              ? 'bg-green-600 text-white'
              : 'bg-black text-white hover:bg-gray-800',
            (!selectedSize || isAdded) && 'opacity-70'
          )}
        >
          {isAdded ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Added to Cart!
            </span>
          ) : (
            `Add ${quantity} to basket • R${totalPrice.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}
