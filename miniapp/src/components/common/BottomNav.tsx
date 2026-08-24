import React from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useTelegram } from '../../hooks/useTelegram';

export type NavTab = 'home' | 'favorites' | 'cart' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { triggerHaptic } = useTelegram();
  const cart = useCartStore((state) => state.cart);
  const wishlist = useWishlistStore((state) => state.wishlist);

  const totalCartItems = cart?.total_items || 0;
  const totalWishlistItems = wishlist?.length || 0;

  const handleTabSelect = (tabId: NavTab) => {
    if (tabId !== activeTab) {
      triggerHaptic('light');
      onTabChange(tabId);
    }
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3.5 pointer-events-none">
      <nav className="relative w-full max-w-[390px] h-[68px] rounded-[34px] ios-glass-dock px-2 flex items-center justify-between pointer-events-auto">

        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => handleTabSelect('home')}
          className="relative flex-1 h-[52px] flex items-center justify-center rounded-full transition-all"
        >
          {activeTab === 'home' && (
            <motion.div
              layoutId="liquid-nav-squircle"
              className="absolute inset-x-1.5 inset-y-0 rounded-full ios-glass-active-tab"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center justify-center">
            {/* Custom Filled Home Icon matching Figma */}
            <svg
              viewBox="0 0 24 24"
              className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'home' ? 'fill-white scale-105 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]' : 'fill-white/60 hover:fill-white/80'
                }`}
            >
              <path d="M12 3L3 11h3v9h5v-5h2v5h5v-9h3L12 3z" />
            </svg>
          </div>
        </button>

        {/* Tab 2: Wishlist */}
        <button
          type="button"
          onClick={() => handleTabSelect('favorites')}
          className="relative flex-1 h-[52px] flex items-center justify-center rounded-full transition-all"
        >
          {activeTab === 'favorites' && (
            <motion.div
              layoutId="liquid-nav-squircle"
              className="absolute inset-x-1.5 inset-y-0 rounded-full ios-glass-active-tab"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill={activeTab === 'favorites' ? 'white' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'favorites' ? 'text-white scale-105 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]' : 'text-white/60 hover:text-white/80'
                }`}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {totalWishlistItems > 0 && activeTab !== 'favorites' && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-white shadow-sm" />
            )}
          </div>
        </button>

        {/* Tab 3: Cart */}
        <button
          type="button"
          onClick={() => handleTabSelect('cart')}
          className="relative flex-1 h-[52px] flex items-center justify-center rounded-full transition-all"
        >
          {activeTab === 'cart' && (
            <motion.div
              layoutId="liquid-nav-squircle"
              className="absolute inset-x-1.5 inset-y-0 rounded-full ios-glass-active-tab"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'cart' ? 'text-white stroke-[2.4] scale-105 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]' : 'text-white/60 hover:text-white/80'
                }`}
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-white text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {totalCartItems}
              </span>
            )}
          </div>
        </button>

        {/* Tab 4: Profile */}
        <button
          type="button"
          onClick={() => handleTabSelect('profile')}
          className="relative flex-1 h-[52px] flex items-center justify-center rounded-full transition-all"
        >
          {activeTab === 'profile' && (
            <motion.div
              layoutId="liquid-nav-squircle"
              className="absolute inset-x-1.5 inset-y-0 rounded-full ios-glass-active-tab"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-6 h-6 transition-transform duration-200 ${activeTab === 'profile' ? 'text-white stroke-[2.4] scale-105 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]' : 'text-white/60 hover:text-white/80'
                }`}
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </button>

      </nav>
    </div>
  );
};
