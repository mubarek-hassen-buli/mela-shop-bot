import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        eventSource = new EventSource(`${apiUrl}/events`);

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'CATALOG_UPDATED') {
              // Real-time instant catalog synchronization on customer's phone
              queryClient.invalidateQueries({ queryKey: ['products'] });
              queryClient.invalidateQueries({ queryKey: ['categories'] });
              queryClient.invalidateQueries({ queryKey: ['brands'] });
              queryClient.invalidateQueries({ queryKey: ['product-details'] });
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
