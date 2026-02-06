import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiProduct } from '@/types';
import { Badge } from './ui/Badge';

interface ProductCardProps {
  product: ApiProduct;
  rank?: number;
  className?: string;
}

export function ProductCard({ product, rank, className }: ProductCardProps) {
  // Get the lowest price from all sizes
  const lowestPrice = Math.min(...product.sizes.map(s => s.price));

  // Check if product has a sale price
  const hasSalePrice = product.sale_price !== null && product.sale_price !== undefined;
  const displayPrice = hasSalePrice ? product.sale_price : lowestPrice;

  return (
    <Link
      to={`/product/${product.id}`}
      state={{ product }}
      className={cn('block group', className)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <span className="text-5xl">🍟</span>
          </div>
        )}

        {/* Sale Badge */}
        {hasSalePrice && (
          <Badge variant="warning" className="absolute top-2 left-2">
            Sale
          </Badge>
        )}

        {/* Rank Badge - only show if no sale badge */}
        {!hasSalePrice && rank && rank <= 3 && (
          <Badge variant="success" className="absolute top-2 left-2">
            #{rank} most liked
          </Badge>
        )}

        {/* Add Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // Will navigate to product detail
          }}
          className={cn(
            'absolute bottom-2 right-2',
            'w-8 h-8 bg-white rounded-full shadow-md',
            'flex items-center justify-center',
            'transition-transform group-hover:scale-110',
            'hover:bg-gray-50 active:bg-gray-100'
          )}
          aria-label={`View ${product.name}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="pt-2">
        <p className="text-base font-medium line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm',
            hasSalePrice ? 'text-orange-500 font-semibold' : 'text-gray-500'
          )}>
            R{displayPrice!.toFixed(2)}
          </p>
          {hasSalePrice && (
            <p className="text-xs text-gray-400 line-through">
              R{lowestPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
