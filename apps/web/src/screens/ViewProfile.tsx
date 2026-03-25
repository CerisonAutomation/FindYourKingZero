// ═══════════════════════════════════════════════════════════════
// SCREEN: ViewProfile — Full profile view with interactions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Flame, Heart, MessageSquare, Sparkles, Star } from 'lucide-react';
import { useNavStore, useAuthStore, useNotifStore } from '@/store';
import { api } from '@/services/api';
import { COLORS } from '@/types';
import type { UserProfile, Notification } from '@/types';

export default function ViewProfileScreen() {
  const go = useNavStore((s) => s.go);
  const back = useNavStore((s) => s.back);
  const peer = useNavStore((s) => s.viewingProfile);
  const me = useAuthStore((s) => s.user);
  const addNotif = useNotifStore((s) => s.addNotification);

  const [tapped, setTapped] = useState(false);
  const [woofed, setWoofed] = useState(false);
  const [superliked, setSuperliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(peer);

  useEffect(() => {
    if (!peer?.id) return;
    (async () => {
      try {
        const data = await api.users.getProfile(peer.id);
        if (data) setProfile(data);
      } catch {}
    })();
  }, [peer?.id]);

  const interact = useCallback(async (type: 'tap' | 'woof' | 'superlike') => {
    if (!peer?.id) return;
    try {
      const { matched } = await api.matches.swipe(peer.id, type === 'tap' ? 'like' : type === 'superlike' ? 'superlike' : 'like');
      if (type === 'tap') { setTapped(true); setToast('Tapped!'); }
      if (type === 'woof') { setWoofed(true); setToast('Woof sent 🐾'); }
      if (type === 'superlike') { setSuperliked(true); setToast('Super Like sent!'); }
      if (matched) {
        setToast("It's a Match!");
        addNotif({ id: crypto.randomUUID(), type: 'match', text: `You matched with ${peer.name}!`, read: false, createdAt: Date.now() });
      }
      setTimeout(() => setToast(''), 2500);
    } catch {}
  }, [peer, addNotif]);

  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: COLORS.w35 }}>No profile selected</p>
      </div>
    );
  }

  const isMe = profile.id === me?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hero image */}
      <div style={{ position: 'relative', height: 340, flexShrink: 0, overflow: 'hidden' }}>
        <img src={profile.avatar} alt={profile.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile.name?.[0] || 'K'}&background=1a1a2e&color=E5192E&size=400`; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,16,1) 0%,rgba(6,6,16,.4) 40%,transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,rgba(229,25,46,.8),rgba(37,99,235,.5),transparent)' }} />

        {/* Back button */}
        <button onClick={back}
          style={{ position: 'absolute', top: 14, left: 14, width: 36, height: 36, background: 'rgba(6,6,16,.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 16 }}>
          <ArrowLeft size={18} />
        </button>

        {profile.premium && (
          <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 9px', background: 'rgba(217,119,6,.15)', border: '1px solid rgba(217,119,6,.4)' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.yellow, letterSpacing: '0.1em' }}>VIP KING</span>
          </div>
        )}

        {/* Name + info overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.4px' }}>{profile.name}</h2>
            <span style={{ fontSize: 20, color: COLORS.w60 }}>{profile.age}</span>
            {profile.verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', background: 'rgba(37,99,235,.15)', border: '1px solid rgba(37,99,235,.35)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.blue }}>VERIFIED</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {profile.online && (
              <>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
                <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 600 }}>Online now</span>
              </>
            )}
            <span style={{ fontSize: 12, color: COLORS.w35 }}></span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Action bar */}
        {!isMe && (
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            {[
              { type: 'tap' as const, label: 'TAP', icon: <Heart size={16} />, c: COLORS.red, on: tapped },
              { type: 'woof' as const, label: 'WOOF', icon: <Flame size={16} />, c: COLORS.yellow, on: woofed },
              { type: 'superlike' as const, label: 'SUPER', icon: <Star size={16} />, c: COLORS.purple, on: superliked },
            ].map((a) => (
              <button key={a.type} onClick={() => interact(a.type)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '12px 0', background: a.on ? `${a.c}12` : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'background .15s',
                }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: a.on ? a.c : COLORS.w35, letterSpacing: '0.14em' }}>{a.label}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: '16px 18px 100px' }}>
          {/* Bio */}
          {profile.bio && (
            <div style={{ background: COLORS.bg1, border: '1px solid rgba(255,255,255,.07)', padding: '13px 15px', marginBottom: 14 }}>
              <p style={{ color: COLORS.w60, fontSize: 14, lineHeight: 1.6 }}>{profile.bio}</p>
            </div>
          )}

          {/* Tribes */}
          {profile.tribes?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', marginBottom: 8 }}>TRIBES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {profile.tribes.map((t) => (
                  <span key={t} style={{ padding: '5px 12px', border: `1px solid ${COLORS.red}`, color: COLORS.red, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {profile.lookingFor?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', marginBottom: 8 }}>LOOKING FOR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {profile.lookingFor.map((l) => (
                  <span key={l} style={{ padding: '5px 12px', border: `1px solid ${COLORS.blue}`, color: COLORS.blue, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
            {[
              { l: 'Height', v: profile.height },
              { l: 'Position', v: profile.position },
              { l: 'Status', v: profile.relationshipStatus },
              { l: 'HIV', v: profile.hivStatus || '—' },
              { l: 'PrEP', v: profile.onPrEP ? 'Yes' : 'No' },
              { l: 'City', v: profile.city },
            ].map((s) => (
              <div key={s.l} style={{ background: COLORS.bg2, border: '1px solid rgba(255,255,255,.07)', padding: '10px 11px', textAlign: 'center' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.v || '—'}</div>
              </div>
            ))}
          </div>

          {/* Block / Report */}
          {!isMe && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => api.users.block(profile.id)}
                style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,.07)', color: COLORS.w35, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                🚫 Block
              <ArrowLeft size={18} /></button>
              <button onClick={() => api.users.report(profile.id, 'other')}
                style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,.07)', color: COLORS.w35, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                🚩 Report
              <ArrowLeft size={18} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Message CTA */}
      {!isMe && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px 24px',
          background: 'linear-gradient(to top,rgba(6,6,16,1) 0%,rgba(6,6,16,.95) 70%,transparent)',
          display: 'flex', gap: 10,
        }}>
          <button onClick={() => setSaved(!saved)}
            style={{
              flex: '0 0 50px', padding: '13px',
              background: saved ? 'rgba(229,25,46,.1)' : 'transparent',
              border: `1px solid ${saved ? 'rgba(229,25,46,.5)' : 'rgba(255,255,255,.12)'}`,
              color: saved ? COLORS.red : COLORS.w60, fontSize: 18, cursor: 'pointer',
            }}>
            <Heart size={18} />
          <ArrowLeft size={18} /></button>
          <button onClick={() => go('chat', { chatUser: profile })}
            style={{
              flex: 1, padding: '15px 24px',
              background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <MessageSquare size={14} /> Message
          <ArrowLeft size={18} /></button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: COLORS.bg3, border: `1px solid ${COLORS.w12}`, padding: '10px 18px', zIndex: 999,
          fontSize: 13, fontWeight: 600, animation: 'fadeUp .2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
