import { useEffect, useMemo } from 'react';
import { TelegramUser, TelegramWebApp } from '../types/telegram';

export function useTelegram() {
  const tg: TelegramWebApp | undefined = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  const user: TelegramUser | undefined = useMemo(() => {
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
    // Development fallback mock user if enabled
    if (import.meta.env.VITE_ENABLE_MOCK_TELEGRAM === 'true') {
      return {
        id: 999888777,
        first_name: 'Demo',
        last_name: 'Customer',
        username: 'democustomer',
        language_code: 'en',
      };
    }
    return undefined;
  }, [tg]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      tg?.HapticFeedback?.impactOccurred(style);
    } catch (e) {
      // Haptics not available
    }
  };

  return {
    tg,
    user,
    initData: tg?.initData || '',
    colorScheme: tg?.colorScheme || 'dark',
    triggerHaptic,
    closeApp: () => tg?.close(),
  };
}
