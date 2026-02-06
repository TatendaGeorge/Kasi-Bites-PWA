import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MIN_QUANTITY, MAX_QUANTITY } from '@/lib/constants';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  minQuantity = MIN_QUANTITY,
  maxQuantity = MAX_QUANTITY,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const sizes = {
    sm: {
      container: 'h-8',
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'w-8 text-sm',
    },
    md: {
      container: 'h-10',
      button: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'w-10 text-base',
    },
    lg: {
      container: 'h-12',
      button: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'w-12 text-lg',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        'inline-flex items-center bg-gray-100 rounded-full',
        sizeConfig.container,
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= minQuantity}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          'hover:bg-gray-200 active:bg-gray-300',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          sizeConfig.button
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={sizeConfig.icon} />
      </button>

      <span
        className={cn(
          'text-center font-semibold',
          sizeConfig.text
        )}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          'hover:bg-gray-200 active:bg-gray-300',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          sizeConfig.button
        )}
        aria-label="Increase quantity"
      >
        <Plus className={sizeConfig.icon} />
      </button>
    </div>
  );
}
