// ═══════════════════════════════════════════════════════════════
// Analytics Dashboard — FindYourKing
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Eye, Heart, MessageCircle, TrendingUp, Calendar } from 'lucide-react';

type Period = 'today' | 'week' | 'month';

interface StatData {
  label: string;
  value: number;
  change: number; // percentage change
  icon: React.ReactNode;
  color: string;
}

interface ChartBar {
  label: string;
  value: number;
}

// Mock data — would come from API in production
const MOCK_DATA: Record<Period, { stats: StatData[]; chart: ChartBar[] }> = {
  today: {
    stats: [
      { label: 'Profile Views', value: 47, change: 12, icon: <Eye size={20} />, color: '#2563EB' },
      { label: 'New Matches', value: 8, change: 33, icon: <Heart size={20} />, color: '#E5192E' },
      { label: 'Messages', value: 23, change: -5, icon: <MessageCircle size={20} />, color: '#D97706' },
      { label: 'Response Rate', value: 89, change: 4, icon: <TrendingUp size={20} />, color: '#16A34A' },
    ],
    chart: [
      { label: '6am', value: 3 }, { label: '9am', value: 7 }, { label: '12pm', value: 12 },
      { label: '3pm', value: 9 }, { label: '6pm', value: 15 }, { label: '9pm', value: 18 },
      { label: '12am', value: 6 },
    ],
  },
  week: {
    stats: [
      { label: 'Profile Views', value: 312, change: 18, icon: <Eye size={20} />, color: '#2563EB' },
      { label: 'New Matches', value: 42, change: 25, icon: <Heart size={20} />, color: '#E5192E' },
      { label: 'Messages', value: 156, change: 8, icon: <MessageCircle size={20} />, color: '#D97706' },
      { label: 'Response Rate', value: 85, change: -2, icon: <TrendingUp size={20} />, color: '#16A34A' },
    ],
    chart: [
      { label: 'Mon', value: 38 }, { label: 'Tue', value: 45 }, { label: 'Wed', value: 52 },
      { label: 'Thu', value: 41 }, { label: 'Fri', value: 63 }, { label: 'Sat', value: 71 },
      { label: 'Sun', value: 44 },
    ],
  },
  month: {
    stats: [
      { label: 'Profile Views', value: 1284, change: 22, icon: <Eye size={20} />, color: '#2563EB' },
      { label: 'New Matches', value: 167, change: 15, icon: <Heart size={20} />, color: '#E5192E' },
      { label: 'Messages', value: 634, change: 11, icon: <MessageCircle size={20} />, color: '#D97706' },
      { label: 'Response Rate', value: 82, change: 6, icon: <TrendingUp size={20} />, color: '#16A34A' },
    ],
    chart: [
      { label: 'Wk 1', value: 280 }, { label: 'Wk 2', value: 312 }, { label: 'Wk 3', value: 345 },
      { label: 'Wk 4', value: 347 },
    ],
  },
};

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('week');
  const data = MOCK_DATA[period];
  const maxChartValue = Math.max(...data.chart.map((b) => b.value), 1);

  const handlePeriodChange = useCallback((p: Period) => setPeriod(p), []);

  // ── Styles ──────────────────────────────────────────────────
  const container: React.CSSProperties = {
    padding: '20px 16px',
    maxWidth: 480,
    margin: '0 auto',
  };

  const pageTitle: React.CSSProperties = {
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const periodRow: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    marginBottom: 20,
    background: 'rgba(255,255,255,.04)',
    borderRadius: 10,
    padding: 4,
  };

  const periodBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 0',
    borderRadius: 8,
    border: 'none',
    background: active ? 'rgba(255,255,255,.10)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,.50)',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all .15s',
  });

  const grid2x2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 24,
  };

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: 14,
    padding: 16,
  };

  const cardIcon: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  };

  const cardValue: React.CSSProperties = {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: 4,
  };

  const cardLabel: React.CSSProperties = {
    color: 'rgba(255,255,255,.50)',
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 6,
  };

  const changeBadge = (positive: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 600,
    color: positive ? '#16A34A' : '#E5192E',
    background: positive ? 'rgba(22,163,74,.12)' : 'rgba(229,25,46,.12)',
    padding: '2px 8px',
    borderRadius: 6,
  });

  const chartSection: React.CSSProperties = {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: 14,
    padding: 20,
  };

  const chartTitle: React.CSSProperties = {
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const chartArea: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 160,
    paddingBottom: 24,
    position: 'relative',
  };

  const barGroup: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  };

  return (
    <div style={container}>
      <div style={pageTitle}>
        <TrendingUp size={24} color="#2563EB" />
        Analytics
      </div>

      {/* Period Selector */}
      <div style={periodRow}>
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            style={periodBtn(period === p)}
            onClick={() => handlePeriodChange(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid 2×2 */}
      <div style={grid2x2}>
        {data.stats.map((stat) => (
          <div key={stat.label} style={card}>
            <div style={{ ...cardIcon, background: `${stat.color}18` }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div style={cardValue}>
              {stat.label === 'Response Rate' ? `${stat.value}%` : stat.value.toLocaleString()}
            </div>
            <div style={cardLabel}>{stat.label}</div>
            <span style={changeBadge(stat.change >= 0)}>
              {stat.change >= 0 ? '+' : ''}{stat.change}%
            </span>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={chartSection}>
        <div style={chartTitle}>
          <Calendar size={16} color="rgba(255,255,255,.50)" />
          Activity Over Time
        </div>
        <div style={chartArea}>
          {data.chart.map((bar) => {
            const heightPct = (bar.value / maxChartValue) * 100;
            return (
              <div key={bar.label} style={barGroup}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 32,
                    height: `${heightPct}%`,
                    borderRadius: '6px 6px 2px 2px',
                    background: `linear-gradient(180deg, #2563EB 0%, rgba(37,99,235,.40) 100%)`,
                    transition: 'height .4s cubic-bezier(0.16, 1, 0.3, 1)',
                    minHeight: 4,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    fontSize: 11,
                    color: 'rgba(255,255,255,.40)',
                    fontWeight: 500,
                  }}
                >
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
