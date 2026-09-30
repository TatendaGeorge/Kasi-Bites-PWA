import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button, IconButton, Stepper } from '@/components/shisa';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items, itemCount, subtotal, deliveryFee, isCartEmpty, updateQuantity, removeFromCart } = useCart();

  const total = subtotal + deliveryFee;

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
      className="absolute top-full right-0 mt-2 w-96 overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-float)',
        zIndex: 50,
      }}
    >
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>Your cart</h3>
        <IconButton icon="x" label="Close" size="sm" flat onClick={onClose} />
      </div>

      {isCartEmpty ? (
        <div className="p-8 text-center">
          <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
            Your cart is empty
          </p>
          <Button onClick={onClose} variant="secondary" size="sm">
            Continue shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-2 text-sm" style={{ background: 'var(--surface-sunken)' }}>
            <span style={{ color: 'var(--ink-muted)' }}>
              {itemCount} item{itemCount > 1 ? 's' : ''}
            </span>
            <span style={{ font: '700 14px/20px var(--font-body)', color: 'var(--ink)' }}>Subtotal: R{subtotal.toFixed(2)}</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="p-4" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="flex gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover flex-shrink-0" style={{ borderRadius: 'var(--radius-md)' }} />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="line-clamp-1" style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                          {item.size}
                        </p>
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-xs line-clamp-1" style={{ color: 'var(--ink-subtle)' }}>
                            + {item.addons.map((a) => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <p className="whitespace-nowrap" style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <Stepper value={item.quantity} min={0} onChange={(q) => (q === 0 ? removeFromCart(item.id) : updateQuantity(item.id, q))} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4" style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-sunken)' }}>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm" style={{ color: 'var(--ink-muted)' }}>
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--ink-muted)' }}>
                <span>Delivery fee</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ font: '700 16px/22px var(--font-body)', color: 'var(--ink)' }}>
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleCheckout} block>
              Go to checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
