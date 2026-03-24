// Gamechanger #20 — QueryClient with optimal defaults + prefetch helpers
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Gamechanger #21 — Prefetch on hover/intent, not on mount
export function prefetchProfiles() {
  return queryClient.prefetchQuery({
    queryKey: ['profiles'],
    queryFn: () => fetch('/api/profiles').then(r => r.json()),
    staleTime: 30_000,
  });
}

export function prefetchMessages(userId: string) {
  return queryClient.prefetchQuery({
    queryKey: ['messages', userId],
    queryFn: () => fetch(`/api/messages/${userId}`).then(r => r.json()),
  });
}
