import { api } from './api';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    telegram_id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
}

export const authApi = {
  loginWithTelegram: async (initData: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/telegram', {
      init_data: initData,
    });
    if (data.access_token) {
      localStorage.setItem('mela_shop_jwt', data.access_token);
    }
    return data;
  },
};
