// ═══════════════════════════════════════════════════════════════
// SCREEN: Onboarding — Multi-step wizard with progress bar
// 6 steps: Welcome, Basic Info, Tribes & Looking For, Location, Photos, Finish
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, Crown, Heart, MapPin, Sparkles, User } from 'lucide-react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { Spinner } from '@/components/ui/index';
import { COLORS } from '@/types';

const TOTAL_STEPS = 6;
const STEP_LABELS = ['Welcome', 'Basic Info', 'Tribes', 'Location', 'Photos', 'Finish'];

const TRIBES = ['Bear', 'Muscle', 'Jock', 'Daddy', 'Otter', 'Twink', 'Leather', 'Masc', 'Geek', 'Alt', 'Queen', 'Biker'];
const LOOKING = ['Chat', 'Events', 'Dates', 'Friends', 'Right Now', 'Relationship', 'Hookup', 'Networking'];

export default function OnboardingScreen() {
  const go = useNavStore((s) => s.go);
  const back = useNavStore((s) => s.back);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [step, setStep] = useState(0);
  const [tribes, setTribes] = useState<string[]>([]);
  const [looking, setLooking] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = useCallback((arr: string[], set: (a: string[]) => void, v: string) => {
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  }, []);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!displayName.trim()) newErrors.displayName = 'Name is required';
        if (!age || parseInt(age) < 18) newErrors.age = 'Must be 18+';
        break;
      case 2:
        if (tribes.length === 0) newErrors.tribes = 'Select at least one tribe';
        if (looking.length === 0) newErrors.looking = 'Select at least one';
        break;
      case 3:
        if (!city.trim()) newErrors.city = 'City is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, displayName, age, tribes, looking, city]);

  const goNext = useCallback(() => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  }, [validateStep]);

  const goBack = useCallback(() => {
    if (step === 0) {
      back();
    } else {
      setStep(prev => prev - 1);
    }
  }, [step, back]);

  const finish = async () => {
    setSaving(true);
    try {
      await api.users.updateProfile({ tribes, lookingFor: looking, city, bio, displayName });
      updateUser({ tribes, lookingFor: looking, city, bio, displayName } as any);
      go('discover');
    } catch {} finally { setSaving(false); }
  };

  const addPhoto = useCallback(() => {
    // Simulate photo upload
    const id = `photo_${Date.now()}`;
    setPhotos(prev => prev.length < 6 ? [...prev, id] : prev);
  }, []);

  // ─── Styles ───
  const containerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100%', background: '#060610' };
  const headerStyle: React.CSSProperties = {
    flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
    borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
  };
  const progressBgStyle: React.CSSProperties = { height: 3, background: COLORS.w07 };
  const progressFillStyle: React.CSSProperties = {
    height: '100%', background: `linear-gradient(90deg,${COLORS.red},#FF4020)`,
    transition: 'width .4s ease', width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
  };
  const contentStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '24px 20px' };
  const btnPrimary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
    border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
  };
  const btnSecondary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px 24px', background: 'transparent', border: `1px solid ${COLORS.w12}`,
    color: COLORS.w60, fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
  };
  const chipStyle = (active: boolean, color: string): React.CSSProperties => ({
    padding: '7px 14px', border: `1px solid ${active ? color : COLORS.w12}`,
    background: active ? `${color}15` : 'transparent', color: active ? color : COLORS.w35,
    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
  });
  const inputStyle: React.CSSProperties = {
    width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
    padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none',
  };
  const errorStyle: React.CSSProperties = { fontSize: 11, color: COLORS.red, marginTop: 4 };
  const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 };

  return (
    <div style={containerStyle}>
      {/* Header with progress */}
      <div style={headerStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,#2563EB,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
            Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
          </div>
          <span style={{ fontSize: 11, color: COLORS.w35 }}>{step + 1}/{TOTAL_STEPS}</span>
        </div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px', justifyContent: 'center' }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i <= step ? COLORS.red : COLORS.w12,
              transition: 'all .3s',
            }} />
          ))}
        </div>
        <div style={progressBgStyle}>
          <div style={progressFillStyle} />
        </div>
      </div>

      <div style={contentStyle}>
        {/* ─── Step 0: Welcome ─── */}
        {step === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}><Crown size={20} /></div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome to the Kingdom</h2>
            <p style={{ color: COLORS.w60, fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>
              Let's set up your profile so other kings can find you. This takes about 2 minutes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32, textAlign: 'left' }}>
              {[
                { icon: <User size={16} color={COLORS.red} />, text: 'Tell us about yourself' },
                { icon: <Heart size={16} color={COLORS.red} />, text: 'Share your tribes & preferences' },
                { icon: <MapPin size={16} color={COLORS.red} />, text: 'Set your location' },
                { icon: <Camera size={16} color={COLORS.red} />, text: 'Add your best photos' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                }}>
                  <div style={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${COLORS.red}12`, border: `1px solid ${COLORS.red}30`,
                  }}>{item.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 1: Basic Info ─── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
              <User size={22} color={COLORS.red} style={{ marginRight: 10, verticalAlign: -3 }} />
              Basic Info
            </h2>
            <p style={{ color: COLORS.w60, fontSize: 13, marginBottom: 24 }}>Tell the kingdom who you are</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={labelStyle}>Display Name</div>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="What should we call you?" style={{ ...inputStyle, borderColor: errors.displayName ? COLORS.red : COLORS.w12 }} />
                {errors.displayName && <div style={errorStyle}>{errors.displayName}</div>}
              </div>
              <div>
                <div style={labelStyle}>Age</div>
                <input value={age} onChange={e => setAge(e.target.value)} type="number" min={18} max={99}
                  placeholder="Your age (18+)" style={{ ...inputStyle, borderColor: errors.age ? COLORS.red : COLORS.w12 }} />
                {errors.age && <div style={errorStyle}>{errors.age}</div>}
              </div>
              <div>
                <div style={labelStyle}>Bio</div>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                  placeholder="Tell the kingdom who you are…" style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>
          </>
        )}

        {/* ─── Step 2: Tribes & Looking For ─── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
              <Sparkles size={22} color={COLORS.red} style={{ marginRight: 10, verticalAlign: -3 }} />
              Tribes & Looking For
            </h2>
            <p style={{ color: COLORS.w60, fontSize: 13, marginBottom: 20 }}>Help us connect you with the right people</p>

            <div style={labelStyle}>Your Tribes (select all that apply)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {TRIBES.map(t => (
                <button key={t} onClick={() => toggle(tribes, setTribes, t)}
                  style={chipStyle(tribes.includes(t), COLORS.red)}>{t}</button>
              ))}
            </div>
            {errors.tribes && <div style={{ ...errorStyle, marginBottom: 16 }}>{errors.tribes}</div>}

            <div style={labelStyle}>What Are You Looking For?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {LOOKING.map(l => (
                <button key={l} onClick={() => toggle(looking, setLooking, l)}
                  style={chipStyle(looking.includes(l), COLORS.blue)}>{l}</button>
              ))}
            </div>
            {errors.looking && <div style={errorStyle}>{errors.looking}</div>}
          </>
        )}

        {/* ─── Step 3: Location ─── */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
              <MapPin size={22} color={COLORS.red} style={{ marginRight: 10, verticalAlign: -3 }} />
              Location
            </h2>
            <p style={{ color: COLORS.w60, fontSize: 13, marginBottom: 24 }}>Where are you based? Kings near you will see you first.</p>

            <div>
              <div style={labelStyle}>Your City</div>
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="Madrid, London, New York…"
                style={{ ...inputStyle, borderColor: errors.city ? COLORS.red : COLORS.w12 }} />
              {errors.city && <div style={errorStyle}>{errors.city}</div>}
            </div>

            <div style={{
              marginTop: 24, padding: '14px 16px', background: 'rgba(37,99,235,.06)',
              border: '1px solid rgba(37,99,235,.18)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.blue, marginBottom: 4 }}><MapPin size={14} style={{marginRight:4,verticalAlign:-1}} /> Location Privacy</div>
              <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>
                We never share your exact location. Other users only see approximate distance. You can change this in Settings anytime.
              </div>
            </div>
          </>
        )}

        {/* ─── Step 4: Photos ─── */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
              <Camera size={22} color={COLORS.red} style={{ marginRight: 10, verticalAlign: -3 }} />
              Photos
            </h2>
            <p style={{ color: COLORS.w60, fontSize: 13, marginBottom: 24 }}>Add up to 6 photos. Show the real you!</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  aspectRatio: '1', background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }} onClick={i === 0 || photos.length >= i ? addPhoto : undefined}>
                  {photos[i] ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Check size={18} color={COLORS.green} />
                      <span style={{ fontSize: 9, color: COLORS.green }}>Added</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Camera size={18} color={COLORS.w20} />
                      {i === 0 && <span style={{ fontSize: 8, color: COLORS.red }}>Required</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              padding: '14px 16px', background: 'rgba(229,25,46,.06)', border: '1px solid rgba(229,25,46,.18)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, marginBottom: 4 }}>Photo Guidelines</div>
              <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>
                Clear face photos get 10x more engagement. No nudity in public photos. Private albums available after profile setup.
              </div>
            </div>
          </>
        )}

        {/* ─── Step 5: Finish ─── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
              background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={36} color="#fff" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>You're Ready, King!</h2>
            <p style={{ color: COLORS.w60, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Your profile is set up. Time to explore the kingdom and meet other kings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
              {[
                { label: 'Name', value: displayName || 'Not set' },
                { label: 'Tribes', value: tribes.length > 0 ? tribes.join(', ') : 'None selected' },
                { label: 'Looking For', value: looking.length > 0 ? looking.join(', ') : 'None selected' },
                { label: 'City', value: city || 'Not set' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                  background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                }}>
                  <span style={{ fontSize: 12, color: COLORS.w35 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div style={{
        flexShrink: 0, padding: '14px 20px', background: 'rgba(6,6,16,0.97)',
        borderTop: `1px solid ${COLORS.w07}`, display: 'flex', gap: 10,
      }}>
        {step > 0 && (
          <button onClick={goBack} style={{ ...btnSecondary, width: 'auto', padding: '15px 20px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button onClick={goNext} style={{ ...btnPrimary, flex: 1 }}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={finish} disabled={saving} style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? <Spinner size={16} /> : <><Crown size={16} /> Enter the Kingdom</>}
          </button>
        )}
      </div>
    </div>
  );
}
