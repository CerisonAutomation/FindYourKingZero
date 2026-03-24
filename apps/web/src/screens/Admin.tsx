// ═══════════════════════════════════════════════════════════════
// SCREEN: Admin Dashboard — stats, moderation, user management
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Users, Shield, Activity, DollarSign, AlertTriangle, Check, X, Search, Ban, ArrowLeft, Server, Cpu, HardDrive, Wifi } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

interface ModerationItem {
  id: string;
  reporterName: string;
  targetName: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'banned' | 'warned';
  reports: number;
  joinedAt: number;
}

const DEMO_STATS = [
  { label: 'Total Users', value: '124,847', change: '+2.4%', icon: Users, color: COLORS.blue },
  { label: 'Active Today', value: '18,392', change: '+5.1%', icon: Activity, color: COLORS.green },
  { label: 'Reports Pending', value: '23', change: '-12%', icon: AlertTriangle, color: COLORS.yellow },
  { label: 'Revenue (MTD)', value: '$48,291', change: '+18%', icon: DollarSign, color: COLORS.red },
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

const HEALTH = [
  { label: 'API Server', status: 'healthy', latency: '42ms', icon: Server },
  { label: 'Database', status: 'healthy', latency: '8ms', icon: HardDrive },
  { label: 'CPU Usage', status: 'warning', value: '78%', icon: Cpu },
  { label: 'WebSocket', status: 'healthy', connections: '12,847', icon: Wifi },
];

const SEVERITY_COLORS: Record<string, string> = {
  low: COLORS.blue,
  medium: COLORS.yellow,
  high: COLORS.red,
};

const USER_STATUS_COLORS: Record<string, string> = {
  active: COLORS.green,
  banned: COLORS.red,
  warned: COLORS.yellow,
};

export default function AdminScreen() {
  const back = useNavStore((s) => s.back);
  const [queue, setQueue] = useState<ModerationItem[]>(DEMO_QUEUE);
  const [users, setUsers] = useState<AdminUser[]>(DEMO_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'users' | 'health'>('overview');

  const handleModerate = useCallback((id: string, action: 'approve' | 'reject') => {
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

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,#2563EB,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.red} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Admin Dashboard</div>
          <div style={{
            padding: '3px 9px', background: 'rgba(229,25,46,.12)', border: '1px solid rgba(229,25,46,.3)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.red }}>ADMIN</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.w07}`, padding: '0 14px' }}>
        {(['overview', 'moderation', 'users', 'health'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 700, color: activeTab === tab ? COLORS.red : COLORS.w35,
            borderBottom: activeTab === tab ? `2px solid ${COLORS.red}` : '2px solid transparent',
            textTransform: 'capitalize', letterSpacing: '.04em',
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {DEMO_STATS.map(s => (
                <div key={s.label} style={{
                  padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                }}>
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
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: s.change.startsWith('+') ? COLORS.green : COLORS.red,
                  }}>
                    {s.change} this week
                  </span>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
              Recent Activity
            </div>
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
          </div>
        )}

        {/* Moderation Queue */}
        {activeTab === 'moderation' && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
              {queue.length} pending review{queue.length !== 1 ? 's' : ''}
            </div>
            {queue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.w35, fontSize: 13 }}>
                <Check size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div>Queue cleared! 🎉</div>
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
                  }}>
                    {q.severity}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.w60, marginBottom: 4 }}>{q.reason}</div>
                <div style={{ fontSize: 10, color: COLORS.w35, marginBottom: 10 }}>
                  Reported by {q.reporterName} · {new Date(q.createdAt).toLocaleTimeString()}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleModerate(q.id, 'approve')} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', background: `${COLORS.green}12`, border: `1px solid ${COLORS.green}30`,
                    color: COLORS.green, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>
                    <Check size={12} /> Dismiss
                  </button>
                  <button onClick={() => handleModerate(q.id, 'reject')} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', background: `${COLORS.red}12`, border: `1px solid ${COLORS.red}30`,
                    color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>
                    <Ban size={12} /> Ban User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 12,
            }}>
              <Search size={14} color={COLORS.w35} />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 13,
                }}
              />
            </div>
            {filteredUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</span>
                    <span style={{
                      padding: '1px 6px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                      color: USER_STATUS_COLORS[u.status], background: `${USER_STATUS_COLORS[u.status]}15`,
                      border: `1px solid ${USER_STATUS_COLORS[u.status]}30`,
                    }}>
                      {u.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.w35 }}>{u.email} · {u.reports} reports</div>
                </div>
                <button onClick={() => handleBanToggle(u.id)} style={{
                  padding: '6px 14px',
                  background: u.status === 'banned' ? `${COLORS.green}12` : `${COLORS.red}12`,
                  border: `1px solid ${u.status === 'banned' ? COLORS.green : COLORS.red}30`,
                  color: u.status === 'banned' ? COLORS.green : COLORS.red,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>
                  {u.status === 'banned' ? 'Unban' : 'Ban'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* System Health */}
        {activeTab === 'health' && (
          <div style={{ padding: '12px 14px' }}>
            {HEALTH.map(h => (
              <div key={h.label} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
                background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
              }}>
                <div style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: h.status === 'healthy' ? `${COLORS.green}12` : `${COLORS.yellow}12`,
                  border: `1px solid ${h.status === 'healthy' ? COLORS.green : COLORS.yellow}30`,
                }}>
                  <h.icon size={16} color={h.status === 'healthy' ? COLORS.green : COLORS.yellow} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{h.label}</div>
                  <div style={{ fontSize: 11, color: COLORS.w35 }}>
                    {'latency' in h ? `Latency: ${h.latency}` : ''}
                    {'value' in h ? `Usage: ${h.value}` : ''}
                    {'connections' in h ? `${h.connections} connections` : ''}
                  </div>
                </div>
                <div style={{
                  padding: '3px 10px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  color: h.status === 'healthy' ? COLORS.green : COLORS.yellow,
                  background: h.status === 'healthy' ? `${COLORS.green}12` : `${COLORS.yellow}12`,
                  border: `1px solid ${h.status === 'healthy' ? COLORS.green : COLORS.yellow}30`,
                }}>
                  {h.status}
                </div>
              </div>
            ))}
            <div style={{
              marginTop: 16, padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>System Metrics (24h)</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Uptime', value: '99.97%' },
                  { label: 'Avg Response', value: '42ms' },
                  { label: 'Error Rate', value: '0.03%' },
                  { label: 'Peak Users', value: '28,491' },
                ].map(m => (
                  <div key={m.label} style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.green }}>{m.value}</div>
                    <div style={{ fontSize: 9, color: COLORS.w35 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
