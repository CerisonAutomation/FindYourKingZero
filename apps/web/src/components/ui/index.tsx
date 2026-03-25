// ═══════════════════════════════════════════════════════════════
// COMPONENTS: UI — Production-grade primitives
// Includes: Avatar, Spinner, LiveDot, Chip, Toast, SectionHeader, TopBar, BottomNav
// ═══════════════════════════════════════════════════════════════

import React, { memo, type FC, type ReactNode } from 'react';
import { ArrowLeft, MessageCircle, User } from 'lucide-react';
import { useNavStore, useNotifStore } from '@/store';
import { COLORS } from '@/types';

// ── Avatar ────────────────────────────────────────────────────
export const Avatar: FC<{
  src: string; size?: number; online?: boolean; verified?: boolean; ring?: boolean;
}> = memo(({ src, size = 48, online, verified, ring }) => (
  <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
    <div style={{
      width: size, height: size, overflow: 'hidden',
      border: ring ? `2px solid ${COLORS.red}` : `1px solid ${COLORS.w12}`,
      boxShadow: ring ? `0 0 14px rgba(229,25,46,.35)` : 'none',
    }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=K&background=1a1a2e&color=E5192E&size=${size}`; }} />
    </div>
    {online && (
      <div style={{
        position: 'absolute', bottom: 1, right: 1,
        width: Math.max(8, size * 0.18), height: Math.max(8, size * 0.18),
        borderRadius: '50%', background: COLORS.green, border: `2px solid ${COLORS.bg}`,
        boxShadow: `0 0 6px ${COLORS.green}`,
      }} />
    )}
    {verified && (
      <div style={{
        position: 'absolute', top: -2, right: -2, width: 14, height: 14,
        background: COLORS.blue, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: '#fff', fontWeight: 700,
      }}></div>
    )}
  </div>
));

// ── Spinner ───────────────────────────────────────────────────
export const Spinner: FC<{ size?: number; color?: string }> = ({ size = 18, color = COLORS.red }) => (
  <div style={{
    width: size, height: size,
    border: '2px solid rgba(255,255,255,.15)',
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin .8s linear infinite',
  }} />
);

// ── Live Dot ──────────────────────────────────────────────────
export const LiveDot: FC<{ size?: number }> = ({ size = 8 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: COLORS.green,
    boxShadow: `0 0 ${size}px ${COLORS.green}`, animation: 'pulseGreen 2s infinite',
  }} />
);

// ── Chip ──────────────────────────────────────────────────────
export const Chip: FC<{
  label: string; active?: boolean; color?: string; onClick?: () => void; small?: boolean;
}> = ({ label, active, color = COLORS.red, onClick, small }) => (
  <button onClick={onClick} style={{
    padding: small ? '3px 9px' : '5px 12px',
    border: `1px solid ${active ? color : COLORS.w12}`,
    background: active ? `${color}18` : 'transparent',
    color: active ? color : COLORS.w35,
    fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: '0.05em',
    cursor: onClick ? 'pointer' : 'default', textTransform: 'uppercase' as const,
  }}>
    {label}
  </button>
);

// ── Toast ─────────────────────────────────────────────────────
export const Toast: FC<{ msg: string; onClose: () => void }> = ({ msg, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
    background: COLORS.bg3, border: `1px solid ${COLORS.w12}`, padding: '10px 18px', zIndex: 999,
    fontSize: 13, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,.6)', animation: 'fadeUp .2s ease',
  }}>
    {msg}
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: COLORS.w60 }}>✕</button>
  </div>
);

// ── Section Header ───────────────────────────────────────────
export const SectionHeader: FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 10px' }}>
    <span style={{ fontSize: 20, fontWeight: 800 }}>{title}</span>
    {action && <button onClick={onAction} style={{ background: 'none', border: 'none', color: COLORS.red, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{action}</button>}
  </div>
);

// ── Top Bar ───────────────────────────────────────────────────
export const TopBar: FC<{
  title?: ReactNode; onBack?: () => void; right?: ReactNode; children?: ReactNode;
}> = ({ title, onBack, right, children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
    borderBottom: `1px solid ${COLORS.w07}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${COLORS.red},rgba(37,99,235,.5),transparent)` }} />
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}><ArrowLeft size={18} /></button>
      )}
      {typeof title === 'string' ? <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{title}</div> : <div style={{ flex: 1 }}>{title}</div>}
      {right}
    </div>
    {children}
  </div>
);

// ── Bottom Navigation ────────────────────────────────────────
export const BottomNav: FC = memo(() => {
  const screen = useNavStore((s) => s.screen);
  const go = useNavStore((s) => s.go);
  const unread = useNotifStore((s) => s.unreadCount());

  const tabs = [
    { id: 'discover' as const, icon: '🧭', label: 'Discover' },
    { id: 'right-now' as const, icon: '📡', label: 'Now' },
    { id: 'messages' as const, icon: <MessageCircle size={14} />, label: 'Messages' },
    { id: 'events' as const, icon: '📅', label: 'Events' },
    { id: 'profile' as const, icon: <User size={14} />, label: 'Profile' },
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      background: 'rgba(6,6,16,0.98)', backdropFilter: 'blur(32px)',
      borderTop: `1px solid ${COLORS.w07}`, height: 60, flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom)', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(229,25,46,.3),rgba(37,99,235,.25),transparent)' }} />
      {tabs.map((t) => {
        const on = screen === t.id;
        return (
          <button key={t.id} onClick={() => go(t.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
              position: 'relative', minWidth: 52,
            }}>
            {on && <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 24, height: 2, background: `linear-gradient(90deg,${COLORS.red},${COLORS.blue})`,
              boxShadow: `0 0 8px ${COLORS.red}`, borderRadius: 1,
            }} />}
            {t.id === 'messages' && unread > 0 && (
              <div style={{
                position: 'absolute', top: 2, right: 8, minWidth: 15, height: 15,
                background: COLORS.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 900, padding: '0 3px', boxShadow: `0 0 6px ${COLORS.red}`,
              }}>
                {unread > 9 ? '9+' : unread}
              </div>
            )}
            <span style={{ fontSize: 20, opacity: on ? 1 : 0.45, transition: 'opacity .15s' }}>{t.icon}</span>
            <span style={{
              fontSize: 8, fontWeight: 700,
              color: on ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)',
              letterSpacing: '0.14em', textTransform: 'uppercase' as const,
              transition: 'color .15s',
            }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
});
