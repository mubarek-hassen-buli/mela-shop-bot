import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';

interface WishlistState {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      toggleWishlist: (product) => {
        const current = get().wishlist;
        const exists = current.some((p) => p.id === product.id);
        if (exists) {
          set({ wishlist: current.filter((p) => p.id !== product.id) });
        } else {
          set({ wishlist: [...current, product] });
        }
      },
      isWishlisted: (productId) => {
        return get().wishlist.some((p) => p.id === productId);
      },
    }),
    {
      name: 'mela_wishlist_storage',
    }
  )
);
