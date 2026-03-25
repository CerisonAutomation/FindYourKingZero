// ═══════════════════════════════════════════════════════════════
// SCREEN: Community Guidelines — rules, prohibited behavior, reporting
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronDown, ChevronUp, DollarSign, Flag, Heart, Lock, Shield, User, XCircle } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

const RULES = [
  { id: 'r1', icon: <User size={16} />, title: 'Be Authentic', desc: 'Use real photos and accurate information about yourself. Catfishing and impersonation are strictly prohibited.' },
  { id: 'r2', icon: '🤝', title: 'Be Respectful', desc: 'Treat everyone with dignity. No harassment, hate speech, bullying, or discrimination of any kind.' },
  { id: 'r3', icon: <Lock size={16} />, title: 'Respect Boundaries', desc: 'No means no. If someone isn\'t interested, move on gracefully. Persistent unwanted contact is harassment.' },
  { id: 'r4', icon: '🔞', title: '18+ Only', desc: 'You must be 18 or older. Any indication of underage users is reported immediately to authorities.' },
  { id: 'r5', icon: <DollarSign size={16} />, title: 'No Solicitation', desc: 'No selling, promoting businesses, requesting money, or financial scams of any kind.' },
  { id: 'r6', icon: <Shield size={16} />, title: 'Protect Privacy', desc: 'Never share someone else\'s personal information, photos, or conversations without explicit consent.' },
  { id: 'r7', icon: '🚫', title: 'No Illegal Activity', desc: 'Drug dealing, solicitation of illegal services, and any criminal activity will result in an immediate ban.' },
  { id: 'r8', icon: '📸', title: 'Photo Standards', desc: 'No nudity in public photos. Private albums are consensual. No photos of minors. No non-consensual intimate images.' },
];

const PROHIBITED = [
  'Harassment, threats, or intimidation',
  'Hate speech based on race, religion, gender, sexuality, or disability',
  'Non-consensual intimate images (NCII) — immediate ban + law enforcement referral',
  'Impersonation or catfishing',
  'Spam, bots, or automated accounts',
  'Solicitation of money, goods, or services',
  'Sharing another user\'s personal data',
  'Promoting or glorifying self-harm',
  'Drug solicitation or distribution',
  'Underage accounts (mandatory report to NCMEC)',
  'Doxxing or threatening to reveal private information',
  'Stalking or persistent unwanted contact after being blocked',
];

const CONSEQUENCES = [
  { level: 'Warning', color: COLORS.yellow, desc: 'First minor violation. Content removed. Account flagged.', icon: '⚠️' },
  { level: 'Temp Suspension', color: COLORS.yellow, desc: '24-72 hour lockout. Review required to restore access.', icon: '⏸️' },
  { level: 'Permanent Ban', color: COLORS.red, desc: 'Serious violations. Device + IP ban. Cannot create new accounts.', icon: '🚫' },
  { level: 'Law Enforcement', color: COLORS.red, desc: 'Illegal activity. Reports to NCMEC, FBI IC3, or local authorities.', icon: '🚨' },
];

const REPORT_STEPS = [
  { step: 1, title: 'Tap the Flag', desc: 'On any profile or message, tap the ⚋ menu and select "Report".' },
  { step: 2, title: 'Choose Category', desc: 'Select the reason: Harassment, Fake Profile, Spam, Hate Speech, Underage, or Other.' },
  { step: 3, title: 'Provide Details', desc: 'Add screenshots or descriptions. More detail helps us investigate faster.' },
  { step: 4, title: 'We Investigate', desc: 'Our Trust & Safety team reviews reports within 24 hours. Urgent cases within 2 hours.' },
  { step: 5, title: 'Outcome', desc: 'We\'ll notify you of the result. Action may include warnings, suspensions, or bans.' },
];

export default function CommunityGuidelinesScreen() {
  const back = useNavStore((s) => s.back);
  const [activeSection, setActiveSection] = useState<'rules' | 'prohibited' | 'consequences' | 'reporting'>('rules');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#16A34A,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Heart size={18} color={COLORS.green} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Community Guidelines</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${COLORS.w07}`, padding: '0 14px', whiteSpace: 'nowrap' }}>
        {([
          { key: 'rules', label: '<Check size={14} color="green" /> Rules' },
          { key: 'prohibited', label: '🚫 Prohibited' },
          { key: 'consequences', label: '⚖️ Consequences' },
          { key: 'reporting', label: '🚩 Reporting' },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 10, fontWeight: 700, color: activeSection === tab.key ? COLORS.green : COLORS.w35,
            borderBottom: activeSection === tab.key ? `2px solid ${COLORS.green}` : '2px solid transparent',
            whiteSpace: 'nowrap', minWidth: 'fit-content',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Intro */}
        <div style={{
          margin: '12px 14px', padding: '14px', background: `${COLORS.green}06`, border: `1px solid ${COLORS.green}18`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.green, marginBottom: 4 }}>
            🤝 Our Community Promise
          </div>
          <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.6 }}>
            FindYourKing is a space for authentic connections. These guidelines exist to keep our community safe, respectful, and welcoming for everyone. Violations are taken seriously.
          </div>
        </div>

        {/* Rules */}
        {activeSection === 'rules' && (
          <div style={{ padding: '0 14px 12px' }}>
            {RULES.map(r => (
              <div key={r.id} style={{
                display: 'flex', gap: 12, padding: '14px', background: COLORS.bg1,
                border: `1px solid ${COLORS.w07}`, marginBottom: 8, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prohibited Behavior */}
        {activeSection === 'prohibited' && (
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
              The following behaviors will result in immediate action:
            </div>
            {PROHIBITED.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 6,
              }}>
                <XCircle size={14} color={COLORS.red} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: COLORS.w60, lineHeight: 1.5 }}>{p}</div>
              </div>
            ))}
          </div>
        )}

        {/* Consequences */}
        {activeSection === 'consequences' && (
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
              Our enforcement follows a progressive discipline model:
            </div>
            {CONSEQUENCES.map((c, i) => (
              <div key={i} style={{
                padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
                borderLeft: `3px solid ${c.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.level}</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
            <div style={{
              marginTop: 12, padding: '12px 14px', background: 'rgba(229,25,46,.06)',
              border: '1px solid rgba(229,25,46,.18)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.red, marginBottom: 4 }}>
                <AlertTriangle size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
                Zero Tolerance
              </div>
              <div style={{ fontSize: 11, color: COLORS.w60, lineHeight: 1.5 }}>
                Child exploitation material (CSAM), non-consensual intimate images (NCII), and credible threats of violence result in immediate permanent ban and law enforcement referral. No exceptions.
              </div>
            </div>
          </div>
        )}

        {/* Reporting Process */}
        {activeSection === 'reporting' && (
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
              How to report a violation:
            </div>
            {REPORT_STEPS.map(s => (
              <div key={s.step} style={{
                display: 'flex', gap: 12, padding: '14px', background: COLORS.bg1,
                border: `1px solid ${COLORS.w07}`, marginBottom: 8, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 28, height: 28, minWidth: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${COLORS.green}12`, border: `1px solid ${COLORS.green}30`,
                  fontSize: 12, fontWeight: 800, color: COLORS.green,
                }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 12, padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <Flag size={12} style={{ marginRight: 6, verticalAlign: -1, color: COLORS.green }} />
                Report Channels
              </div>
              {[
                { label: 'In-App Report', desc: 'Profile menu <ArrowRight size={16} /> Report (fastest)' },
                { label: 'Email', desc: 'safety@findyourking.app' },
                { label: 'Emergency', desc: 'safety@findyourking.app (urgent — 2hr response)' },
                { label: 'Law Enforcement', desc: 'legal@findyourking.app (for official requests)' },
              ].map(c => (
                <div key={c.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: `1px solid ${COLORS.w07}`,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{c.label}</span>
                  <span style={{ fontSize: 11, color: COLORS.w60 }}>{c.desc}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 12, padding: '14px', background: `${COLORS.green}06`, border: `1px solid ${COLORS.green}18`, textAlign: 'center',
            }}>
              <CheckCircle size={20} color={COLORS.green} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, marginBottom: 4 }}>Your Report Matters</div>
              <div style={{ fontSize: 11, color: COLORS.w60, lineHeight: 1.5 }}>
                Reports are confidential. We never reveal who reported. Every report is reviewed by a human moderator — not just automated systems.
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '12px 14px 24px', fontSize: 10, color: COLORS.w35 }}>
          Guidelines updated March 2026 · Review annually
        </div>
      </div>
    </div>
  );
}
