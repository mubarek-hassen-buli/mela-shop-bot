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
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);

  return (
    <div className="flex flex-col gap-4 pb-28 px-3.5 pt-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToShop}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xl border border-white/15 active:scale-95 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
        <h2 className="text-sm font-bold text-white">Your Shopping Cart</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#141922]/80 border border-white/10 flex items-center justify-center text-slate-400 shadow-lg">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Your cart is empty</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Browse our catalog and add items to your cart to get started.
          </p>
          <button
            onClick={onBackToShop}
            className="mt-4 px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/25 text-white text-xs font-bold shadow-lg active:scale-95 transition-all"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={(itemId, qty) => updateQuantity({ itemId, quantity: qty })}
                onRemoveItem={(itemId) => removeItem(itemId)}
              />
            ))}
          </div>

          <div className="mt-2 p-5 bg-[#121722]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl flex flex-col gap-2.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal ({cart?.total_items} items)</span>
              <span className="font-bold text-white">{subtotal.toLocaleString()} Birr</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Estimated Delivery</span>
              <span className="font-medium text-slate-200">Free in Addis Ababa</span>
            </div>
            <div className="border-t border-white/10 my-1.5" />
            <div className="flex justify-between text-base font-extrabold text-white">
              <span>Total</span>
              <span className="text-white">{subtotal.toLocaleString()} Birr</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
