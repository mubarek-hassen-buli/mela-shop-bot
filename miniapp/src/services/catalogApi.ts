import { api } from './api';
import { Category, Brand, Product, PaginatedProducts } from '../types/product';

export interface ProductQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'newest';
}

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getBrands: async (): Promise<Brand[]> => {
    const { data } = await api.get<Brand[]>('/brands');
    return data;
  },

  getProducts: async (params?: ProductQueryParams): Promise<PaginatedProducts> => {
    const { data } = await api.get<PaginatedProducts>('/products', { params });
    return data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${slug}`);
    return data;
  },
};
