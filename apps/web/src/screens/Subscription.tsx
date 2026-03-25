// ═══════════════════════════════════════════════════════════════
// SCREEN: Subscription — Full tier comparison
// Competitor parity with Grindr XTRA/Unlimited + Romeo Plus
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { ArrowLeft, Crown, Check } from 'lucide-react';
import { useNavStore } from '@/store';
import { haptic } from '@/services/haptics';
import { COLORS } from '@/types';

interface Tier {
  id: string; name: string; price: string; period: string;
  c: string; badge: string | null; features: string[];
}

const TIERS: Tier[] = [
  {
    id: 'free', name: 'Free', price: '€0', period: 'forever', c: COLORS.w35, badge: null,
    features: [
      '20 profile views/day',
      'Basic text chat',
      'Right Now (limited)',
      '3 events/month',
      'Grid view only',
      'Basic filters',
      '5 favorites',
    ],
  },
  {
    id: 'plus', name: 'Plus', price: '€9.99', period: '/month', c: COLORS.blue, badge: 'POPULAR',
    features: [
      'Unlimited profile views',
      'Priority in search results',
      'Read receipts',
      'See who viewed you (footprints)',
      'Unlimited favorites',
      'Advanced filters (age, tribes, looking for)',
      'Grid + Swipe + List views',
      'Travel mode (1 city/month)',
      '10 events/month',
      'Ad-free experience',
      'Expiring photos',
    ],
  },
  {
    id: 'pro', name: 'King Pro', price: '€19.99', period: '/month', c: COLORS.red, badge: 'BEST VALUE',
    features: [
      'All Plus features',
      'AI Smart Replies (on-device)',
      'Incognito browsing',
      'Superlike ×5/day',
      'Profile boost (10x visibility)',
      'Unlimited travel mode',
      'Priority support',
      'Verified badge',
      'Advanced AI matching',
      'Private photo albums (5)',
      'Video calls',
      'Voice notes',
      'Auto-translate in chat',
      'Toxicity shield',
    ],
  },
  {
    id: 'elite', name: 'Elite', price: '€39.99', period: '/month', c: COLORS.yellow, badge: 'ELITE',
    features: [
      'All Pro features',
      'Top of search (always first)',
      'Unlimited superlikes',
      'Unlimited profile boosts',
      'Personal AI concierge',
      'VIP event access',
      'Custom themes',
      'Priority customer support',
      'Unlimited private albums',
      'Group video calls',
      'Advanced analytics dashboard',
      'Early access to new features',
      'Exclusive Elite community',
      'Discreet mode + PIN lock',
    ],
  },
];

export default function SubscriptionScreen() {
  const back = useNavStore((s) => s.back);
  const [sel, setSel] = useState('pro');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const selectedTier = TIERS.find(t => t.id === sel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,#D97706,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}><ArrowLeft size={18} /></button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Crown size={16} color={COLORS.yellow} /> King Subscription</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.red, letterSpacing: '.14em', marginBottom: 6 }}>UPGRADE YOUR REIGN</div>
          <p style={{ color: COLORS.w60, fontSize: 13 }}>Unlock the full kingdom. Cancel anytime.</p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
          {(['monthly', 'yearly'] as const).map((b, i) => (
            <button key={b} onClick={() => setBilling(b)}
              style={{
                padding: '8px 20px', border: `1px solid ${billing === b ? COLORS.red : COLORS.w12}`,
                background: billing === b ? 'rgba(229,25,46,.1)' : 'transparent',
                color: billing === b ? COLORS.red : COLORS.w35, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', textTransform: 'capitalize',
              }}>
              {b} {b === 'yearly' && <span style={{ fontSize: 9, color: COLORS.green, marginLeft: 4 }}>SAVE 20%</span>}
            </button>
          ))}
        </div>

        {/* Tiers */}
        {TIERS.map((tier, _i) => {
          const price = billing === 'yearly' && tier.id !== 'free'
            ? `€${(parseFloat(tier.price.replace('€', '')) * 0.8 * 12).toFixed(0)}`
            : tier.price;
          const period = billing === 'yearly' && tier.id !== 'free' ? '/year' : tier.period;

          return (
            <button key={tier.id} onClick={() => { setSel(tier.id); haptic.tap(); }}
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
                  color: tier.id === 'elite' ? '#000' : '#fff', letterSpacing: '.1em',
                }}>
                  {tier.badge}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: sel === tier.id ? tier.c : '#fff' }}>{tier.name}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: tier.c, lineHeight: 1 }}>{price}</div>
                  <div style={{ fontSize: 10, color: COLORS.w35 }}>{period}</div>
                </div>
              </div>
              {tier.features.map((f, _i) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <Check size={12} style={{ color: tier.c }} />
                  <span style={{ fontSize: 12, color: COLORS.w60 }}>{f}</span>
                </div>
              ))}
            </button>
          );
        })}

        {/* CTA */}
        <button onClick={() => haptic.medium()}
          style={{
            marginTop: 8, padding: '15px 24px',
            background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(229,25,46,.3)',
          }}>
          <Crown size={16} /> Start {selectedTier?.name} {billing === 'yearly' ? '(Yearly)' : '(Monthly)'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: COLORS.w35 }}>
          Cancel anytime. No questions asked. Secure payment via Stripe.
        </p>

        {/* Comparison table teaser */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: COLORS.bg1, border: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8 }}>COMPARED TO COMPETITORS</div>
          <div style={{ fontSize: 11, color: COLORS.w35, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={12} style={{ color: COLORS.green }} /> Grindr XTRA: €14.99/mo — We offer more at €9.99</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={12} style={{ color: COLORS.green }} /> Romeo Plus: €9.90/mo — We match + add AI features</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={12} style={{ color: COLORS.green }} /> MachoBB Premium: €12.99/mo — We beat with on-device AI</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={12} style={{ color: COLORS.green }} /> All competitors: server-side AI = privacy risk</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={12} style={{ color: COLORS.green }} /> Us: 100% on-device AI = zero data leaves your phone</div>
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
