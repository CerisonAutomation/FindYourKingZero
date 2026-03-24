// SignUp — cast API response to UserProfile (full profile built during onboarding)
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui/index';
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

  const submit = async () => {
    if (!email.trim() || !password || !name.trim()) { setError('Fill all fields'); return; }
    if (password.length < 8) { setError('Password min 8 chars'); return; }
    setLoading(true); setError('');
    try {
      const { user, token } = await api.auth.register({ email: email.trim(), password, name: name.trim(), age: 18 });
      // Cast to UserProfile — full data collected during onboarding
      login(user as UserProfile, token);
      go('onboarding');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 24px 40px' }}>
      <button onClick={() => go('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.w35, marginBottom: 32, fontSize: 13 }}>← Back</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Create account</h1>
      <p style={{ color: COLORS.w35, fontSize: 13, marginBottom: 28 }}>Free forever. No credit card.</p>
      {error && <div style={{ padding: '10px 14px', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', color: COLORS.red, fontSize: 12, marginBottom: 14 }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input value={name}     onChange={e => { setName(e.target.value);     setError(''); }} placeholder="Display name" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
        <input value={email}    onChange={e => { setEmail(e.target.value);    setError(''); }} placeholder="Email"        type="email"    style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
        <input value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Password (8+ chars)" type="password" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
      </div>
      <button onClick={submit} disabled={loading} style={{ marginTop: 16, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading ? 0.6 : 1 }}>
        {loading ? <Spinner size={16} /> : 'Create Account →'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.w35 }}>
        Have an account? <button onClick={() => go('signin')} style={{ background: 'none', border: 'none', color: COLORS.red, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
      </p>
    </div>
  );
}
