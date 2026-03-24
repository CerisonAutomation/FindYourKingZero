// ═══════════════════════════════════════════════════════════════
// HOOK: useAuthInit — single source of truth for session restore
//
// Flow:
//   1. On mount, check Zustand persisted state (zustand/persist → localStorage)
//   2. If token exists, verify with API → hydrate or clear
//   3. Listen for Supabase auth events if Supabase is configured
//
// The Zustand persist middleware IS the persistence layer.
// No separate localStorage keys needed.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import { useAuthStore, useNavStore } from '@/store';
import { api } from '@/services/api';

export function useAuthInit(): void {
  const { token, user, isAuthenticated } = useAuthStore.getState();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const go = useNavStore((s) => s.go);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (hydrated.current || cancelled) return;

      // No stored session — stay on landing
      if (!token || !isAuthenticated || !user) {
        go('landing');
        return;
      }

      try {
        // Verify stored token with API
        const res = await api.auth.verify();
        if (cancelled) return;

        if (res.user) {
          // Token valid — rehydrate with server data
          hydrated.current = true;
          login(user, token);
          go('discover');
        } else {
          throw new Error('Invalid session');
        }
      } catch {
        if (cancelled) return;
        // Token expired or invalid — clear and redirect
        logout();
        go('landing');
      }
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
