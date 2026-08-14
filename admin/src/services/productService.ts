import { adminApi } from '../lib/axios';
import { Product, ProductCreatePayload, Color } from '../types/product';
import { PaginatedResponse, MessageResponse, DashboardStats } from '../types/api';

export const productService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await adminApi.get<DashboardStats>('/admin/dashboard/stats');
    return data;
  },

  getProducts: async (params?: { page?: number; search?: string; category_id?: number }): Promise<PaginatedResponse<Product>> => {
    const { data } = await adminApi.get<PaginatedResponse<Product>>('/admin/products', { params });
    return data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const { data } = await adminApi.get<Product>(`/admin/products/${id}`);
    return data;
  },

  createProduct: async (payload: ProductCreatePayload): Promise<Product> => {
    const { data } = await adminApi.post<Product>('/admin/products', payload);
    return data;
  },

  updateProduct: async (id: number, payload: Partial<ProductCreatePayload>): Promise<Product> => {
    const { data } = await adminApi.put<Product>(`/admin/products/${id}`, payload);
    return data;
  },

  toggleProductStatus: async (id: number): Promise<Product> => {
    const { data } = await adminApi.patch<Product>(`/admin/products/${id}/toggle-status`);
    return data;
  },

  deleteProduct: async (id: number): Promise<MessageResponse> => {
    const { data } = await adminApi.delete<MessageResponse>(`/admin/products/${id}`);
    return data;
  },

  getColors: async (): Promise<Color[]> => {
    const { data } = await adminApi.get<Color[]>('/admin/products/colors');
    return data;
  },

  createColor: async (name: string, hex_code: string): Promise<Color> => {
    const { data } = await adminApi.post<Color>('/admin/products/colors', { name, hex_code });
    return data;
  },
};
