import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItemRow } from '../components/cart/CartItemRow';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCart } from '../hooks/useCart';

interface CartPageProps {
  onBackToShop: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onBackToShop }) => {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="flex flex-col gap-4 pb-28 px-4 pt-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToShop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700/60"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
        <h2 className="text-sm font-bold text-slate-200">Your Shopping Cart</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-300">Your cart is empty</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Browse our catalog and add items to your cart to get started.
          </p>
          <button
            onClick={onBackToShop}
            className="mt-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-500/20"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={(itemId, qty) => updateQuantity({ itemId, quantity: qty })}
                onRemoveItem={(itemId) => removeItem(itemId)}
              />
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal ({cart?.total_items} items)</span>
              <span className="font-semibold text-slate-200">${Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-200">Calculated at checkout</span>
            </div>
            <div className="border-t border-slate-700/50 my-1"></div>
            <div className="flex justify-between text-sm font-bold text-slate-100">
              <span>Total</span>
              <span className="text-sky-400">${Number(subtotal).toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
