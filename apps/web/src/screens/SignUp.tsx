// ═══════════════════════════════════════════════════════════════
// SCREEN: SignUp — API-based auth (Supabase optional upgrade)
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { COLORS } from '@/types';
import type { UserProfile } from '@/types';

export default function SignUpScreen() {
  const go    = useNavStore((s) => s.go);
  const login = useAuthStore((s) => s.login);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [sent,     setSent]     = useState(false);

  const submit = async () => {
    if (!email.trim() || !password || !name.trim()) { setError('Fill all fields'); return; }
    if (password.length < 8) { setError('Password min 8 chars'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.auth.register({ 
        email: email.trim().toLowerCase(), 
        password, 
        name: name.trim(),
        age: 18
      });
      
      // If email confirmation required, API might return token=null or similar
      if (!res.token) {
        setSent(true);
        return;
      }

      const u = res.user;
      const profile: UserProfile = {
        id: u.id,
        authId: u.id,
        email: u.email ?? '',
        name: name.trim(),
        avatar: (u as any).avatar ?? '',
        bio: (u as any).bio ?? '',
        age: 18,
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
      go('onboarding');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setError(msg.includes('already') ? 'Email already registered — try signing in' : msg);
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: COLORS.w35, fontSize: 14, lineHeight: 1.6 }}>
          We sent a confirmation link to <strong style={{ color: '#fff' }}>{email}</strong>.<br />
          Click it to activate your account, then sign in.
        </p>
        <button onClick={() => go('signin')} style={{ marginTop: 28, padding: '13px 28px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 24px 40px' }}>
      <button onClick={() => go('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.w35, marginBottom: 32, fontSize: 13 }}>← Back</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Create account</h1>
      <p style={{ color: COLORS.w35, fontSize: 13, marginBottom: 28 }}>Free forever. No credit card.</p>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', color: COLORS.red, fontSize: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          placeholder="Display name"
          autoComplete="name"
          style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <input
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="Email"
          type="email"
          autoComplete="email"
          style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <input
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          placeholder="Password (8+ chars)"
          type="password"
          autoComplete="new-password"
          style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        style={{ marginTop: 16, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', width: '100%', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Creating account…' : 'Create Account →'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.w35 }}>
        Have an account?{' '}
        <button onClick={() => go('signin')} style={{ background: 'none', border: 'none', color: COLORS.red, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
      </p>
    </div>
  );
}
