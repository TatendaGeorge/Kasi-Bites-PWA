import { cn } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/types';
import { Stepper, IconButton } from '@/components/shisa';
import { art } from '@/components/shisa/art';

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
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden" style={{ borderRadius: 'var(--radius-md)', background: 'var(--brand-soft)' }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <img src={art('kota')} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="line-clamp-1" style={{ font: '500 16px/22px var(--font-display)', color: 'var(--ink)' }}>
              {item.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              {item.size}
            </p>
            {item.addons && item.addons.length > 0 && (
              <p className="text-xs" style={{ color: 'var(--brand-text)' }}>
                + {item.addons.map((a) => a.name).join(', ')}
              </p>
            )}
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              R{item.price.toFixed(2)} each
            </p>
          </div>

          <IconButton icon="x" label="Remove item" size="sm" flat onClick={() => onRemove(item.id)} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <Stepper value={item.quantity} onChange={(q) => onUpdateQuantity(item.id, q)} />
          <span style={{ font: '700 15px/20px var(--font-body)', color: 'var(--ink)' }}>R{itemTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
