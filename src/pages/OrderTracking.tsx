import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { formatDateTime, getStatusTone } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import api from '@/services/api';
import type { ApiOrder, OrderStatus } from '@/types';
import { Button, Badge, Icon } from '@/components/shisa';

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const TONE_COLOR: Record<string, string> = {
  brand: 'var(--brand)',
  mielie: 'var(--mielie)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  neutral: 'var(--ink-muted)',
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
    } catch {
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--flame)' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
        <Header title="Track order" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
            {error || 'Order not found'}
          </p>
          <Button onClick={() => navigate('/')}>Go home</Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Track order" showBack />

      <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto lg:max-w-5xl lg:mx-auto lg:w-full">
        <div className="lg:flex lg:gap-8">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 style={{ font: '600 22px/28px var(--font-display)', color: 'var(--ink)' }}>#{order.order_number}</h2>
                <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                  {formatDateTime(order.created_at)}
                </p>
              </div>
              <Badge tone={getStatusTone(order.status)}>{order.status_label}</Badge>
            </div>

            {!isCancelled && (
              <div className="mb-8">
                <h3 className="mb-4" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
                  Order status
                </h3>

                <div className="relative">
                  {STATUS_ORDER.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isLast = index === STATUS_ORDER.length - 1;
                    const color = TONE_COLOR[getStatusTone(status)];

                    return (
                      <div key={status} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="relative">
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isCompleted ? color : 'var(--surface-sunken)',
                              color: isCompleted ? 'var(--on-brand)' : 'var(--ink-subtle)',
                            }}
                          >
                            <Icon name="check" size={16} strokeWidth={2.5} />
                          </div>

                          {!isLast && (
                            <div
                              className="absolute left-1/2 top-8 -translate-x-1/2"
                              style={{ width: 2, height: 24, background: isCompleted ? color : 'var(--line)' }}
                            />
                          )}
                        </div>

                        <div className="flex-1 pt-1">
                          <p style={{ font: '500 15px/22px var(--font-body)', color: isCompleted ? 'var(--ink)' : 'var(--ink-subtle)' }}>
                            {STATUS_LABELS[status]}
                          </p>
                          {isCurrent && !isDelivered && (
                            <p className="text-sm animate-pulse" style={{ color }}>
                              In progress…
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="mb-6" style={{ background: 'var(--brand-soft)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--danger)' }}>This order has been cancelled</p>
                {order.notes && (
                  <p className="text-sm mt-1" style={{ color: 'var(--danger)' }}>
                    {order.notes}
                  </p>
                )}
              </div>
            )}

            <div className="mb-6">
              <h3 className="mb-4" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
                Delivery details
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="map-pin" size={20} style={{ color: 'var(--ink-subtle)', marginTop: 2 }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                      Delivery address
                    </p>
                    <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{order.delivery_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="phone" size={20} style={{ color: 'var(--ink-subtle)', marginTop: 2 }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                      Contact
                    </p>
                    <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{order.customer_phone}</p>
                  </div>
                </div>

                {order.estimated_delivery_at && !isDelivered && !isCancelled && (
                  <div className="flex items-start gap-3">
                    <Icon name="clock" size={20} style={{ color: 'var(--ink-subtle)', marginTop: 2 }} />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Estimated delivery
                      </p>
                      <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>
                        {new Date(order.estimated_delivery_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-80 lg:flex-shrink-0">
            <div
              className="lg:sticky lg:top-24"
              style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 16 }}
            >
              <h3 className="mb-3" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
                Order items
              </h3>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span style={{ color: 'var(--ink-muted)' }}>
                    {item.quantity}x {item.product_name} ({item.size})
                  </span>
                  <span style={{ color: 'var(--ink)' }}>R{item.total_price.toFixed(2)}</span>
                </div>
              ))}

              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
                <div className="flex justify-between" style={{ font: '700 16px/22px var(--font-body)', color: 'var(--ink)' }}>
                  <span>Total</span>
                  <span>R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-4 safe-bottom lg:max-w-5xl lg:mx-auto lg:w-full">
        <Button onClick={() => navigate('/')} variant="secondary" block>
          Order more
        </Button>
      </div>
    </div>
  );
}
