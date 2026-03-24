// ═══════════════════════════════════════════════════════════════
// SCREEN: SignIn — Supabase Auth (email/password)
//
// Flow:
//   1. User enters email + password
//   2. supabase.auth.signInWithPassword() → session + user
//   3. Fetch profile from Supabase DB
//   4. Store in Zustand → navigate to discover
//
// If Supabase not configured, shows error with setup instructions.
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/types';
import type { UserProfile } from '@/types';

export default function SignInScreen() {
  const go    = useNavStore((s) => s.go);
  const login = useAuthStore((s) => s.login);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const submit = async () => {
    if (!email.trim() || !password) { setError('Fill all fields'); return; }
    if (!supabase) { setError('App not configured. Contact support.'); return; }
    
    setLoading(true); setError('');
    try {
      // 1. Sign in with Supabase Auth
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authErr) throw authErr;

      const userId = data.user!.id;

      // 2. Fetch profile from Supabase DB
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, handle, display_name, bio, age, photo_url, verified, premium, online_status, tribes, looking_for, position, hiv_status, on_prep, height_cm, relationship_status, coarse_lat, coarse_lng, geohash, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      // 3. Build UserProfile
      const user: UserProfile = {
        id: userId,
        authId: userId,
        email: data.user!.email ?? '',
        name: profile?.display_name ?? data.user!.email?.split('@')[0] ?? 'King',
        avatar: profile?.photo_url ?? '',
        bio: profile?.bio ?? '',
        age: profile?.age ?? 18,
        city: '',
        lat: profile?.coarse_lat ?? 0,
        lng: profile?.coarse_lng ?? 0,
        h3Hex: profile?.geohash ?? '',
        distance: 0,
        tribes: (profile?.tribes ?? []) as UserProfile['tribes'],
        lookingFor: (profile?.looking_for ?? []) as UserProfile['lookingFor'],
        height: profile?.height_cm ? `${profile.height_cm}cm` : '',
        position: (profile?.position ?? '') as UserProfile['position'],
        relationshipStatus: (profile?.relationship_status ?? 'Single') as UserProfile['relationshipStatus'],
        hivStatus: (profile?.hiv_status ?? '') as UserProfile['hivStatus'],
        onPrEP: profile?.on_prep ?? false,
        photos: profile?.photo_url ? [profile.photo_url] : [],
        verified: profile?.verified ?? false,
        premium: profile?.premium ?? false,
        online: profile?.online_status === 'online',
        lastSeen: Date.now(),
        publicKey: {} as JsonWebKey,
        createdAt: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(),
      };

      login(user, data.session!.access_token);
      go('discover');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign in failed';
      setError(msg.includes('Invalid') ? 'Wrong email or password' : msg);
    } finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 24px 40px' }}>
      <button onClick={() => go('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.w35, marginBottom: 32, fontSize: 13 }}>← Back</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Welcome back</h1>
      <p style={{ color: COLORS.w35, fontSize: 13, marginBottom: 28 }}>Sign in to your kingdom</p>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', color: COLORS.red, fontSize: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="Email"
          type="email"
          autoComplete="email"
          style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <input
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        style={{ marginTop: 16, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', width: '100%', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>

      <button
        onClick={() => go('forgot-password')}
        style={{ background: 'none', border: 'none', color: COLORS.w35, fontSize: 12, cursor: 'pointer', marginTop: 12, textAlign: 'center' }}
      >
        Forgot password?
      </button>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.w35 }}>
        No account?{' '}
        <button onClick={() => go('signup')} style={{ background: 'none', border: 'none', color: COLORS.red, fontWeight: 700, cursor: 'pointer' }}>Create one free</button>
      </p>
    </div>
  );
}
