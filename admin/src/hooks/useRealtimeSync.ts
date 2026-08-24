'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Robust environment variable resolution for Next.js
    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000/api/v1';

    let retryDelay = 2000;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const sseUrl = `${apiUrl.replace(/\/+$/, '')}/events`;
        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.onopen = () => {
          retryDelay = 2000;
        };

        es.onmessage = (event) => {
          try {
            if (!event.data) return;
            const payload = JSON.parse(event.data);

            if (payload.type === 'CATALOG_UPDATED') {
              // Real-time instant synchronization across admin panels and screens
              queryClient.invalidateQueries({ queryKey: ['admin-products'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['admin-categories'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['admin-brands'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['admin-colors'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['admin-product'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['brands'], refetchType: 'all' });
            }
          } catch {
            // Heartbeats / non-JSON SSE comments
          }
        };

        es.onerror = () => {
          if (es) es.close();
          if (!isUnmounted) {
            reconnectTimerRef.current = setTimeout(() => {
              retryDelay = Math.min(retryDelay * 1.5, 15000);
              connect();
            }, retryDelay);
          }
        };
      } catch {
        if (!isUnmounted) {
          reconnectTimerRef.current = setTimeout(connect, 4000);
        }
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [queryClient]);
}
