import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useDeliverySettings } from '@/context/StoreSettingsContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { CartItem } from '@/components/CartItem';

export default function Cart() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, isCartEmpty, updateQuantity, removeFromCart } = useCart();
  const { deliveryFee: configuredDeliveryFee } = useDeliverySettings();

  // Use delivery fee from settings, 0 if cart is empty
  const deliveryFee = isCartEmpty ? 0 : configuredDeliveryFee;
  const total = subtotal + deliveryFee;

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header title="Cart" showBack />

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-center mb-6">
            Add some delicious items to your cart
          </p>
          <Button onClick={() => navigate('/')}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="Cart" showBack />

      {/* Desktop: Two column layout */}
      <div className="flex-1 lg:flex lg:gap-8 lg:p-8 lg:max-w-5xl lg:mx-auto lg:w-full">
        {/* Cart Items */}
        <div className="flex-1 px-4 lg:px-0 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Add More Items Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-4 text-orange-500 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add more items
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 lg:bg-white lg:border lg:border-gray-200 lg:rounded-2xl px-4 lg:px-6 py-6 safe-bottom lg:w-80 lg:h-fit lg:sticky lg:top-24">
          <h3 className="font-semibold mb-4">Order Summary</h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({itemCount} items)</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>R{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            fullWidth
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
