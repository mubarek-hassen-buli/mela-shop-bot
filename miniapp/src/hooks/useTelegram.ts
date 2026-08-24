import { useEffect, useMemo } from 'react';
import { TelegramUser, TelegramWebApp } from '../types/telegram';

export function useTelegram() {
  const tg: TelegramWebApp | undefined = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();

      // Configure native Telegram header and background to match #0E0E10 brand color
      try {
        if (typeof tg.setHeaderColor === 'function') {
          tg.setHeaderColor('#0E0E10');
        }
        if (typeof tg.setBackgroundColor === 'function') {
          tg.setBackgroundColor('#0E0E10');
        }
        if (typeof tg.setBottomBarColor === 'function') {
          tg.setBottomBarColor('#0E0E10');
        }
      } catch (e) {
        console.warn('Could not set Telegram native bar colors:', e);
      }
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
