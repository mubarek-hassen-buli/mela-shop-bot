import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { AdminUser } from '../types/api';

export function useAdminAuth(requireAuth = true) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mela_admin_token');
    if (!token) {
      setIsLoading(false);
      if (requireAuth) {
        router.push('/login');
      }
      return;
    }

    authService
      .getProfile()
      .then((data) => {
        setAdmin(data);
      })
      .catch(() => {
        localStorage.removeItem('mela_admin_token');
        if (requireAuth) {
          router.push('/login');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [requireAuth, router]);

  const logout = () => {
    authService.logout();
    setAdmin(null);
    router.push('/login');
  };

  return { admin, isLoading, logout };
}
