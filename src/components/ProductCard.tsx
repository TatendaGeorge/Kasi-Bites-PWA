import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ApiProduct } from '@/types';
import { Badge, Icon } from '@/components/shisa';
import { art } from '@/components/shisa/art';

interface ProductCardProps {
  product: ApiProduct;
  storeSlug: string;
  rank?: number;
  className?: string;
  onOpenModal?: (product: ApiProduct) => void;
}

export function ProductCard({ product, storeSlug, rank, className, onOpenModal }: ProductCardProps) {
  const navigate = useNavigate();

  const lowestPrice = Math.min(...product.sizes.map((s) => s.price));
  const hasSalePrice = product.sale_price !== null && product.sale_price !== undefined;
  const displayPrice = hasSalePrice ? product.sale_price : lowestPrice;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.innerWidth >= 1024 && onOpenModal) {
      onOpenModal(product);
    } else {
      navigate(`/store/${storeSlug}/product/${product.id}`, { state: { product } });
    }
  };

  return (
    <div onClick={handleClick} className={cn('block group cursor-pointer', className)}>
      <div
        className="relative w-full aspect-square overflow-hidden"
        style={{ borderRadius: 'var(--radius-md)', background: 'var(--brand-soft)' }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <img src={art('kota')} alt="" className="w-full h-full object-cover" />
        )}

        {hasSalePrice ? (
          <span className="absolute top-2 left-2">
            <Badge tone="mielie">Sale</Badge>
          </span>
        ) : rank && rank <= 3 ? (
          <span className="absolute top-2 left-2">
            <Badge tone="success">#{rank} most liked</Badge>
          </span>
        ) : null}

        <button
          onClick={handleClick}
          className="absolute bottom-2 right-2 flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            width: 32,
            height: 32,
            background: 'var(--surface)',
            borderRadius: '50%',
            boxShadow: 'var(--shadow-float)',
          }}
          aria-label={`View ${product.name}`}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      <div className="pt-2">
        <p className="line-clamp-2" style={{ font: '500 16px/22px var(--font-display)', color: 'var(--ink)' }}>
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <p className={hasSalePrice ? 'sh-fee' : ''} style={!hasSalePrice ? { color: 'var(--ink-muted)', fontSize: 14 } : { fontSize: 14 }}>
            R{displayPrice!.toFixed(2)}
          </p>
          {hasSalePrice && (
            <p className="text-xs line-through" style={{ color: 'var(--ink-subtle)' }}>
              R{lowestPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
