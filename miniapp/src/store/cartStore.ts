import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartSummary } from '../types/cart';

interface CartState {
  cart: CartSummary | null;
  setCart: (cart: CartSummary) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: null }),
    }),
    {
      name: 'mela_cart_storage',
    }
  )
);
