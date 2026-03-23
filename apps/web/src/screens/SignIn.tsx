// SignIn stub
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { TopBar } from '@/components/ui/index';
import { Spinner } from '@/components/ui/index';
import { COLORS } from '@/types';

export default function SignInScreen() {
  const go = useNavStore((s) => s.go);
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) { setError('Fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const { user, token } = await api.auth.login({ email: email.trim(), password });
      login(user, token);
      go('discover');
    } catch (e: any) {
      setError(e.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 24px 40px' }}>
      <button onClick={() => go('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.w35, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>← Back</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Welcome back</h1>
      {error && <div style={{ padding: '10px 14px', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', color: COLORS.red, fontSize: 12, marginBottom: 14 }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Email" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
        <input value={password} onChange={e => { setPassword(e.target.value); setError(''); }} type={showPw ? 'text' : 'password'} placeholder="Password" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
      </div>
      <button onClick={submit} disabled={loading} style={{ marginTop: 16, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading ? 0.6 : 1 }}>
        {loading ? <Spinner size={16} /> : 'Sign In →'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.w35 }}>
        No account? <button onClick={() => go('signup')} style={{ background: 'none', border: 'none', color: COLORS.red, fontWeight: 700, cursor: 'pointer' }}>Create one free</button>
      </p>
    </div>
  );
}
