import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Truck, Store, AlertTriangle, Loader2 } from 'lucide-react';
import { cn, validateSAPhoneNumber } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useDeliverySettings } from '@/context/StoreSettingsContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import api from '@/services/api';
import type { FormErrors } from '@/types';

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const {
    isLoading: isLoadingSettings,
    deliveryFee: configuredDeliveryFee,
    deliveryRadiusKm: maxDeliveryRadius,
    storeLatitude: storeLat,
    storeLongitude: storeLng,
  } = useDeliverySettings();

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

  // Calculate distance from store
  const distanceFromStore = useMemo(() => {
    if (formData.deliveryLatitude && formData.deliveryLongitude && storeLat && storeLng) {
      return calculateDistance(
        storeLat,
        storeLng,
        formData.deliveryLatitude,
        formData.deliveryLongitude
      );
    }
    return null;
  }, [formData.deliveryLatitude, formData.deliveryLongitude, storeLat, storeLng]);

  // Check if delivery is available
  const isDeliveryAvailable = distanceFromStore === null || distanceFromStore <= maxDeliveryRadius;

  // Auto-switch to collection if too far
  useEffect(() => {
    if (!isDeliveryAvailable && orderType === 'delivery') {
      setOrderType('collection');
    }
  }, [isDeliveryAvailable, orderType]);

  // Calculate fees based on order type
  const deliveryFee = orderType === 'collection' ? 0 : configuredDeliveryFee;
  const total = subtotal + deliveryFee;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  const handleAddressChange = (address: string, lat?: number, lng?: number) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddress: address,
      deliveryLatitude: lat,
      deliveryLongitude: lng,
    }));
    if (errors.deliveryAddress) {
      setErrors(prev => ({ ...prev, deliveryAddress: undefined }));
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
      newErrors.deliveryAddress = orderType === 'delivery'
        ? 'Please enter a valid delivery address'
        : 'Please enter your address for contact purposes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: formData.fullName,
        customer_phone: formData.phoneNumber,
        order_type: orderType,
        delivery_address: formData.deliveryAddress,
        delivery_latitude: formData.deliveryLatitude,
        delivery_longitude: formData.deliveryLongitude,
        payment_method: paymentMethod,
        notes: formData.specialInstructions || undefined,
        items: items.map(item => ({
          product_size_id: item.productSizeId!,
          quantity: item.quantity,
          addon_ids: item.addons?.map(a => a.id),
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
    } catch (err) {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header title="Checkout" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-gray-500">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="Checkout" showBack />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 md:flex md:gap-8 px-4 md:px-6 py-6 overflow-y-auto">
          {/* Form Section */}
          <div className="flex-1 space-y-6 md:max-w-2xl">
          {/* Order Type Selection */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Order Type</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => isDeliveryAvailable && setOrderType('delivery')}
                disabled={!isDeliveryAvailable}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  orderType === 'delivery'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200',
                  !isDeliveryAvailable && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  orderType === 'delivery' ? 'bg-black text-white' : 'bg-gray-100'
                )}>
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Delivery</p>
                  <p className="text-xs text-gray-500">R{configuredDeliveryFee.toFixed(2)} fee</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('collection')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  orderType === 'collection'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  orderType === 'collection' ? 'bg-black text-white' : 'bg-gray-100'
                )}>
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Collection</p>
                  <p className="text-xs text-gray-500">No fee</p>
                </div>
              </button>
            </div>

            {/* Distance Warning */}
            {!isDeliveryAvailable && distanceFromStore !== null && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Outside delivery area</p>
                  <p className="text-yellow-700">
                    Your location is {distanceFromStore.toFixed(1)}km away. We only deliver within {maxDeliveryRadius}km.
                    Please choose collection instead.
                  </p>
                </div>
              </div>
            )}

            {orderType === 'collection' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Collection Point:</strong> You'll receive a notification when your order is ready for pickup.
                </p>
              </div>
            )}
          </section>

          {/* Contact Details */}
          <section>
            <h3 className="text-lg font-semibold mb-4">
              {orderType === 'delivery' ? 'Delivery Details' : 'Contact Details'}
            </h3>

            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
              />

              <Input
                label="Phone Number"
                placeholder="0821234567"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                error={errors.phoneNumber}
              />

              <AddressAutocomplete
                label={orderType === 'delivery' ? 'Delivery Address' : 'Your Address'}
                placeholder="Start typing your address..."
                value={formData.deliveryAddress}
                onChange={handleAddressChange}
                error={errors.deliveryAddress}
              />

              {distanceFromStore !== null && isDeliveryAvailable && orderType === 'delivery' && (
                <p className="text-sm text-green-600">
                  {distanceFromStore < 0.1 ? 'Very close to store' : `${distanceFromStore.toFixed(1)}km from store`} - Delivery available
                </p>
              )}

              {isAuthenticated && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-600">Save as default address</span>
                </label>
              )}

              <Input
                label="Special Instructions (optional)"
                placeholder={orderType === 'delivery'
                  ? 'Any special delivery instructions...'
                  : 'Any special requests...'}
                value={formData.specialInstructions}
                onChange={(e) => handleChange('specialInstructions', e.target.value)}
              />
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors',
                  paymentMethod === 'cash'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  paymentMethod === 'cash' ? 'bg-black text-white' : 'bg-gray-100'
                )}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">
                    {orderType === 'delivery' ? 'Cash on Delivery' : 'Cash on Collection'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {orderType === 'delivery' ? 'Pay when your order arrives' : 'Pay when you collect'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                disabled
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors opacity-50',
                  paymentMethod === 'card'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  paymentMethod === 'card' ? 'bg-black text-white' : 'bg-gray-100'
                )}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Card Payment</p>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
              </button>
            </div>
          </section>

          {/* API Error - Mobile */}
          {apiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg md:hidden">
              <p className="text-red-700">{apiError}</p>
            </div>
          )}
          </div>

          {/* Order Summary - Sidebar on Desktop */}
          <div className="mt-6 md:mt-0 md:w-80 md:flex-shrink-0">
            <div className="md:sticky md:top-6">
              <section>
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                <div className="bg-gray-50 md:bg-white md:border md:border-gray-200 rounded-xl p-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name} ({item.size})
                      </span>
                      <span>R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 mt-2 pt-2 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>R{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{orderType === 'delivery' ? 'Delivery Fee' : 'Collection'}</span>
                      <span>{orderType === 'collection' ? 'Free' : `R${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>R{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Desktop Submit Button */}
                  <div className="hidden md:block mt-4">
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isSubmitting}
                    >
                      Place {orderType === 'collection' ? 'Collection' : 'Delivery'} Order
                    </Button>
                  </div>
                </div>
              </section>

              {/* API Error - Desktop */}
              {apiError && (
                <div className="hidden md:block mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{apiError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button - Mobile only */}
        <div className="px-4 py-4 bg-white border-t border-gray-100 safe-bottom md:hidden">
          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
          >
            Place {orderType === 'collection' ? 'Collection' : 'Delivery'} Order - R{total.toFixed(2)}
          </Button>
        </div>
      </form>
    </div>
  );
}
