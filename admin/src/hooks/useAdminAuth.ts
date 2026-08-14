import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { AdminUser } from '../types/api';

export function useAdminAuth(requireAuth = true) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const token = mounted ? localStorage.getItem('mela_admin_token') : null;

  const { data: admin, isLoading, isError } = useQuery<AdminUser>({
    queryKey: ['admin-profile'],
    queryFn: authService.getProfile,
    enabled: Boolean(token),
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (!mounted) return;

    if (!token && requireAuth) {
      router.push('/login');
    }
    if (isError && requireAuth) {
      localStorage.removeItem('mela_admin_token');
      router.push('/login');
    }
  }, [mounted, token, isError, requireAuth, router]);

  const logout = () => {
    authService.logout();
    queryClient.clear();
    router.push('/login');
  };

  return {
    admin: admin || null,
    isLoading: !mounted || (Boolean(token) && isLoading),
    logout,
  };
}

