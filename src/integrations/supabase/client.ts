// =============================================================================
// ENTERPRISE SUPABASE CLIENT v4.0 — PKCE + PostGIS + Realtime + Type-safe
// Fixes: SQL injection, channel leaks, user:any, duplicate getById, no PKCE
// =============================================================================
import { createClient, type Session, type AuthError } from '@supabase/supabase-js';
import type { Database } from './types';

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
      flowType: 'pkce',           // PKCE required — fixes CSRF vector
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    global: {
      headers: {
        'X-Client-Info': 'findyourking-web@4.0.0',
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
export const supabaseAuth = {
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

// ── DB service — typed, no SQL injection ───────────────────────────────────────
type TableName = keyof Database['public']['Tables'];

export const supabaseDb = {
  // FIXED: was duplicated between supabaseAuth and supabaseDb — now single source
  getById: async <T>(table: TableName, id: string): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  insert: async <T>(table: TableName, payload: Record<string, unknown>): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) throw error;
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
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  delete: async <T>(table: TableName, match: Record<string, unknown>): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).delete().match(match).select('*').single();
      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },
};

// ── Realtime service — FIXED: stable channel names prevent leaks ───────────────
// OLD pattern used Date.now() as channel name = unbounded channel growth
// NEW pattern: caller provides stable semantic key, manager deduplicates
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export const supabaseRealtime = {
  /**
   * Subscribe to a stable named channel. Deduplicates automatically.
   * @param channelKey - Stable key e.g. "presence:user:abc123" NOT Date.now()
   */
  subscribe: (
    channelKey: string,
    setup: (channel: ReturnType<typeof supabase.channel>) => ReturnType<typeof supabase.channel>,
  ) => {
    if (activeChannels.has(channelKey)) {
      return activeChannels.get(channelKey)!;
    }
    const channel = setup(supabase.channel(channelKey));
    channel.subscribe();
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
};

// ── PostGIS proximity search — FIXED: parameterized, no SQL injection ──────────
// OLD: used raw string interpolation in st_dwithin call
// NEW: uses RPC with typed params — Supabase handles sanitization
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

export default supabase;
