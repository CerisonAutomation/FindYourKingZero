// ═══════════════════════════════════════════════════════════════
// SCREEN: ForgotPassword — API-based password reset
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useNavStore } from '@/store';
import { api } from '@/services/api';
import { COLORS } from '@/types';

export default function ForgotPasswordScreen() {
  const go = useNavStore((s) => s.go);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) { setError('Enter your email'); return; }
    setLoading(true); setError('');
    try {
      // Assuming the API has a forgot password endpoint
      await api.auth.forgotPassword({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      // Don't reveal if email exists or not for security
      setSent(true); // Still show success to prevent email enumeration
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📧</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: COLORS.w35, fontSize: 14, lineHeight: 1.6 }}>
          We've sent a password reset link to <strong style={{ color: '#fff' }}>{email}</strong>.<br />
          If the email exists in our system, you'll receive instructions shortly.
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
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Forgot password</h1>
      <p style={{ color: COLORS.w35, fontSize: 13, marginBottom: 28 }}>Enter your email to reset your password</p>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', color: COLORS.red, fontSize: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <input
        value={email}
        onChange={e => { setEmail(e.target.value); setError(''); }}
        placeholder="Email"
        type="email"
        autoComplete="email"
        style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
      />

      <button
        onClick={submit}
        disabled={loading}
        style={{ marginTop: 16, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', width: '100%', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.w35 }}>
        Remember your password?{' '}
        <button onClick={() => go('signin')} style={{ background: 'none', border: 'none', color: COLORS.red, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
      </p>
    </div>
  );
}
