import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface HeaderProps {
  title?: string;
  onCartClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Mela Shop', onCartClick }) => {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart?.total_items || 0;

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-white flex items-center justify-center font-extrabold text-slate-950 text-sm shadow-md">
          M
        </div>
        <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>
      </div>

      {onCartClick && (
        <button
          onClick={onCartClick}
          className="relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15 active:scale-95 shadow-md"
        >
          <ShoppingBag className="w-4 h-4 text-slate-200" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-slate-950 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      )}
    </header>
  );
};
