// ═══════════════════════════════════════════════════════════════
// SCREEN: Landing — Upgraded with ParticleGrid, premium animations
// Merged: best colors from v3 + particle background from newfyk
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { ArrowRight, Brain, Check, Crown, Lock, Map, Mic, Radio } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';
import { ParticleGrid } from '@/components/ui/ParticleGrid';

export default function LandingScreen() {
  const go = useNavStore((s) => s.go);
  const [count, setCount] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c < 520 ? c + 7 : 520)), 20);
    setTimeout(() => setFade(true), 300);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', position: 'relative' }}>
      {/* Particle background */}
      <ParticleGrid />

      <div style={{
        padding: '56px 24px 40px', minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
        opacity: fade ? 1 : 0, transition: 'opacity 0.8s ease',
      }}>
        <div>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            border: '1px solid rgba(229,25,46,.35)', background: 'rgba(229,25,46,.07)', marginBottom: 32,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: COLORS.green,
              boxShadow: `0 0 6px ${COLORS.green}`, animation: 'pulseGreen 2s infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.85)', letterSpacing: '0.1em' }}>
              {count}K+ KINGS WORLDWIDE · LIVE NOW
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, lineHeight: 0.9,
            letterSpacing: '1px', marginBottom: 20,
          }}>
            <span style={{ display: 'block', color: '#fff' }}>FIND YOUR</span>
            <span style={{
              display: 'block',
              background: `linear-gradient(135deg,${COLORS.red},#FF5020,${COLORS.yellow})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>KING.</span>
          </h1>

          {/* Description */}
          <p style={{ color: COLORS.w60, fontSize: 15, maxWidth: 520, marginBottom: 36, lineHeight: 1.7 }}>
            The premium platform for men who demand more — real connections, live events,
            instant meetups, enterprise-grade privacy. All AI runs on your device.
            <span style={{ color: COLORS.yellow, fontWeight: 600 }}> Zero API keys.</span>
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }}>
            <Stat val={`${count}K+`} label="Members" color={COLORS.red} />
            <Stat val="15K+" label="Daily Active" color={COLORS.blue} />
            <Stat val="230+" label="Cities" color={COLORS.yellow} />
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {['<Brain size={16} /> On-Device AI', '<Lock size={16} /> E2EE Encrypted', '<Radio size={16} /> P2P Native', '<Map size={16} /> H3 Proximity', '<Mic size={16} /> Voice Commands'].map((f) => (
              <div key={f} style={{
                padding: '4px 10px', background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
                fontSize: 11, color: COLORS.w35, fontWeight: 600,
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <button onClick={() => go('signup')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(229,25,46,.3)',
              }}>
              <Crown size={20} /> Start Free
            </button>
            <button onClick={() => go('signin')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 24px', background: 'rgba(255,255,255,.04)',
                border: `1px solid ${COLORS.w12}`, color: COLORS.w60, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', backdropFilter: 'blur(10px)',
              }}>
              Sign In <ArrowRight size={16} />
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
            {['App Store 4.9★', 'GDPR Compliant', 'E2EE', 'On-Device AI', '18+ Only'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Check size={14} color={COLORS.green} />
                <span style={{ fontSize: 12, color: COLORS.w35 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ val, label, color }: { val: string; label: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: '-1px', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
    </div>
  );
}
