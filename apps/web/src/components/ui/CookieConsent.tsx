// ═══════════════════════════════════════════════════════════════
// GDPR Cookie Consent Banner — FindYourKing
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { Cookie, Shield, X, Settings } from 'lucide-react';

const STORAGE_KEY = 'king-cookie-consent';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const defaultPreferences: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so it slides up after page load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = useCallback((prefs: ConsentPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }));
    setVisible(false);
    setShowPreferences(false);
  }, []);

  const handleAcceptAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: true, marketing: true, personalization: true });
  }, [saveConsent]);

  const handleRejectAll = useCallback(() => {
    saveConsent(defaultPreferences);
  }, [saveConsent]);

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences);
  }, [saveConsent, preferences]);

  const togglePreference = useCallback((key: keyof ConsentPreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!visible) return null;

  // ── Styles ──────────────────────────────────────────────────
  const overlay: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const banner: React.CSSProperties = {
    background: 'linear-gradient(180deg, #0E0E22 0%, #060610 100%)',
    borderTop: '1px solid rgba(255,255,255,.07)',
    padding: '20px 24px',
    maxWidth: 960,
    margin: '0 auto 0',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px rgba(0,0,0,.6)',
  };

  const headerRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: showPreferences ? 16 : 12,
  };

  const title: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  };

  const description: React.CSSProperties = {
    color: 'rgba(255,255,255,.60)',
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 16,
  };

  const btnRow: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  };

  const baseBtn: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity .15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const acceptBtn: React.CSSProperties = {
    ...baseBtn,
    background: '#E5192E',
    color: '#fff',
  };

  const rejectBtn: React.CSSProperties = {
    ...baseBtn,
    background: 'rgba(255,255,255,.07)',
    color: 'rgba(255,255,255,.80)',
    border: '1px solid rgba(255,255,255,.10)',
  };

  const manageBtn: React.CSSProperties = {
    ...baseBtn,
    background: 'transparent',
    color: 'rgba(255,255,255,.60)',
    border: '1px solid rgba(255,255,255,.10)',
  };

  const prefSection: React.CSSProperties = {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  };

  const prefRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  };

  const prefLabel: React.CSSProperties = {
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
  };

  const prefDesc: React.CSSProperties = {
    color: 'rgba(255,255,255,.40)',
    fontSize: 12,
    marginTop: 2,
  };

  const toggleTrack = (on: boolean): React.CSSProperties => ({
    width: 40,
    height: 22,
    borderRadius: 11,
    background: on ? '#16A34A' : 'rgba(255,255,255,.12)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background .2s',
    flexShrink: 0,
  });

  const toggleKnob = (on: boolean): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 2,
    left: on ? 20 : 2,
    transition: 'left .2s',
  });

  const prefItems: { key: keyof ConsentPreferences; label: string; desc: string }[] = [
    { key: 'necessary', label: 'Necessary', desc: 'Required for the app to function' },
    { key: 'analytics', label: 'Analytics', desc: 'Help us understand how you use the app' },
    { key: 'marketing', label: 'Marketing', desc: 'Personalized ads and promotions' },
    { key: 'personalization', label: 'Personalization', desc: 'Customized content and recommendations' },
  ];

  return (
    <>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div style={overlay}>
        <div style={banner}>
          <div style={headerRow}>
            <div style={title}>
              <Cookie size={20} color="#D97706" />
              <span>Cookie Preferences</span>
            </div>
            <button
              onClick={() => setVisible(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} color="rgba(255,255,255,.40)" />
            </button>
          </div>

          <p style={description}>
            We use cookies to enhance your experience on FindYourKing. Some cookies are essential,
            while others help us improve our services and show you relevant content.
            By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            See our{' '}
            <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>Privacy Policy</a>{' '}
            for more details.
          </p>

          {showPreferences && (
            <div style={prefSection}>
              {prefItems.map(({ key, label, desc }) => (
                <div
                  key={key}
                  style={{ ...prefRow, borderBottom: key === 'personalization' ? 'none' : prefRow.borderBottom }}
                >
                  <div>
                    <div style={prefLabel}>
                      {label} {key === 'necessary' && <span style={{ color: '#16A34A', fontSize: 11 }}>(Always on)</span>}
                    </div>
                    <div style={prefDesc}>{desc}</div>
                  </div>
                  <div
                    style={toggleTrack(preferences[key])}
                    onClick={() => togglePreference(key)}
                  >
                    <div style={toggleKnob(preferences[key])} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={btnRow}>
            <button style={acceptBtn} onClick={handleAcceptAll}>
              <Shield size={14} /> Accept All
            </button>
            <button style={rejectBtn} onClick={handleRejectAll}>
              Reject All
            </button>
            <button
              style={manageBtn}
              onClick={() => setShowPreferences((v) => !v)}
            >
              <Settings size={14} />
              {showPreferences ? 'Hide Preferences' : 'Manage Preferences'}
            </button>
            {showPreferences && (
              <button style={acceptBtn} onClick={handleSavePreferences}>
                Save Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
