// ═══════════════════════════════════════════════════════════════
// SCREEN: Safety Center — blocked users, reports, tips, emergency
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Shield, ShieldAlert, Phone, AlertTriangle, UserX, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: number;
}

interface Report {
  id: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: number;
}

const DEMO_BLOCKED: BlockedUser[] = [
  { id: '1', name: 'Alex M.', avatar: 'https://i.pravatar.cc/100?u=block1', blockedAt: Date.now() - 86400000 * 3 },
  { id: '2', name: 'Jordan K.', avatar: 'https://i.pravatar.cc/100?u=block2', blockedAt: Date.now() - 86400000 * 7 },
  { id: '3', name: 'Sam W.', avatar: 'https://i.pravatar.cc/100?u=block3', blockedAt: Date.now() - 86400000 * 14 },
];

const DEMO_REPORTS: Report[] = [
  { id: 'r1', targetName: 'Fake Profile', reason: 'Catfishing / stolen photos', status: 'resolved', createdAt: Date.now() - 86400000 * 5 },
  { id: 'r2', targetName: 'Harassment', reason: 'Repeated unwanted messages', status: 'pending', createdAt: Date.now() - 86400000 * 1 },
  { id: 'r3', targetName: 'Spam Account', reason: 'Promotional links in profile', status: 'reviewed', createdAt: Date.now() - 86400000 * 10 },
];

const SAFETY_TIPS = [
  'Always meet in a public place for the first time.',
  'Tell a friend where you\'re going and who you\'re meeting.',
  'Trust your instincts — if something feels off, leave.',
  'Don\'t share personal details like your address too early.',
  'Keep your drink in sight at all times.',
  'Have your own transportation arranged.',
];

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.yellow,
  reviewed: COLORS.blue,
  resolved: COLORS.green,
  dismissed: COLORS.w35,
};

export default function SafetyScreen() {
  const back = useNavStore((s) => s.back);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(DEMO_BLOCKED);
  const [reports] = useState<Report[]>(DEMO_REPORTS);
  const [activeTab, setActiveTab] = useState<'blocked' | 'reports' | 'tips'>('blocked');

  const handleUnblock = useCallback((id: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.red} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Safety Center</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.w07}`, padding: '0 14px' }}>
          {(['blocked', 'reports', 'tips'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: activeTab === tab ? COLORS.red : COLORS.w35,
              borderBottom: activeTab === tab ? `2px solid ${COLORS.red}` : '2px solid transparent',
              textTransform: 'uppercase', letterSpacing: '.08em',
            }}>
              {tab === 'blocked' ? '🚫 Blocked' : tab === 'reports' ? '🚩 Reports' : '🛡️ Tips'}
            </button>
          ))}
        </div>

        {/* Blocked Users */}
        {activeTab === 'blocked' && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
              {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
            </div>
            {blockedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.w35, fontSize: 13 }}>
                <UserX size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div>No blocked users</div>
              </div>
            ) : blockedUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
              }}>
                <img src={u.avatar} style={{ width: 44, height: 44, objectFit: 'cover', border: `1px solid ${COLORS.w12}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.w35 }}>Blocked {formatDate(u.blockedAt)}</div>
                </div>
                <button onClick={() => handleUnblock(u.id)} style={{
                  padding: '6px 14px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
                  color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
              {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
            </div>
            {reports.map(r => (
              <div key={r.id} style={{
                padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.targetName}</div>
                  <span style={{
                    padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    color: STATUS_COLORS[r.status], background: `${STATUS_COLORS[r.status]}15`,
                    border: `1px solid ${STATUS_COLORS[r.status]}40`,
                  }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.w60 }}>{r.reason}</div>
                <div style={{ fontSize: 10, color: COLORS.w35, marginTop: 4 }}>{formatDate(r.createdAt)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Safety Tips */}
        {activeTab === 'tips' && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{
              padding: '14px', background: 'rgba(229,25,46,.06)', border: '1px solid rgba(229,25,46,.18)', marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.red, marginBottom: 6 }}>
                <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Your safety matters
              </div>
              <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.6 }}>
                FindYourKing is committed to creating a safe environment. If you ever feel unsafe, trust your instincts and reach out.
              </div>
            </div>
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 14px', background: COLORS.bg1,
                border: `1px solid ${COLORS.w07}`, marginBottom: 8, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 24, height: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: COLORS.w04, border: `1px solid ${COLORS.w07}`, fontSize: 11, fontWeight: 800, color: COLORS.red,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: COLORS.w60, lineHeight: 1.5 }}>{tip}</div>
              </div>
            ))}

            {/* Emergency contacts */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
                <Phone size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
                Emergency Contacts
              </div>
              {[
                { label: 'Local Emergency', number: '911', icon: '🚨' },
                { label: 'National Crisis Hotline', number: '988', icon: '💬' },
                { label: 'FindYourKing Support', number: 'support@findyourking.app', icon: '👑' },
              ].map(c => (
                <div key={c.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.w60 }}>{c.number}</div>
                  </div>
                  <ChevronRight size={16} color={COLORS.w20} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
