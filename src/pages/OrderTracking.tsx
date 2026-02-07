import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Clock, MapPin, Phone, Loader2 } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusVariant } from '@/components/ui/Badge';
import api from '@/services/api';
import type { ApiOrder, OrderStatus } from '@/types';

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Status-specific colors matching admin Kanban
const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; line: string }> = {
  pending: { bg: 'bg-yellow-500', text: 'text-yellow-600', line: 'bg-yellow-500' },
  confirmed: { bg: 'bg-blue-500', text: 'text-blue-600', line: 'bg-blue-500' },
  preparing: { bg: 'bg-purple-500', text: 'text-purple-600', line: 'bg-purple-500' },
  ready: { bg: 'bg-green-500', text: 'text-green-600', line: 'bg-green-500' },
  out_for_delivery: { bg: 'bg-orange-500', text: 'text-orange-600', line: 'bg-orange-500' },
  delivered: { bg: 'bg-green-500', text: 'text-green-600', line: 'bg-green-500' },
  cancelled: { bg: 'bg-red-500', text: 'text-red-600', line: 'bg-red-500' },
};

export default function OrderTracking() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    if (!orderNumber) return;

    try {
      const response = await api.getOrder(orderNumber);
      if (response.data?.order) {
        setOrder(response.data.order);
        setError(null);
      } else {
        setError(response.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header title="Track Order" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="Track Order" showBack />

      <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto lg:max-w-5xl lg:mx-auto lg:w-full">
        <div className="lg:flex lg:gap-8">
          {/* Left Column: Status Timeline */}
          <div className="flex-1">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">#{order.order_number}</h2>
                <p className="text-sm text-gray-500">
                  {formatDateTime(order.created_at)}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status_label}
              </Badge>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Order Status</h3>

                <div className="relative">
                  {STATUS_ORDER.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isLast = index === STATUS_ORDER.length - 1;
                    const statusColor = STATUS_COLORS[status];

                    return (
                      <div key={status} className="flex items-start gap-4 pb-6 last:pb-0">
                        {/* Status indicator */}
                        <div className="relative">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white',
                              isCompleted
                                ? statusColor.bg
                                : 'bg-gray-200 text-gray-400'
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </div>

                          {/* Connecting line */}
                          {!isLast && (
                            <div
                              className={cn(
                                'absolute left-1/2 top-8 w-0.5 h-6 -translate-x-1/2',
                                isCompleted ? statusColor.line : 'bg-gray-200'
                              )}
                            />
                          )}
                        </div>

                        {/* Status text */}
                        <div className="flex-1 pt-1">
                          <p
                            className={cn(
                              'font-medium',
                              isCompleted ? 'text-black' : 'text-gray-400'
                            )}
                          >
                            {STATUS_LABELS[status]}
                          </p>
                          {isCurrent && !isDelivered && (
                            <p className={cn('text-sm animate-pulse', statusColor.text)}>
                              In progress...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled Notice */}
            {isCancelled && (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-red-800 font-medium">This order has been cancelled</p>
                {order.notes && (
                  <p className="text-red-600 text-sm mt-1">{order.notes}</p>
                )}
              </div>
            )}

            {/* Delivery Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Delivery Details</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                </div>

                {order.estimated_delivery_at && !isDelivered && !isCancelled && (
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
            </div>
          </div>

          {/* Right Column: Order Items */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="bg-gray-50 lg:bg-white lg:border lg:border-gray-200 rounded-xl p-4 lg:sticky lg:top-24">
              <h3 className="font-semibold mb-3">Order Items</h3>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.product_name} ({item.size})
                  </span>
                  <span>R{item.total_price.toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="px-4 lg:px-8 py-4 safe-bottom lg:max-w-5xl lg:mx-auto lg:w-full">
        <Button
          onClick={() => navigate('/')}
          variant="secondary"
          fullWidth
          className="lg:w-auto lg:px-8"
        >
          Order More
        </Button>
      </div>
    </div>
  );
}
