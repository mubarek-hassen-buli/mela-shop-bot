import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../services/cartApi';
import { useCartStore } from '../store/cartStore';
import { CartSummary } from '../types/cart';

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
    staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity: number }) =>
      cartApi.addToCart(variantId, quantity),
    onMutate: async ({ quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartSummary>(['cart']);

      if (previousCart) {
        const optimisticCart: CartSummary = {
          ...previousCart,
          total_items: previousCart.total_items + quantity,
        };
        queryClient.setQueryData(['cart'], optimisticCart);
        setCart(optimisticCart);
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setCart(context.previousCart);
      }
    },
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData(['cart'], data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartSummary>(['cart']);

      if (previousCart) {
        const updatedItems = previousCart.items.map((item) => {
          if (item.id === itemId) {
            const price = Number(item.variant?.price || 0);
            return {
              ...item,
              quantity,
              item_subtotal: price * quantity,
            };
          }
          return item;
        });

        const totalItems = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
        const subtotal = updatedItems.reduce((acc, item) => acc + Number(item.item_subtotal), 0);

        const optimisticCart: CartSummary = {
          items: updatedItems,
          total_items: totalItems,
          subtotal,
        };

        queryClient.setQueryData(['cart'], optimisticCart);
        setCart(optimisticCart);
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setCart(context.previousCart);
      }
    },
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData(['cart'], data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartSummary>(['cart']);

      if (previousCart) {
        const updatedItems = previousCart.items.filter((item) => item.id !== itemId);
        const totalItems = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
        const subtotal = updatedItems.reduce((acc, item) => acc + Number(item.item_subtotal), 0);

        const optimisticCart: CartSummary = {
          items: updatedItems,
          total_items: totalItems,
          subtotal,
        };

        queryClient.setQueryData(['cart'], optimisticCart);
        setCart(optimisticCart);
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setCart(context.previousCart);
      }
    },
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData(['cart'], data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
