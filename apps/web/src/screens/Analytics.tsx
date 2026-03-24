// ═══════════════════════════════════════════════════════════════
// SCREEN: Analytics — profile views, match rates, popular times
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { BarChart3, Eye, Heart, MessageCircle, TrendingUp, Clock, ArrowLeft, Crown } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

const VIEWS = { today: 47, week: 312, month: 1284, total: 15842 };
const MATCH_RATE = { sent: 89, received: 64, matched: 41, rate: 46.1 };
const MSG_RATE = { received: 156, responded: 132, rate: 84.6 };

const HOURLY_VIEWS = [
  { hour: '6a', v: 8 }, { hour: '8a', v: 14 }, { hour: '10a', v: 22 },
  { hour: '12p', v: 38 }, { hour: '2p', v: 28 }, { hour: '4p', v: 32 },
  { hour: '6p', v: 45 }, { hour: '8p', v: 62 }, { hour: '10p', v: 55 },
  { hour: '12a', v: 30 },
];

const TRIBES = [
  { name: 'Bear', count: 234, pct: 28 }, { name: 'Muscle', count: 189, pct: 22 },
  { name: 'Jock', count: 156, pct: 18 }, { name: 'Daddy', count: 112, pct: 13 },
  { name: 'Otter', count: 89, pct: 10 }, { name: 'Other', count: 76, pct: 9 },
];

const INTERESTS = [
  { name: 'Fitness', emoji: '🏋️', matches: 89 },
  { name: 'Music', emoji: '🎵', matches: 76 },
  { name: 'Travel', emoji: '✈️', matches: 64 },
  { name: 'Food', emoji: '🍽️', matches: 52 },
  { name: 'Gaming', emoji: '🎮', matches: 41 },
  { name: 'Art', emoji: '🎨', matches: 35 },
];

export default function AnalyticsScreen() {
  const back = useNavStore((s) => s.back);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  const maxHourly = Math.max(...HOURLY_VIEWS.map(h => h.v));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#2563EB,#7C3AED,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <BarChart3 size={18} color={COLORS.blue} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Analytics</div>
          <Crown size={14} color={COLORS.yellow} style={{ marginRight: 4 }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: COLORS.yellow }}>PRO</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Period selector */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 14px' }}>
          {(['week', 'month', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '8px 0', background: period === p ? `${COLORS.blue}15` : COLORS.w04,
              border: `1px solid ${period === p ? COLORS.blue + '40' : COLORS.w07}`,
              color: period === p ? COLORS.blue : COLORS.w35, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {p === 'all' ? 'All Time' : `This ${p}`}
            </button>
          ))}
        </div>

        {/* Profile Views */}
        <div style={{ margin: '0 14px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
            <Eye size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
            Profile Views
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Today', value: VIEWS.today },
              { label: 'Week', value: VIEWS.week },
              { label: 'Month', value: VIEWS.month },
              { label: 'Total', value: VIEWS.total },
            ].map(v => (
              <div key={v.label} style={{
                padding: '12px 10px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.blue }}>{v.value.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: COLORS.w35, marginTop: 2 }}>{v.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Match & Message Rates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 14px 12px' }}>
          <div style={{ padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Heart size={14} color={COLORS.red} />
              <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.w35, textTransform: 'uppercase', letterSpacing: '.08em' }}>Match Rate</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.red }}>{MATCH_RATE.rate}%</div>
            <div style={{ fontSize: 11, color: COLORS.w35, marginTop: 4 }}>
              {MATCH_RATE.matched} matches from {MATCH_RATE.sent} likes sent
            </div>
            <div style={{ marginTop: 10, height: 4, background: COLORS.w07, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${MATCH_RATE.rate}%`, height: '100%', background: COLORS.red, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <MessageCircle size={14} color={COLORS.green} />
              <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.w35, textTransform: 'uppercase', letterSpacing: '.08em' }}>Response Rate</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.green }}>{MSG_RATE.rate}%</div>
            <div style={{ fontSize: 11, color: COLORS.w35, marginTop: 4 }}>
              {MSG_RATE.responded} replies from {MSG_RATE.received} messages
            </div>
            <div style={{ marginTop: 10, height: 4, background: COLORS.w07, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${MSG_RATE.rate}%`, height: '100%', background: COLORS.green, borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Popular Times Chart */}
        <div style={{ margin: '0 14px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
            <Clock size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
            Popular Viewing Times
          </div>
          <div style={{
            padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
            display: 'flex', alignItems: 'flex-end', gap: 6, height: 140,
          }}>
            {HOURLY_VIEWS.map(h => (
              <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%', maxWidth: 24,
                  height: `${(h.v / maxHourly) * 85}%`,
                  background: h.v === maxHourly ? COLORS.blue : `${COLORS.blue}60`,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height .3s',
                }} />
                <div style={{ fontSize: 8, color: COLORS.w35, marginTop: 4, whiteSpace: 'nowrap' }}>{h.hour}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: 10, color: COLORS.w35 }}>
            Peak time: 8 PM — 62 profile views
          </div>
        </div>

        {/* Top Tribes */}
        <div style={{ margin: '0 14px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
            <TrendingUp size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
            Top Tribes Viewing You
          </div>
          <div style={{ background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
            {TRIBES.map((t, i) => (
              <div key={t.name} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderBottom: i < TRIBES.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: COLORS.w04, border: `1px solid ${COLORS.w07}`, fontSize: 10, fontWeight: 800, color: COLORS.w35,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: COLORS.w07, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${t.pct}%`, height: '100%', background: COLORS.blue, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.w60, fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Interests */}
        <div style={{ margin: '0 14px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
            Matching Interests
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {INTERESTS.map(i => (
              <div key={i.name} style={{
                padding: '12px 10px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{i.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{i.name}</div>
                <div style={{ fontSize: 10, color: COLORS.w35 }}>{i.matches} matches</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '12px 14px 24px', fontSize: 10, color: COLORS.w35 }}>
          Analytics refresh every 15 minutes · Data retained for 90 days
        </div>
      </div>
    </div>
  );
}
