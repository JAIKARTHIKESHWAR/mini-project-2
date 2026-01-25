import React from 'react';
import { Trash2, X, Minus, Plus } from 'lucide-react';
import Sheet from '../../../components/ui/Sheet';
import Button from '../../../components/ui/Button';
import useCartStore from '../state/useCartStore';

const CartSidebar = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + (item.priceValue || 0) * item.quantity, 0);

  return (
    <Sheet open={isOpen} onClose={closeCart} side="right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Cart</h3>
        <Button variant="ghost" size="sm" onClick={closeCart}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-300">No items yet. Add perfumes to preview.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="h-16 w-16 rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white line-clamp-1">{item.name}</p>
                <p className="text-xs text-slate-400">{item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-white">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-4 w-4 text-rose-300" />
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-white">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={clearCart}>
            Clear
          </Button>
          <Button className="flex-1">Checkout</Button>
        </div>
      </div>
    </Sheet>
  );
};

export default CartSidebar;

