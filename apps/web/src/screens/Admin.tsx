// ═══════════════════════════════════════════════════════════════
// SCREEN: Admin — Multi-page dashboard with sub-navigation
// Main hub <ArrowRight size={16} /> 5 sub-screens: Dashboard, Metrics, Moderation, Reports, Audit
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Activity, AlertTriangle, ArrowLeft, ArrowRight, Ban, BarChart3, Check, ChevronRight, Clock, Cpu, DollarSign, Eye, FileText, HardDrive, Search, Server, Shield, Sparkles, TrendingDown, TrendingUp, Users, Wifi, X, Zap } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

// ─── Data ───
interface ModerationItem {
  id: string; reporterName: string; targetName: string; reason: string;
  severity: 'low' | 'medium' | 'high'; createdAt: number;
}

interface AdminUser {
  id: string; name: string; email: string;
  status: 'active' | 'banned' | 'warned'; reports: number; joinedAt: number;
}

interface AuditLog {
  id: string; action: string; admin: string; target: string; timestamp: number;
}

const DEMO_STATS = [
  { label: 'Total Users', value: '124,847', change: '+2.4%', icon: Users, color: COLORS.blue },
  { label: 'Active Today', value: '18,392', change: '+5.1%', icon: Activity, color: COLORS.green },
  { label: 'Reports Pending', value: '23', change: '-12%', icon: AlertTriangle, color: COLORS.yellow },
  { label: 'Revenue (MTD)', value: '$48,291', change: '+18%', icon: DollarSign, color: COLORS.red },
];

const METRICS = [
  { label: 'DAU / MAU Ratio', value: '14.7%', trend: 'up', detail: 'Healthy engagement' },
  { label: 'Avg Session Time', value: '23m 41s', trend: 'up', detail: '+2m from last week' },
  { label: 'Match Rate', value: '8.3%', trend: 'up', detail: 'Above industry avg' },
  { label: 'Message Response', value: '67%', trend: 'stable', detail: 'Steady' },
  { label: 'Churn Rate', value: '3.2%', trend: 'down', detail: 'Improving' },
  { label: 'Conversion to Pro', value: '4.8%', trend: 'up', detail: '+0.6% this month' },
  { label: 'Report Rate', value: '0.12%', trend: 'down', detail: 'Low — healthy community' },
  { label: 'Avg Revenue/User', value: '$0.39', trend: 'up', detail: 'Growing' },
];

const DEMO_QUEUE: ModerationItem[] = [
  { id: 'm1', reporterName: 'User_8291', targetName: 'SpamBot_44', reason: 'Spam & solicitation', severity: 'high', createdAt: Date.now() - 3600000 },
  { id: 'm2', reporterName: 'King_Marcus', targetName: 'FakeProfile_2', reason: 'Stolen photos / catfishing', severity: 'high', createdAt: Date.now() - 7200000 },
  { id: 'm3', reporterName: 'Devon_R', targetName: 'AngryUser_99', reason: 'Harassment in DMs', severity: 'medium', createdAt: Date.now() - 14400000 },
  { id: 'm4', reporterName: 'Alex_LGBT', targetName: 'Troll_42', reason: 'Hate speech', severity: 'high', createdAt: Date.now() - 28800000 },
];

const DEMO_USERS: AdminUser[] = [
  { id: 'u1', name: 'Marcus Johnson', email: 'marcus@email.com', status: 'active', reports: 0, joinedAt: Date.now() - 86400000 * 90 },
  { id: 'u2', name: 'SpamBot_44', email: 'spam@bot.com', status: 'banned', reports: 12, joinedAt: Date.now() - 86400000 * 5 },
  { id: 'u3', name: 'Alex Rivera', email: 'alex@email.com', status: 'active', reports: 1, joinedAt: Date.now() - 86400000 * 30 },
  { id: 'u4', name: 'Jordan Lee', email: 'jordan@email.com', status: 'warned', reports: 3, joinedAt: Date.now() - 86400000 * 60 },
];

const DEMO_AUDIT: AuditLog[] = [
  { id: 'a1', action: 'User banned', admin: 'Admin_Sarah', target: 'SpamBot_44', timestamp: Date.now() - 1800000 },
  { id: 'a2', action: 'Report dismissed', admin: 'Admin_Mike', target: 'Report #4892', timestamp: Date.now() - 3600000 },
  { id: 'a3', action: 'Content removed', admin: 'Admin_Sarah', target: 'Photo #12847', timestamp: Date.now() - 7200000 },
  { id: 'a4', action: 'User warned', admin: 'Admin_Mike', target: 'Jordan Lee', timestamp: Date.now() - 14400000 },
  { id: 'a5', action: 'Report escalated', admin: 'System', target: 'Report #4901', timestamp: Date.now() - 21600000 },
  { id: 'a6', action: 'Feature flag toggled', admin: 'Admin_Sarah', target: 'new_matching_v2 <ArrowRight size={16} /> ON', timestamp: Date.now() - 28800000 },
];

const HEALTH = [
  { label: 'API Server', status: 'healthy', latency: '42ms', icon: Server },
  { label: 'Database', status: 'healthy', latency: '8ms', icon: HardDrive },
  { label: 'CPU Usage', status: 'warning', value: '78%', icon: Cpu },
  { label: 'WebSocket', status: 'healthy', connections: '12,847', icon: Wifi },
];

const SEVERITY_COLORS: Record<string, string> = { low: COLORS.blue, medium: COLORS.yellow, high: COLORS.red };
const USER_STATUS_COLORS: Record<string, string> = { active: COLORS.green, banned: COLORS.red, warned: COLORS.yellow };

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Sub-screen wrapper ───
function AdminSubScreen({ title, backFn, children }: { title: string; backFn: () => void; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,#2563EB,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={backFn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.red} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{title}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}

// ─── Main Component ───
export default function AdminScreen() {
  const back = useNavStore((s) => s.back);
  const [subPage, setSubPage] = useState<string | null>(null);
  const [queue, setQueue] = useState<ModerationItem[]>(DEMO_QUEUE);
  const [users, setUsers] = useState<AdminUser[]>(DEMO_USERS);
  const [userSearch, setUserSearch] = useState('');

  const handleModerate = useCallback((id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleBanToggle = useCallback((id: string) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' as const } : u
    ));
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ─── Hub cards ───
  const cards = [
    { id: 'dashboard', icon: <BarChart3 size={24} color={COLORS.blue} />, label: 'Dashboard', sub: 'Overview stats & recent activity', color: COLORS.blue },
    { id: 'metrics', icon: <TrendingUp size={24} color={COLORS.green} />, label: 'Metrics', sub: 'Engagement, conversion, churn', color: COLORS.green },
    { id: 'moderation', icon: <Shield size={24} color={COLORS.red} />, label: 'Moderation', sub: `${queue.length} pending reviews`, color: COLORS.red },
    { id: 'reports', icon: <FileText size={24} color={COLORS.yellow} />, label: 'Reports', sub: 'User reports & flagged content', color: COLORS.yellow },
    { id: 'audit', icon: <Eye size={24} color={COLORS.purple} />, label: 'Audit Log', sub: 'Admin action history', color: COLORS.purple },
  ];

  // ─── Sub-page: Dashboard ───
  if (subPage === 'dashboard') {
    return (
      <AdminSubScreen title="Dashboard" backFn={() => setSubPage(null)}>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {DEMO_STATS.map(s => (
              <div key={s.label} style={{ padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${s.color}12`, border: `1px solid ${s.color}30`,
                  }}>
                    <s.icon size={14} color={s.color} />
                  </div>
                  <span style={{ fontSize: 10, color: COLORS.w35, fontWeight: 600 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.change.startsWith('+') ? COLORS.green : COLORS.red }}>
                  {s.change} this week
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Recent Activity</div>
          {[
            { text: 'New user registration spike (+340/hr)', time: '2 min ago', color: COLORS.green },
            { text: 'Report resolved: harassment case #4892', time: '15 min ago', color: COLORS.blue },
            { text: 'User banned: SpamBot_44', time: '1 hour ago', color: COLORS.red },
            { text: 'Subscription: 12 new King Pro signups', time: '3 hours ago', color: COLORS.yellow },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, color: COLORS.w60 }}>{a.text}</div>
              <span style={{ fontSize: 10, color: COLORS.w35, whiteSpace: 'nowrap' }}>{a.time}</span>
            </div>
          ))}
          {/* System health mini */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>System Health</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {HEALTH.map(h => (
                <div key={h.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', margin: '0 auto 4px',
                    background: h.status === 'healthy' ? COLORS.green : COLORS.yellow,
                  }} />
                  <div style={{ fontSize: 9, color: COLORS.w35 }}>{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminSubScreen>
    );
  }

  // ─── Sub-page: Metrics ───
  if (subPage === 'metrics') {
    return (
      <AdminSubScreen title="Metrics" backFn={() => setSubPage(null)}>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 10, textTransform: 'uppercase' }}>Key Performance Indicators</div>
          {METRICS.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
              background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
            }}>
              <div style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: m.trend === 'up' ? `${COLORS.green}12` : m.trend === 'down' ? `${COLORS.red}12` : `${COLORS.w12}`,
                border: `1px solid ${m.trend === 'up' ? COLORS.green : m.trend === 'down' ? COLORS.red : COLORS.w12}30`,
              }}>
                {m.trend === 'up' ? <TrendingUp size={14} color={COLORS.green} /> :
                 m.trend === 'down' ? <TrendingDown size={14} color={COLORS.red} /> :
                 <Activity size={14} color={COLORS.w35} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: COLORS.w35 }}>{m.detail}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: m.trend === 'up' ? COLORS.green : m.trend === 'down' ? COLORS.red : '#fff' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </AdminSubScreen>
    );
  }

  // ─── Sub-page: Moderation ───
  if (subPage === 'moderation') {
    return (
      <AdminSubScreen title="Moderation Queue" backFn={() => setSubPage(null)}>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
            {queue.length} pending review{queue.length !== 1 ? 's' : ''}
          </div>
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: COLORS.w35, fontSize: 13 }}>
              <Check size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div>Queue cleared! <Sparkles size={16} /></div>
            </div>
          ) : queue.map(q => (
            <div key={q.id} style={{
              padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{q.targetName}</span>
                <span style={{
                  padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  color: SEVERITY_COLORS[q.severity], background: `${SEVERITY_COLORS[q.severity]}15`,
                  border: `1px solid ${SEVERITY_COLORS[q.severity]}40`,
                }}>{q.severity}</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.w60, marginBottom: 4 }}>{q.reason}</div>
              <div style={{ fontSize: 10, color: COLORS.w35, marginBottom: 10 }}>
                Reported by {q.reporterName} · {formatTime(q.createdAt)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleModerate(q.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px', background: `${COLORS.green}12`, border: `1px solid ${COLORS.green}30`,
                  color: COLORS.green, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}><Check size={12} /> Dismiss</button>
                <button onClick={() => handleModerate(q.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px', background: `${COLORS.red}12`, border: `1px solid ${COLORS.red}30`,
                  color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}><Ban size={12} /> Ban User</button>
              </div>
            </div>
          ))}

          {/* User search for quick moderation */}
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', margin: '16px 0 8px', textTransform: 'uppercase' }}>Quick User Search</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 12,
          }}>
            <Search size={14} color={COLORS.w35} />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }} />
          </div>
          {filteredUsers.slice(0, 3).map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 6,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{u.name}</span>
                  <span style={{
                    padding: '1px 6px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                    color: USER_STATUS_COLORS[u.status], background: `${USER_STATUS_COLORS[u.status]}15`,
                    border: `1px solid ${USER_STATUS_COLORS[u.status]}30`,
                  }}>{u.status}</span>
                </div>
                <div style={{ fontSize: 10, color: COLORS.w35 }}>{u.reports} reports</div>
              </div>
              <button onClick={() => handleBanToggle(u.id)} style={{
                padding: '5px 12px',
                background: u.status === 'banned' ? `${COLORS.green}12` : `${COLORS.red}12`,
                border: `1px solid ${u.status === 'banned' ? COLORS.green : COLORS.red}30`,
                color: u.status === 'banned' ? COLORS.green : COLORS.red,
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>{u.status === 'banned' ? 'Unban' : 'Ban'}</button>
            </div>
          ))}
        </div>
      </AdminSubScreen>
    );
  }

  // ─── Sub-page: Reports ───
  if (subPage === 'reports') {
    return (
      <AdminSubScreen title="Reports" backFn={() => setSubPage(null)}>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 10, textTransform: 'uppercase' }}>Flagged Content</div>
          {[
            { type: 'Photo', target: 'User_2847', reason: 'Nudity violation', status: 'pending', time: '30m ago' },
            { type: 'Profile', target: 'SpamBot_44', reason: 'Commercial solicitation', status: 'pending', time: '1h ago' },
            { type: 'Message', target: 'AngryUser_99', reason: 'Threatening language', status: 'reviewed', time: '3h ago' },
            { type: 'Photo', target: 'User_1293', reason: 'Underage concern', status: 'escalated', time: '5h ago' },
          ].map((r, i) => (
            <div key={i} style={{
              padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '2px 6px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                    background: COLORS.w04, border: `1px solid ${COLORS.w07}`, color: COLORS.w60,
                  }}>{r.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{r.target}</span>
                </div>
                <span style={{
                  padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  color: r.status === 'pending' ? COLORS.yellow : r.status === 'escalated' ? COLORS.red : COLORS.blue,
                  background: r.status === 'pending' ? `${COLORS.yellow}15` : r.status === 'escalated' ? `${COLORS.red}15` : `${COLORS.blue}15`,
                  border: `1px solid ${r.status === 'pending' ? COLORS.yellow : r.status === 'escalated' ? COLORS.red : COLORS.blue}40`,
                }}>{r.status}</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.w60 }}>{r.reason}</div>
              <div style={{ fontSize: 10, color: COLORS.w35, marginTop: 4 }}>{r.time}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Report Statistics (30 days)</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Total', value: '147' },
                { label: 'Resolved', value: '124' },
                { label: 'Pending', value: '19' },
                { label: 'Escalated', value: '4' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: COLORS.w35 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminSubScreen>
    );
  }

  // ─── Sub-page: Audit Log ───
  if (subPage === 'audit') {
    return (
      <AdminSubScreen title="Audit Log" backFn={() => setSubPage(null)}>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>All admin actions are logged for compliance</div>
          {DEMO_AUDIT.map((a, i) => (
            <div key={a.id} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 6,
            }}>
              <div style={{
                width: 32, height: 32, minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
              }}>
                <Clock size={14} color={COLORS.w35} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.action}</div>
                <div style={{ fontSize: 11, color: COLORS.w60 }}>by {a.admin} <ArrowRight size={16} /> {a.target}</div>
              </div>
              <div style={{ fontSize: 10, color: COLORS.w35, whiteSpace: 'nowrap' }}>{formatTime(a.timestamp)}</div>
            </div>
          ))}
        </div>
      </AdminSubScreen>
    );
  }

  // ─── Main Admin Hub ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,#2563EB,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.red} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Admin</div>
          <div style={{ padding: '3px 9px', background: 'rgba(229,25,46,.12)', border: '1px solid rgba(229,25,46,.3)' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.red }}>ADMIN</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
        {/* Quick stats row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Online', value: '18.4K', color: COLORS.green },
            { label: 'Reports', value: '23', color: COLORS.yellow },
            { label: 'Revenue', value: '$48K', color: COLORS.red },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, padding: '10px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: COLORS.w35, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map(card => (
            <button key={card.id} onClick={() => setSubPage(card.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px',
                background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer', textAlign: 'left',
              }}>
              <div style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${card.color}12`, border: `1px solid ${card.color}30`,
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{card.label}</div>
                <div style={{ fontSize: 12, color: COLORS.w35 }}>{card.sub}</div>
              </div>
              <ChevronRight size={18} color={COLORS.w20} />
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', margin: '20px 0 8px', textTransform: 'uppercase' }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Ban Wave', icon: <Ban size={14} color={COLORS.red} />, color: COLORS.red },
            { label: 'Announcement', icon: <Zap size={14} color={COLORS.yellow} />, color: COLORS.yellow },
            { label: 'Export Data', icon: <FileText size={14} color={COLORS.blue} />, color: COLORS.blue },
          ].map(a => (
            <button key={a.label} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 8px', background: `${a.color}08`, border: `1px solid ${a.color}25`,
              cursor: 'pointer', color: a.color,
            }}>
              {a.icon}
              <span style={{ fontSize: 10, fontWeight: 700 }}>{a.label}</span>
            </button>
          ))}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
