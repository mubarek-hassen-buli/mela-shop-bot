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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
          M
        </div>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h1>
      </div>

      {onCartClick && (
        <button
          onClick={onCartClick}
          className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition-all border border-slate-700/50"
        >
          <ShoppingBag className="w-5 h-5 text-sky-400" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-sky-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      )}
    </header>
  );
};
