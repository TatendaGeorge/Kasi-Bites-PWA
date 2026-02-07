import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Phone, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import type { ApiOrder } from '@/types';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const order = (location.state as { order?: ApiOrder })?.order;

  // Show notification prompt after a 2-second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotificationPrompt(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Success Header */}
      <div className="bg-green-50 px-4 lg:px-8 py-12 lg:py-16 text-center">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-green-600" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">Order Placed!</h1>
        <p className="text-green-600">Your order has been received</p>
      </div>

      {/* Order Details */}
      <div className="flex-1 px-4 lg:px-8 py-6 lg:flex lg:gap-8 lg:max-w-5xl lg:mx-auto lg:w-full">
        {/* Left Column: Order Info */}
        <div className="flex-1">
          {/* Order Number */}
          <div className="bg-gray-50 rounded-xl p-4 text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-2xl font-bold">#{orderNumber}</p>
          </div>

          {/* Delivery Info */}
          <div className="space-y-4 mb-6">
          <h3 className="font-semibold">Delivery Information</h3>

          {order && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
              </div>

              {order.estimated_delivery_at && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">
                      {new Date(order.estimated_delivery_at).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:w-80 lg:flex-shrink-0">
          {order && (
            <div className="bg-gray-50 lg:bg-white lg:border lg:border-gray-200 rounded-xl p-4 lg:sticky lg:top-24">
              <h3 className="font-semibold mb-3">Order Summary</h3>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.product_name} ({item.size})
                  </span>
                  <span>R{item.total_price.toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>R{order.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 lg:px-8 py-4 lg:py-6 safe-bottom lg:max-w-5xl lg:mx-auto lg:w-full">
        <div className="flex flex-col lg:flex-row gap-3 lg:justify-center">
          <Button
            onClick={() => navigate(`/order-tracking/${orderNumber}`)}
            className="lg:w-auto lg:px-8"
            fullWidth
          >
            Track Order
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            className="lg:w-auto lg:px-8"
            fullWidth
          >
            Order More
          </Button>
        </div>
      </div>

      {/* Notification Prompt */}
      <NotificationPrompt
        show={showNotificationPrompt}
        onDismiss={() => setShowNotificationPrompt(false)}
      />
    </div>
  );
}
