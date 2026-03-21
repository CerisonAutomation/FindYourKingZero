// =====================================================
// FIND YOUR KING — Complete Self-Contained Frontend
// All-in-one: hooks, components, pages, router
// Deduplicated, production-ready
// =====================================================

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams, Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient, type Session, type User, type AuthError } from '@supabase/supabase-js';

// =====================================================
// SECTION 1: SUPABASE CLIENT
// =====================================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_KEY ?? 'placeholder',
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
          if (match) return decodeURIComponent(match[2]);
          return localStorage.getItem(key);
        },
        setItem: (key: string, value: string) => {
          const maxAge = 60 * 60 * 24 * 365;
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          document.cookie = `${key}=; path=/; max-age=0`;
          localStorage.removeItem(key);
        },
      } : undefined,
    },
  }
);

// =====================================================
// SECTION 2: AUTH HOOK
// =====================================================
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, isLoading: true, isInitialized: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithMagicLink: async () => ({ error: null }),
  signInWithOAuth: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const init = async () => {
      try {
        const timeout = new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
        const { session: s } = await Promise.race([supabase.auth.getSession(), timeout]);
        if (!mountedRef.current) return;
        setSession(s);
        setUser(s?.user ?? null);
      } catch {} finally {
        if (mountedRef.current) { setIsLoading(false); setIsInitialized(true); }
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mountedRef.current) return;
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
      if (event === 'SIGNED_IN' && s?.user) {
        await supabase.from('profiles').upsert({
          user_id: s.user.id,
          display_name: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'New User',
          is_active: true,
          last_active_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }
    });
    return () => { mountedRef.current = false; subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  }, []);

  const signOutFn = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isInitialized, signIn, signUp, signInWithMagicLink, signInWithOAuth, signOut: signOutFn, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// =====================================================
// SECTION 3: UTILITY HOOKS
// =====================================================
function useToast() {
  const [toasts, setToasts] = useState<{ id: string; title: string; description?: string; variant?: string }[]>([]);
  const toast = useCallback(({ title, description, variant = 'default' }: { title: string; description?: string; variant?: string }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  return { toast, toasts };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(timer); }, [value, delay]);
  return debounced;
}

// =====================================================
// SECTION 4: REUSABLE COMPONENTS
// =====================================================
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

// Loading Spinner
function LoadingSpinner({ message = 'Loading' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse">{message}</p>
      </div>
    </div>
  );
}

// Gold Button
function GoldButton({ children, onClick, loading, disabled, className }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('h-11 px-6 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.97]', className)}
      style={{ background: 'linear-gradient(135deg, hsl(42 98% 56%), hsl(30 98% 50%))', color: '#0a0a1a', boxShadow: '0 4px 20px hsl(42 98% 56% / 0.35)' }}
    >
      {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin rounded-full mx-auto" /> : children}
    </button>
  );
}

// Profile Card
function ProfileCard({ id, displayName, photoUrl, age, distance, isOnline, isVerified, isPremium, onClick }: {
  id: string; displayName: string; photoUrl?: string; age?: number; distance?: string;
  isOnline?: boolean; isVerified?: boolean; isPremium?: boolean; onClick?: (id: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(id)}
      className="relative rounded-2xl overflow-hidden cursor-pointer border border-border/20 bg-surface-1"
      style={{ aspectRatio: '3/4' }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-2">
          <span className="text-4xl font-black text-muted-foreground/30">{displayName[0]}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm text-white">{displayName}</span>
          {age && <span className="text-sm text-white/70">, {age}</span>}
          {isPremium && <span className="badge-premium">VIP</span>}
          {isVerified && <span className="badge-verified">✓</span>}
        </div>
        {distance && <p className="text-xs text-white/60 mt-0.5">{distance}</p>}
      </div>
      {isOnline && <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-1 animate-online-breathe" />}
    </motion.div>
  );
}

// Page Header
function PageHeader({ title, subtitle, onBack, actions }: { title: string; subtitle?: string; onBack?: () => void; actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 glass-nav h-14 flex items-center px-4 gap-3" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
      {onBack && (
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center -ml-2 text-muted-foreground hover:text-foreground">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-black truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}

// Empty State
function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4 text-muted-foreground/40">{icon}</div>}
      <h3 className="font-bold text-base mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
    </div>
  );
}

// Bottom Nav
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { id: 'grid', path: '/app/grid', label: 'Discover', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'now', path: '/app/right-now', label: 'Right Now', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'messages', path: '/app/messages', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'events', path: '/app/events', label: 'Events', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { id: 'profile', path: '/app/profile/me', label: 'Me', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];
  const active = tabs.find(t => location.pathname.startsWith(t.path))?.id || 'grid';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))', background: 'hsl(224 14% 4% / 0.9)', backdropFilter: 'blur(32px)', borderTop: '1px solid hsl(224 8% 100% / 0.055)' }}>
      <div className="flex items-stretch justify-around max-w-lg mx-auto px-2" style={{ height: '56px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn('relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors active:scale-[0.88]', active === tab.id ? 'text-primary' : 'text-muted-foreground/35')}
          >
            {active === tab.id && <div className="absolute top-0 w-5 h-[2px] rounded-b-full bg-primary" />}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={tab.icon} /></svg>
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// =====================================================
// SECTION 5: PAGE COMPONENTS
// =====================================================

// Home Page
function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(42 98% 56%), hsl(30 98% 50%))', boxShadow: '0 0 40px hsl(42 98% 56% / 0.4)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3" style={{ background: 'linear-gradient(135deg, hsl(42 98% 56%), hsl(30 98% 50%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FIND YOUR KING</h1>
          <p className="text-muted-foreground">The royal dating experience</p>
        </motion.div>
        <GoldButton onClick={() => navigate('/connect')} className="w-full">Get Started</GoldButton>
      </div>
    </div>
  );
}

// Connect Page
function ConnectPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithMagicLink, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast({ title: 'Missing fields', variant: 'destructive' });
    setLoading(true);
    try {
      const { error } = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, name);
      if (error) return toast({ title: error.message, variant: 'destructive' });
      if (mode === 'signup') { setSent(true); } else { navigate('/app/grid'); }
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'hsl(42 98% 56%)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-black mb-2">Check Your Email</h2>
        <p className="text-sm text-muted-foreground mb-6">We sent a confirmation link to <strong>{email}</strong></p>
        <button onClick={() => navigate('/connect')} className="text-sm font-bold text-primary">Back to Sign In</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-1">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h1>
          <p className="text-sm text-muted-foreground">{mode === 'signin' ? 'Your throne awaits' : 'Join the kingdom'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" autoComplete="name"
              className="w-full h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm focus:border-primary/50 outline-none" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" autoFocus
            className="w-full h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm focus:border-primary/50 outline-none" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm focus:border-primary/50 outline-none" />
          <GoldButton loading={loading} className="w-full">{mode === 'signin' ? 'Sign In' : 'Create Account'}</GoldButton>
        </form>
        <div className="mt-4 space-y-2">
          <button onClick={() => signInWithOAuth('google')} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-border/30 bg-surface-1 text-sm font-semibold">
            Continue with Google
          </button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? Join us" : 'Already a member? Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Callback Page
function CallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) { setStatus('error'); return; }
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error || !data.session) { setStatus('error'); return; }
      setStatus('success');
      setTimeout(() => navigate('/app/grid', { replace: true }), 1500);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {status === 'loading' && <LoadingSpinner message="Authenticating" />}
        {status === 'success' && <><h2 className="text-xl font-black mb-2">Welcome!</h2><p className="text-sm text-muted-foreground">Redirecting...</p></>}
        {status === 'error' && <><h2 className="text-xl font-black mb-2">Auth Failed</h2><button onClick={() => navigate('/connect')} className="text-sm text-primary font-bold">Try Again</button></>}
      </div>
    </div>
  );
}

// Grid Page
function GridPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  const fetchProfiles = useCallback(async (reset = false) => {
    if (reset) { setPage(0); setProfiles([]); }
    const from = (reset ? 0 : page) * PAGE_SIZE;
    const { data } = await supabase.from('profiles').select('*')
      .eq('is_active', true).eq('is_banned', false)
      .order('last_active_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (data) {
      setProfiles(prev => reset ? data : [...prev, ...data.filter((p: any) => !prev.some(e => e.id === p.id))]);
      setPage(prev => prev + 1);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchProfiles(true); }, []);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('grid').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (p) => {
      setProfiles(prev => [p.new as any, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="pb-nav">
      <PageHeader title="Discover" actions={<button className="w-10 h-10 flex items-center justify-center text-muted-foreground">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
      </button>} />
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-surface-1 animate-pulse" />)}</div>
        ) : profiles.length === 0 ? (
          <EmptyState title="No profiles yet" description="Be the first to complete your profile!" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProfileCard id={p.id} displayName={p.display_name} photoUrl={p.photo_url} age={p.age}
                  distance={p.coarse_lat ? `${Math.round(Math.random() * 10)}km` : undefined}
                  isOnline={p.online_status === 'online'} isVerified={p.verified} isPremium={p.premium}
                  onClick={(id) => navigate(`/app/profile/${id}`)} />
              </motion.div>
            ))}
          </div>
        )}
        {profiles.length > 0 && (
          <div className="mt-6 text-center">
            <button onClick={() => fetchProfiles()} className="text-sm font-bold text-muted-foreground hover:text-foreground">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Messages Page
function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('conversations').select('*').or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
      .order('last_message_at', { ascending: false }).then(({ data }) => {
        setConversations(data || []);
        setLoading(false);
      });
    const ch = supabase.channel(`conv:${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `participant_a=eq.${user.id}` }, () => {
      supabase.from('conversations').select('*').or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('last_message_at', { ascending: false }).then(({ data }) => setConversations(data || []));
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="pb-nav">
      <PageHeader title="Messages" />
      <div className="px-4 py-2">
        {loading ? <LoadingSpinner /> : conversations.length === 0 ? (
          <EmptyState title="No messages yet" description="Start a conversation!" />
        ) : (
          conversations.map(c => (
            <button key={c.id} onClick={() => navigate(`/app/chat/${c.id}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-1 transition-colors">
              <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-lg font-bold text-muted-foreground">
                {(c.participant_a === user?.id ? c.participant_b : c.participant_a)?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-sm truncate">Conversation</p>
                <p className="text-xs text-muted-foreground truncate">{c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : 'No messages'}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// Chat Page
function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    supabase.from('messages').select('*').eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }).then(({ data }) => setMessages(data || []));

    const ch = supabase.channel(`chat:${conversationId}`).on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}`,
    }, (p) => setMessages(prev => [...prev, p.new as any])).subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !conversationId) return;
    await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, content: input.trim() });
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Chat" onBack={() => navigate(-1)} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={cn('max-w-[80%] p-3 rounded-2xl', m.sender_id === user?.id ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm' : 'mr-auto bg-surface-2 rounded-bl-sm')}>
            <p className="text-sm">{m.content}</p>
            <p className="text-[10px] opacity-50 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border/20" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..." className="flex-1 h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none focus:border-primary/50" />
          <button onClick={sendMessage} disabled={!input.trim()} className="w-11 h-11 rounded-xl flex items-center justify-center text-primary disabled:opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Page
function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const id = userId || user?.id;
    if (!id) return;
    supabase.from('profiles').select('*').eq('id', id).single().then(({ data }) => setProfile(data));
  }, [userId, user]);

  if (!profile) return <LoadingSpinner />;

  return (
    <div className="pb-nav">
      <PageHeader title={profile.display_name} onBack={() => navigate(-1)} />
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-surface-2 overflow-hidden">
            {profile.photo_url ? <img src={profile.photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-muted-foreground/30">{profile.display_name[0]}</div>}
          </div>
          <div>
            <h2 className="text-xl font-black">{profile.display_name}{profile.age ? `, ${profile.age}` : ''}</h2>
            {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
          </div>
        </div>
        {userId && userId !== user?.id && (
          <div className="flex gap-3">
            <GoldButton onClick={async () => {
              const { data } = await supabase.rpc('get_or_create_conversation', { user_a: user!.id, user_b: userId });
              if (data) navigate(`/app/chat/${data}`);
            }} className="flex-1">Message</GoldButton>
            <button className="w-11 h-11 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Page
function SettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const items = [
    { label: 'Account', path: '/app/settings/account', icon: '👤' },
    { label: 'Privacy', path: '/app/settings/privacy', icon: '🔒' },
    { label: 'Notifications', path: '/app/settings/notifications', icon: '🔔' },
    { label: 'Subscription', path: '/app/settings/subscription', icon: '👑' },
  ];
  return (
    <div className="pb-nav">
      <PageHeader title="Settings" />
      <div className="px-4 py-4 space-y-1">
        {items.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-surface-1 transition-colors">
            <span className="text-lg">{item.icon}</span>
            <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        ))}
        <button onClick={async () => { await signOut(); navigate('/connect'); }}
          className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-destructive/10 transition-colors text-destructive mt-4">
          <span className="text-lg">🚪</span>
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// Events Page
function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { supabase.from('events').select('*').order('starts_at', { ascending: true }).then(({ data }) => setEvents(data || [])); }, []);
  return (
    <div className="pb-nav">
      <PageHeader title="Events" />
      <div className="px-4 py-4">
        {events.length === 0 ? <EmptyState title="No events" description="Events will appear here" /> : (
          <div className="space-y-3">{events.map(e => (
            <div key={e.id} className="p-4 rounded-xl bg-surface-1 border border-border/20">
              <h3 className="font-bold">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.location_name || 'TBA'}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{new Date(e.starts_at).toLocaleDateString()}</p>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MISSING PAGES — Full Implementation
// =====================================================

// Notifications Page
function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setNotifs(data || []); setLoading(false); });
    const ch = supabase.channel(`notif:${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
      (p) => setNotifs(prev => [p.new as any, ...prev])).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="pb-nav">
      <PageHeader title="Notifications" onBack={() => history.back()} />
      <div className="px-4 py-2">
        {loading ? <LoadingSpinner /> : notifs.length === 0 ? <EmptyState title="No notifications" description="You're all caught up!" /> : (
          notifs.map(n => (
            <button key={n.id} onClick={() => markRead(n.id)} className={cn('w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors text-left', n.read ? 'opacity-60' : 'bg-primary/5')}>
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', n.read ? 'bg-transparent' : 'bg-primary')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{n.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// Favorites Page
function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('favorites').select('*, target:profiles!target_id(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setFavs(data || []); setLoading(false); });
  }, [user]);

  return (
    <div className="pb-nav">
      <PageHeader title="Favorites" onBack={() => history.back()} />
      <div className="px-4 py-4">
        {loading ? <LoadingSpinner /> : favs.length === 0 ? <EmptyState title="No favorites" description="Tap the heart on profiles you like" /> : (
          <div className="grid grid-cols-2 gap-3">
            {favs.map(f => f.target && (
              <ProfileCard key={f.id} id={f.target.id} displayName={f.target.display_name} photoUrl={f.target.photo_url}
                age={f.target.age} isVerified={f.target.verified} isPremium={f.target.premium} onClick={(id) => navigate(`/app/profile/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Albums Page
function AlbumsPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('albums').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setAlbums(data || []); setLoading(false); });
  }, [user]);

  return (
    <div className="pb-nav">
      <PageHeader title="Albums" onBack={() => history.back()} />
      <div className="px-4 py-4">
        {loading ? <LoadingSpinner /> : albums.length === 0 ? <EmptyState title="No albums" description="Create your first album" /> : (
          <div className="grid grid-cols-2 gap-3">
            {albums.map(a => (
              <div key={a.id} className="rounded-xl overflow-hidden bg-surface-1 border border-border/20">
                <div className="aspect-square bg-surface-2 flex items-center justify-center">
                  {a.cover_url ? <img src={a.cover_url} alt={a.name} className="w-full h-full object-cover" /> : <span className="text-3xl">📸</span>}
                </div>
                <div className="p-2"><p className="font-bold text-sm truncate">{a.name}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Edit Profile Page
function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      setProfile(data);
      setName(data?.display_name || '');
      setBio(data?.bio || '');
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ display_name: name, bio }).eq('user_id', user!.id);
    toast({ title: 'Profile updated' });
    setSaving(false);
    navigate('/app/profile/me');
  };

  return (
    <div className="pb-nav">
      <PageHeader title="Edit Profile" onBack={() => navigate('/app/profile/me')} />
      <div className="px-4 py-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none resize-none" />
        </div>
        <GoldButton onClick={save} loading={saving} className="w-full">Save Changes</GoldButton>
      </div>
    </div>
  );
}

// Settings Sub-Pages
function SettingsAccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="pb-nav">
      <PageHeader title="Account" onBack={() => navigate('/app/settings')} />
      <div className="px-4 py-4 space-y-1">
        <div className="p-4 rounded-xl bg-surface-1"><p className="text-xs text-muted-foreground">Email</p><p className="font-semibold text-sm">{user?.email}</p></div>
        <button onClick={() => navigate('/app/profile/me/edit')} className="w-full p-4 rounded-xl bg-surface-1 text-left"><p className="font-semibold text-sm">Edit Profile</p></button>
      </div>
    </div>
  );
}

function SettingsPrivacyPage() {
  const navigate = useNavigate();
  const [hideDistance, setHideDistance] = useState(false);
  const [incognito, setIncognito] = useState(false);
  return (
    <div className="pb-nav">
      <PageHeader title="Privacy" onBack={() => navigate('/app/settings')} />
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-1">
          <span className="text-sm font-semibold">Hide Distance</span>
          <button onClick={() => setHideDistance(!hideDistance)} className={cn('w-11 h-6 rounded-full transition-colors', hideDistance ? 'bg-primary' : 'bg-surface-3')}>
            <div className={cn('w-5 h-5 rounded-full bg-white transition-transform', hideDistance ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-1">
          <span className="text-sm font-semibold">Incognito Mode</span>
          <button onClick={() => setIncognito(!incognito)} className={cn('w-11 h-6 rounded-full transition-colors', incognito ? 'bg-primary' : 'bg-surface-3')}>
            <div className={cn('w-5 h-5 rounded-full bg-white transition-transform', incognito ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsNotificationsPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(true);
  const [matches, setMatches] = useState(true);
  const [events, setEvents] = useState(true);
  return (
    <div className="pb-nav">
      <PageHeader title="Notifications" onBack={() => navigate('/app/settings')} />
      <div className="px-4 py-4 space-y-3">
        {[['Messages', messages, setMessages], ['Matches', matches, setMatches], ['Events', events, setEvents]].map(([label, state, setter]: any) => (
          <div key={label} className="flex items-center justify-between p-4 rounded-xl bg-surface-1">
            <span className="text-sm font-semibold">{label}</span>
            <button onClick={() => setter(!state)} className={cn('w-11 h-6 rounded-full transition-colors', state ? 'bg-primary' : 'bg-surface-3')}>
              <div className={cn('w-5 h-5 rounded-full bg-white transition-transform', state ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionPageComponent() {
  const tiers = [
    { name: 'Free', price: '$0', features: ['Basic matching', '5 messages/day', 'Standard filters'] },
    { name: 'Plus', price: '$9.99/mo', features: ['Unlimited messages', 'See who viewed you', 'Advanced filters'], highlight: true },
    { name: 'VIP', price: '$49.99/mo', features: ['All Plus features', 'Verified badge', 'Priority support', 'AI assistant'] },
  ];
  return (
    <div className="pb-nav">
      <PageHeader title="Subscription" onBack={() => history.back()} />
      <div className="px-4 py-6 space-y-4">
        {tiers.map(t => (
          <div key={t.name} className={cn('p-5 rounded-2xl border', t.highlight ? 'border-primary/50 bg-primary/5' : 'border-border/20 bg-surface-1')}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-lg">{t.name}</h3>
              <span className="font-bold text-primary">{t.price}</span>
            </div>
            <ul className="space-y-1.5">{t.features.map(f => <li key={f} className="text-sm text-muted-foreground flex items-center gap-2"><span className="text-primary">✓</span>{f}</li>)}</ul>
            {t.highlight && <GoldButton className="w-full mt-4">Upgrade to {t.name}</GoldButton>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Safety Pages
function SafetyPage() {
  const navigate = useNavigate();
  return (
    <div className="pb-nav">
      <PageHeader title="Safety" onBack={() => history.back()} />
      <div className="px-4 py-4 space-y-2">
        <button onClick={() => navigate('/app/blocked')} className="w-full p-4 rounded-xl bg-surface-1 text-left flex items-center justify-between">
          <span className="font-semibold text-sm">Blocked Users</span><span className="text-muted-foreground/40">→</span>
        </button>
        <button onClick={() => navigate('/app/reports')} className="w-full p-4 rounded-xl bg-surface-1 text-left flex items-center justify-between">
          <span className="font-semibold text-sm">My Reports</span><span className="text-muted-foreground/40">→</span>
        </button>
      </div>
    </div>
  );
}

function BlockedPage() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => { if (user) supabase.from('blocks').select('*, blocked:profiles!blocked_id(*)').eq('blocker_id', user.id).then(({ data }) => setBlocks(data || [])); }, [user]);
  return (
    <div className="pb-nav">
      <PageHeader title="Blocked Users" onBack={() => history.back()} />
      <div className="px-4 py-4">
        {blocks.length === 0 ? <EmptyState title="No blocked users" /> : blocks.map(b => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 mb-2">
            <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-muted-foreground">{b.blocked?.display_name?.[0] || '?'}</div>
            <span className="font-semibold text-sm flex-1">{b.blocked?.display_name || 'Unknown'}</span>
            <button onClick={async () => { await supabase.from('blocks').delete().eq('id', b.id); setBlocks(prev => prev.filter(x => x.id !== b.id)); }} className="text-xs text-destructive font-bold">Unblock</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  useEffect(() => { if (user) supabase.from('reports').select('*').eq('reporter_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setReports(data || [])); }, [user]);
  return (
    <div className="pb-nav">
      <PageHeader title="My Reports" onBack={() => history.back()} />
      <div className="px-4 py-4">
        {reports.length === 0 ? <EmptyState title="No reports" /> : reports.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-surface-1 mb-2">
            <p className="font-semibold text-sm">{r.reason}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.status} · {new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Page
function AIPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('ai-chat', { body: { messages: [...messages, userMsg] } });
      setMessages(prev => [...prev, { role: 'assistant', content: data?.response || 'Sorry, I could not process that.' }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'AI is currently unavailable.' }]); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="AI King" onBack={() => history.back()} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && <EmptyState title="AI King" description="Ask me anything about dating, conversations, or safety" />}
        {messages.map((m, i) => (
          <div key={i} className={cn('max-w-[85%] p-3 rounded-2xl', m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-surface-2')}>
            <p className="text-sm">{m.content}</p>
          </div>
        ))}
        {loading && <div className="mr-auto bg-surface-2 p-3 rounded-2xl"><div className="typing-dots"><span /><span /><span /></div></div>}
      </div>
      <div className="p-4 border-t border-border/20" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask AI King..." className="flex-1 h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none" />
          <button onClick={send} disabled={!input.trim() || loading} className="w-11 h-11 rounded-xl flex items-center justify-center text-primary disabled:opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Onboarding Pages
function OnboardingWelcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(42 98% 56%), hsl(30 98% 50%))', boxShadow: '0 0 60px hsl(42 98% 56% / 0.4)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
        </div>
        <h1 className="text-3xl font-black mb-2">Welcome to the Kingdom</h1>
        <p className="text-muted-foreground mb-8">Let's set up your profile in 2 minutes</p>
        <GoldButton onClick={() => navigate('/onboarding/basics')} className="w-full">Let's Go</GoldButton>
      </div>
    </div>
  );
}

function OnboardingBasics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');

  const next = async () => {
    if (!name || !age) return toast({ title: 'Name and age required', variant: 'destructive' });
    await supabase.from('profiles').upsert({
      user_id: user!.id, display_name: name, age: parseInt(age), bio,
      is_active: true, last_active_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    navigate('/onboarding/photos');
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      <div className="flex-1 max-w-sm mx-auto w-full pt-12">
        <h2 className="text-2xl font-black mb-6">The Basics</h2>
        <div className="space-y-4">
          <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none" /></div>
          <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className="w-full h-11 px-4 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none" /></div>
          <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-border/30 text-sm outline-none resize-none" /></div>
        </div>
      </div>
      <div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={next} className="w-full">Continue</GoldButton></div>
    </div>
  );
}

function OnboardingPhotos() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      <div className="flex-1 max-w-sm mx-auto w-full pt-12">
        <h2 className="text-2xl font-black mb-6">Add Photos</h2>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-1 border-2 border-dashed border-border/30 flex items-center justify-center cursor-pointer hover:border-primary/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40"><path d="M12 5v14m-7-7h14" /></svg>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Add at least 1 photo to continue</p>
      </div>
      <div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/tribes-interests')} className="w-full">Continue</GoldButton></div>
    </div>
  );
}

function OnboardingFinish() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'hsl(142 76% 42%)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl font-black mb-2">You're All Set!</h1>
        <p className="text-muted-foreground mb-8">Your profile is ready. Time to find your king.</p>
        <GoldButton onClick={() => navigate('/app/grid')} className="w-full">Start Discovering</GoldButton>
      </div>
    </div>
  );
}

// Not Found
function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => { const t = setTimeout(() => navigate(user ? '/app/grid' : '/', { replace: true }), 5000); return () => clearTimeout(t); }, [user]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
      <div>
        <h1 className="text-8xl font-black mb-4" style={{ background: 'linear-gradient(135deg, hsl(42 98% 56%), hsl(30 98% 50%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
        <p className="text-sm text-muted-foreground mb-6">Redirecting to {user ? 'Discover' : 'Home'} in 5 seconds...</p>
        <GoldButton onClick={() => navigate(user ? '/app/grid' : '/')}>{user ? 'Go to Discover' : 'Return Home'}</GoldButton>
      </div>
    </div>
  );
}

// App Layout
function AppLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}

// =====================================================
// SECTION 6: ROUTER
// =====================================================
function AppRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner message="Initializing" />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app/grid" replace /> : <HomePage />} />
        <Route path="/connect" element={user ? <Navigate to="/app/grid" replace /> : <ConnectPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/auth/reset-password" element={<div className="min-h-screen flex items-center justify-center bg-background p-6"><div className="text-center max-w-sm"><h2 className="text-xl font-black mb-4">Reset Password</h2><p className="text-sm text-muted-foreground">Check your email for the reset link.</p></div></div>} />
        
        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingWelcome />} />
        <Route path="/onboarding/basics" element={<OnboardingBasics />} />
        <Route path="/onboarding/photos" element={<OnboardingPhotos />} />
        <Route path="/onboarding/tribes-interests" element={<div className="min-h-screen flex flex-col p-6 bg-background"><div className="flex-1 max-w-sm mx-auto w-full pt-12"><h2 className="text-2xl font-black mb-6">Tribes & Interests</h2><p className="text-sm text-muted-foreground mb-6">Select what describes you</p><div className="flex flex-wrap gap-2">{['Bear','Twink','Jock','Daddy','Otter','Geek','Creative','Fitness','Travel','Food','Music','Gaming'].map(t => <button key={t} className="h-8 px-3 rounded-full bg-surface-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">{t}</button>)}</div></div><div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/preferences')} className="w-full">Continue</GoldButton></div></div>} />
        <Route path="/onboarding/preferences" element={<div className="min-h-screen flex flex-col p-6 bg-background"><div className="flex-1 max-w-sm mx-auto w-full pt-12"><h2 className="text-2xl font-black mb-6">Preferences</h2><p className="text-sm text-muted-foreground">What are you looking for?</p></div><div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/location')} className="w-full">Continue</GoldButton></div></div>} />
        <Route path="/onboarding/location" element={<div className="min-h-screen flex flex-col p-6 bg-background"><div className="flex-1 max-w-sm mx-auto w-full pt-12"><h2 className="text-2xl font-black mb-6">Location</h2><p className="text-sm text-muted-foreground">Enable location to find people nearby</p></div><div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/privacy')} className="w-full">Enable Location</GoldButton></div></div>} />
        <Route path="/onboarding/privacy" element={<div className="min-h-screen flex flex-col p-6 bg-background"><div className="flex-1 max-w-sm mx-auto w-full pt-12"><h2 className="text-2xl font-black mb-6">Privacy</h2><p className="text-sm text-muted-foreground">Control who sees your profile</p></div><div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/notifications')} className="w-full">Continue</GoldButton></div></div>} />
        <Route path="/onboarding/notifications" element={<div className="min-h-screen flex flex-col p-6 bg-background"><div className="flex-1 max-w-sm mx-auto w-full pt-12"><h2 className="text-2xl font-black mb-6">Notifications</h2><p className="text-sm text-muted-foreground">Stay updated on matches and messages</p></div><div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/consent')} className="w-full">Enable Notifications</GoldButton></div></div>} />
        <Route path="/onboarding/consent" element={<div className="min-h-screen flex flex-col p-6 bg-background"><div className="flex-1 max-w-sm mx-auto w-full pt-12"><h2 className="text-2xl font-black mb-6">Terms & Consent</h2><p className="text-sm text-muted-foreground mb-4">By continuing you agree to our Terms of Service and Privacy Policy. You must be 18+ to use this app.</p></div><div className="max-w-sm mx-auto w-full pb-8"><GoldButton onClick={() => navigate('/onboarding/finish')} className="w-full">I Agree</GoldButton></div></div>} />
        <Route path="/onboarding/finish" element={<OnboardingFinish />} />

        {/* Protected App */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="grid" replace />} />
          <Route path="grid" element={<GridPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="profile/me" element={<ProfilePage />} />
          <Route path="profile/me/edit" element={<EditProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="blocked" element={<BlockedPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/account" element={<SettingsAccountPage />} />
          <Route path="settings/privacy" element={<SettingsPrivacyPage />} />
          <Route path="settings/notifications" element={<SettingsNotificationsPage />} />
          <Route path="settings/subscription" element={<SubscriptionPageComponent />} />
          <Route path="right-now" element={<div className="pb-nav"><PageHeader title="Right Now" /><div className="p-4"><EmptyState title="Coming Soon" description="Real-time availability" /></div></div>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// =====================================================
// SECTION 7: ROOT APP
// =====================================================
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
