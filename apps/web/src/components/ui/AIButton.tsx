// UI: AI Button — Futuristic pulsing glow with status states
import { useState, useEffect, type FC } from 'react';

interface AIButtonProps {
  onClick: () => void;
  loading?: boolean;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 36, md: 44, lg: 52 };

export const AIButton: FC<AIButtonProps> = ({ onClick, loading, active, size = 'md' }) => {
  const [pulse, setPulse] = useState(false);
  const s = sizes[size];

  useEffect(() => {
    if (active) {
      const t = setInterval(() => setPulse(p => !p), 1500);
      return () => clearInterval(t);  // cleanup when active
    }
    return undefined;                  // explicit return for non-active path — fixes TS7030
  }, [active]);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{ position: 'relative', width: s, height: s, background: 'transparent', border: 'none', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform .15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: loading ? `conic-gradient(from 0deg,#E5192E,#7C3AED,#2563EB,#E5192E)` : active ? `conic-gradient(from ${pulse ? 0 : 180}deg,#E5192E,#7C3AED,#2563EB,#E5192E)` : `linear-gradient(135deg,rgba(229,25,46,.4),rgba(124,58,237,.4))`, animation: loading ? 'spin 1s linear infinite' : active ? 'spin 3s linear infinite' : 'none', opacity: active || loading ? 1 : 0.5, transition: 'opacity .3s' }} />
      <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%,#1a1a2e,#0a0a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: s * 0.4, filter: active || loading ? `drop-shadow(0 0 8px rgba(124,58,237,.8)) drop-shadow(0 0 16px rgba(229,25,46,.4))` : 'none', transition: 'filter .3s', animation: loading ? 'pulse 1s ease-in-out infinite' : 'none' }}>
          {loading ? <div style={{ width: s * 0.35, height: s * 0.35, border: '2px solid rgba(255,255,255,.15)', borderTop: '2px solid #7C3AED', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /> : '✨'}
        </div>
      </div>
      {(active || loading) && [0, 1, 2].map(i => (
        <div key={i} style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: ['#E5192E','#7C3AED','#2563EB'][i], top: `${30 + i * 20}%`, left: `${20 + i * 25}%`, animation: `sparkle ${1.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
      ))}
      <style>{`@keyframes sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.5)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </button>
  );
};
