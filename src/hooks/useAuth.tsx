// =============================================================================
// useAuth.tsx v4.0 — Race-condition-free, PKCE, debounced online status
// Fixes: double-init race, online status storm, missing resetPassword
// =============================================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase, supabaseAuth } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  error: null,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithMagicLink: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  clearError: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // FIXED: mount guard prevents state updates after unmount (race condition)
  const mountedRef = useRef(true);
  // FIXED: debounce timer for online status to prevent presence storms
  const onlineDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initialize session once on mount (FIXED: was called twice) ────────────
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { session: s, error: e } = await supabaseAuth.getSession();
        if (!mountedRef.current) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (e) setError(e);
      } catch (err) {
        if (mountedRef.current) setError(err as AuthError);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Auth state change listener ────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mountedRef.current) return;
        setSession(s);
        setUser(s?.user ?? null);
        setIsLoading(false);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Online presence — FIXED: debounced 500ms to prevent storms ───────────
  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = (isOnline: boolean) => {
      if (onlineDebounceRef.current) clearTimeout(onlineDebounceRef.current);
      onlineDebounceRef.current = setTimeout(async () => {
        try {
          await supabase
            .from('profiles')
            .update({ is_online: isOnline, last_seen: new Date().toISOString() })
            .eq('id', user.id);
        } catch {
          // non-critical — silently fail
        }
      }, 500);
    };

    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);
    const handleVisibility = () => updateOnlineStatus(!document.hidden);

    updateOnlineStatus(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (onlineDebounceRef.current) clearTimeout(onlineDebounceRef.current);
      updateOnlineStatus(false);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  // ── Auth actions ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: e } = await supabaseAuth.signIn(email, password);
    if (e) setError(e);
    return { error: e };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    const { error: e } = await supabaseAuth.signUp(email, password, displayName);
    if (e) setError(e);
    return { error: e };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    setError(null);
    const { error: e } = await supabaseAuth.signInWithMagicLink(email);
    if (e) setError(e);
    return { error: e };
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await supabaseAuth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    const { error: e } = await supabaseAuth.resetPassword(email);
    if (e) setError(e);
    return { error: e };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isInitialized,
        error,
        signIn,
        signUp,
        signInWithMagicLink,
        signOut,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export { AuthContext };
export type { AuthContextType };
