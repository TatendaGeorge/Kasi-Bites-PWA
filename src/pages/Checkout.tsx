import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { validateSAPhoneNumber } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore, useDeliverySettings } from '@/context/StoreContext';
import { Header } from '@/components/layout/Header';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import api from '@/services/api';
import type { FormErrors } from '@/types';
import { Button, TextField, Icon, SectionHeader } from '@/components/shisa';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function OptionCard({
  active,
  disabled,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 transition-all"
      style={{
        padding: 16,
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        background: active ? 'var(--surface-sunken)' : 'transparent',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: active ? 'var(--ink)' : 'var(--surface-sunken)',
          color: active ? 'var(--surface)' : 'var(--ink)',
        }}
      >
        <Icon name={icon} size={22} />
      </div>
      <div className="text-center">
        <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{title}</p>
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}

function PaymentRow({
  active,
  disabled,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 transition-colors"
      style={{
        padding: 16,
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        background: active ? 'var(--surface-sunken)' : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: active ? 'var(--ink)' : 'var(--surface-sunken)',
          color: active ? 'var(--surface)' : 'var(--ink)',
        }}
      >
        <Icon name={icon} size={20} />
      </div>
      <div className="text-left">
        <p style={{ font: '500 15px/22px var(--font-body)', color: 'var(--ink)' }}>{title}</p>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, storeId, storeSlug } = useCart();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { loadStore } = useStore();
  const {
    isLoading: isLoadingSettings,
    deliveryFee: configuredDeliveryFee,
    deliveryRadiusKm: maxDeliveryRadius,
    storeLatitude: storeLat,
    storeLongitude: storeLng,
  } = useDeliverySettings();

  useEffect(() => {
    if (storeSlug) loadStore(storeSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    deliveryAddress: user?.default_address || '',
    deliveryLatitude: user?.default_address_latitude ?? undefined,
    deliveryLongitude: user?.default_address_longitude ?? undefined,
    specialInstructions: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const distanceFromStore = useMemo(() => {
    if (formData.deliveryLatitude && formData.deliveryLongitude && storeLat && storeLng) {
      return calculateDistance(storeLat, storeLng, formData.deliveryLatitude, formData.deliveryLongitude);
    }
    return null;
  }, [formData.deliveryLatitude, formData.deliveryLongitude, storeLat, storeLng]);

  const isDeliveryAvailable = distanceFromStore === null || distanceFromStore <= maxDeliveryRadius;

  useEffect(() => {
    if (!isDeliveryAvailable && orderType === 'delivery') {
      setOrderType('collection');
    }
  }, [isDeliveryAvailable, orderType]);

  const deliveryFee = orderType === 'collection' ? 0 : configuredDeliveryFee;
  const total = subtotal + deliveryFee;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  const handleAddressChange = (address: string, lat?: number, lng?: number) => {
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: address,
      deliveryLatitude: lat,
      deliveryLongitude: lng,
    }));
    if (errors.deliveryAddress) {
      setErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
    }
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter your phone number';
    } else if (!validateSAPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid SA phone number';
    }

    if (!formData.deliveryAddress.trim() || formData.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress =
        orderType === 'delivery' ? 'Please enter a valid delivery address' : 'Please enter your address for contact purposes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    if (!storeId) {
      setApiError('Your cart is missing store information. Please go back to your cart and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        store_id: storeId,
        customer_name: formData.fullName,
        customer_phone: formData.phoneNumber,
        order_type: orderType,
        delivery_address: formData.deliveryAddress,
        delivery_latitude: formData.deliveryLatitude,
        delivery_longitude: formData.deliveryLongitude,
        payment_method: paymentMethod,
        notes: formData.specialInstructions || undefined,
        items: items.map((item) => ({
          product_size_id: item.productSizeId!,
          quantity: item.quantity,
          addon_ids: item.addons?.map((a) => a.id),
        })),
      };

      const response = await api.createOrder(orderData);

      if (response.data?.order) {
        if (saveAddress && isAuthenticated) {
          await updateProfile({
            default_address: formData.deliveryAddress,
            default_address_latitude: formData.deliveryLatitude,
            default_address_longitude: formData.deliveryLongitude,
          });
        }

        clearCart();

        navigate(`/order-confirmation/${response.data.order.order_number}`, {
          state: { order: response.data.order },
          replace: true,
        });
      } else {
        setApiError(response.error || 'Failed to place order');
      }
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
        <Header title="Checkout" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--ink-subtle)' }} />
            <p style={{ color: 'var(--ink-muted)' }}>Loading checkout…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Checkout" showBack />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 lg:flex lg:gap-8 px-4 lg:px-8 py-6 overflow-y-auto lg:max-w-6xl lg:mx-auto lg:w-full">
          <div className="flex-1 sh-stack">
            <section className="lg:sh-card" style={{ padding: 0 }}>
              <div className="lg:p-6">
                <h3 className="mb-4" style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>
                  Order type
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <OptionCard
                    active={orderType === 'delivery'}
                    disabled={!isDeliveryAvailable}
                    icon="bike"
                    title="Delivery"
                    subtitle={`R${configuredDeliveryFee.toFixed(2)} fee`}
                    onClick={() => isDeliveryAvailable && setOrderType('delivery')}
                  />
                  <OptionCard
                    active={orderType === 'collection'}
                    icon="store"
                    title="Collection"
                    subtitle="No fee"
                    onClick={() => setOrderType('collection')}
                  />
                </div>

                {!isDeliveryAvailable && distanceFromStore !== null && (
                  <div
                    className="mt-3 flex items-start gap-3"
                    style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--mielie)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>
                      <strong>Outside delivery area.</strong> Your location is {distanceFromStore.toFixed(1)}km away. We only
                      deliver within {maxDeliveryRadius}km. Please choose collection instead.
                    </p>
                  </div>
                )}

                {orderType === 'collection' && (
                  <div className="mt-3" style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--brand-soft)' }}>
                    <p className="text-sm" style={{ color: 'var(--brand-text)' }}>
                      <strong>Collection point:</strong> You'll receive a notification when your order is ready for pickup.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="lg:sh-card" style={{ padding: 0 }}>
              <div className="lg:p-6 sh-stack">
                <h3 style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>
                  {orderType === 'delivery' ? 'Delivery details' : 'Contact details'}
                </h3>

                <TextField
                  label="Full name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  error={errors.fullName}
                />

                <TextField
                  label="Phone number"
                  placeholder="0821234567"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                />

                <AddressAutocomplete
                  label={orderType === 'delivery' ? 'Delivery address' : 'Your address'}
                  placeholder="Start typing your address…"
                  value={formData.deliveryAddress}
                  onChange={handleAddressChange}
                  error={errors.deliveryAddress}
                />

                {distanceFromStore !== null && isDeliveryAvailable && orderType === 'delivery' && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>
                    {distanceFromStore < 0.1 ? 'Very close to store' : `${distanceFromStore.toFixed(1)}km from store`} —
                    delivery available
                  </p>
                )}

                {isAuthenticated && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--ink)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                      Save as default address
                    </span>
                  </label>
                )}

                <TextField
                  label="Special instructions (optional)"
                  placeholder={orderType === 'delivery' ? 'Any special delivery instructions…' : 'Any special requests…'}
                  value={formData.specialInstructions}
                  onChange={(e) => handleChange('specialInstructions', e.target.value)}
                />
              </div>
            </section>

            <section className="lg:sh-card" style={{ padding: 0 }}>
              <div className="lg:p-6">
                <h3 className="mb-4" style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}>
                  Payment method
                </h3>

                <div className="space-y-3">
                  <PaymentRow
                    active={paymentMethod === 'cash'}
                    icon="check"
                    title={orderType === 'delivery' ? 'Cash on delivery' : 'Cash on collection'}
                    subtitle={orderType === 'delivery' ? 'Pay when your order arrives' : 'Pay when you collect'}
                    onClick={() => setPaymentMethod('cash')}
                  />
                  <PaymentRow
                    active={paymentMethod === 'card'}
                    disabled
                    icon="credit-card"
                    title="Card payment"
                    subtitle="Coming soon"
                    onClick={() => setPaymentMethod('card')}
                  />
                </div>
              </div>
            </section>

            {apiError && (
              <div
                className="p-4 lg:hidden"
                style={{ borderRadius: 'var(--radius-md)', background: 'var(--brand-soft)', border: '1px solid var(--danger)' }}
              >
                <p style={{ color: 'var(--danger)' }}>{apiError}</p>
              </div>
            )}
          </div>

          <div className="mt-6 lg:mt-0 lg:w-96 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <section className="lg:sh-card" style={{ padding: 0 }}>
                <div className="lg:p-6">
                  <SectionHeader title="Order summary" action={false} />

                  <div className="mt-3" style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2">
                        <span style={{ color: 'var(--ink-muted)' }}>
                          {item.quantity}x {item.name} ({item.size})
                        </span>
                        <span style={{ color: 'var(--ink)' }}>R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}

                    <div className="mt-2 pt-2 space-y-2" style={{ borderTop: '1px solid var(--line)' }}>
                      <div className="flex justify-between" style={{ color: 'var(--ink-muted)' }}>
                        <span>Subtotal</span>
                        <span>R{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between" style={{ color: 'var(--ink-muted)' }}>
                        <span>{orderType === 'delivery' ? 'Delivery fee' : 'Collection'}</span>
                        <span>{orderType === 'collection' ? 'Free' : `R${deliveryFee.toFixed(2)}`}</span>
                      </div>
                      <div
                        className="flex justify-between pt-2"
                        style={{ borderTop: '1px solid var(--line)', font: '700 18px/24px var(--font-body)', color: 'var(--ink)' }}
                      >
                        <span>Total</span>
                        <span>R{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="hidden lg:block mt-4">
                      <Button type="submit" block disabled={isSubmitting}>
                        {isSubmitting ? 'Placing order…' : `Place ${orderType === 'collection' ? 'collection' : 'delivery'} order`}
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {apiError && (
                <div
                  className="hidden lg:block mt-4 p-4"
                  style={{ borderRadius: 'var(--radius-md)', background: 'var(--brand-soft)', border: '1px solid var(--danger)' }}
                >
                  <p style={{ color: 'var(--danger)' }}>{apiError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 safe-bottom lg:hidden" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <Button type="submit" block disabled={isSubmitting}>
            {isSubmitting ? 'Placing order…' : `Place ${orderType === 'collection' ? 'collection' : 'delivery'} order • R${total.toFixed(2)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
