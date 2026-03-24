// ═══════════════════════════════════════════════════════════════
// HOOK: useAuthInit — restore API session on app load
// Graceful fallback if API is unreachable
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import { useAuthStore, useNavStore } from '@/store';
import type { UserProfile } from '@/types';
import { api } from '@/services/api';

const TOKEN_KEY = 'king-token';
const PROFILE_KEY = 'king-profile';

export function useAuthInit(): void {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const go = useNavStore((s) => s.go);
  const hydrated = useRef(false);

  useEffect(() => {
    let unsubscribed = false;

    // 1. Try to restore from localStorage on mount
    (async () => {
      if (unsubscribed || hydrated.current) return;
      
      const token = localStorage.getItem(TOKEN_KEY);
      const profileJson = localStorage.getItem(PROFILE_KEY);
      
      if (token && profileJson) {
        try {
          const profile = JSON.parse(profileJson) as UserProfile;
          // Verify token with API
          const res = await api.auth.verify();
          if (res.token) {
            hydrated.current = true;
            login(profile, res.token);
            go('discover');
            return;
          }
        } catch (e) {
          // Token invalid or expired, clear storage
          console.warn('[useAuthInit] stored token invalid');
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(PROFILE_KEY);
        }
      }
      
      // No valid stored token, check if we're already on auth screen
      const currentScreen = useNavStore.getState().screen;
      if (currentScreen !== 'signin' && currentScreen !== 'signup' && currentScreen !== 'landing') {
        go('landing');
      }
    })();

    // 2. Listen for auth events from API (optional - could implement via polling or websocket)
    // For now, we rely on explicit login/logout calls storing to localStorage
    
    return () => {
      unsubscribed = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Auth storage helpers ──────────────────────────────────────
export function storeAuth(token: string, profile: UserProfile): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}