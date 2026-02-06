import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/types';
import { QuantitySelector } from './QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function CartItem({ item, onUpdateQuantity, onRemove, className }: CartItemProps) {
  const itemTotal = item.price * item.quantity;

  return (
    <div className={cn('flex gap-3 py-4', className)}>
      {/* Product Image */}
      <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-orange-50 flex items-center justify-center">
            <span className="text-3xl">🍟</span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-medium text-base line-clamp-1">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.size}</p>
            {item.addons && item.addons.length > 0 && (
              <p className="text-xs text-orange-500">
                + {item.addons.map(a => a.name).join(', ')}
              </p>
            )}
            <p className="text-sm text-gray-500">R{item.price.toFixed(2)} each</p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Quantity and Total */}
        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(quantity) => onUpdateQuantity(item.id, quantity)}
            size="sm"
          />
          <span className="font-semibold">R{itemTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
