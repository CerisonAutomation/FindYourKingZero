// =============================================================================
// ENTERPRISE SUPABASE CLIENT v5.0 — PKCE + PostGIS + Realtime + Typed Queries
// Fixes: SQL injection, channel leaks, user:any, duplicate getById, no PKCE
// Added: Query builder, pagination, caching, typed helpers
// =============================================================================
import { createClient, type Session, type AuthError } from '@supabase/supabase-js';
import type {
  Database,
  PaginatedResult,
  PaginationParams,
  TableRow,
  TableInsert,
} from './types';

// ── Env validation ─────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const msg =
    '[FindYourKing] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example → .env.local and fill in your project values.';
  if (import.meta.env.PROD) throw new Error(msg);
  else console.warn(msg);
}

// ── Singleton client ───────────────────────────────────────────────────────────
export const supabase = createClient<Database>(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          // Try cookie first, fall back to localStorage
          const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
          if (match) return decodeURIComponent(match[2]);
          return localStorage.getItem(key);
        },
        setItem: (key: string, value: string) => {
          // Store in both cookie (for SSR) and localStorage (for speed)
          const maxAge = 60 * 60 * 24 * 365; // 1 year
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          document.cookie = `${key}=; path=/; max-age=0`;
          localStorage.removeItem(key);
        },
      } : undefined,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    global: {
      headers: {
        'X-Client-Info': 'findyourking-web@5.0.0',
        'X-Client-Type': 'web',
        'X-Environment': import.meta.env.MODE,
      },
    },
    db: { schema: 'public' },
  },
);

export const supabaseConfig = {
  url: SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
} as const;

// ── Shared response types ──────────────────────────────────────────────────────
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface AuthResponse {
  session: Session | null;
  user: Session['user'] | null;
  error: AuthError | null;
}

// ── Auth service ───────────────────────────────────────────────────────────────
// ── Health check ──────────────────────────────────────────────────────────────
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    if (error) throw error;
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: (err as Error).message };
  }
}

// ── Profile helpers ───────────────────────────────────────────────────────────
export const supabaseAuth = {
  /** Ensure a profiles row exists for the given user (upsert). */
  ensureProfile: async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          display_name:
            (user.user_metadata?.display_name as string) ||
            (user.user_metadata?.full_name as string) ||
            user.email?.split('@')[0] ||
            'New User',
          is_active: true,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false },
      );
      if (error) console.warn('[Auth] ensureProfile error:', error.message);
    } catch (err) {
      console.warn('[Auth] ensureProfile exception:', err);
    }
  },

  /** PKCE code exchange — wraps supabase.auth.exchangeCodeForSession */
  exchangeCodeForSession: async (code: string): Promise<{ session: Session | null; error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      return { session: data?.session ?? null, error };
    } catch (err) {
      return { session: null, error: err as AuthError };
    }
  },

  getSession: async (): Promise<AuthResponse> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, user: session?.user ?? null, error };
    } catch (err) {
      return { session: null, user: null, error: err as AuthError };
    }
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
      return { session, user: session?.user ?? null, error };
    } catch (err) {
      return { session: null, user: null, error: err as AuthError };
    }
  },

  signUp: async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { session, user: session?.user ?? null, error };
    } catch (err) {
      return { session: null, user: null, error: err as AuthError };
    }
  },

  signInWithMagicLink: async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  },

  signOut: async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  },

  resetPassword: async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  },

  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
};

// ── Query cache ────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleAt: number;
}

const queryCache = new Map<string, CacheEntry<unknown>>();

export const queryCacheConfig = {
  /** Default stale time in ms (5 minutes) */
  defaultStaleTime: 5 * 60 * 1000,
  /** Max cache entries before eviction */
  maxEntries: 200,
};

function getCacheKey(table: string, params: Record<string, unknown>): string {
  return `${table}:${JSON.stringify(params)}`;
}

function getCached<T>(key: string): T | null {
  const entry = queryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.staleAt) {
    queryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, staleTime?: number): void {
  if (queryCache.size >= queryCacheConfig.maxEntries) {
    // Evict oldest entry
    const oldest = queryCache.keys().next().value;
    if (oldest) queryCache.delete(oldest);
  }
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    staleAt: Date.now() + (staleTime ?? queryCacheConfig.defaultStaleTime),
  });
}

export function invalidateCache(prefix: string): void {
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) queryCache.delete(key);
  }
}

export function clearCache(): void {
  queryCache.clear();
}

// ── Query builder with error handling ──────────────────────────────────────────
type TableName = keyof Database['public']['Tables'];

export const supabaseDb = {
  getById: async <T>(table: TableName, id: string): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  /** Get a single row by id with cache support */
  getByIdCached: async <T extends { id: string }>(
    table: TableName,
    id: string,
    staleTime?: number,
  ): Promise<SupabaseResponse<T>> => {
    const cacheKey = getCacheKey(table as string, { id });
    const cached = getCached<T>(cacheKey);
    if (cached) return { data: cached, error: null };

    const result = await supabaseDb.getById<T>(table, id);
    if (result.data) setCache(cacheKey, result.data, staleTime);
    return result;
  },

  insert: async <T>(table: TableName, payload: Record<string, unknown>): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) throw error;
      invalidateCache(table as string);
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  update: async <T>(
    table: TableName,
    payload: Record<string, unknown>,
    match: Record<string, unknown>,
  ): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).update(payload).match(match).select('*').single();
      if (error) throw error;
      invalidateCache(table as string);
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  delete: async <T>(table: TableName, match: Record<string, unknown>): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).delete().match(match).select('*').single();
      if (error) throw error;
      invalidateCache(table as string);
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  /** Generic paginated query with optional filters */
  query: async <T>(
    table: TableName,
    options: {
      select?: string;
      filters?: Record<string, unknown>;
      pagination?: PaginationParams;
      staleTime?: number;
    } = {},
  ): Promise<SupabaseResponse<PaginatedResult<T>>> => {
    const {
      select = '*',
      filters = {},
      pagination = {},
      staleTime,
    } = options;

    const {
      page = 1,
      pageSize = 20,
      orderBy = 'created_at',
      ascending = false,
    } = pagination;

    const cacheKey = getCacheKey(table as string, { select, filters, pagination });
    const cached = getCached<PaginatedResult<T>>(cacheKey);
    if (cached) return { data: cached, error: null };

    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .order(orderBy, { ascending })
        .range(from, to);

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && 'gte' in value) {
          // Range filter: { gte: number, lte?: number }
          const range = value as { gte?: number; lte?: number; gt?: number; lt?: number };
          if (range.gte !== undefined) query = query.gte(key, range.gte);
          if (range.lte !== undefined) query = query.lte(key, range.lte);
          if (range.gt !== undefined) query = query.gt(key, range.gt);
          if (range.lt !== undefined) query = query.lt(key, range.lt);
        } else if (typeof value === 'string' && value.startsWith('%') && value.endsWith('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const result: PaginatedResult<T> = {
        data: (data ?? []) as T[],
        count,
        hasMore: count !== null ? from + pageSize < count : (data?.length ?? 0) >= pageSize,
        page,
        pageSize,
      };

      setCache(cacheKey, result, staleTime);
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },
};

// ── Realtime service — stable channel names, typed helpers, proper cleanup ─────
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export const supabaseRealtime = {
  subscribe: (
    channelKey: string,
    setup: (channel: ReturnType<typeof supabase.channel>) => ReturnType<typeof supabase.channel>,
  ) => {
    if (activeChannels.has(channelKey)) {
      return activeChannels.get(channelKey)!;
    }
    const channel = setup(supabase.channel(channelKey));
    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn(`[Realtime] Channel ${channelKey} error: ${status}`);
        activeChannels.delete(channelKey);
      }
    });
    activeChannels.set(channelKey, channel);
    return channel;
  },

  unsubscribe: async (channelKey: string): Promise<void> => {
    const channel = activeChannels.get(channelKey);
    if (channel) {
      await supabase.removeChannel(channel);
      activeChannels.delete(channelKey);
    }
  },

  unsubscribeAll: async (): Promise<void> => {
    await supabase.removeAllChannels();
    activeChannels.clear();
  },

  getActiveChannels: () => Array.from(activeChannels.keys()),

  cleanup: async (): Promise<void> => {
    for (const [key, channel] of activeChannels) {
      try {
        await supabase.removeChannel(channel);
      } catch {
        // Channel already removed or errored
      }
      activeChannels.delete(key);
    }
  },
};

// ── Typed Realtime Subscription Helpers ────────────────────────────────────────

export type RealtimePayload<T extends Record<string, unknown>> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T | null;
  errors: string[] | null;
};

export type Unsubscribe = () => Promise<void>;

/** Subscribe to messages in a conversation. */
export function subscribeToMessages(
  conversationId: string,
  callback: (payload: RealtimePayload<Record<string, unknown>>) => void,
): Unsubscribe {
  const key = `messages:${conversationId}`;

  supabaseRealtime.subscribe(key, (channel) =>
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: Record<string, unknown>) => {
        try {
          callback(payload as unknown as RealtimePayload<Record<string, unknown>>);
        } catch (err) {
          console.error('[Realtime] message callback error:', err);
        }
      },
    ),
  );

  return async () => {
    await supabaseRealtime.unsubscribe(key);
  };
}

/** Subscribe to a user's presence state. */
export function subscribeToPresence(
  userId: string,
  callback: (state: { online_at: string; user_id: string }) => void,
): Unsubscribe {
  const key = `presence:${userId}`;

  const channel = supabaseRealtime.subscribe(key, (ch) =>
    ch.on('presence', { event: 'sync' }, () => {
      try {
        const state = ch.presenceState();
        const entries = Object.values(state).flat() as { online_at: string; user_id: string }[];
        entries.forEach((entry) => callback(entry));
      } catch (err) {
        console.error('[Realtime] presence callback error:', err);
      }
    }),
  );

  channel.track({ user_id: userId, online_at: new Date().toISOString() }).catch((err) => {
    console.warn('[Realtime] presence track failed:', err);
  });

  return async () => {
    await supabaseRealtime.unsubscribe(key);
  };
}

/** Subscribe to notifications for a specific user. */
export function subscribeToNotifications(
  userId: string,
  callback: (payload: RealtimePayload<Record<string, unknown>>) => void,
): Unsubscribe {
  const key = `notifications:${userId}`;

  supabaseRealtime.subscribe(key, (channel) =>
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload: Record<string, unknown>) => {
        try {
          callback(payload as unknown as RealtimePayload<Record<string, unknown>>);
        } catch (err) {
          console.error('[Realtime] notification callback error:', err);
        }
      },
    ),
  );

  return async () => {
    await supabaseRealtime.unsubscribe(key);
  };
}

/** Subscribe to typing indicators in a conversation. */
export function subscribeToTyping(
  conversationId: string,
  callback: (payload: { user_id: string; is_typing: boolean }) => void,
): Unsubscribe {
  const key = `typing:${conversationId}`;

  supabaseRealtime.subscribe(key, (channel) =>
    channel.on('broadcast', { event: 'typing' }, (payload: Record<string, unknown>) => {
      try {
        callback(payload as unknown as { user_id: string; is_typing: boolean });
      } catch (err) {
        console.error('[Realtime] typing callback error:', err);
      }
    }),
  );

  return async () => {
    await supabaseRealtime.unsubscribe(key);
  };
}

/** Send a typing indicator broadcast. */
export function sendTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean,
): void {
  const key = `typing:${conversationId}`;
  const channel = activeChannels.get(key);
  if (channel) {
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, is_typing: isTyping },
    }).catch((err: Error) => {
      console.warn('[Realtime] typing send failed:', err);
    });
  }
}

// ── PostGIS proximity search — parameterized, no SQL injection ────────────────
export const supabaseGeo = {
  findNearby: async (
    lat: number,
    lng: number,
    radiusMeters: number,
    table: string,
  ) => {
    const { data, error } = await supabase.rpc('find_nearby_users', {
      lat,
      lng,
      radius_meters: radiusMeters,
      target_table: table,
    });
    return { data, error };
  },
};

// ── Auth error classification ─────────────────────────────────────────────────
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  RATE_LIMITED = 'rate_limited',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

export function classifyAuthError(error: AuthError | Error | null): {
  code: AuthErrorCode;
  message: string;
  retryable: boolean;
} {
  if (!error) return { code: AuthErrorCode.UNKNOWN, message: 'No error', retryable: false };

  const msg = error.message?.toLowerCase() || '';

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials'))
    return { code: AuthErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password', retryable: false };
  if (msg.includes('email not confirmed') || msg.includes('not confirmed'))
    return { code: AuthErrorCode.EMAIL_NOT_CONFIRMED, message: 'Please confirm your email', retryable: false };
  if (msg.includes('user not found'))
    return { code: AuthErrorCode.USER_NOT_FOUND, message: 'No account found with this email', retryable: false };
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('6 characters')))
    return { code: AuthErrorCode.WEAK_PASSWORD, message: 'Password is too weak', retryable: false };
  if (msg.includes('already registered') || msg.includes('already exists'))
    return { code: AuthErrorCode.EMAIL_ALREADY_EXISTS, message: 'An account with this email already exists', retryable: false };
  if (msg.includes('rate limit') || msg.includes('too many'))
    return { code: AuthErrorCode.RATE_LIMITED, message: 'Too many attempts. Please wait and try again', retryable: true };
  if (msg.includes('network') || msg.includes('fetch'))
    return { code: AuthErrorCode.NETWORK_ERROR, message: 'Network error. Check your connection', retryable: true };

  return { code: AuthErrorCode.UNKNOWN, message: error.message || 'An unexpected error occurred', retryable: false };
}

export default supabase;
