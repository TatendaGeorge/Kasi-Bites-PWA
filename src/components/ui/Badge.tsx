import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' |
    'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  className?: string;
}

const variants = {
  // Generic variants
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-600',
  primary: 'bg-orange-500 text-white',
  // Status-specific variants (matching admin)
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Helper to get variant from order status
export function getStatusVariant(status: OrderStatus): keyof typeof variants {
  return status;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
