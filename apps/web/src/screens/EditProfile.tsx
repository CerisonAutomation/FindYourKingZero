// ═══════════════════════════════════════════════════════════════
// SCREEN: EditProfile — Full profile editing with live save
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { COLORS } from '@/types';
import type { Tribe, LookingFor } from '@/types';

const TRIBES: Tribe[] = ['Bear', 'Muscle', 'Jock', 'Daddy', 'Otter', 'Twink', 'Leather', 'Masc', 'Geek', 'Alt', 'Clean-cut', 'Discreet'];
const LOOKING: LookingFor[] = ['Chat', 'Events', 'Dates', 'Friends', 'Right Now', 'Relationship', 'Hookup', 'Networking'];

export default function EditProfileScreen() {
  const go = useNavStore((s) => s.go);
  const back = useNavStore((s) => s.back);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    bio: user?.bio ?? '',
    city: user?.city ?? '',
    age: user?.age ?? 0,
    height: user?.height ?? '',
    position: user?.position ?? '',
    relationshipStatus: user?.relationshipStatus ?? 'Single',
    hivStatus: user?.hivStatus ?? '',
    onPrEP: user?.onPrEP ?? false,
    avatar: user?.avatar ?? '',
  });
  const [tribes, setTribes] = useState<string[]>(user?.tribes ?? []);
  const [lookingFor, setLookingFor] = useState<string[]>(user?.lookingFor ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const upd = (k: string) => (v: string | boolean | number) => setForm(p => ({ ...p, [k]: v }));
  const toggle = (arr: string[], set: (a: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const data = { ...form, tribes, lookingFor };
      await api.users.updateProfile(data);
      updateUser(data as any);
      setSaved(true);
      setTimeout(() => { setSaved(false); back(); }, 1000);
    } catch {} finally { setSaving(false); }
  }, [form, tribes, lookingFor, updateUser, back]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 14px', height: 52, flexShrink: 0,
        background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,.07)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,rgba(37,99,235,.5),transparent)' }} />
        <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>←</button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Edit Profile</div>
        <button onClick={save} disabled={saving}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.red, fontWeight: 800, fontSize: 12, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 76, height: 76, border: '2px solid #E5192E', overflow: 'hidden', boxShadow: '0 0 22px rgba(229,25,46,.4)' }}>
              <img src={form.avatar || user?.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${form.name?.[0] || 'K'}&background=1a1a2e&color=E5192E&size=200`; }} />
            </div>
            <div style={{ flex: 1 }}>
              <input value={form.avatar} onChange={e => upd('avatar')(e.target.value)} placeholder="Avatar URL"
                style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 12, outline: 'none' }} />
            </div>
          </div>

          <Field label="Display Name" value={form.name} onChange={upd('name')} placeholder="How kings see you" />
          <Field label="City" value={form.city} onChange={upd('city')} placeholder="Madrid, London…" />
          <div>
            <Label>BIO</Label>
            <textarea value={form.bio} onChange={e => upd('bio')(e.target.value)} placeholder="Tell the kingdom who you are…" rows={4}
              style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.5 }} />
          </div>

          {/* Tribes */}
          <div>
            <Label>TRIBES</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {TRIBES.map(t => (
                <button key={t} onClick={() => toggle(tribes, setTribes, t)}
                  style={{
                    padding: '5px 12px', border: `1px solid ${tribes.includes(t) ? COLORS.red : 'rgba(255,255,255,.12)'}`,
                    background: tribes.includes(t) ? 'rgba(229,25,46,.1)' : 'transparent',
                    color: tribes.includes(t) ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <Label>LOOKING FOR</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {LOOKING.map(l => (
                <button key={l} onClick={() => toggle(lookingFor, setLookingFor, l)}
                  style={{
                    padding: '5px 12px', border: `1px solid ${lookingFor.includes(l) ? COLORS.blue : 'rgba(255,255,255,.12)'}`,
                    background: lookingFor.includes(l) ? 'rgba(37,99,235,.1)' : 'transparent',
                    color: lookingFor.includes(l) ? COLORS.blue : COLORS.w35, fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Body stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Height" value={form.height} onChange={upd('height')} placeholder="182cm" />
            <SelectField label="Position" value={form.position} onChange={upd('position') as any} options={['', 'Top', 'Bottom', 'Vers', 'Vers Top', 'Vers Bot', 'Side']} />
            <SelectField label="HIV Status" value={form.hivStatus} onChange={upd('hivStatus') as any} options={['', 'Neg', 'Neg on PrEP', 'Poz Undetectable', 'Poz', 'Unknown']} />
            <SelectField label="Status" value={form.relationshipStatus} onChange={upd('relationshipStatus') as any} options={['Single', 'Open', 'Partnered', 'Complicated']} />
          </div>

          {/* PrEP toggle */}
          <button onClick={() => upd('onPrEP')(!form.onPrEP)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: form.onPrEP ? 'rgba(22,163,74,.07)' : 'transparent',
              border: `1px solid ${form.onPrEP ? 'rgba(22,163,74,.3)' : 'rgba(255,255,255,.12)'}`, cursor: 'pointer',
            }}>
            <div style={{
              width: 17, height: 17, border: `1px solid ${form.onPrEP ? COLORS.green : COLORS.w35}`,
              background: form.onPrEP ? COLORS.green : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff',
            }}>
              {form.onPrEP ? '✓' : ''}
            </div>
            <span style={{ fontSize: 13, color: COLORS.w60 }}>On PrEP</span>
          </button>

          <button onClick={save} disabled={saving}
            style={{
              padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              width: '100%', opacity: saving ? 0.6 : 1, marginTop: 8,
            }}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : '✓ Save Profile'}
          </button>
          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }}>{children}</div>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none' }}>
        {options.map(o => <option key={o} value={o}>{o || 'Select…'}</option>)}
      </select>
    </div>
  );
}
