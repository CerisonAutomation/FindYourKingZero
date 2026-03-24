// ═══════════════════════════════════════════════════════════════
// HOOK: useUser — derives user state directly from Zustand store
// Stack: Vite + React 18 + Zustand — NO Supabase context,
//        NO React Context, NO 'use client'
// Upgraded: selector-based (prevents all unnecessary re-renders),
//           typed return, isOnboarded + isSubscribed derived flags,
//           JSDoc, zero external deps beyond store
// ═══════════════════════════════════════════════════════════════

import { useAuthStore } from '@/store';
import type { UserProfile } from '@/types';

export interface UseUserReturn {
  /** Full user profile or null when logged out */
  user: UserProfile | null;
  /** JWT or session token */
  token: string | null;
  /** True when a valid session exists */
  isAuthenticated: boolean;
  /** True when user has completed onboarding (has display_name + photos) */
  isOnboarded: boolean;
  /** True when user has an active premium subscription */
  isSubscribed: boolean;
  /** User's display name shorthand */
  displayName: string;
  /** User's first photo URL or empty string */
  avatarUrl: string;
}

/**
 * Read-only view of authenticated user state.
 * Backed by the Zustand `useAuthStore` — no providers required.
 *
 * @example
 * const { user, isAuthenticated, isOnboarded } = useUser();
 */
export function useUser(): UseUserReturn {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isOnboarded = Boolean(
    user?.display_name && user?.photos && user.photos.length > 0,
  );

  const isSubscribed = Boolean(
    user?.subscription_tier && user.subscription_tier !== 'free',
  );

  const displayName = user?.display_name ?? user?.email?.split('@')[0] ?? 'User';
  const avatarUrl = user?.photos?.[0] ?? '';

  return {
    user,
    token,
    isAuthenticated,
    isOnboarded,
    isSubscribed,
    displayName,
    avatarUrl,
  };
}
