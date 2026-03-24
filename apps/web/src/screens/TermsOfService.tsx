// ═══════════════════════════════════════════════════════════════
// SCREEN: Terms of Service — complete terms with section navigation
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { FileText, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

const SECTIONS = [
  {
    id: 'acceptance', title: '1. Acceptance of Terms',
    content: `By accessing or using FindYourKing ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all terms, you may not use the Service. These Terms constitute a legally binding agreement between you and FindYourKing Ltd ("Company", "we", "us"). You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are 18+ and have the legal capacity to enter into these Terms.`,
  },
  {
    id: 'account', title: '2. Account Registration & Security',
    content: `You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account. You may not create more than one account per person. You may not share your account with others. We reserve the right to suspend or terminate accounts that violate these Terms. Account verification (photo ID) may be required to access certain features.`,
  },
  {
    id: 'conduct', title: '3. User Conduct',
    content: `You agree NOT to: Harass, threaten, or intimidate other users; Post false, misleading, or deceptive content; Impersonate any person or entity; Share another user's personal information without consent; Use the Service for commercial solicitation; Upload malicious code or attempt to hack the Service; Scrape, crawl, or systematically collect data from the Service; Use automated means (bots, scripts) to interact with the Service; Engage in hate speech or discrimination; Share explicit content in public areas; Solicit money or financial information from other users; Engage in any illegal activity.`,
  },
  {
    id: 'content', title: '4. User Content & Intellectual Property',
    content: `You retain ownership of content you post. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the Service. You represent that you have the right to post all content you share. We may remove content that violates these Terms without notice. You may not post content that infringes on third-party intellectual property rights. Our name, logo, and all related marks are trademarks of FindYourKing Ltd.`,
  },
  {
    id: 'safety', title: '5. Safety & Interactions',
    content: `FindYourKing is a platform for connecting people. We are not responsible for the conduct of users, whether online or offline. You are solely responsible for your interactions with other users. We strongly recommend: Meeting in public places; Informing friends/family of your plans; Not sharing financial information; Trusting your instincts. We provide safety tools (blocking, reporting, emergency contacts) but cannot guarantee user behavior. Always prioritize your personal safety.`,
  },
  {
    id: 'payments', title: '6. Subscriptions & Payments',
    content: `Premium features require a paid subscription. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date. Payment is processed through the App Store, Google Play, or our web payment processor (Stripe). Refunds are subject to the respective store's refund policy. We may change pricing with 30 days' notice. Subscription features may be added, modified, or removed. Free trial periods, if offered, convert to paid subscriptions unless cancelled before trial end.`,
  },
  {
    id: 'privacy', title: '7. Privacy & Data',
    content: `Your privacy is important to us. Our Privacy Policy (available in Settings > Privacy Policy) explains how we collect, use, and protect your data. By using the Service, you consent to our data practices as described in the Privacy Policy. You have the right to access, export, and delete your data at any time. We comply with GDPR and other applicable data protection laws. Messages are end-to-end encrypted. We do not sell your personal data to third parties.`,
  },
  {
    id: 'disclaimer', title: '8. Disclaimers & Limitation of Liability',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.`,
  },
  {
    id: 'termination', title: '9. Termination',
    content: `You may terminate your account at any time via Settings > Delete Account. We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or if required by law. Upon termination: your access to the Service ceases; your data will be deleted per our data retention policy; provisions that by their nature should survive will survive (liability limitations, dispute resolution). Termination does not entitle you to refunds of any prepaid amounts.`,
  },
  {
    id: 'disputes', title: '10. Dispute Resolution',
    content: `These Terms are governed by the laws of England and Wales. Any disputes shall be resolved through binding arbitration, except that either party may seek injunctive relief in court. You agree to resolve disputes individually and waive any right to class action. Before initiating formal dispute resolution, we encourage you to contact us at disputes@findyourking.app to attempt informal resolution. The arbitration shall be conducted by the London Court of International Arbitration (LCIA).`,
  },
  {
    id: 'changes', title: '11. Changes to Terms',
    content: `We may modify these Terms at any time. We will notify you of material changes via email and in-app notification at least 30 days before changes take effect. Continued use after changes constitutes acceptance. If you disagree with changes, you must stop using the Service and may terminate your account. Previous versions of these Terms are available upon request.`,
  },
  {
    id: 'contact', title: '12. Contact',
    content: `Legal: legal@findyourking.app\nSupport: support@findyourking.app\nSafety: safety@findyourking.app\nPostal: FindYourKing Ltd, 42 King Street, London, EC2V 8AS, UK\n\nFor DMCA/copyright claims, contact legal@findyourking.app with full details of the alleged infringement.`,
  },
];

export default function TermsOfServiceScreen() {
  const back = useNavStore((s) => s.back);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['acceptance']));

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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#D97706,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <FileText size={18} color={COLORS.yellow} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Terms of Service</div>
        </div>
      </div>

      {/* Section quick nav */}
      <div style={{
        display: 'flex', overflowX: 'auto', padding: '8px 14px', gap: 6, flexShrink: 0,
        borderBottom: `1px solid ${COLORS.w07}`, whiteSpace: 'nowrap',
      }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => {
            document.getElementById(`tos-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
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
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Terms of Service</div>
          <div style={{ fontSize: 12, color: COLORS.w35 }}>Last updated: March 1, 2026 · Effective: March 15, 2026</div>
          <div style={{ fontSize: 11, color: COLORS.w35, marginTop: 4 }}>FindYourKing Ltd · Registered in England & Wales</div>
        </div>

        {SECTIONS.map(s => (
          <div key={s.id} id={`tos-${s.id}`} style={{ marginBottom: 8 }}>
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
          marginTop: 16, padding: '14px', background: `${COLORS.yellow}06`, border: `1px solid ${COLORS.yellow}18`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.yellow, marginBottom: 4 }}>⚖️ Agreement</div>
          <div style={{ fontSize: 11, color: COLORS.w35 }}>By using FindYourKing, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</div>
        </div>

        <div style={{ textAlign: 'center', padding: '12px 0 24px', fontSize: 10, color: COLORS.w35 }}>
          © 2026 FindYourKing Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}
