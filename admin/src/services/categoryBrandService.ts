import { adminApi } from '../lib/axios';
import { Category, Brand } from '../types/product';
import { MessageResponse, PaginatedResponse, AdminUser } from '../types/api';

export const categoryBrandService = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await adminApi.get<Category[]>('/admin/categories');
    return data;
  },

  createCategory: async (name: string, slug: string, parent_id?: number): Promise<Category> => {
    const { data } = await adminApi.post<Category>('/admin/categories', { name, slug, parent_id });
    return data;
  },

  deleteCategory: async (id: number): Promise<MessageResponse> => {
    const { data } = await adminApi.delete<MessageResponse>(`/admin/categories/${id}`);
    return data;
  },

  getBrands: async (): Promise<Brand[]> => {
    const { data } = await adminApi.get<Brand[]>('/admin/brands');
    return data;
  },

  createBrand: async (name: string, slug: string, logo_url?: string): Promise<Brand> => {
    const { data } = await adminApi.post<Brand>('/admin/brands', { name, slug, logo_url });
    return data;
  },

  deleteBrand: async (id: number): Promise<MessageResponse> => {
    const { data } = await adminApi.delete<MessageResponse>(`/admin/brands/${id}`);
    return data;
  },

  getCustomers: async (params?: { page?: number; search?: string }): Promise<PaginatedResponse<AdminUser>> => {
    const { data } = await adminApi.get<PaginatedResponse<AdminUser>>('/admin/customers', { params });
    return data;
  },
};
