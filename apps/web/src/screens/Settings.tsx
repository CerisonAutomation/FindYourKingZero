// ═══════════════════════════════════════════════════════════════
// SCREEN: Settings — Category cards with sub-page navigation
// Main page - category cards - sub-screens via go()
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import {
  ArrowLeft, User, Shield, Lock, Brain, Bell, CreditCard, Eye,
  MapPin, ChevronRight, Download, Globe, HelpCircle, Bug, FileText,
  Star, Trash2, LogOut, Camera, Wifi, Radio, Hexagon, Crown,
} from 'lucide-react';
import { useNavStore, useAuthStore } from '@/store';
import { useAI } from '@/hooks/useAI';
import { haptic } from '@/services/haptics';
import { COLORS } from '@/types';

// ─── Settings Sub-Screen Renderer ───
function SettingsSubScreen({ title, backFn, children }: { title: string; backFn: () => void; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={backFn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{title}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>{children}</div>
    </div>
  );
}

// ─── Toggle Row Component ───
function ToggleRow({ icon, label, sub, value, onToggle }: { icon: React.ReactNode; label: string; sub: string; value: boolean; onToggle: () => void }) {
  return (
    <button onClick={() => { haptic.tap(); onToggle(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.w07}`,
        cursor: 'pointer', width: '100%', textAlign: 'left',
      }}>
      <div style={{ width: 30, height: 30, background: COLORS.w04, border: `1px solid ${COLORS.w07}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: COLORS.w35 }}>{sub}</div>
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11, padding: 2,
        background: value ? COLORS.green : 'rgba(255,255,255,.15)', transition: 'background .2s',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transform: value ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .2s',
        }} />
      </div>
    </button>
  );
}

// ─── Menu Row Component ───
function MenuRow({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={() => { haptic.tap(); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.w07}`,
        cursor: 'pointer', width: '100%', textAlign: 'left',
      }}>
      <div style={{ width: 30, height: 30, background: COLORS.w04, border: `1px solid ${COLORS.w07}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: COLORS.w35 }}>{sub}</div>
      </div>
      <ChevronRight size={16} color={COLORS.w20} />
    </button>
  );
}

// ─── Main Component ───
export default function SettingsScreen() {
  const go = useNavStore((s) => s.go);
  const back = useNavStore((s) => s.back);
  const { user, logout } = useAuthStore();
  const { ready: aiReady, preloadEssential } = useAI();

  const [subPage, setSubPage] = useState<string | null>(null);

  // Toggle states
  const [incognito, setIncognito] = useState(false);
  const [discreet, setDiscreet] = useState(false);
  const [pinLock, setPinLock] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [distanceVisible, setDistanceVisible] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);
  const [pushTaps, setPushTaps] = useState(true);
  const [pushMatches, setPushMatches] = useState(true);
  const [pushEvents, setPushEvents] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [aiModelsLoaded, setAiModelsLoaded] = useState(false);

  const handleLogout = useCallback(async () => {
    haptic.heavy();
    try {
      const { supabase } = await import('@/lib/supabase');
      if (supabase) await supabase.auth.signOut();
    } catch {}
    logout();
    go('landing');
  }, [logout, go]);

  const handlePreloadAI = useCallback(async () => {
    await preloadEssential();
    setAiModelsLoaded(true);
    haptic.success();
  }, [preloadEssential]);

  // ─── Category cards data ───
  const categories = [
    { id: 'account', icon: <User size={20} color={COLORS.blue} />, label: 'Account', sub: 'Profile, photos, verification', color: COLORS.blue },
    { id: 'privacy', icon: <Eye size={20} color={COLORS.purple} />, label: 'Privacy', sub: 'Incognito, PIN, visibility', color: COLORS.purple },
    { id: 'security', icon: <Lock size={20} color={COLORS.green} />, label: 'Security', sub: 'Encryption, 2FA, sessions', color: COLORS.green },
    { id: 'ai', icon: <Brain size={20} color="#7C3AED" />, label: 'AI & P2P', sub: 'On-device models, voice, P2P', color: '#7C3AED' },
    { id: 'notifications', icon: <Bell size={20} color={COLORS.yellow} />, label: 'Notifications', sub: 'Push, sound, vibration', color: COLORS.yellow },
    { id: 'subscription', icon: <CreditCard size={20} color={COLORS.red} />, label: 'Subscription', sub: 'King Pro, boosts, analytics', color: COLORS.red },
    { id: 'discovery', icon: <MapPin size={20} color={COLORS.blue} />, label: 'Discovery', sub: 'Travel mode, radius, sorting', color: COLORS.blue },
    { id: 'data', icon: <Download size={20} color={COLORS.w60} />, label: 'Data & Legal', sub: 'Export, privacy policy, terms', color: COLORS.w60 },
  ];

  // ─── Render sub-pages ───
  if (subPage === 'account') {
    return (
      <SettingsSubScreen title="Account" backFn={() => setSubPage(null)}>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Profile</div>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow icon={<User size={14} color={COLORS.w60} />} label="Edit Profile" sub="Name, bio, photos, stats, tribes" onClick={() => go('edit-profile')} />
          <MenuRow icon={<Camera size={14} color={COLORS.w60} />} label="Photo Albums" sub="Manage private & public albums" onClick={() => go('albums')} />
          <MenuRow icon={<Shield size={14} color={COLORS.w60} />} label="Verification" sub={user?.verified ? 'Verified' : 'Photo ID verify'} onClick={() => {}} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', margin: '16px 0 8px', textTransform: 'uppercase' }}>Connected</div>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow icon={<Globe size={14} color={COLORS.w60} />} label="Connected Accounts" sub="Google, Apple, Facebook" onClick={() => {}} />
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'privacy') {
    return (
      <SettingsSubScreen title="Privacy" backFn={() => setSubPage(null)}>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <ToggleRow icon={<Eye size={14} color={COLORS.w60} />} label="Incognito Mode" sub={incognito ? 'Active — Browse invisible' : 'Browse without being seen'} value={incognito} onToggle={() => setIncognito(!incognito)} />
          <ToggleRow icon={<Eye size={14} color={COLORS.w60} />} label="Discreet Mode" sub={discreet ? 'Active — App icon hidden' : 'Hide app icon & name'} value={discreet} onToggle={() => setDiscreet(!discreet)} />
          <ToggleRow icon={<Lock size={14} color={COLORS.w60} />} label="PIN Lock" sub={pinLock ? 'Active' : 'Require PIN to open'} value={pinLock} onToggle={() => setPinLock(!pinLock)} />
          <ToggleRow icon={<MapPin size={14} color={COLORS.w60} />} label="Show Distance" sub={distanceVisible ? 'Active' : 'Hidden from profile'} value={distanceVisible} onToggle={() => setDistanceVisible(!distanceVisible)} />
          <ToggleRow icon={<Wifi size={14} color={COLORS.w60} />} label="Online Status" sub={onlineStatus ? 'Active' : 'Hidden'} value={onlineStatus} onToggle={() => setOnlineStatus(!onlineStatus)} />
          <ToggleRow icon={<Check size={14} color={COLORS.w60} />} label="Read Receipts" sub={readReceipts ? 'Active — Send read confirmations' : "Don't show when read"} value={readReceipts} onToggle={() => setReadReceipts(!readReceipts)} />
          <ToggleRow icon={<Radio size={14} color={COLORS.w60} />} label="Typing Indicator" sub={typingIndicator ? 'Active — Show when typing' : 'Hidden'} value={typingIndicator} onToggle={() => setTypingIndicator(!typingIndicator)} />
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'security') {
    return (
      <SettingsSubScreen title="Security" backFn={() => setSubPage(null)}>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow icon={<Lock size={14} color={COLORS.green} />} label="E2EE Encryption" sub="Web Crypto API · P-256 · AES-256-GCM" onClick={() => {}} />
          <MenuRow icon={<Shield size={14} color={COLORS.green} />} label="Two-Factor Auth" sub="TOTP or SMS verification" onClick={() => {}} />
          <MenuRow icon={<Wifi size={14} color={COLORS.green} />} label="Active Sessions" sub="Manage logged-in devices" onClick={() => {}} />
          <MenuRow icon={<Key size={14} color={COLORS.green} />} label="Change Password" sub="Update your account password" onClick={() => {}} />
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'ai') {
    return (
      <SettingsSubScreen title="AI & P2P" backFn={() => setSubPage(null)}>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow
            icon={<Brain size={14} color="#7C3AED" />}
            label="AI Models"
            sub={aiReady ? (aiModelsLoaded ? '✅ Toxicity + Sentiment loaded' : 'Click to load') : 'Worker loading…'}
            onClick={handlePreloadAI}
          />
          <MenuRow icon={<Mic size={14} color="#7C3AED" />} label="Voice Commands" sub="Control app with voice" onClick={() => go('voice')} />
          <MenuRow icon={<Hexagon size={14} color="#7C3AED" />} label="P2P Network" sub="Trystero v0.22 · Nostr signaling" onClick={() => {}} />
          <MenuRow icon={<MapPin size={14} color="#7C3AED" />} label="Proximity Engine" sub="H3 hex grid · MapLibre GL" onClick={() => {}} />
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 4 }}>ZERO-API-KEY AI STACK</div>
          <div style={{ fontSize: 11, color: COLORS.w35, lineHeight: 1.6 }}>
            All AI runs on-device via Transformers.js v4 (WebGPU).<br />
            • Smart replies (Phi-3 Mini · 1.2GB · q4)<br />
            • Toxicity detection (toxic-bert · 44MB)<br />
            • Translation (NLLB-200 · 240MB)<br />
            • Embeddings for matching (MiniLM · 22MB)<br />
            • Voice (Whisper · 75MB · SpeechT5 · 150MB)
          </div>
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'notifications') {
    return (
      <SettingsSubScreen title="Notifications" backFn={() => setSubPage(null)}>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Push Notifications</div>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <ToggleRow icon={<MessageSquare size={14} color={COLORS.w60} />} label="Messages" sub={pushMessages ? 'Active' : 'Muted'} value={pushMessages} onToggle={() => setPushMessages(!pushMessages)} />
          <ToggleRow icon={<Heart size={14} color={COLORS.w60} />} label="Taps & Likes" sub={pushTaps ? 'Active' : 'Muted'} value={pushTaps} onToggle={() => setPushTaps(!pushTaps)} />
          <ToggleRow icon={<StarIcon size={14} color={COLORS.w60} />} label="New Matches" sub={pushMatches ? 'Active' : 'Muted'} value={pushMatches} onToggle={() => setPushMatches(!pushMatches)} />
          <ToggleRow icon={<Calendar size={14} color={COLORS.w60} />} label="Events" sub={pushEvents ? 'Active' : 'Muted'} value={pushEvents} onToggle={() => setPushEvents(!pushEvents)} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', margin: '16px 0 8px', textTransform: 'uppercase' }}>Feedback</div>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <ToggleRow icon={<Volume2 size={14} color={COLORS.w60} />} label="Sound" sub={sound ? 'Active' : 'Silent'} value={sound} onToggle={() => setSound(!sound)} />
          <ToggleRow icon={<Vibrate size={14} color={COLORS.w60} />} label="Vibration" sub={vibration ? 'Active' : 'Off'} value={vibration} onToggle={() => setVibration(!vibration)} />
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'subscription') {
    return (
      <SettingsSubScreen title="Subscription" backFn={() => setSubPage(null)}>
        <div style={{
          padding: '20px', background: 'linear-gradient(135deg, rgba(229,25,46,.12), rgba(217,119,6,.08))',
          border: '1px solid rgba(229,25,46,.2)', marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}><Crown size={32} color={COLORS.yellow} /></div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>King Pro</div>
          <div style={{ fontSize: 12, color: COLORS.w60, marginBottom: 12 }}>Unlock the full kingdom experience</div>
          <button style={{
            padding: '12px 32px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            Upgrade Now — $9.99/mo
          </button>
        </div>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow icon={<Rocket size={14} color={COLORS.yellow} />} label="Profile Boost" sub="Get 10x more views" onClick={() => {}} />
          <MenuRow icon={<Eye size={14} color={COLORS.yellow} />} label="Who Viewed You" sub="See your profile visitors" onClick={() => {}} />
          <MenuRow icon={<StarIcon size={14} color={COLORS.yellow} />} label="Super Likes" sub="Stand out from the crowd" onClick={() => {}} />
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'discovery') {
    return (
      <SettingsSubScreen title="Discovery" backFn={() => setSubPage(null)}>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow icon={<MapPin size={14} color={COLORS.blue} />} label="Travel Mode" sub="Browse another city" onClick={() => go('travel-mode')} />
          <MenuRow icon={<Search size={14} color={COLORS.blue} />} label="Search Radius" sub="Default distance filter" onClick={() => {}} />
          <MenuRow icon={<Grid size={14} color={COLORS.blue} />} label="Default View" sub="Grid / Swipe / List" onClick={() => {}} />
          <MenuRow icon={<BarChart size={14} color={COLORS.blue} />} label="Sort Preference" sub="Distance / Recent / Compatibility" onClick={() => {}} />
        </div>
      </SettingsSubScreen>
    );
  }

  if (subPage === 'data') {
    return (
      <SettingsSubScreen title="Data & Legal" backFn={() => setSubPage(null)}>
        <div style={{ border: `1px solid ${COLORS.w07}` }}>
          <MenuRow icon={<Download size={14} color={COLORS.w60} />} label="Export My Data" sub="Download all your data (GDPR)" onClick={() => go('gdpr')} />
          <MenuRow icon={<FileText size={14} color={COLORS.w60} />} label="Privacy Policy" sub="Read our privacy policy" onClick={() => go('privacy-policy')} />
          <MenuRow icon={<FileText size={14} color={COLORS.w60} />} label="Terms of Service" sub="Read our terms" onClick={() => go('terms-of-service')} />
          <MenuRow icon={<Globe size={14} color={COLORS.w60} />} label="Language" sub="Change app language" onClick={() => {}} />
          <MenuRow icon={<BarChart size={14} color={COLORS.w60} />} label="My Analytics" sub="View your profile stats" onClick={() => go('analytics')} />
        </div>
      </SettingsSubScreen>
    );
  }

  // ─── Main Settings Page ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,rgba(37,99,235,.5),transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Settings</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {/* User card */}
        {user && (
          <div style={{
            padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
          }}>
            <div style={{ width: 52, height: 52, border: `2px solid ${COLORS.red}`, overflow: 'hidden', boxShadow: '0 0 14px rgba(229,25,46,.35)' }}>
              <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
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

        {/* Category cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { haptic.tap(); setSubPage(cat.id); }}
              style={{
                padding: '16px 14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s',
              }}>
              <div style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${cat.color}12`, border: `1px solid ${cat.color}30`, marginBottom: 10,
              }}>
                {cat.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: COLORS.w35 }}>{cat.sub}</div>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Quick Actions</div>
        <div style={{ border: `1px solid ${COLORS.w07}`, marginBottom: 16 }}>
          <MenuRow icon={<Shield size={14} color={COLORS.red} />} label="Safety Center" sub="Blocked users, reports, tips" onClick={() => go('safety')} />
          <MenuRow icon={<Shield size={14} color={COLORS.red} />} label="Admin Dashboard" sub="Moderation & analytics" onClick={() => go('admin')} />
          <MenuRow icon={<HelpCircle size={14} color={COLORS.w60} />} label="Help Center" sub="FAQs and guides" onClick={() => {}} />
          <MenuRow icon={<Bug size={14} color={COLORS.w60} />} label="Report a Bug" sub="Something broken?" onClick={() => {}} />
          <MenuRow icon={<StarIcon size={14} color={COLORS.w60} />} label="Rate the App" sub="Leave a review" onClick={() => {}} />
        </div>

        {/* Danger zone */}
        <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>Danger Zone</div>
        <button onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px', background: 'transparent', border: `1px solid ${COLORS.w07}`,
            color: COLORS.w35, fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', marginBottom: 8,
          }}>
          <LogOut size={14} /> Sign Out
        </button>
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
            color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
          }}>
          <Trash2 size={14} /> Delete Account
        </button>

        <div style={{ textAlign: 'center', padding: '16px 14px 24px', color: COLORS.w35, fontSize: 10 }}>
          v4.0 · Transformers.js v4 (WebGPU) · Trystero P2P · H3 · MapLibre · Web Crypto · 18+ Only · GDPR
        </div>
      </div>
    </div>
  );
}

// Missing imports for sub-pages - aliased to avoid conflicts
function Check(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function MessageSquare(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function Heart(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function StarIcon(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function Calendar(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function Volume2(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
}
function Vibrate(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function Rocket(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
}
function Search(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function Grid(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function BarChart(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
}
function Key(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
}
function Mic(props: any) {
  return <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
}
