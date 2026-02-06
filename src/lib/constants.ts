// App Constants
export const APP_NAME = 'Kasi Bites';
export const APP_DESCRIPTION = 'Order delicious food for delivery';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.159:8000/api';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  CART: 'cart',
} as const;

// Delivery Configuration
export const DELIVERY_FEE = 30;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 10;

// Order Status Labels
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Size Labels (for display)
export const SIZE_LABELS: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

// Colors (matching mobile app)
export const COLORS = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  accent: '#FFD23F',
  background: '#FFFFFF',
  surface: '#F6F6F6',
  text: {
    primary: '#000000',
    secondary: '#545454',
    light: '#8A8A8A',
    inverse: '#FFFFFF',
  },
  success: '#05944F',
  error: '#E21B1B',
  warning: '#FF9500',
  border: '#EEEEEE',
  divider: '#E8E8E8',
} as const;

// Categories (if used for filtering)
export const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'fries', name: 'Fries' },
  { id: 'burgers', name: 'Burgers' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'combos', name: 'Combos' },
] as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid South African phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
} as const;
