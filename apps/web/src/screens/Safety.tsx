// ═══════════════════════════════════════════════════════════════
// SCREEN: Safety — Multi-page with sub-navigation
// Main hub - 4 sub-screens: Blocked Users, Reports, Safety Tips, Emergency
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { AlertTriangle, ArrowLeft, Ban, Check, ChevronRight, Clock, Crown, Eye, EyeOff, Heart, MapPin, MessageCircle, Phone, Shield, ShieldAlert, UserX, X } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

// ─── Data ───
interface BlockedUser {
  id: string; name: string; avatar: string; blockedAt: number;
}

interface Report {
  id: string; targetName: string; reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'; createdAt: number;
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
  { title: 'Meet in Public', text: 'Always meet in a public place for the first time.', icon: <MapPin size={16} color={COLORS.red} /> },
  { title: 'Tell a Friend', text: "Tell a friend where you're going and who you're meeting.", icon: <MessageCircle size={16} color={COLORS.red} /> },
  { title: 'Trust Your Gut', text: 'Trust your instincts — if something feels off, leave.', icon: <ShieldAlert size={16} color={COLORS.red} /> },
  { title: 'Guard Personal Info', text: "Don't share personal details like your address too early.", icon: <Eye size={16} color={COLORS.red} /> },
  { title: 'Watch Your Drink', text: 'Keep your drink in sight at all times.', icon: <AlertTriangle size={16} color={COLORS.red} /> },
  { title: 'Own Transport', text: 'Have your own transportation arranged.', icon: <MapPin size={16} color={COLORS.red} /> },
  { title: 'Video Call First', text: 'Consider a video call before meeting in person.', icon: <Eye size={16} color={COLORS.red} /> },
  { title: 'Share Location', text: 'Use live location sharing with a trusted contact.', icon: <MapPin size={16} color={COLORS.red} /> },
];

const EMERGENCY_CONTACTS = [
  { label: 'Local Emergency', number: '911', icon: '🚨', desc: 'Police, fire, ambulance' },
  { label: 'National Crisis Hotline', number: '988', icon: <MessageCircle size={18} />, desc: 'Suicide & crisis lifeline' },
  { label: 'LGBTQ+ Hotline', number: '1-866-488-7386', icon: '🏳️‍🌈', desc: 'Trevor Project — 24/7' },
  { label: 'FindYourKing Support', number: 'support@findyourking.app', icon: <Crown size={18} />, desc: 'Safety team response < 2h' },
  { label: 'Local Police Non-Emergency', number: '311', icon: '🚔', desc: 'Non-emergency assistance' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.yellow, reviewed: COLORS.blue, resolved: COLORS.green, dismissed: COLORS.w35,
};

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ─── Sub-screen wrapper ───
function SafetySubScreen({ title, backFn, children }: { title: string; backFn: () => void; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={backFn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.red} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{title}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>{children}</div>
    </div>
  );
}

// ─── Main Component ───
export default function SafetyScreen() {
  const back = useNavStore((s) => s.back);
  const [subPage, setSubPage] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(DEMO_BLOCKED);
  const [reports] = useState<Report[]>(DEMO_REPORTS);

  const handleUnblock = useCallback((id: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // ─── Hub cards ───
  const cards = [
    { id: 'blocked', icon: <UserX size={24} color={COLORS.red} />, label: 'Blocked Users', sub: `${blockedUsers.length} blocked accounts`, color: COLORS.red },
    { id: 'reports', icon: <AlertTriangle size={24} color={COLORS.yellow} />, label: 'Reports', sub: `${reports.filter(r => r.status === 'pending').length} pending`, color: COLORS.yellow },
    { id: 'tips', icon: <Shield size={24} color={COLORS.blue} />, label: 'Safety Tips', sub: 'Stay safe meeting people', color: COLORS.blue },
    { id: 'emergency', icon: <Phone size={24} color={COLORS.green} />, label: 'Emergency', sub: 'Crisis contacts & location sharing', color: COLORS.green },
  ];

  // ─── Sub-page: Blocked Users ───
  if (subPage === 'blocked') {
    return (
      <SafetySubScreen title="Blocked Users" backFn={() => setSubPage(null)}>
        <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
          {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
        </div>
        {blockedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.w35, fontSize: 13 }}>
            <UserX size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div>No blocked users</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Blocked users won't be able to see your profile or message you.</div>
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
            }}>Unblock</button>
          </div>
        ))}
        <div style={{
          marginTop: 16, padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>About Blocking</div>
          <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.6 }}>
            When you block someone: they can't see your profile, send you messages, or see your online status. They won't be notified.
          </div>
        </div>
      </SafetySubScreen>
    );
  }

  // ─── Sub-page: Reports ───
  if (subPage === 'reports') {
    return (
      <SafetySubScreen title="My Reports" backFn={() => setSubPage(null)}>
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
              }}>{r.status}</span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.w60 }}>{r.reason}</div>
            <div style={{ fontSize: 10, color: COLORS.w35, marginTop: 4 }}>{formatDate(r.createdAt)}</div>
          </div>
        ))}
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px', background: `${COLORS.red}10`, border: `1px solid ${COLORS.red}25`,
          color: COLORS.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 12,
        }}>
          <AlertTriangle size={14} /> File New Report
        </button>
      </SafetySubScreen>
    );
  }

  // ─── Sub-page: Safety Tips ───
  if (subPage === 'tips') {
    return (
      <SafetySubScreen title="Safety Tips" backFn={() => setSubPage(null)}>
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
              width: 32, height: 32, minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${COLORS.red}08`, border: `1px solid ${COLORS.red}20`,
            }}>
              {tip.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.4 }}>{tip.text}</div>
            </div>
          </div>
        ))}
      </SafetySubScreen>
    );
  }

  // ─── Sub-page: Emergency ───
  if (subPage === 'emergency') {
    return (
      <SafetySubScreen title="Emergency" backFn={() => setSubPage(null)}>
        <div style={{
          padding: '16px', background: 'rgba(22,163,74,.06)', border: '1px solid rgba(22,163,74,.18)', marginBottom: 16, textAlign: 'center',
        }}>
          <ShieldAlert size={28} color={COLORS.green} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>In an emergency, call 911</div>
          <div style={{ fontSize: 12, color: COLORS.w60 }}>Your safety comes first. Always.</div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Crisis Contacts</div>
        {EMERGENCY_CONTACTS.map(c => (
          <div key={c.label} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
          }}>
            <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: COLORS.w60 }}>{c.desc}</div>
              <div style={{ fontSize: 12, color: COLORS.blue, fontWeight: 600, marginTop: 2 }}>{c.number}</div>
            </div>
            <ChevronRight size={16} color={COLORS.w20} />
          </div>
        ))}

        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', margin: '16px 0 8px', textTransform: 'uppercase' }}>Location Sharing</div>
        <div style={{
          padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${COLORS.green}12`, border: `1px solid ${COLORS.green}30`,
            }}>
              <MapPin size={16} color={COLORS.green} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Share Live Location</div>
              <div style={{ fontSize: 11, color: COLORS.w35 }}>Send your real-time location to a trusted contact</div>
            </div>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', background: COLORS.green, border: 'none',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
          }}>
            <MapPin size={14} /> Share Location Now
          </button>
        </div>

        <div style={{
          marginTop: 12, padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${COLORS.red}12`, border: `1px solid ${COLORS.red}30`,
            }}>
              <AlertTriangle size={16} color={COLORS.red} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Silent Alert</div>
              <div style={{ fontSize: 11, color: COLORS.w35 }}>Notify your emergency contacts without alerting anyone nearby</div>
            </div>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
            color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
          }}>
            <ShieldAlert size={14} /> Trigger Silent Alert
          </button>
        </div>
      </SafetySubScreen>
    );
  }

  // ─── Main Safety Hub ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.red} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Safety Center</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
        {/* Status banner */}
        <div style={{
          padding: '14px', background: 'rgba(22,163,74,.06)', border: '1px solid rgba(22,163,74,.18)',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Shield size={20} color={COLORS.green} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.green }}>You're Protected</div>
            <div style={{ fontSize: 11, color: COLORS.w60 }}>All safety features active</div>
          </div>
          <Check size={16} color={COLORS.green} />
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

        {/* Quick emergency */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Quick Emergency</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', background: `${COLORS.red}10`, border: `1px solid ${COLORS.red}25`,
              color: COLORS.red, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              <Phone size={14} /> Call 911
            </button>
            <button style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', background: `${COLORS.green}10`, border: `1px solid ${COLORS.green}25`,
              color: COLORS.green, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              <MapPin size={14} /> Share Location
            </button>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
