// ═══════════════════════════════════════════════════════════════
// HOOK: useAuthInit — session restore + auth state listener
//
// Flow:
//   1. On mount, check for existing Supabase session
//   2. If session exists → fetch profile → hydrate Zustand store
//   3. Listen for auth events (sign in, sign out, token refresh)
//   4. Supabase persist handles localStorage automatically
//
// Works with or without Supabase:
//   - Supabase configured: full auth flow
//   - Supabase not configured: redirect to landing (no auth possible)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useNavStore } from '@/store';
import type { UserProfile } from '@/types';

/** Fetch user profile from Supabase DB and map to UserProfile. */
async function fetchProfile(userId: string, session: Session): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `id, handle, display_name, bio, age, height_cm, weight_kg, body_type,
       position, hiv_status, last_tested_at, on_prep, practices, tribes,
       looking_for, kinks, meet_places, body_hair, ethnicity, relationship_status,
       languages, photo_url, verified, premium, online_status, last_seen_at,
       available_now, incognito, coarse_lat, coarse_lng, geohash,
       onboarding_completed, is_active, is_banned, created_at,
       photos ( id, url, thumbnail_url, is_private, caption, sort_order )`,
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[useAuthInit] profile fetch error', error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    authId: userId,
    email: session.user.email ?? '',
    name: data.display_name ?? session.user.email?.split('@')[0] ?? 'King',
    avatar: data.photo_url ?? '',
    bio: data.bio ?? '',
    age: data.age ?? 18,
    city: '',
    lat: data.coarse_lat ?? 0,
    lng: data.coarse_lng ?? 0,
    h3Hex: data.geohash ?? '',
    distance: 0,
    tribes: (data.tribes ?? []) as UserProfile['tribes'],
    lookingFor: (data.looking_for ?? []) as UserProfile['lookingFor'],
    height: data.height_cm ? `${data.height_cm}cm` : '',
    position: (data.position ?? '') as UserProfile['position'],
    relationshipStatus: (data.relationship_status ?? 'Single') as UserProfile['relationshipStatus'],
    hivStatus: (data.hiv_status ?? '') as UserProfile['hivStatus'],
    onPrEP: data.on_prep ?? false,
    photos: (data.photos ?? []).map((p: { url: string }) => p.url),
    verified: data.verified ?? false,
    premium: data.premium ?? false,
    online: data.online_status === 'online',
    lastSeen: data.last_seen_at ? new Date(data.last_seen_at).getTime() : Date.now(),
    publicKey: {} as JsonWebKey,
    createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
  };
}

export function useAuthInit(): void {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const go = useNavStore((s) => s.go);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      // No Supabase — stay on landing, no auth possible
      go('landing');
      return;
    }

    // 1. Restore existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled || hydrated.current) return;
      if (session) {
        hydrated.current = true;
        const profile = await fetchProfile(session.user.id, session);
        if (profile) {
          login(profile, session.access_token);
          go('discover');
        } else {
          // Auth user exists but no profile → onboarding
          go('onboarding');
        }
      } else {
        go('landing');
      }
    });

    // 2. Listen for all auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === 'SIGNED_IN' && session) {
        if (hydrated.current) return;
        hydrated.current = true;
        const profile = await fetchProfile(session.user.id, session);
        if (profile) {
          login(profile, session.access_token);
          go('discover');
        } else {
          go('onboarding');
        }
      }

      if (event === 'TOKEN_REFRESHED' && session) {
        useAuthStore.setState((s) => ({ ...s, token: session.access_token }));
      }

      if (event === 'SIGNED_OUT' || !session) {
        hydrated.current = false;
        logout();
        go('landing');
      }

      if (event === 'USER_UPDATED' && session) {
        const profile = await fetchProfile(session.user.id, session);
        if (profile) useAuthStore.getState().updateUser(profile);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
