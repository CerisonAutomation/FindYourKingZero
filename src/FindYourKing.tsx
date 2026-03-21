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
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="grid" replace />} />
          <Route path="grid" element={<GridPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="profile/me" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="settings" element={<SettingsPage />} />
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
