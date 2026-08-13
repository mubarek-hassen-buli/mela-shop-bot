import React from 'react';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface BottomNavProps {
  activeTab: 'home' | 'cart' | 'profile';
  onTabChange: (tab: 'home' | 'cart' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart?.total_items || 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-6 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-sky-400 font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px]">Shop</span>
        </button>

        <button
          onClick={() => onTabChange('cart')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === 'cart' ? 'text-sky-400 font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-sky-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[11px]">Cart</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-sky-400 font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};
