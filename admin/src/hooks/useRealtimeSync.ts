'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        eventSource = new EventSource(`${apiUrl}/events`);

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'CATALOG_UPDATED') {
              // Real-time optimistic synchronization
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
              queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
              queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            }
          } catch {
            // Heartbeats / comments
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
          }
          reconnectTimeout = setTimeout(connect, 4000);
        };
      } catch {
        reconnectTimeout = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [queryClient]);
}
