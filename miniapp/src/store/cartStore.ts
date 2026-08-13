import { create } from 'zustand';
import { CartSummary } from '../types/cart';

interface CartState {
  cart: CartSummary | null;
  setCart: (cart: CartSummary) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
}));
