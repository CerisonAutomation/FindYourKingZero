// Gamechanger #13 — Immer middleware for Zustand: mutate state directly, no spreads
// Gamechanger #14 — subscribeWithSelector: surgical subscriptions, no cascade re-renders
// Gamechanger #15 — persist: auto-restore auth session on reload
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    subscribeWithSelector(
      immer((set) => ({
        userId: null,
        token: null,
        isAuthenticated: false,
        setAuth: (userId, token) => set((s) => {
          s.userId = userId;
          s.token = token;
          s.isAuthenticated = true;
        }),
        clearAuth: () => set((s) => {
          s.userId = null;
          s.token = null;
          s.isAuthenticated = false;
        }),
      }))
    ),
    {
      name: 'fyk-auth',
      partialize: (s) => ({ userId: s.userId, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);
