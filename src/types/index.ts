// Size Types
export type FriesSize = 'Small' | 'Medium' | 'Large';

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  sizes: ProductSize[];
}

export interface ProductSize {
  size: FriesSize;
  price: number;
}

// Cart Types
export interface CartItemAddon {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productSizeId?: number;
  name: string;
  size: FriesSize;
  quantity: number;
  price: number;
  addons?: CartItemAddon[];
  imageUrl?: string | null;
}

// Order Types
export interface CheckoutForm {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  specialInstructions: string;
}

export interface Order {
  orderNumber: string;
  items: CartItem[];
  customerDetails: CheckoutForm;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  estimatedDelivery: string;
  createdAt: Date;
}

export type PaymentMethod = 'cash_on_delivery';

// API Order Types
export interface ApiOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  status_label: string;
  payment_method: string;
  payment_method_label: string;
  notes: string | null;
  estimated_delivery_at: string | null;
  created_at: string;
  items: ApiOrderItem[];
  status_history: ApiOrderStatusHistory[];
}

export interface ApiOrderItem {
  id: number;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ApiOrderStatusHistory {
  status: OrderStatus;
  status_label: string;
  notes: string | null;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

// Form Validation Types
export interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  deliveryAddress?: string;
}

// Cart Context Types
export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addToCart: (name: string, size: FriesSize, quantity: number, price: number, productSizeId?: number, addons?: CartItemAddon[], imageUrl?: string | null) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartEmpty: boolean;
}

// API Product Types
export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sale_price: number | null;
  category_id: number | null;
  category: ApiCategory | null;
  sizes: ApiProductSize[];
  addons: ApiAddon[];
}

export interface ApiProductSize {
  id: number;
  size: 'small' | 'medium' | 'large';
  price: number;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export interface ApiAddon {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  default_address: string | null;
  default_address_latitude: number | null;
  default_address_longitude: number | null;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; default_address?: string; default_address_latitude?: number; default_address_longitude?: number }) => Promise<{ success: boolean; error?: string }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Create Order Data
export interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  payment_method?: 'cash' | 'card';
  notes?: string;
  items: {
    product_size_id: number;
    quantity: number;
    addon_ids?: number[];
  }[];
}
