// ═══════════════════════════════════════════════════════════════
// SCREEN: Profile — self-view with stats
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { TopBar } from '@/components/ui/index';
import { Avatar } from '@/components/ui/index';
import { COLORS } from '@/types';

export default function ProfileScreen() {
  const go = useNavStore((s) => s.go);
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'about' | 'stats'>('about');

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="My Profile"
        right={
          <>
            <button onClick={() => go('edit-profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>✏️</button>
            <button onClick={() => go('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>⚙️</button>
          </>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Cover */}
        <div style={{ position: 'relative', height: 150, background: `linear-gradient(135deg,rgba(229,25,46,.18),rgba(37,99,235,.12),rgba(6,6,16,1))`, flexShrink: 0 }}>
          <div style={{ position: 'absolute', bottom: -32, left: 18 }}>
            <div style={{ width: 76, height: 76, border: `3px solid ${COLORS.red}`, overflow: 'hidden', boxShadow: `0 0 22px rgba(229,25,46,.4)` }}>
              <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '42px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>{user.name}</h2>
            <span style={{ fontSize: 18, color: COLORS.w60 }}>{user.age}</span>
            {user.verified && <span style={{ color: COLORS.blue }}>✓</span>}
          </div>
          <div style={{ fontSize: 13, color: COLORS.w35, marginBottom: 14 }}>📍 {user.city || 'No city set'}</div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: `1px solid ${COLORS.w07}`, marginBottom: 18 }}>
            {[
              { l: 'VIEWS', v: '0', c: COLORS.red },
              { l: 'MATCHES', v: '0', c: COLORS.blue },
              { l: 'STATUS', v: 'Active', c: COLORS.green },
            ].map((st, i) => (
              <div key={st.l} style={{ padding: '12px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${COLORS.w07}` : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: st.c }}>{st.v}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em' }}>{st.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.w07}`, marginBottom: 18 }}>
            {['about', 'stats'].map((t, _i) => (
              <button key={t} onClick={() => setTab(t as any)}
                style={{
                  flex: 1, padding: '9px 0', background: 'transparent', border: 'none', cursor: 'pointer',
                  color: tab === t ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  borderBottom: tab === t ? `2px solid ${COLORS.red}` : 'none',
                }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'about' && (
            <div>
              {user.bio && (
                <div style={{ background: COLORS.bg2, border: `1px solid ${COLORS.w07}`, padding: 13, marginBottom: 14 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: COLORS.w35, marginBottom: 6 }}>BIO</div>
                  <p style={{ color: COLORS.w60, fontSize: 13, lineHeight: 1.6 }}>{user.bio}</p>
                </div>
              )}
              {user.tribes.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: COLORS.w35, marginBottom: 8 }}>TRIBES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {user.tribes.map((t) => (
                      <span key={t} style={{ padding: '5px 12px', border: `1px solid ${COLORS.red}`, color: COLORS.red, fontSize: 11, fontWeight: 700 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: 'Height', v: user.height },
                  { l: 'Position', v: user.position },
                  { l: 'Status', v: user.relationshipStatus },
                  { l: 'PrEP', v: user.onPrEP ? 'Yes' : 'No' },
                ].map((item) => (
                  <div key={item.l} style={{ background: COLORS.bg2, border: `1px solid ${COLORS.w07}`, padding: '10px 11px' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: COLORS.w35, marginBottom: 3 }}>{item.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}
