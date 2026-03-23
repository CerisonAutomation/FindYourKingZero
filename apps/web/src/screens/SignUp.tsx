// SignUp stub
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui/index';
import { COLORS } from '@/types';

export default function SignUpScreen() {
  const go = useNavStore((s) => s.go);
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [agreed, setAgreed] = useState({ terms: false, privacy: false, age: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwScore = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password), password.length >= 14].filter(Boolean).length;
  const can1 = email.includes('@') && name.length > 1 && password.length >= 8;
  const can2 = age && parseInt(age) >= 18 && Object.values(agreed).every(Boolean);

  const submit = async () => {
    if (!can2) return;
    setLoading(true); setError('');
    try {
      const { user, token } = await api.auth.register({ email: email.trim(), password, name: name.trim(), age: parseInt(age) });
      login(user, token);
      go('onboarding');
    } catch (e: any) { setError(e.message || 'Signup failed'); } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 24px 40px' }}>
      <button onClick={() => step === 1 ? go('landing') : setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.w35, marginBottom: 24, fontSize: 13 }}>← Back</button>
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {[1, 2].map(i => <div key={i} style={{ flex: 1, height: 3, background: i <= step ? COLORS.red : COLORS.w12, transition: 'all .3s' }} />)}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{step === 1 ? 'Create Account' : 'Almost Done'}</h1>
      <p style={{ color: COLORS.w60, fontSize: 13, marginBottom: 24 }}>{step === 1 ? 'Join 520K+ kings worldwide' : 'Complete your profile'}</p>
      {error && <div style={{ padding: '10px 14px', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', color: COLORS.red, fontSize: 12, marginBottom: 14 }}>{error}</div>}
      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Display Name" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (8+ chars)" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
          {password && (
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ flex: 1, height: 3, background: i <= pwScore ? [COLORS.red, '#FF6020', COLORS.yellow, COLORS.green, COLORS.green][pwScore - 1] || COLORS.green : COLORS.w12 }} />
              ))}
            </div>
          )}
          <button onClick={() => setStep(2)} disabled={!can1} style={{ marginTop: 4, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: can1 ? 1 : 0.4 }}>
            Continue →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="number" min={18} max={99} value={age} onChange={e => setAge(e.target.value)} placeholder="Age (18+)" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
          {[
            { k: 'age' as const, l: 'I confirm I am 18+' },
            { k: 'terms' as const, l: 'I agree to Terms of Service' },
            { k: 'privacy' as const, l: 'I agree to Privacy Policy' },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setAgreed(p => ({ ...p, [k]: !p[k] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: agreed[k] ? 'rgba(229,25,46,.07)' : 'transparent', border: `1px solid ${agreed[k] ? COLORS.red : COLORS.w12}`, cursor: 'pointer' }}>
              <div style={{ width: 17, height: 17, border: `1px solid ${agreed[k] ? COLORS.red : COLORS.w35}`, background: agreed[k] ? COLORS.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>
                {agreed[k] ? '✓' : ''}
              </div>
              <span style={{ fontSize: 12, color: COLORS.w60 }}>{l}</span>
            </button>
          ))}
          <button onClick={submit} disabled={!can2 || loading} style={{ marginTop: 4, padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: can2 && !loading ? 1 : 0.4 }}>
            {loading ? <Spinner size={16} /> : '👑 Enter the Kingdom'}
          </button>
        </div>
      )}
    </div>
  );
}
