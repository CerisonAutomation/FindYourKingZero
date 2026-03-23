// ═══════════════════════════════════════════════════════════════
// SCREEN: Subscription — Full tier comparison with features
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

const TIERS = [
  {
    id: 'free', name: 'Free', price: '€0', period: 'forever', c: COLORS.w35, badge: null,
    features: ['20 profile views/day', 'Basic chat', 'Right Now limited', '3 events/month'],
  },
  {
    id: 'plus', name: 'Plus', price: '€9.99', period: '/month', c: COLORS.blue, badge: 'POPULAR',
    features: ['Unlimited profiles', 'Priority search', 'Read receipts', 'See who viewed you', '10 events/month'],
  },
  {
    id: 'pro', name: 'King Pro', price: '€19.99', period: '/month', c: COLORS.red, badge: 'BEST VALUE',
    features: ['All Plus features', 'AI Smart Replies (on-device)', 'Incognito mode', 'Superlike ×5/day', 'Events early access', 'Verified badge', 'Advanced filters'],
  },
  {
    id: 'elite', name: 'Elite', price: '€39.99', period: '/month', c: COLORS.yellow, badge: 'ELITE',
    features: ['All Pro features', 'Top of search', 'Unlimited superlikes', 'Personal concierge', 'VIP event access', 'Custom themes', 'Priority support', 'Profile boost'],
  },
];

export default function SubscriptionScreen() {
  const back = useNavStore((s) => s.back);
  const [sel, setSel] = useState('pro');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,#D97706,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>←</button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>King Subscription</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.red, letterSpacing: '0.14em', marginBottom: 6 }}>UPGRADE YOUR REIGN</div>
          <p style={{ color: COLORS.w60, fontSize: 13 }}>Unlock the full kingdom. Cancel anytime.</p>
        </div>

        {TIERS.map((tier) => (
          <button key={tier.id} onClick={() => setSel(tier.id)}
            style={{
              display: 'block', width: '100%', marginBottom: 10, padding: 15,
              background: sel === tier.id ? `${tier.c}10` : 'rgba(255,255,255,.02)',
              border: `1.5px solid ${sel === tier.id ? tier.c : 'rgba(255,255,255,.07)'}`,
              cursor: 'pointer', textAlign: 'left', position: 'relative',
              boxShadow: sel === tier.id ? `0 0 22px ${tier.c}18` : 'none', transition: 'all .2s',
            }}>
            {tier.badge && (
              <div style={{
                position: 'absolute', top: -1, right: 14, padding: '2px 9px',
                background: tier.c, fontSize: 8, fontWeight: 900,
                color: tier.id === 'elite' ? '#000' : '#fff', letterSpacing: '0.1em',
              }}>
                {tier.badge}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: sel === tier.id ? tier.c : '#fff' }}>{tier.name}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: tier.c, lineHeight: 1 }}>{tier.price}</div>
                <div style={{ fontSize: 10, color: COLORS.w35 }}>{tier.period}</div>
              </div>
            </div>
            {tier.features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <span style={{ color: tier.c, fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 12, color: COLORS.w60 }}>{f}</span>
              </div>
            ))}
          </button>
        ))}

        <button style={{
          marginTop: 8, padding: '15px 24px',
          background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
          border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          👑 Start {TIERS.find(t => t.id === sel)?.name}
        </button>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: COLORS.w35 }}>
          Cancel anytime. No questions asked. Secure payment via Stripe.
        </p>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
