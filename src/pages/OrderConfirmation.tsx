import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import type { ApiOrder } from '@/types';
import { Button, Icon } from '@/components/shisa';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const order = (location.state as { order?: ApiOrder })?.order;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotificationPrompt(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <div className="px-4 lg:px-8 py-12 lg:py-16 text-center" style={{ background: 'var(--brand-soft)' }}>
        <div
          className="flex items-center justify-center mx-auto mb-4"
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success)' }}
        >
          <Icon name="check" size={40} style={{ color: 'var(--on-brand)' }} strokeWidth={2.5} />
        </div>
        <h1 className="mb-2" style={{ font: '600 28px/34px var(--font-display)', color: 'var(--success)' }}>
          Order placed!
        </h1>
        <p style={{ color: 'var(--success)' }}>Your order has been received</p>
      </div>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:flex lg:gap-8 lg:max-w-5xl lg:mx-auto lg:w-full">
        <div className="flex-1">
          <div
            className="text-center mb-6"
            style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 16 }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--ink-muted)' }}>
              Order number
            </p>
            <p style={{ font: '700 24px/30px var(--font-body)', color: 'var(--ink)' }}>#{orderNumber}</p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>Delivery information</h3>

            {order && (
              <div className="space-y-3">
                <InfoRow icon="circle-user" label="Customer" value={order.customer_name} />
                <InfoRow icon="phone" label="Phone" value={order.customer_phone} />
                <InfoRow icon="map-pin" label="Delivery address" value={order.delivery_address} />
                {order.estimated_delivery_at && (
                  <InfoRow
                    icon="clock"
                    label="Estimated delivery"
                    value={new Date(order.estimated_delivery_at).toLocaleTimeString('en-ZA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-80 lg:flex-shrink-0">
          {order && (
            <div
              className="lg:sticky lg:top-24"
              style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 16 }}
            >
              <h3 className="mb-3" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
                Order summary
              </h3>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span style={{ color: 'var(--ink-muted)' }}>
                    {item.quantity}x {item.product_name} ({item.size})
                  </span>
                  <span style={{ color: 'var(--ink)' }}>R{item.total_price.toFixed(2)}</span>
                </div>
              ))}

              <div className="mt-2 pt-2 space-y-1" style={{ borderTop: '1px solid var(--line)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--ink-muted)' }}>
                  <span>Subtotal</span>
                  <span>R{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--ink-muted)' }}>
                  <span>Delivery fee</span>
                  <span>R{order.delivery_fee.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between pt-2"
                  style={{ borderTop: '1px solid var(--line)', font: '700 16px/22px var(--font-body)', color: 'var(--ink)' }}
                >
                  <span>Total</span>
                  <span>R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-8 py-4 lg:py-6 safe-bottom lg:max-w-5xl lg:mx-auto lg:w-full">
        <div className="flex flex-col lg:flex-row gap-3 lg:justify-center">
          <Button onClick={() => navigate(`/order-tracking/${orderNumber}`)} block>
            Track order
          </Button>
          <Button onClick={() => navigate('/')} variant="secondary" block>
            Order more
          </Button>
        </div>
      </div>

      <NotificationPrompt show={showNotificationPrompt} onDismiss={() => setShowNotificationPrompt(false)} />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} size={20} style={{ color: 'var(--ink-subtle)', marginTop: 2 }} />
      <div>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          {label}
        </p>
        <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{value}</p>
      </div>
    </div>
  );
}
