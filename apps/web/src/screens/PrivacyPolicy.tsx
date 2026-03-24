// ═══════════════════════════════════════════════════════════════
// SCREEN: Privacy Policy — complete privacy policy with navigation
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Shield, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

const SECTIONS = [
  {
    id: 'intro', title: '1. Introduction',
    content: `FindYourKing ("we", "us", "our") operates the FindYourKing mobile application and website (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By using FindYourKing, you agree to the collection and use of information in accordance with this policy. We are committed to protecting your personal data and respecting your privacy rights under applicable laws, including the General Data Protection Regulation (GDPR).`,
  },
  {
    id: 'collect', title: '2. Information We Collect',
    content: `We collect information you provide directly: profile data (name, age, photos, bio, preferences), account credentials (email, encrypted password), messages and media you share with other users, and location data (with your permission). We automatically collect: device information (model, OS, unique identifiers), usage analytics (features used, session duration), log data (IP address, access times), and approximate location via IP. We do NOT collect: financial data (handled by Stripe), biometric data, or health data beyond what you voluntarily share.`,
  },
  {
    id: 'use', title: '3. How We Use Your Information',
    content: `We use your data to: provide and maintain the Service; match you with compatible users; enable messaging and communication; send notifications about matches and messages; improve and personalize your experience; detect and prevent fraud, abuse, and security incidents; comply with legal obligations; and conduct research and analytics (anonymized/aggregated only). We process data based on: your consent, contractual necessity, legitimate interests (safety, improvement), and legal obligations.`,
  },
  {
    id: 'share', title: '4. Data Sharing & Disclosure',
    content: `We do NOT sell your personal data. We share data only with: Service providers (hosting, analytics, payment processing) under strict data processing agreements; Law enforcement when required by law or to protect safety; Other users — only profile information you choose to make public; In anonymized/aggregated form for research. All third-party processors are GDPR-compliant and bound by data processing agreements.`,
  },
  {
    id: 'security', title: '5. Data Security',
    content: `We implement industry-standard security measures: End-to-end encryption for messages (Web Crypto API, AES-256-GCM); Encrypted data at rest; Secure authentication with optional 2FA; Regular security audits and penetration testing; Access controls limiting employee access to personal data; Incident response procedures with 72-hour breach notification. No method of transmission over the Internet is 100% secure, but we continuously work to protect your data.`,
  },
  {
    id: 'retention', title: '6. Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide services. Upon account deletion: profile data is deleted within 30 days; messages are deleted within 90 days; anonymized analytics may be retained indefinitely; backup copies are purged within 90 days. You may request early deletion at any time via Settings > Data & Privacy > Request Data Deletion.`,
  },
  {
    id: 'rights', title: '7. Your Rights (GDPR)',
    content: `Under GDPR, you have the right to: Access your personal data (Settings > Export My Data); Rectify inaccurate data (Settings > Edit Profile); Erase your data ("Right to be Forgotten"); Restrict processing; Data portability (export in JSON format); Object to processing; Withdraw consent at any time. To exercise any right, contact dpo@findyourking.app or use in-app controls. We respond within 30 days.`,
  },
  {
    id: 'cookies', title: '8. Cookies & Tracking',
    content: `We use cookies and similar technologies: Essential cookies (required for functionality, cannot be disabled); Analytics cookies (help us improve the Service, opt-out available); Functional cookies (remember your preferences). You can manage cookie preferences in Settings > Cookie Preferences. We do not use third-party advertising cookies. Our analytics use privacy-respecting, anonymized data collection.`,
  },
  {
    id: 'children', title: '9. Children\'s Privacy',
    content: `FindYourKing is strictly for users aged 18 and over. We do not knowingly collect data from anyone under 18. If we discover a user is under 18, we immediately delete their account and data. If you believe a minor is using our Service, please report it immediately via the in-app reporting feature or contact safety@findyourking.app.`,
  },
  {
    id: 'changes', title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email and in-app notification at least 30 days before changes take effect. Continued use of the Service after changes constitutes acceptance of the updated policy. Previous versions are available upon request.`,
  },
  {
    id: 'contact', title: '11. Contact Us',
    content: `Data Protection Officer: dpo@findyourking.app\nPrivacy Team: privacy@findyourking.app\nSafety Team: safety@findyourking.app\nPostal: FindYourKing Ltd, 42 King Street, London, EC2V 8AS, UK\n\nFor GDPR-related requests, include your account email and the specific right you wish to exercise. We respond within 30 calendar days.`,
  },
];

export default function PrivacyPolicyScreen() {
  const back = useNavStore((s) => s.back);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['intro']));

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#2563EB,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Shield size={18} color={COLORS.blue} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Privacy Policy</div>
        </div>
      </div>

      {/* Section quick nav */}
      <div style={{
        display: 'flex', overflowX: 'auto', padding: '8px 14px', gap: 6, flexShrink: 0,
        borderBottom: `1px solid ${COLORS.w07}`, whiteSpace: 'nowrap',
      }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => {
            document.getElementById(`pp-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
            setExpanded(prev => new Set([...prev, s.id]));
          }} style={{
            padding: '4px 10px', background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
            color: COLORS.w35, fontSize: 9, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {s.title.split('. ')[1]}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {/* Title block */}
        <div style={{ textAlign: 'center', marginBottom: 20, padding: '16px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Privacy Policy</div>
          <div style={{ fontSize: 12, color: COLORS.w35 }}>Last updated: March 1, 2026 · Effective: March 15, 2026</div>
          <div style={{ fontSize: 11, color: COLORS.w35, marginTop: 4 }}>GDPR Compliant · EU 2016/679</div>
        </div>

        {SECTIONS.map(s => (
          <div key={s.id} id={`pp-${s.id}`} style={{ marginBottom: 8 }}>
            <button onClick={() => toggle(s.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</span>
              {expanded.has(s.id) ? <ChevronUp size={16} color={COLORS.w35} /> : <ChevronDown size={16} color={COLORS.w35} />}
            </button>
            {expanded.has(s.id) && (
              <div style={{
                padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                borderTop: 'none', fontSize: 13, color: COLORS.w60, lineHeight: 1.7, whiteSpace: 'pre-line',
              }}>
                {s.content}
              </div>
            )}
          </div>
        ))}

        <div style={{
          marginTop: 16, padding: '14px', background: `${COLORS.blue}06`, border: `1px solid ${COLORS.blue}18`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.blue, marginBottom: 4 }}>Questions?</div>
          <div style={{ fontSize: 11, color: COLORS.w35 }}>Contact our Data Protection Officer at dpo@findyourking.app</div>
        </div>

        <div style={{ textAlign: 'center', padding: '12px 0 24px', fontSize: 10, color: COLORS.w35 }}>
          © 2026 FindYourKing Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}
