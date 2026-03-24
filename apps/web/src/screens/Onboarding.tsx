// Onboarding flow — tribes, looking for, about you, done
import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui/index';
import { COLORS } from '@/types';

const TRIBES = ['Bear', 'Muscle', 'Jock', 'Daddy', 'Otter', 'Twink', 'Leather', 'Masc', 'Geek', 'Alt'];
const LOOKING = ['Chat', 'Events', 'Dates', 'Friends', 'Right Now', 'Relationship', 'Hookup', 'Networking'];

export default function OnboardingScreen() {
  const go = useNavStore((s) => s.go);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [step, setStep] = useState(0);
  const [tribes, setTribes] = useState<string[]>([]);
  const [looking, setLooking] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (arr: string[], set: (a: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const finish = async () => {
    setSaving(true);
    try {
      await api.users.updateProfile({ tribes, lookingFor: looking, city, bio });
      updateUser({ tribes, lookingFor: looking, city, bio } as any);
      go('discover');
    } catch {} finally { setSaving(false); }
  };

  const steps = ['Tribes', 'Looking For', 'About You', 'Done'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 24px 24px' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, background: i <= step ? COLORS.red : COLORS.w12 }} />)}
      </div>

      {step === 0 && (
        <>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Your Tribe</h2>
          <p style={{ color: COLORS.w60, fontSize: 14, marginBottom: 22 }}>Select all that apply</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {TRIBES.map(t => (
              <button key={t} onClick={() => toggle(tribes, setTribes, t)}
                style={{ padding: '5px 12px', border: `1px solid ${tribes.includes(t) ? COLORS.red : COLORS.w12}`, background: tribes.includes(t) ? 'rgba(229,25,46,.1)' : 'transparent', color: tribes.includes(t) ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} style={{ padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            Continue →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Looking For</h2>
          <p style={{ color: COLORS.w60, fontSize: 14, marginBottom: 22 }}>What brings you here?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {LOOKING.map(l => (
              <button key={l} onClick={() => toggle(looking, setLooking, l)}
                style={{ padding: '5px 12px', border: `1px solid ${looking.includes(l) ? COLORS.blue : COLORS.w12}`, background: looking.includes(l) ? 'rgba(37,99,235,.1)' : 'transparent', color: looking.includes(l) ? COLORS.blue : COLORS.w35, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{ padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            Continue →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>About You</h2>
          <p style={{ color: COLORS.w60, fontSize: 14, marginBottom: 22 }}>Help kings find you</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Your City (Madrid, London…)" style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the kingdom who you are…" rows={4} style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', resize: 'none' }} />
          </div>
          <button onClick={() => setStep(3)} style={{ padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            Continue →
          </button>
        </>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', paddingTop: 32 }}>
          <div style={{ fontSize: 60, marginBottom: 24 }}>👑</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>You're in, King.</h2>
          <p style={{ color: COLORS.w60, fontSize: 14, marginBottom: 32 }}>Your kingdom awaits.</p>
          <button onClick={finish} disabled={saving} style={{ padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: saving ? 0.6 : 1 }}>
            {saving ? <Spinner size={16} /> : '→ Enter the Kingdom'}
          </button>
        </div>
      )}
    </div>
  );
}
