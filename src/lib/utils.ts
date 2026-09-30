import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in South African Rand
export function formatPrice(price: number): string {
  return `R${price.toFixed(2)}`;
}

// Validate South African phone number
export function validateSAPhoneNumber(phone: string): boolean {
  // Remove all spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Valid formats:
  // 0821234567 (10 digits starting with 0)
  // +27821234567 (12 chars starting with +27)
  // 27821234567 (11 digits starting with 27)
  const patterns = [
    /^0[1-9][0-9]{8}$/,           // 0821234567
    /^\+27[1-9][0-9]{8}$/,        // +27821234567
    /^27[1-9][0-9]{8}$/,          // 27821234567
  ];

  return patterns.some(pattern => pattern.test(cleanPhone));
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format time for display
export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Capitalize size label
export function formatSize(size: string): string {
  return capitalize(size.toLowerCase());
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Truncate text
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

// Get the Shisa Badge tone for an order status
export function getStatusTone(status: string): 'neutral' | 'brand' | 'mielie' | 'success' | 'danger' {
  const tones: Record<string, 'neutral' | 'brand' | 'mielie' | 'success' | 'danger'> = {
    pending: 'brand',
    confirmed: 'brand',
    preparing: 'mielie',
    ready: 'mielie',
    out_for_delivery: 'mielie',
    delivered: 'success',
    cancelled: 'danger',
  };
  return tones[status] || 'neutral';
}

// Local storage helpers with error handling
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};
