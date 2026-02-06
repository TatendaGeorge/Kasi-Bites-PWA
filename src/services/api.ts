import type { ApiOrder, ApiProduct, CreateOrderData, User } from '@/types';
import { API_BASE_URL, STORAGE_KEYS } from '@/lib/constants';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private token: string | null = null;

  init(): void {
    this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  getToken(): string | null {
    // Always check localStorage as fallback in case token wasn't set in memory
    if (!this.token) {
      this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Always get fresh token before each request
    const currentToken = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Something went wrong',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  // Auth endpoints
  async register(name: string, email: string, phone: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        password_confirmation: password
      }),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/logout', { method: 'POST' });
    this.setToken(null);
    return response;
  }

  async getUser() {
    return this.request<{ user: User }>('/user');
  }

  async updateProfile(data: { name?: string; phone?: string; default_address?: string }) {
    return this.request<{ message: string; user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts() {
    return this.request<{ products: ApiProduct[] }>('/products');
  }

  // Orders
  async createOrder(orderData: CreateOrderData) {
    return this.request<{ message: string; order: ApiOrder }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderNumber: string) {
    return this.request<{ order: ApiOrder }>(`/orders/${orderNumber}`);
  }

  async getMyOrders(page: number = 1, perPage: number = 50) {
    return this.request<{ orders: ApiOrder[]; meta: { current_page: number; last_page: number; total: number } }>(`/orders?page=${page}&per_page=${perPage}`);
  }

  // Device tokens for push notifications
  async registerDeviceToken(token: string, platform: string = 'web') {
    return this.request('/device-tokens', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }

  // Store settings (public)
  async getStoreSettings() {
    return this.request<{
      data: {
        store_name: string;
        store_address: string | null;
        store_phone: string | null;
        store_latitude: number | null;
        store_longitude: number | null;
        delivery_fee: number;
        delivery_radius_km: number;
        minimum_order_amount: number;
        is_store_open: boolean;
        operating_hours: Record<string, { open: string; close: string; is_open: boolean }> | null;
      };
    }>('/store/settings');
  }

  // Web Push notifications
  async getVapidPublicKey() {
    return this.request<{ public_key: string }>('/web-push/vapid-public-key').then(
      (response) => response.data || { public_key: '' }
    );
  }

  async subscribeWebPush(subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }) {
    return this.request<{ message: string; subscription_id: number }>(
      '/web-push/subscribe',
      {
        method: 'POST',
        body: JSON.stringify(subscription),
      }
    );
  }

  async unsubscribeWebPush(endpoint: string) {
    return this.request<{ message: string }>('/web-push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    });
  }
}

export const api = new ApiService();
export default api;
