// ═══════════════════════════════════════════════════════════════
// HOOK: useAuthInit — restore Supabase session on app load
// Replaces the old api.auth.verify() pattern
// ═══════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useNavStore } from '@/store';
import type { UserProfile } from '@/types';

export function useAuthInit() {
  const login  = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const go     = useNavStore((s) => s.go);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) return;
      const u    = session.user;
      const meta = u.user_metadata ?? {};
      const profile: UserProfile = {
        id:     u.id,
        email:  u.email ?? '',
        name:   (meta.name as string) || u.email?.split('@')[0] || 'King',
        avatar: (meta.avatar_url as string) || '',
        bio:    '',
        age:    (meta.age as number) || 18,
        city:   '',
        tribes: [],
        lookingFor: [],
        online: true,
        height: '',
        position: '',
        relationshipStatus: 'Single',
        hivStatus: '',
        onPrEP: false,
        photos: [],
        verified: u.email_confirmed_at != null,
        premium: false,
        distance: 0,
        lastSeen: Date.now(),
      };
      login(profile, session.access_token);
    });

    // Listen for auth state changes (token refresh, sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        logout();
        go('landing');
      }
      if (event === 'TOKEN_REFRESHED' && session) {
        // Silently update token in store
        useAuthStore.setState((s) => ({ ...s, token: session.access_token }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
