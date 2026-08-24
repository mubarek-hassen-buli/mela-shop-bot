import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Robust environment variable resolution
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
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
              // Instantly invalidate and refetch all catalog queries on the user's screen
              queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['brands'], refetchType: 'all' });
              queryClient.invalidateQueries({ queryKey: ['product'], refetchType: 'all' });
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
