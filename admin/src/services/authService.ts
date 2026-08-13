import { adminApi } from '../lib/axios';
import { AdminAuthResponse, AdminUser } from '../types/api';

export const authService = {
  login: async (email: string, password: string): Promise<AdminAuthResponse> => {
    const { data } = await adminApi.post<AdminAuthResponse>('/admin/auth/login', {
      email,
      password,
    });
    if (data.access_token) {
      localStorage.setItem('mela_admin_token', data.access_token);
    }
    return data;
  },

  getProfile: async (): Promise<AdminUser> => {
    const { data } = await adminApi.get<AdminUser>('/admin/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('mela_admin_token');
  },
};
