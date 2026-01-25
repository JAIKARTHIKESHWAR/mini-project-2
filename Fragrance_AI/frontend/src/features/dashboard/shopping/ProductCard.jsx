import React from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import useCartStore from '../state/useCartStore';

const ProductCard = ({ product, onView }) => {
  const { addItem } = useCartStore();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <Badge className="absolute top-2 left-2 bg-black/50 text-white border-white/20">
          {product.vendor}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white line-clamp-1">{product.name}</p>
          <p className="text-xs text-slate-400">{product.price}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => onView?.(product)}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      <Button onClick={() => addItem(product)}>
        <ShoppingCart className="h-4 w-4" /> Add to cart
      </Button>
    </div>
  );
};

export default ProductCard;

