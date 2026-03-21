// =============================================================================
// FINDYOURKINGZERO — UNIFIED APP (Single Entry Point)
// All pages, routing, UI in one file — imports backend from ./unified/core
// =============================================================================

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import {
  AuthProvider, useAuth, useProfile, useProfiles, useUpdateProfile,
  useMessages, useConversations, useEvents, useCreateEvent,
  useNotifications, useFavorites, useBookings, services,
  supabase, auth, db, realtime,
  type UserProfile, type Message, type Conversation, type Event, type Notification, type Booking, type UserTier,
} from './core';

// ── Lazy Pages (code-split for performance) ──────────────────────────────────
const HomePage = lazy(() => import('../pages/HomePage'));
const ConnectPage = lazy(() => import('../pages/ConnectPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE PAGES — Self-contained, no external dependencies beyond core
// ═══════════════════════════════════════════════════════════════════════════════

// ── Auth Pages ────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await auth.signIn(email, password);
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">FindYourKing</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">{error}</div>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-surface-1 border border-border text-foreground" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-surface-1 border border-border text-foreground" required />
          <button type="submit" disabled={loading}
            className="w-full p-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          No account? <Link to="/signup" className="text-primary">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await auth.signUp(email, password, { display_name: name });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">FindYourKing</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">{error}</div>}
          <input type="text" placeholder="Display Name" value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-surface-1 border border-border text-foreground" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-surface-1 border border-border text-foreground" required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-surface-1 border border-border text-foreground" required minLength={6} />
          <button type="submit" disabled={loading}
            className="w-full p-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Have an account? <Link to="/login" className="text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

// ── Explore Page ──────────────────────────────────────────────────────────────
const ExplorePage = () => {
  const { profiles, loading } = useProfiles();
  const { favorites, toggle } = useFavorites();
  const navigate = useNavigate();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/profile/${p.id}`)}>
            <div className="aspect-square bg-surface-2 relative">
              {p.avatar_url ? <img src={p.avatar_url} alt={p.display_name || ''} className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
              {p.is_online && <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate">{p.display_name}, {p.age}</span>
                <button onClick={(e) => { e.stopPropagation(); toggle(p.id); }} className="text-lg">
                  {favorites.includes(p.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">{p.location || 'Somewhere'}</p>
            </div>
          </div>
        ))}
      </div>
      {profiles.length === 0 && <div className="text-center text-muted-foreground mt-20">No profiles found. Check back soon!</div>}
    </div>
  );
};

// ── Profile Page ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { userId } = useParams();
  const { profile, loading } = useProfile(userId);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!profile) return <div className="text-center mt-20 text-muted-foreground">Profile not found</div>;

  const isMe = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="aspect-video bg-surface-2">
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> :
            <div className="w-full h-full flex items-center justify-center text-8xl">👤</div>}
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">←</button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{profile.display_name}{profile.age ? `, ${profile.age}` : ''}</h1>
          {profile.is_verified && <span className="text-blue-500">✓</span>}
          {profile.is_online && <span className="text-xs text-green-500">● Online</span>}
        </div>
        {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
        {profile.location && <p className="text-sm text-muted-foreground">📍 {profile.location}</p>}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(i => <span key={i} className="px-3 py-1 rounded-full bg-surface-2 text-xs">{i}</span>)}
          </div>
        )}
        {!isMe && (
          <div className="flex gap-3 pt-4">
            <button onClick={() => navigate(`/chat/new?user=${profile.id}`)}
              className="flex-1 p-3 rounded-xl bg-primary text-primary-foreground font-semibold">Message</button>
            <button className="p-3 rounded-xl bg-surface-2 border border-border">🤍</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Me Profile Page ───────────────────────────────────────────────────────────
const MePage = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-surface-2 overflow-hidden">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> :
            <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.display_name || 'User'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{profile?.tier || 'free'}</span>
        </div>
      </div>
      <div className="space-y-2">
        {[{ icon: '✏️', label: 'Edit Profile', to: '/profile/me/edit' },
          { icon: '📸', label: 'My Photos', to: '/profile/me/photos' },
          { icon: '⚙️', label: 'Settings', to: '/settings' },
          { icon: '💎', label: 'Subscription', to: '/settings/subscription' },
          { icon: '🛡️', label: 'Safety', to: '/safety' },
          { icon: '✓', label: 'Verification', to: '/verification' },
        ].map(item => (
          <button key={item.to} onClick={() => navigate(item.to)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-1 hover:bg-surface-2 transition-colors text-left">
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            <span className="ml-auto text-muted-foreground">→</span>
          </button>
        ))}
      </div>
      <button onClick={() => { signOut(); navigate('/login'); }}
        className="w-full p-3 rounded-xl bg-destructive/10 text-destructive font-semibold">Sign Out</button>
    </div>
  );
};

// ── Events Page ───────────────────────────────────────────────────────────────
const EventsPage = () => {
  const { events, loading } = useEvents('upcoming');
  const navigate = useNavigate();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button onClick={() => navigate('/events/create')} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">+ Create</button>
      </div>
      <div className="space-y-4">
        {events.map(ev => (
          <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}
            className="bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:border-primary/50">
            {ev.cover_url && <img src={ev.cover_url} alt="" className="w-full h-40 object-cover" />}
            <div className="p-4">
              <h3 className="font-semibold">{ev.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{new Date(ev.starts_at).toLocaleDateString()} • {ev.location || 'TBA'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{ev.type}</span>
                <span className="text-xs text-muted-foreground">{ev.attendee_count} attending</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <div className="text-center text-muted-foreground mt-20">No upcoming events</div>}
    </div>
  );
};

// ── Chat Page ─────────────────────────────────────────────────────────────────
const ChatListPage = () => {
  const { conversations, loading } = useConversations();
  const navigate = useNavigate();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="space-y-2">
        {conversations.map(c => (
          <button key={c.id} onClick={() => navigate(`/chat/${c.id}`)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 text-left">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-xl">💬</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate">Conversation</span>
                {c.unread_count > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{c.unread_count}</span>}
              </div>
              <p className="text-sm text-muted-foreground truncate">{c.last_message || 'No messages yet'}</p>
            </div>
          </button>
        ))}
      </div>
      {conversations.length === 0 && <div className="text-center text-muted-foreground mt-20">No conversations yet. Start exploring!</div>}
    </div>
  );
};

const ChatRoomPage = () => {
  const { conversationId } = useParams();
  const { messages, send, loading } = useMessages(conversationId);
  const [text, setText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await send(text.trim());
    setText('');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <h1 className="font-semibold">Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${m.sender_id === user?.id ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-surface-2 rounded-bl-sm'}`}>
              <p className="text-sm">{m.content}</p>
              <p className="text-xs opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..."
          className="flex-1 p-3 rounded-xl bg-surface-1 border border-border text-foreground" />
        <button type="submit" className="p-3 rounded-xl bg-primary text-primary-foreground font-semibold">Send</button>
      </form>
    </div>
  );
};

// ── Notifications Page ────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm text-primary">Mark all read</button>}
      </div>
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} onClick={() => markAsRead(n.id)}
            className={`p-4 rounded-xl border cursor-pointer ${n.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{n.type === 'match' ? '❤️' : n.type === 'message' ? '💬' : n.type === 'event' ? '📅' : '🔔'}</span>
              <div>
                <p className="font-medium text-sm">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {notifications.length === 0 && <div className="text-center text-muted-foreground mt-20">No notifications</div>}
    </div>
  );
};

// ── Settings Page ─────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { icon: '👤', label: 'Account', to: '/settings/account' },
    { icon: '🔔', label: 'Notifications', to: '/settings/notifications' },
    { icon: '🔒', label: 'Privacy', to: '/settings/privacy' },
    { icon: '🛡️', label: 'Security', to: '/settings/security' },
    { icon: '💳', label: 'Subscription', to: '/settings/subscription' },
    { icon: '📄', label: 'Content', to: '/settings/content' },
    { icon: '❓', label: 'Help & Support', to: '#' },
    { icon: '📜', label: 'Terms of Service', to: '/terms' },
    { icon: '🔐', label: 'Privacy Policy', to: '/privacy' },
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="space-y-2">
        {sections.map(s => (
          <button key={s.label} onClick={() => s.to !== '#' && navigate(s.to)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-1 hover:bg-surface-2 transition-colors text-left">
            <span className="text-xl">{s.icon}</span>
            <span className="font-medium">{s.label}</span>
            <span className="ml-auto text-muted-foreground">→</span>
          </button>
        ))}
      </div>
      <button onClick={() => { signOut(); navigate('/login'); }}
        className="w-full p-3 rounded-xl bg-destructive/10 text-destructive font-semibold">Sign Out</button>
      <p className="text-center text-xs text-muted-foreground">FindYourKing v4.0</p>
    </div>
  );
};

// ── Right Now Page (live nearby) ──────────────────────────────────────────────
const RightNowPage = () => {
  const { profiles, loading } = useProfiles();
  const online = profiles.filter(p => p.is_online);

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-2">Right Now</h1>
      <p className="text-sm text-muted-foreground mb-6">{online.length} people online near you</p>
      {loading ? <div className="flex justify-center mt-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div> :
        <div className="grid grid-cols-2 gap-4">
          {online.map(p => (
            <Link key={p.id} to={`/profile/${p.id}`} className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50">
              <div className="aspect-square bg-surface-2 relative">
                {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-sm font-semibold text-white drop-shadow-lg">{p.display_name}{p.age ? `, ${p.age}` : ''}</p>
                </div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
            </Link>
          ))}
        </div>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: LAYOUT + NAVIGATION + ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

const BottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const tabs = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/explore', icon: '🔍', label: 'Explore' },
    { path: '/right-now', icon: '⚡', label: 'Now' },
    { path: '/events', icon: '📅', label: 'Events' },
    { path: '/chat', icon: '💬', label: 'Chat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-1/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(t => (
          <Link key={t.path} to={t.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${location.pathname === t.path ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
            {t.path === '/chat' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[8px] text-white flex items-center justify-center">{unreadCount}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="pb-20">{children}<BottomNav /></div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: MAIN APP — All routes in one place
// ═══════════════════════════════════════════════════════════════════════════════

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes with bottom nav */}
            <Route path="/" element={<ProtectedRoute><AppShell><HomePage /></AppShell></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><AppShell><ExplorePage /></AppShell></ProtectedRoute>} />
            <Route path="/right-now" element={<ProtectedRoute><AppShell><RightNowPage /></AppShell></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><AppShell><EventsPage /></AppShell></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AppShell><ChatListPage /></AppShell></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppShell><NotificationsPage /></AppShell></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/me" element={<ProtectedRoute><AppShell><MePage /></AppShell></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AppShell><Suspense fallback={<LoadingFallback />}>
              {React.createElement(lazy(() => import('../features/analytics/pages/AnalyticsPage')))}
            </Suspense></AppShell></ProtectedRoute>} />
            <Route path="/connect" element={<ProtectedRoute><AppShell><ConnectPage /></AppShell></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
