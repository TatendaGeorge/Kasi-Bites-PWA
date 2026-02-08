import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useDeliverySettings } from '@/context/StoreSettingsContext';
import { Button } from '@/components/ui/Button';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items, itemCount, subtotal, isCartEmpty, updateQuantity, removeFromCart } = useCart();
  const { deliveryFee: configuredDeliveryFee } = useDeliverySettings();

  const deliveryFee = isCartEmpty ? 0 : configuredDeliveryFee;
  const total = subtotal + deliveryFee;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg">Your Cart</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isCartEmpty ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Button onClick={onClose} variant="secondary" size="sm">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          {/* Items count and subtotal */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-sm">
            <span className="text-gray-600">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
            <span className="font-medium">Subtotal: R{subtotal.toFixed(2)}</span>
          </div>

          {/* Cart Items */}
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex gap-3">
                  {/* Image */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.size}</p>
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-xs text-gray-400 line-clamp-1">
                            + {item.addons.map(a => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-sm whitespace-nowrap">
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.quantity <= MIN_QUANTITY) {
                              removeFromCart(item.id);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          {item.quantity <= MIN_QUANTITY ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, Math.min(MAX_QUANTITY, item.quantity + 1))}
                          disabled={item.quantity >= MAX_QUANTITY}
                          className={cn(
                            'w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center transition-colors',
                            item.quantity >= MAX_QUANTITY
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-100'
                          )}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleCheckout} fullWidth>
              Go to checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
