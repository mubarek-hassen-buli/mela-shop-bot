import { useQuery } from '@tanstack/react-query';
import { catalogApi, ProductQueryParams } from '../services/catalogApi';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 1000 * 60 * 10,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: catalogApi.getBrands,
    staleTime: 1000 * 60 * 10,
  });
}

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => catalogApi.getProducts(params),
  });
}

export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogApi.getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}
