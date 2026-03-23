// ═══════════════════════════════════════════════════════════════
// SCREEN: Settings — Full config with AI model management
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useNavStore, useAuthStore } from '@/store';
import { useAI } from '@/hooks/useAI';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS } from '@/types';

export default function SettingsScreen() {
  const go = useNavStore((s) => s.go);
  const { user, logout } = useAuthStore();
  const { ready: aiReady, loading: aiLoading, preloadEssential, unload } = useAI();
  const [aiModelsLoaded, setAiModelsLoaded] = useState(false);

  const handleLogout = async () => {
    await logout();
    go('landing');
  };

  const handlePreloadAI = async () => {
    await preloadEssential();
    setAiModelsLoaded(true);
  };

  const sections = [
    {
      label: 'ACCOUNT',
      items: [
        { icon: '👤', label: 'Edit Profile', sub: 'Name, bio, photos, stats', action: () => go('edit-profile') },
        { icon: '🛡️', label: 'Privacy & Visibility', sub: 'Incognito, distance, last seen', action: () => {} },
        { icon: '🔔', label: 'Notifications', sub: 'Push, quiet hours', action: () => {} },
      ],
    },
    {
      label: 'SUBSCRIPTION',
      items: [
        { icon: '👑', label: 'King Pro', sub: 'Manage plan & billing', action: () => go('subscription') },
      ],
    },
    {
      label: 'SAFETY',
      items: [
        { icon: '🚫', label: 'Blocked Users', sub: 'Manage blocked', action: () => {} },
        { icon: '✓', label: 'Verification', sub: 'Photo ID verify', action: () => {} },
        { icon: '🚩', label: 'Report History', sub: 'View past reports', action: () => {} },
      ],
    },
    {
      label: 'AI & P2P (ON-DEVICE)',
      items: [
        {
          icon: '🧠',
          label: 'AI Models',
          sub: aiReady ? (aiModelsLoaded ? '✅ Toxicity + Sentiment loaded' : 'Click to load') : 'Worker loading…',
          action: handlePreloadAI,
        },
        {
          icon: '🔒',
          label: 'E2EE Encryption',
          sub: 'Web Crypto API · P-256 · AES-256-GCM',
          action: () => {},
        },
        {
          icon: '📡',
          label: 'P2P Network',
          sub: 'Trystero v0.22 · Nostr signaling',
          action: () => {},
        },
        {
          icon: '🗺️',
          label: 'Proximity Engine',
          sub: 'H3 hex grid · MapLibre GL · 0 API keys',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Settings" onBack={() => go('profile')} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* User card */}
        {user && (
          <div style={{
            margin: '12px 14px 4px', padding: '13px 14px',
            background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Avatar src={user.avatar} size={52} online ring />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: COLORS.w35 }}>{user.id.slice(0, 16)}…</div>
            </div>
            {user.premium && (
              <div style={{ padding: '3px 9px', background: 'rgba(217,119,6,.12)', border: '1px solid rgba(217,119,6,.35)' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.yellow }}>PRO</span>
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        {sections.map((sec) => (
          <div key={sec.label} style={{ margin: '12px 0 0' }}>
            <div style={{ padding: '3px 14px 6px', fontSize: 8.5, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {sec.label}
            </div>
            <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
              {sec.items.map((item, i) => (
                <button key={item.label} onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: 'transparent', border: 'none',
                    borderBottom: i < sec.items.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                  <div style={{ width: 30, height: 30, background: COLORS.w04, border: `1px solid ${COLORS.w07}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: COLORS.w35 }}>{item.sub}</div>
                  </div>
                  <span style={{ color: COLORS.w12 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Free AI models note */}
        <div style={{ margin: '16px 12px', padding: '12px 14px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.purple, marginBottom: 4 }}>🧠 ZERO-API-KEY AI STACK</div>
          <div style={{ fontSize: 11, color: COLORS.w35, lineHeight: 1.6 }}>
            All AI runs on-device via Transformers.js v4 (WebGPU).<br />
            • Smart replies (Phi-3 Mini · 1.2GB · q4)<br />
            • Toxicity detection (toxic-bert · 44MB)<br />
            • Translation (NLLB-200 · 240MB)<br />
            • Sentiment analysis (DistilBERT · 68MB)<br />
            • Embeddings for matching (MiniLM · 22MB)<br />
            • Voice (Whisper · 75MB · SpeechT5 · 150MB)<br />
            Models cached after first download. Full offline.
          </div>
        </div>

        {/* Sign out */}
        <div style={{ margin: '16px 12px' }}>
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 24px', background: 'transparent', border: `1px solid ${COLORS.w07}`,
              color: COLORS.w35, fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
            }}>
            Sign Out
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '8px 14px 24px', color: COLORS.w35, fontSize: 10 }}>
          v4.0 · Transformers.js v4 (WebGPU) · Trystero P2P · H3 · MapLibre · Web Crypto · 18+ Only
        </div>
      </div>
    </div>
  );
}
