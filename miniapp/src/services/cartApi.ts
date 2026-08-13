import { api } from './api';
import { CartSummary } from '../types/cart';

export const cartApi = {
  getCart: async (): Promise<CartSummary> => {
    const { data } = await api.get<CartSummary>('/cart');
    return data;
  },

  addToCart: async (variantId: number, quantity: number = 1): Promise<CartSummary> => {
    const { data } = await api.post<CartSummary>('/cart/items', {
      variant_id: variantId,
      quantity,
    });
    return data;
  },

  updateQuantity: async (itemId: number, quantity: number): Promise<CartSummary> => {
    const { data } = await api.patch<CartSummary>(`/cart/items/${itemId}`, {
      quantity,
    });
    return data;
  },

  removeItem: async (itemId: number): Promise<CartSummary> => {
    const { data } = await api.delete<CartSummary>(`/cart/items/${itemId}`);
    return data;
  },
};
