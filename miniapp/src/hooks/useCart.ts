import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../services/cartApi';
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartApi.getCart();
      setCart(data);
      return data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity: number }) =>
      cartApi.addToCart(variantId, quantity),
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData(['cart'], data);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData(['cart'], data);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData(['cart'], data);
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    addToCart: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
  };
}
