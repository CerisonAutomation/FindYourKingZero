// =============================================================================
// useAuth.tsx v4.1 — Rate-limited, profile-creation-on-signup, PKCE-aware
// Fixes: no profile creation after signup, no client-side rate limiting
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
import { supabase, supabaseAuth, classifyAuthError, AuthErrorCode } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  errorCode: AuthErrorCode | null;
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
  errorCode: null,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithMagicLink: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  clearError: () => {},
});

// ── Rate limiter (client-side debounce) ────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 15_000; // 15 second window
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const authAttempts: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Purge expired entries
  while (authAttempts.length && now - authAttempts[0] > RATE_LIMIT_WINDOW_MS) {
    authAttempts.shift();
  }
  if (authAttempts.length >= RATE_LIMIT_MAX_ATTEMPTS) return false;
  authAttempts.push(now);
  return true;
}

function getRateLimitCooldown(): number {
  if (authAttempts.length === 0) return 0;
  const oldest = authAttempts[0];
  return Math.max(0, RATE_LIMIT_WINDOW_MS - (Date.now() - oldest));
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);

  const mountedRef = useRef(true);
  const onlineDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initialize session once on mount ─────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { session: s, error: e } = await supabaseAuth.getSession();
        if (!mountedRef.current) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (e) {
          setError(e);
          setErrorCode(classifyAuthError(e));
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err as AuthError);
          setErrorCode(classifyAuthError(err as AuthError));
        }
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

  // ── Auth state change listener ───────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mountedRef.current) return;
        setSession(s);
        setUser(s?.user ?? null);
        setIsLoading(false);

        // Create profile on first sign-in (email confirmation, OAuth, etc.)
        if (event === 'SIGNED_IN' && s?.user) {
          await supabaseAuth.ensureProfile(s.user);
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Online presence — debounced 500ms ────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = (isOnline: boolean) => {
      if (onlineDebounceRef.current) clearTimeout(onlineDebounceRef.current);
      onlineDebounceRef.current = setTimeout(async () => {
        try {
          await supabase
            .from('profiles')
            .update({ is_online: isOnline, last_seen: new Date().toISOString() })
            .eq('user_id', user.id);
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

  // ── Auth actions ─────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setErrorCode(null);

    if (!checkRateLimit()) {
      const cooldown = getRateLimitCooldown();
      const rateLimitError = {
        message: `Too many attempts. Please wait ${Math.ceil(cooldown / 1000)} seconds.`,
        name: 'RateLimitError',
        status: 429,
      } as AuthError;
      setError(rateLimitError);
      setErrorCode(AuthErrorCode.RATE_LIMITED);
      return { error: rateLimitError };
    }

    const { error: e } = await supabaseAuth.signIn(email, password);
    if (e) {
      setError(e);
      setErrorCode(classifyAuthError(e));
    }
    return { error: e };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    setErrorCode(null);

    if (!checkRateLimit()) {
      const cooldown = getRateLimitCooldown();
      const rateLimitError = {
        message: `Too many attempts. Please wait ${Math.ceil(cooldown / 1000)} seconds.`,
        name: 'RateLimitError',
        status: 429,
      } as AuthError;
      setError(rateLimitError);
      setErrorCode(AuthErrorCode.RATE_LIMITED);
      return { error: rateLimitError };
    }

    const { error: e, session: s, user: u } = await supabaseAuth.signUp(email, password, displayName);
    if (e) {
      setError(e);
      setErrorCode(classifyAuthError(e));
      return { error: e };
    }

    // If email confirmation is disabled in Supabase, the session exists immediately.
    // Create profile now so the user lands on onboarding with a row ready.
    if (s?.user) {
      await supabaseAuth.ensureProfile(s.user);
    } else if (u) {
      await supabaseAuth.ensureProfile(u);
    }

    return { error: null };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    setError(null);
    setErrorCode(null);

    if (!checkRateLimit()) {
      const cooldown = getRateLimitCooldown();
      const rateLimitError = {
        message: `Too many attempts. Please wait ${Math.ceil(cooldown / 1000)} seconds.`,
        name: 'RateLimitError',
        status: 429,
      } as AuthError;
      setError(rateLimitError);
      setErrorCode(AuthErrorCode.RATE_LIMITED);
      return { error: rateLimitError };
    }

    const { error: e } = await supabaseAuth.signInWithMagicLink(email);
    if (e) {
      setError(e);
      setErrorCode(classifyAuthError(e));
    }
    return { error: e };
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setErrorCode(null);
    await supabaseAuth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    setErrorCode(null);

    if (!checkRateLimit()) {
      const cooldown = getRateLimitCooldown();
      const rateLimitError = {
        message: `Too many attempts. Please wait ${Math.ceil(cooldown / 1000)} seconds.`,
        name: 'RateLimitError',
        status: 429,
      } as AuthError;
      setError(rateLimitError);
      setErrorCode(AuthErrorCode.RATE_LIMITED);
      return { error: rateLimitError };
    }

    const { error: e } = await supabaseAuth.resetPassword(email);
    if (e) {
      setError(e);
      setErrorCode(classifyAuthError(e));
    }
    return { error: e };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isInitialized,
        error,
        errorCode,
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

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export { AuthContext };
export type { AuthContextType };
