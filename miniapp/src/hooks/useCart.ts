import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../services/cartApi';
import { useCartStore } from '../store/cartStore';
import { CartSummary, CartItem } from '../types/cart';
import { Product, ProductVariant } from '../types/product';

export interface AddToCartParams {
  product?: Product;
  variant?: ProductVariant;
  variantId: number;
  quantity: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const cartFromStore = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartApi.getCart();
      setCart(data);
      return data;
    },
    initialData: cartFromStore || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ variantId, quantity }: AddToCartParams) =>
      cartApi.addToCart(variantId, quantity),
    onMutate: async ({ product, variant, variantId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart =
        queryClient.getQueryData<CartSummary>(['cart']) ||
        useCartStore.getState().cart || {
          items: [],
          total_items: 0,
          subtotal: 0,
        };

      const existingIndex = previousCart.items.findIndex(
        (item) => item.variant_id === variantId
      );

      const activeVariant =
        variant || product?.variants?.find((v) => v.id === variantId) || null;
      const unitPrice = Number(activeVariant?.price || 0);

      const updatedItems = [...previousCart.items];

      if (existingIndex >= 0) {
        const existing = updatedItems[existingIndex];
        const newQty = existing.quantity + quantity;
        updatedItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          item_subtotal: unitPrice * newQty,
        };
      } else {
        const optimisticItem: CartItem = {
          id: -Math.floor(Math.random() * 1000000),
          user_id: 0,
          variant_id: variantId,
          quantity: quantity,
          updated_at: new Date().toISOString(),
          variant: activeVariant,
          product: product || null,
          item_subtotal: unitPrice * quantity,
        };
        updatedItems.unshift(optimisticItem);
      }

      const totalItems = updatedItems.reduce((acc, i) => acc + i.quantity, 0);
      const subtotal = updatedItems.reduce(
        (acc, i) => acc + Number(i.item_subtotal),
        0
      );

      const optimisticCart: CartSummary = {
        items: updatedItems,
        total_items: totalItems,
        subtotal,
      };

      queryClient.setQueryData(['cart'], optimisticCart);
      setCart(optimisticCart);

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
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart =
        queryClient.getQueryData<CartSummary>(['cart']) ||
        useCartStore.getState().cart || {
          items: [],
          total_items: 0,
          subtotal: 0,
        };

      const updatedItems = previousCart.items
        .map((item) => {
          if (item.id === itemId) {
            const price = Number(item.variant?.price || 0);
            return {
              ...item,
              quantity,
              item_subtotal: price * quantity,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      const totalItems = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
      const subtotal = updatedItems.reduce(
        (acc, item) => acc + Number(item.item_subtotal),
        0
      );

      const optimisticCart: CartSummary = {
        items: updatedItems,
        total_items: totalItems,
        subtotal,
      };

      queryClient.setQueryData(['cart'], optimisticCart);
      setCart(optimisticCart);

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
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart =
        queryClient.getQueryData<CartSummary>(['cart']) ||
        useCartStore.getState().cart || {
          items: [],
          total_items: 0,
          subtotal: 0,
        };

      const updatedItems = previousCart.items.filter((item) => item.id !== itemId);
      const totalItems = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
      const subtotal = updatedItems.reduce(
        (acc, item) => acc + Number(item.item_subtotal),
        0
      );

      const optimisticCart: CartSummary = {
        items: updatedItems,
        total_items: totalItems,
        subtotal,
      };

      queryClient.setQueryData(['cart'], optimisticCart);
      setCart(optimisticCart);

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
  });

  const cart = cartQuery.data || cartFromStore;

  return {
    cart,
    isLoading: cartQuery.isLoading && !cart,
    isError: cartQuery.isError,
    addToCart: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
  };
}
