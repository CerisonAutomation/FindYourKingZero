// ═══════════════════════════════════════════════════════════════
// SCREEN: SignIn — API-based auth (Supabase optional upgrade)
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
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
    setLoading(true); setError('');
    try {
      const res = await api.auth.login({ email: email.trim().toLowerCase(), password });
      const u = res.user;
      const profile: UserProfile = {
        id: u.id,
        authId: u.id,
        email: u.email ?? '',
        name: u.name || u.email?.split('@')[0] || 'King',
        avatar: (u as any).avatar ?? '',
        bio: (u as any).bio ?? '',
        age: (u as any).age ?? 18,
        city: (u as any).city ?? '',
        tribes: (u as any).tribes ?? [],
        lookingFor: (u as any).lookingFor ?? [],
        online: true,
        height: '',
        position: '',
        relationshipStatus: 'Single',
        hivStatus: '',
        onPrEP: false,
        photos: (u as any).avatar ? [(u as any).avatar] : [],
        verified: (u as any).verified ?? false,
        premium: (u as any).premium ?? false,
        distance: 0,
        lastSeen: Date.now(),
        lat: 0,
        lng: 0,
        h3Hex: '',
        publicKey: {} as JsonWebKey,
        createdAt: Date.now(),
      };
      login(profile, res.token);
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
