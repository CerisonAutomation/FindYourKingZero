// ═══════════════════════════════════════════════════════════════
// SCREEN: GDPR / Privacy — cookie prefs, data export, deletion
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { ArrowLeft, Check, Cookie, Download, Eye, EyeOff, FileText, Lock, Shield, Trash2, Clipboard as LucideClipboard } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

interface CookiePref {
  key: string;
  label: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

export default function GDPRScreen() {
  const back = useNavStore((s) => s.back);
  const go = useNavStore((s) => s.go);

  const [cookies, setCookies] = useState<CookiePref[]>([
    { key: 'essential', label: 'Essential Cookies', description: 'Required for the app to function. Cannot be disabled.', required: true, enabled: true },
    { key: 'analytics', label: 'Analytics Cookies', description: 'Help us understand how you use FindYourKing.', required: false, enabled: true },
    { key: 'marketing', label: 'Marketing Cookies', description: 'Used for personalized ads and promotions.', required: false, enabled: false },
    { key: 'functional', label: 'Functional Cookies', description: 'Remember your preferences and settings.', required: false, enabled: true },
  ]);

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const toggleCookie = useCallback((key: string) => {
    setCookies(prev => prev.map(c =>
      c.key === key && !c.required ? { ...c, enabled: !c.enabled } : c
    ));
  }, []);

  const handleExport = useCallback(() => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setExported(true); }, 2000);
  }, []);

  const handleDeleteRequest = useCallback(() => {
    setDeleting(true);
    setTimeout(() => { setDeleting(false); setDeleteRequested(true); }, 1500);
  }, []);

  const privacySettings = [
    { icon: Eye, label: 'Profile Visibility', value: 'Public', desc: 'Who can see your profile' },
    { icon: Lock, label: 'Data Encryption', value: 'AES-256-GCM', desc: 'End-to-end encrypted messages' },
    { icon: Shield, label: 'Login Security', value: '2FA Enabled', desc: 'Two-factor authentication' },
  ];

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
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Data & Privacy</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* GDPR badge */}
        <div style={{
          margin: '12px 14px', padding: '14px', background: `${COLORS.blue}08`, border: `1px solid ${COLORS.blue}20`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.blue, marginBottom: 4 }}>
            🇪🇺 GDPR Compliant
          </div>
          <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>
            FindYourKing respects your data rights under the General Data Protection Regulation (EU 2016/679).
            You have full control over your personal data.
          </div>
        </div>

        {/* Cookie Preferences */}
        <div style={{ margin: '12px 0 0' }}>
          <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            <Cookie size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
            Cookie Preferences
          </div>
          <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
            {cookies.map((c, i) => (
              <div key={c.key} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < cookies.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.label}
                    {c.required && (
                      <span style={{ fontSize: 8, fontWeight: 700, color: COLORS.w35, padding: '1px 6px', background: COLORS.w04, border: `1px solid ${COLORS.w07}` }}>
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.w35, marginTop: 2 }}>{c.description}</div>
                </div>
                <div onClick={() => toggleCookie(c.key)} style={{
                  width: 40, height: 22, borderRadius: 11, padding: 2,
                  background: c.enabled ? COLORS.green : 'rgba(255,255,255,.15)',
                  cursor: c.required ? 'default' : 'pointer', opacity: c.required ? 0.5 : 1,
                  transition: 'background .2s',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transform: c.enabled ? 'translateX(18px)' : 'translateX(0)',
                    transition: 'transform .2s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div style={{ margin: '16px 0 0' }}>
          <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            Privacy Settings
          </div>
          <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
            {privacySettings.map((s, i) => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < privacySettings.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
                }}>
                  <s.icon size={14} color={COLORS.w60} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: COLORS.w35 }}>{s.desc}</div>
                </div>
                <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Actions */}
        <div style={{ margin: '16px 0 0' }}>
          <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            Your Data Rights
          </div>
          <div style={{ margin: '0 12px' }}>
            {/* Export */}
            <button onClick={handleExport} disabled={exporting || exported} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px', width: '100%',
              background: exported ? `${COLORS.green}08` : COLORS.bg1,
              border: `1px solid ${exported ? COLORS.green + '30' : COLORS.w07}`,
              cursor: exported ? 'default' : 'pointer', marginBottom: 8, textAlign: 'left',
            }}>
              <div style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${COLORS.blue}12`, border: `1px solid ${COLORS.blue}30`,
              }}>
                {exported ? <Check size={16} color={COLORS.green} /> : <Download size={16} color={COLORS.blue} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {exporting ? 'Preparing Export...' : exported ? 'Export Ready!' : 'Export My Data'}
                </div>
                <div style={{ fontSize: 11, color: COLORS.w35 }}>
                  Download all your data in JSON format (GDPR Art. 20)
                </div>
              </div>
            </button>

            {/* Delete */}
            <button onClick={handleDeleteRequest} disabled={deleting || deleteRequested} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px', width: '100%',
              background: deleteRequested ? `${COLORS.yellow}08` : 'rgba(239,68,68,.04)',
              border: `1px solid ${deleteRequested ? COLORS.yellow + '30' : 'rgba(239,68,68,.18)'}`,
              cursor: deleteRequested ? 'default' : 'pointer', textAlign: 'left',
            }}>
              <div style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)',
              }}>
                {deleteRequested ? <Check size={16} color={COLORS.yellow} /> : <Trash2 size={16} color="#ef4444" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: deleteRequested ? COLORS.yellow : '#ef4444' }}>
                  {deleting ? 'Processing...' : deleteRequested ? 'Deletion Scheduled' : 'Request Data Deletion'}
                </div>
                <div style={{ fontSize: 11, color: COLORS.w35 }}>
                  Permanently delete all your data (GDPR Art. 17 — Right to Erasure)
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Legal links */}
        <div style={{ margin: '16px 12px' }}>
          <button onClick={() => go('privacy-policy')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer', marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}><FileText size={14} /> Privacy Policy</span>
            <span style={{ color: COLORS.w12, fontSize: 16 }}>›</span>
          </button>
          <button onClick={() => go('terms-of-service')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer', marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}><LucideClipboard size={14} /> Terms of Service</span>
            <span style={{ color: COLORS.w12, fontSize: 16 }}>›</span>
          </button>
          <button onClick={() => go('community-guidelines')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: '12px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>🤝 Community Guidelines</span>
            <span style={{ color: COLORS.w12, fontSize: 16 }}>›</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '12px 14px 24px', fontSize: 10, color: COLORS.w35 }}>
          Data Protection Officer: dpo@findyourking.app
        </div>
      </div>
    </div>
  );
}
