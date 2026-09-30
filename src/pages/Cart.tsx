import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { Header } from '@/components/layout/Header';
import { CartItem } from '@/components/CartItem';
import { Button, Icon } from '@/components/shisa';

export default function Cart() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, deliveryFee, isCartEmpty, storeSlug, updateQuantity, removeFromCart } = useCart();
  const { loadStore } = useStore();
  const total = subtotal + deliveryFee;
  const browseHref = storeSlug ? `/store/${storeSlug}` : '/';

  useEffect(() => {
    if (storeSlug) loadStore(storeSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  if (isCartEmpty) {
    return (
      <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
        <Header title="Cart" showBack />

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div
            className="flex items-center justify-center mb-6"
            style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface-sunken)' }}
          >
            <Icon name="shopping-cart" size={48} style={{ color: 'var(--ink-muted)' }} />
          </div>
          <h2 className="mb-2" style={{ font: '600 22px/28px var(--font-display)', color: 'var(--ink)' }}>
            Your cart is empty
          </h2>
          <p className="text-center mb-6" style={{ color: 'var(--ink-muted)' }}>
            Add some delicious items to your cart
          </p>
          <Button onClick={() => navigate('/')}>Browse stores</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Cart" showBack />

      <div className="flex-1 lg:flex lg:gap-8 lg:p-8 lg:max-w-5xl lg:mx-auto lg:w-full">
        <div className="flex-1 px-4 lg:px-0 overflow-y-auto">
          <div>
            {items.map((item, i) => (
              <div key={item.id} style={i > 0 ? { borderTop: '1px solid var(--line)' } : undefined}>
                <CartItem item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(browseHref)}
            className="w-full flex items-center justify-center gap-2 py-4"
            style={{ color: 'var(--brand-text)', font: '700 15px/20px var(--font-body)' }}
          >
            <Icon name="plus" size={20} />
            Add more items
          </button>
        </div>

        <div
          className="px-4 lg:px-6 py-6 safe-bottom lg:w-80 lg:h-fit lg:sticky lg:top-24"
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="mb-4" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
            Order summary
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between" style={{ color: 'var(--ink-muted)' }}>
              <span>Subtotal ({itemCount} items)</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--ink-muted)' }}>
              <span>Delivery fee</span>
              <span>R{deliveryFee.toFixed(2)}</span>
            </div>
            <div
              className="flex justify-between pt-2"
              style={{ borderTop: '1px solid var(--line)', font: '700 18px/24px var(--font-body)', color: 'var(--ink)' }}
            >
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>

          <Button block onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
