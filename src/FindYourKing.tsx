// =====================================================
// FIND YOUR KING — Complete Consolidated Frontend
// All hooks, components, pages in one file
// Backend: Supabase (30 tables, 6 edge functions)
// =====================================================

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, Suspense, lazy, type ReactNode, type FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams, Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient, type Session, type User, type AuthError } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Utility functions
const cn = (...classes: (string | undefined | false | null)[]) => classes.filter(Boolean).join(' ');
const log = { info: () => {}, debug: () => {}, warn: () => {}, error: () => {} };
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Database = any;

// =====================================================
// FIND YOUR KING — Complete Consolidated Frontend
// All hooks, components, pages in one file
// Backend: Supabase (30 tables, 6 edge functions)
// =====================================================

// ════════════════════════════════════════════════════════
// SUPABASE CLIENT
// Source: src/integrations/supabase/client.ts
// ════════════════════════════════════════════════════════

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
  getById: async <T,>(table: TableName, id: string): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  /** Get a single row by id with cache support */
  getByIdCached: async <T extends { id: string },>(
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

  insert: async <T,>(table: TableName, payload: Record<string, unknown>): Promise<SupabaseResponse<T>> => {
    try {
      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) throw error;
      invalidateCache(table as string);
      return { data: data as T, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  update: async <T,>(
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

  delete: async <T,>(table: TableName, match: Record<string, unknown>): Promise<SupabaseResponse<T>> => {
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
  query: async <T,>(
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

  // ── Storage service — file upload/download per official docs ────────────────
export const supabaseStorage = {
  upload: async (bucket: string, path: string, file: File, options?: { upsert?: boolean }) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: options?.upsert ?? false,
      cacheControl: '3600',
    });
    if (error) throw error;
    return data;
  },

  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;
    return data;
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  createSignedUrl: async (bucket: string, path: string, expiresIn = 3600) => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  remove: async (bucket: string, paths: string[]) => {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  },

  list: async (bucket: string, path = '', options?: { limit?: number; offset?: number }) => {
    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: options?.limit ?? 100,
      offset: options?.offset ?? 0,
    });
    if (error) throw error;
    return data;
  },
};

// ── Edge Functions service — invoke with auth per official docs ─────────────
export const supabaseFunctions = {
  invoke: async <T = unknown,>(functionName: string, body?: Record<string, unknown>): Promise<T> => {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (error) throw error;
    return data as T;
  },

  invokeStream: async (functionName: string, body: Record<string, unknown>, onChunk: (chunk: string) => void) => {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    if (error) throw error;

    // Handle streaming response
    const reader = (data as any)?.getReader?.();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(new TextDecoder().decode(value));
      }
    }
    return data;
  },
};



export default supabase;


// ════════════════════════════════════════════════════════
// AUTH HOOK
// Source: src/hooks/useAuth.tsx
// ════════════════════════════════════════════════════════

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
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<{ error: AuthError | null }>;
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
  signInWithOAuth: async () => ({ error: null }),
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
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<{ session: Session | null; error: AuthError | null }>((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timed out')), 10000);
        });
        
        const { session: s, error: e } = await Promise.race([
          supabaseAuth.getSession(),
          timeoutPromise
        ]);
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
          // Force loading to stop even on error
          setIsLoading(false);
          setIsInitialized(true);
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
        
        // Handle token refresh — keep user logged in
        if (event === 'TOKEN_REFRESHED' && s?.user) {
          // Session was refreshed, user stays logged in
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
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

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple' | 'github') => {
    setError(null);
    setErrorCode(null);

    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (e) {
      setError(e);
      setErrorCode(classifyAuthError(e));
      return { error: e };
    }
    return { error: null };
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
        signInWithOAuth,
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


// ════════════════════════════════════════════════════════
// PROFILE HOOK
// Source: src/hooks/useProfile.tsx
// ════════════════════════════════════════════════════════

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';

export type Profile  = {
    id: string;
    user_id: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    age: number | null;
    date_of_birth: string | null;
    height: number | null;
    weight: number | null;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    tribes: string[];
    interests: string[];
    looking_for: string[];
    is_verified: boolean;
    is_online: boolean;
    last_seen: string;
    hourly_rate: number | null;
    is_available_now: boolean;
    views_count: number;
    favorites_count: number;
    rating: number;
    created_at: string;
    updated_at: string;
    // Verification fields
    age_verified: boolean;
    age_verified_at: string | null;
    photo_verified: boolean;
    photo_verified_at: string | null;
    id_verified: boolean;
    id_verified_at: string | null;
    phone_verified: boolean;
    phone_verified_at: string | null;
    // GDPR fields
    gdpr_consent_date: string | null;
    data_processing_consent: boolean;
    marketing_consent: boolean;
    account_deletion_requested_at: string | null;
}

export type ProfileWithDetails  = {
    id: string;
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
    height: number | null;
    weight: number | null;
    hourly_rate: number | null;
    is_online: boolean | null;
    is_verified: boolean | null;
    is_available_now: boolean | null;
    last_seen: string | null;
    tribes: string[] | null;
    interests: string[] | null;
    looking_for: string[] | null;
    latitude: number | null;
    longitude: number | null;
    views_count: number | null;
    favorites_count: number | null;
    rating: number | null;
    age_verified: boolean | null;
    photo_verified: boolean | null;
    id_verified: boolean | null;
    phone_verified: boolean | null;
    created_at: string | null;
    is_premium?: boolean | null;
    position?: string | null;
    ethnicity?: string | null;
    relationship_status?: string | null;
}

export type ProfileFilters  = {
    minAge?: number;
    maxAge?: number;
    tribes?: string[];
    lookingFor?: string[];
    isOnline?: boolean;
    isVerified?: boolean;
    hasPhotos?: boolean;
    maxDistance?: number;
    search?: string;
}

export const useProfile = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Real-time subscription for own profile
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`own-profile-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['profile', user.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const {data: profile, isLoading, error} = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null;

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return data as Profile;
        },
        enabled: !!user,
    });

    return {profile, isLoading, error};
};

export const useUpdateProfile = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: Partial<Profile>) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('profiles')
                .update(updates)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile', user?.id]});
            toast({
                title: 'Profile updated',
                description: 'Your profile has been saved successfully.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useProfiles = (filters?: {
    tribes?: string[];
    minAge?: number;
    maxAge?: number;
    isOnline?: boolean;
    isVerified?: boolean;
    city?: string;
}) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Real-time subscription for profile list changes
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('profiles-list-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'profiles'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['profiles']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return useQuery({
        queryKey: ['profiles', filters],
        queryFn: async () => {
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('user_id', user?.id || '')
                .order('is_online', {ascending: false})
                .order('last_seen', {ascending: false});

            if (filters?.minAge) query = query.gte('age', filters.minAge);
            if (filters?.maxAge) query = query.lte('age', filters.maxAge);
            if (filters?.isOnline) query = query.eq('is_online', true);
            if (filters?.isVerified) query = query.eq('is_verified', true);
            if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
            if (filters?.tribes && filters.tribes.length > 0) {
                query = query.overlaps('tribes', filters.tribes);
            }

            const {data, error} = await query.limit(50);
            if (error) throw error;
            return data as Profile[];
        },
        enabled: !!user,
    });
};

// Enhanced useProfiles with comprehensive filtering for grid view
export const useProfilesGrid = (filters?: ProfileFilters) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Real-time subscription — invalidate on any profile change
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('profiles-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'profiles'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['profiles']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return useQuery({
        queryKey: ['profiles', filters, user?.id],
        queryFn: async () => {
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('user_id', user?.id || '')
                .order('is_online', {ascending: false})
                .order('last_seen', {ascending: false, nullsFirst: false})
                .limit(100);

            if (filters?.minAge) query = query.gte('age', filters.minAge);
            if (filters?.maxAge) query = query.lte('age', filters.maxAge);
            if (filters?.isOnline) query = query.eq('is_online', true);
            if (filters?.isVerified) query = query.eq('is_verified', true);
            if (filters?.search) {
                query = query.or(
                    `display_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
                );
            }

            const {data, error} = await query;
            if (error) throw error;

            let profiles = (data || []) as ProfileWithDetails[];

            // Client-side array filters
            if (filters?.tribes && filters.tribes.length > 0) {
                profiles = profiles.filter(p =>
                    p.tribes?.some(t => filters.tribes?.includes(t))
                );
            }
            if (filters?.lookingFor && filters.lookingFor.length > 0) {
                profiles = profiles.filter(p =>
                    p.looking_for?.some(l => filters.lookingFor?.includes(l))
                );
            }
            if (filters?.isOnline) {
                profiles = profiles.filter(p => p.is_online);
            }
            if (filters?.isVerified) {
                profiles = profiles.filter(p => p.is_verified);
            }
            if (filters?.hasPhotos) {
                profiles = profiles.filter(p => !!p.avatar_url);
            }
            if (filters?.search) {
                const s = filters.search.toLowerCase();
                profiles = profiles.filter(p =>
                    p.display_name?.toLowerCase().includes(s) ||
                    p.bio?.toLowerCase().includes(s) ||
                    p.city?.toLowerCase().includes(s)
                );
            }

            return profiles;
        },
        enabled: !!user,
        staleTime: 30000,
    });
};

export const useProfileById = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    // Real-time subscription for specific profile
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`profile-view-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['profile', userId]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);

    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data as Profile;
        },
        enabled: !!userId,
    });
};


// ════════════════════════════════════════════════════════
// MESSAGES HOOK
// Source: src/hooks/useMessages.tsx
// ════════════════════════════════════════════════════════


export type Conversation  = {
    id: string;
    participant_one: string;
    participant_two: string;
    last_message_at: string;
    created_at: string;
    other_user?: {
        display_name: string;
        avatar_url: string | null;
        is_online: boolean;
    };
    last_message?: Message;
    unread_count?: number;
}

export type Message  = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'voice' | 'booking_request';
    media_url: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export const useConversations = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: conversations, isLoading} = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('conversations')
                .select('*')
                .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
                .order('last_message_at', {ascending: false});

            if (error) throw error;

            // Fetch other user profiles and last messages
            const conversationsWithDetails = await Promise.all(
                (data || []).map(async (conv) => {
                    const otherUserId = conv.participant_one === user.id
                        ? conv.participant_two
                        : conv.participant_one;

                    const [profileRes, messagesRes, unreadRes] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('display_name, avatar_url, is_online')
                            .eq('user_id', otherUserId)
                            .single(),
                        supabase
                            .from('messages')
                            .select('*')
                            .eq('conversation_id', conv.id)
                            .order('created_at', {ascending: false})
                            .limit(1),
                        supabase
                            .from('messages')
                            .select('id', {count: 'exact'})
                            .eq('conversation_id', conv.id)
                            .eq('is_read', false)
                            .neq('sender_id', user.id),
                    ]);

                    return {
                        ...conv,
                        other_user: profileRes.data,
                        last_message: messagesRes.data?.[0],
                        unread_count: unreadRes.count || 0,
                    } as Conversation;
                })
            );

            return conversationsWithDetails;
        },
        enabled: !!user,
    });

    // Subscribe to new conversations
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('conversations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['conversations', user.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return {conversations: conversations || [], isLoading};
};

export const useMessages = (conversationId: string | undefined) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: messages, isLoading} = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];

            const {data, error} = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', {ascending: true});

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!conversationId,
    });

    // Subscribe to new messages
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    queryClient.setQueryData(
                        ['messages', conversationId],
                        (old: Message[] | undefined) => [...(old || []), payload.new as Message]
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    // Mark messages as read
    useEffect(() => {
        if (!conversationId || !user || !messages?.length) return;

        const unreadMessages = messages.filter(
            (m) => !m.is_read && m.sender_id !== user.id
        );

        if (unreadMessages.length > 0) {
            supabase
                .from('messages')
                .update({is_read: true, read_at: new Date().toISOString()})
                .in('id', unreadMessages.map((m) => m.id))
                .then(() => {
                    queryClient.invalidateQueries({queryKey: ['conversations', user.id]});
                });
        }
    }, [messages, conversationId, user, queryClient]);

    return {messages: messages || [], isLoading};
};

export const useSendMessage = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               conversationId,
                               content,
                               messageType = 'text',
                               mediaUrl,
                           }: {
            conversationId: string;
            content: string;
            messageType?: 'text' | 'image' | 'voice' | 'booking_request';
            mediaUrl?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                    message_type: messageType,
                    media_url: mediaUrl,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['messages', data.conversation_id]});
            queryClient.invalidateQueries({queryKey: ['conversations', user?.id]});
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to send message',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useCreateConversation = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (otherUserId: string) => {
            if (!user) throw new Error('Not authenticated');

            // Check if conversation already exists
            const {data: existing} = await supabase
                .from('conversations')
                .select('*')
                .or(
                    `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
                )
                .single();

            if (existing) return existing;

            // Create new conversation
            const {data, error} = await supabase
                .from('conversations')
                .insert({
                    participant_one: user.id,
                    participant_two: otherUserId,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['conversations', user?.id]});
        },
    });
};


// ════════════════════════════════════════════════════════
// CONVERSATIONS HOOK
// Source: src/hooks/useConversations.tsx
// ════════════════════════════════════════════════════════


export type ConversationWithDetails  = {
    id: string;
    participant_one: string;
    participant_two: string;
    last_message_at: string | null;
    created_at: string | null;
    other_user: {
        user_id: string;
        display_name: string | null;
        avatar_url: string | null;
        is_online: boolean | null;
        last_seen: string | null;
    } | null;
    last_message: {
        content: string;
        sender_id: string;
        created_at: string;
        is_read: boolean;
    } | null;
    unread_count: number;
}

export const useConversations = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Fetch conversations
            const {data: conversations, error} = await supabase
                .from('conversations')
                .select('*')
                .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
                .order('last_message_at', {ascending: false, nullsFirst: false});

            if (error) throw error;

            // Enrich with other user info and last message
            const enrichedConversations = await Promise.all(
                (conversations || []).map(async (conv) => {
                    const otherUserId = conv.participant_one === user.id
                        ? conv.participant_two
                        : conv.participant_one;

                    const [profileResult, lastMessageResult, unreadResult] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('user_id, display_name, avatar_url, is_online, last_seen')
                            .eq('user_id', otherUserId)
                            .single(),
                        supabase
                            .from('messages')
                            .select('content, sender_id, created_at, is_read')
                            .eq('conversation_id', conv.id)
                            .order('created_at', {ascending: false})
                            .limit(1)
                            .single(),
                        supabase
                            .from('messages')
                            .select('id', {count: 'exact'})
                            .eq('conversation_id', conv.id)
                            .neq('sender_id', user.id)
                            .eq('is_read', false),
                    ]);

                    return {
                        ...conv,
                        other_user: profileResult.data,
                        last_message: lastMessageResult.data,
                        unread_count: unreadResult.count || 0,
                    } as ConversationWithDetails;
                })
            );

            return enrichedConversations;
        },
        enabled: !!user,
    });

    // Real-time subscription for conversation updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('conversations-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                (payload) => {
                    const conv = payload.new as any;
                    if (conv?.participant_one === user.id || conv?.participant_two === user.id) {
                        queryClient.invalidateQueries({queryKey: ['conversations']});
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['conversations']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return query;
};

export const useCreateConversation = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (otherUserId: string) => {
            if (!user) throw new Error('Not authenticated');

            // Check if conversation exists
            const {data: existing} = await supabase
                .from('conversations')
                .select('id')
                .or(
                    `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
                )
                .single();

            if (existing) return existing.id;

            // Create new conversation
            const {data, error} = await supabase
                .from('conversations')
                .insert({
                    participant_one: user.id,
                    participant_two: otherUserId,
                })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['conversations']});
        },
    });
};

export const useConversationMessages = (conversationId: string | null) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];

            const {data, error} = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', {ascending: true});

            if (error) throw error;

            // Mark messages as read
            if (user) {
                await supabase
                    .from('messages')
                    .update({is_read: true, read_at: new Date().toISOString()})
                    .eq('conversation_id', conversationId)
                    .neq('sender_id', user.id)
                    .eq('is_read', false);
            }

            return data;
        },
        enabled: !!conversationId,
    });

    // Real-time subscription for new messages
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['messages', conversationId]});
                    queryClient.invalidateQueries({queryKey: ['conversations']});
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['messages', conversationId]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    return query;
};

export const useSendMessage = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({conversationId, content, mediaUrl}: {
            conversationId: string;
            content: string;
            mediaUrl?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                    media_url: mediaUrl,
                    message_type: mediaUrl ? 'media' : 'text',
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, {conversationId}) => {
            queryClient.invalidateQueries({queryKey: ['messages', conversationId]});
            queryClient.invalidateQueries({queryKey: ['conversations']});
        },
    });
};

export const useConversationPresence = (conversationId: string | null) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId || !user) return;

        const channel = supabase.channel(`presence-${conversationId}`, {
            config: {presence: {key: user.id}},
        });

        channel
            .on('presence', {event: 'sync'}, () => {
                const state = channel.presenceState();
                queryClient.setQueryData(['presence', conversationId], state);
            })
            .on('presence', {event: 'join'}, ({key, newPresences}) => {
                console.log('User joined:', key, newPresences);
            })
            .on('presence', {event: 'leave'}, ({key, leftPresences}) => {
                console.log('User left:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                        typing: false,
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, user, queryClient]);

    const setTyping = async (isTyping: boolean) => {
        if (!conversationId || !user) return;

        const channel = supabase.channel(`presence-${conversationId}`);
        await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            typing: isTyping,
        });
    };

    return {setTyping};
};


// ════════════════════════════════════════════════════════
// EVENTS HOOK
// Source: src/hooks/useEvents.tsx
// ════════════════════════════════════════════════════════


export type Event ={
    id: string;
    host_id: string;
    title: string;
    description: string | null;
    event_type: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    event_date: string;
    start_time: string;
    end_time: string | null;
    max_attendees: number;
    is_public: boolean;
    is_premium_only: boolean;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
    host?: {
        display_name: string;
        avatar_url: string;
        is_verified: boolean;
    };
    attendee_count?: number;
    is_attending?: boolean;
}

export const EVENT_TYPES = [
    {id: 'gym', label: 'Gym Buddy', icon: '💪', color: 'bg-orange-500'},
    {id: 'cinema', label: 'Cinema', icon: '🎬', color: 'bg-purple-500'},
    {id: 'dinner', label: 'Dinner', icon: '🍽️', color: 'bg-red-500'},
    {id: 'coffee', label: 'Coffee', icon: '☕', color: 'bg-amber-500'},
    {id: 'drinks', label: 'Drinks', icon: '🍻', color: 'bg-yellow-500'},
    {id: 'hiking', label: 'Hiking', icon: '🥾', color: 'bg-green-500'},
    {id: 'sports', label: 'Sports', icon: '⚽', color: 'bg-blue-500'},
    {id: 'gaming', label: 'Gaming', icon: '🎮', color: 'bg-indigo-500'},
    {id: 'party', label: 'Party', icon: '🎉', color: 'bg-pink-500'},
    {id: 'meetup', label: 'Meetup', icon: '👋', color: 'bg-teal-500'},
];

/**
 * Shared realtime hook — call once at the top of any component
 * that uses event data so cache stays warm for all event queries.
 */
export const useEventsRealtime = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const eventsChannel = supabase
            .channel('events-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'events'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events']});
                }
            )
            .subscribe();

        const attendeesChannel = supabase
            .channel('event-attendees-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'event_attendees'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(attendeesChannel);
        };
    }, [queryClient]);
};

export const useEvents = (filter?: 'upcoming' | 'my_events' | 'attending') => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const today = new Date().toISOString().split('T')[0];

    // Real-time subscriptions for events and attendees
    useEffect(() => {
        const eventsChannel = supabase
            .channel(`events-${filter ?? 'all'}-realtime`)
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'events'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events', filter, user?.id]});
                }
            )
            .subscribe();

        const attendeesChannel = supabase
            .channel(`event-attendees-${filter ?? 'all'}-realtime`)
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'event_attendees'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events', filter, user?.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(attendeesChannel);
        };
    }, [filter, user?.id, queryClient]);

    return useQuery({
        queryKey: ['events', filter, user?.id],
        queryFn: async () => {
            let query = supabase
                .from('events')
                .select('*')
                .gte('event_date', today)
                .order('event_date', {ascending: true});

            if (filter === 'my_events' && user) {
                query = query.eq('host_id', user.id);
            }

            const {data: events, error} = await query;
            if (error) throw error;

            // Enrich with host profiles and attendee counts
            const enrichedEvents = await Promise.all(
                (events || []).map(async (event) => {
                    const [hostResult, attendeesResult, attendingResult] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('display_name, avatar_url, is_verified')
                            .eq('user_id', event.host_id)
                            .single(),
                        supabase
                            .from('event_attendees')
                            .select('id', {count: 'exact'})
                            .eq('event_id', event.id)
                            .eq('status', 'confirmed'),
                        user
                            ? supabase
                                .from('event_attendees')
                                .select('id')
                                .eq('event_id', event.id)
                                .eq('user_id', user.id)
                                .maybeSingle()
                            : Promise.resolve({data: null}),
                    ]);

                    return {
                        ...event,
                        host: hostResult.data,
                        attendee_count: attendeesResult.count || 0,
                        is_attending: !!attendingResult.data,
                    } as Event;
                })
            );

            if (filter === 'attending' && user) {
                return enrichedEvents.filter((e) => e.is_attending);
            }

            return enrichedEvents;
        },
        enabled: filter !== 'my_events' || !!user,
    });
};

export const useCreateEvent = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: {
            title: string;
            description?: string;
            event_type: string;
            location: string;
            latitude?: number;
            longitude?: number;
            event_date: string;
            start_time: string;
            end_time?: string;
            max_attendees?: number;
            is_public?: boolean;
            cover_image?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('events')
                .insert({host_id: user.id, ...event})
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: 'Event Created', description: 'Your event is now live.'});
        },
        onError: (error: Error) => {
            toast({title: 'Failed to create event', description: error.message, variant: 'destructive'});
        },
    });
};

export const useJoinEvent = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('event_attendees')
                .insert({event_id: eventId, user_id: user.id, status: 'confirmed'})
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: "You're in!", description: 'See you at the event.'});
        },
        onError: (error: Error) => {
            toast({title: 'Failed to join', description: error.message, variant: 'destructive'});
        },
    });
};

export const useLeaveEvent = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase
                .from('event_attendees')
                .delete()
                .eq('event_id', eventId)
                .eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: 'Left event', description: "You've been removed from this event."});
        },
    });
};

export const useDeleteEvent = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            const {error} = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: 'Event deleted', description: 'Your event has been removed.'});
        },
    });
};


// ════════════════════════════════════════════════════════
// NOTIFICATIONS HOOK
// Source: src/hooks/useNotifications.tsx
// ════════════════════════════════════════════════════════


export type Notification = {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string | null;
    data: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
}

export const useNotifications = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    const {data: notifications = [], isLoading} = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', {ascending: false})
                .limit(50);

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
    });

    // Subscribe to new notifications in realtime
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const notification = payload.new as Notification;
                    queryClient.invalidateQueries({queryKey: ['notifications']});

                    // Show toast for new notification
                    toast({
                        title: notification.title,
                        description: notification.body || undefined,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient, toast]);

    const markAsRead = useMutation({
        mutationFn: async (notificationId: string) => {
            const {error} = await supabase
                .from('notifications')
                .update({is_read: true})
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase
                .from('notifications')
                .update({is_read: true})
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
    });

    const deleteNotification = useMutation({
        mutationFn: async (notificationId: string) => {
            const {error} = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
        deleteNotification: deleteNotification.mutate,
    };
};

// Hook for registering push notifications
export const usePushNotifications = () => {
    const {user} = useAuth();
    const {toast} = useToast();

    const registerPush = async () => {
        if (!user) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast({
                title: 'Push notifications not supported',
                description: 'Your browser does not support push notifications.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast({
                    title: 'Permission denied',
                    description: 'Please enable notifications in your browser settings.',
                    variant: 'destructive',
                });
                return;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');

            // Get push subscription
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
                ),
            });

            // Save subscription to database
            const {error} = await supabase.from('push_subscriptions').insert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth_key: arrayBufferToBase64(subscription.getKey('auth')),
            });

            if (error && !error.message.includes('duplicate')) throw error;

            toast({
                title: 'Notifications enabled! 🔔',
                description: 'You will now receive push notifications.',
            });
        } catch (error) {
            console.error('Push registration error:', error);
            toast({
                title: 'Error',
                description: 'Could not enable push notifications.',
                variant: 'destructive',
            });
        }
    };

    return {registerPush};
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


// ════════════════════════════════════════════════════════
// FAVORITES HOOK
// Source: src/hooks/useFavorites.tsx
// ════════════════════════════════════════════════════════


export const useFavorites = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const {toast} = useToast();

    // Real-time subscription on favorites table for this user
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`favorites-${user.id}-realtime`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'favorites',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['favorites', user.id]});
                    queryClient.invalidateQueries({queryKey: ['favorite-ids', user.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const {data: favorites, isLoading} = useQuery({
        queryKey: ['favorites', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data: favData, error} = await supabase
                .from('favorites')
                .select('favorited_user_id')
                .eq('user_id', user.id);

            if (error) throw error;
            if (!favData || favData.length === 0) return [];

            const {data: profiles, error: profilesError} = await supabase
                .from('profiles')
                .select('*')
                .in('user_id', favData.map((f) => f.favorited_user_id));

            if (profilesError) throw profilesError;
            return profiles as Profile[];
        },
        enabled: !!user,
    });

    const {data: favoriteIds} = useQuery({
        queryKey: ['favorite-ids', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('favorites')
                .select('favorited_user_id')
                .eq('user_id', user.id);

            if (error) throw error;
            return data.map((f) => f.favorited_user_id);
        },
        enabled: !!user,
    });

    const toggleFavorite = useMutation({
        mutationFn: async (profileUserId: string) => {
            if (!user) throw new Error('Not authenticated');

            const isFavorited = favoriteIds?.includes(profileUserId);

            if (isFavorited) {
                const {error} = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('favorited_user_id', profileUserId);

                if (error) throw error;
                return {action: 'removed', profileUserId};
            } else {
                const {error} = await supabase
                    .from('favorites')
                    .insert({user_id: user.id, favorited_user_id: profileUserId});

                if (error) throw error;
                return {action: 'added', profileUserId};
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['favorites', user?.id]});
            queryClient.invalidateQueries({queryKey: ['favorite-ids', user?.id]});
            toast({
                title: result.action === 'added' ? 'Added to favorites' : 'Removed from favorites',
                description:
                    result.action === 'added'
                        ? 'Profile saved to your favorites'
                        : 'Profile removed from your favorites',
            });
        },
        onError: (error: Error) => {
            toast({title: 'Error', description: error.message, variant: 'destructive'});
        },
    });

    const isFavorite = (profileUserId: string) =>
        favoriteIds?.includes(profileUserId) || false;

    return {
        favorites: favorites || [],
        favoriteIds: favoriteIds || [],
        isLoading,
        toggleFavorite: toggleFavorite.mutate,
        isFavorite,
        isToggling: toggleFavorite.isPending,
    };
};


// ════════════════════════════════════════════════════════
// PRESENCE HOOK
// Source: src/hooks/usePresence.tsx
// ════════════════════════════════════════════════════════


interface PresenceState {
    [key: string]: {
        user_id: string;
        online_at: string;
        typing?: boolean;
    }[];
}

export const usePresence = (channelName?: string) => {
    const {user} = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    const effectiveChannel = channelName || 'global-presence';

    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel(effectiveChannel);

        channel
            .on('presence', {event: 'sync'}, () => {
                const state = channel.presenceState() as PresenceState;
                const users = Object.values(state)
                    .flat()
                    .filter((u) => u.user_id !== user.id);

                setOnlineUsers(users.map((u) => u.user_id));
                setTypingUsers(users.filter((u) => u.typing).map((u) => u.user_id));
            })
            .on('presence', {event: 'join'}, ({newPresences}) => {
                const newUserIds = newPresences
                    .filter((p: any) => p.user_id !== user.id)
                    .map((p: any) => p.user_id);

                setOnlineUsers((prev) => [...new Set([...prev, ...newUserIds])]);
            })
            .on('presence', {event: 'leave'}, ({leftPresences}) => {
                const leftUserIds = leftPresences.map((p: any) => p.user_id);
                setOnlineUsers((prev) => prev.filter((id) => !leftUserIds.includes(id)));
                setTypingUsers((prev) => prev.filter((id) => !leftUserIds.includes(id)));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        // Update profile online status
        supabase
            .from('profiles')
            .update({is_online: true, last_seen: new Date().toISOString()})
            .eq('user_id', user.id)
            .then();

        // Handle page visibility changes
        const handleVisibility = () => {
            if (document.hidden) {
                supabase
                    .from('profiles')
                    .update({is_online: false, last_seen: new Date().toISOString()})
                    .eq('user_id', user.id)
                    .then();
            } else {
                supabase
                    .from('profiles')
                    .update({is_online: true, last_seen: new Date().toISOString()})
                    .eq('user_id', user.id)
                    .then();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            supabase.removeChannel(channel);
        };
    }, [user, effectiveChannel]);

    const setTyping = async (isTyping: boolean) => {
        if (!user) return;

        const channel = supabase.channel(effectiveChannel);
        await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            typing: isTyping,
        });
    };

    return {
        onlineUsers,
        typingUsers,
        setTyping,
        isUserOnline: (userId: string) => onlineUsers.includes(userId),
        isUserTyping: (userId: string) => typingUsers.includes(userId),
    };
};

export const useGlobalPresence = () => {
    return usePresence('global-presence');
};

export const useConversationPresence = (conversationId: string) => {
    return usePresence(`conversation-${conversationId}`);
};


// ════════════════════════════════════════════════════════
// GOLD BUTTON
// Source: src/components/ui/GoldButton.tsx
// ════════════════════════════════════════════════════════

import {Loader2} from 'lucide-react';

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'outline';
    children: React.ReactNode;
}

const sizeMap = {
    sm: 'h-9 px-5 text-[10px]',
    md: 'h-12 px-8 text-[12px]',
    lg: 'h-14 px-10 text-[13px]',
};

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
    ({loading, size = 'md', variant = 'solid', children, className, disabled, ...props}, ref) => {
        const isOutline = variant === 'outline';

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex items-center justify-center gap-2.5',
                    'font-black tracking-[0.1em] uppercase',
                    'transition-all duration-150',
                    'active:scale-[0.96]',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    sizeMap[size],
                    isOutline
                        ? 'bg-transparent border border-[hsl(42_98%_56%_/_0.35)] text-[hsl(var(--gold))]'
                        : 'btn-gold',
                    className,
                )}
                style={
                    !isOutline
                        ? {
                            background: 'var(--gradient-gold)',
                            color: '#fff',
                            boxShadow: '0 4px 24px hsl(42 98% 56% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                        }
                        : undefined
                }
                {...props}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin"/>
                ) : (
                    children
                )}
            </button>
        );
    },
);

GoldButton.displayName = 'GoldButton';


// ════════════════════════════════════════════════════════
// EMPTY STATE
// Source: src/components/ui/EmptyState.tsx
// ════════════════════════════════════════════════════════

import {motion} from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({icon: Icon, title, description, actionLabel, onAction}: EmptyStateProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center mb-6 relative"
                animate={{scale: [1, 1.05, 1]}}
                transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
            >
                <Icon className="w-12 h-12 text-primary"/>
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
                     style={{animationDuration: '3s'}}/>
            </motion.div>

            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>

            {actionLabel && onAction && (
                <Button onClick={onAction} className="gradient-primary glow">
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
}


// ════════════════════════════════════════════════════════
// PROFILE CARD
// Source: src/components/ui/ProfileCard.tsx
// ════════════════════════════════════════════════════════


interface ProfileCardProps {
    id: string;
    displayName: string;
    photoUrl?: string;
    age?: number;
    distance?: string;
    isOnline?: boolean;
    isVerified?: boolean;
    isPremium?: boolean;
    availableNow?: boolean;
    onClick?: (id: string) => void;
    className?: string;
}

export function ProfileCard({
    id,
    displayName,
    photoUrl,
    age,
    distance,
    isOnline = false,
    isVerified = false,
    isPremium = false,
    availableNow = false,
    onClick,
    className,
}: ProfileCardProps) {
    return (
        <div
            onClick={() => onClick?.(id)}
            className={cn(
                'relative overflow-hidden cursor-pointer group',
                'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                'hover:scale-[1.03]',
                className,
            )}
            style={{
                background: 'hsl(var(--surface-1))',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'var(--shadow-card)',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(id);
                }
            }}
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                style={{
                    boxShadow: '0 0 30px hsl(42 98% 56% / 0.12), inset 0 0 0 1px hsl(42 98% 56% / 0.15)',
                }}
            />

            {/* Photo area — 4:5 ratio */}
            <div className="relative aspect-[4/5] overflow-hidden">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--surface-2)), hsl(var(--surface-3)))',
                        }}
                    >
                        <span
                            className="text-[36px] font-black opacity-20"
                            style={{color: 'hsl(var(--foreground))'}}
                        >
                            {displayName[0]?.toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Gradient overlay at bottom */}
                <div
                    className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, hsl(220 18% 2% / 0.92) 100%)',
                    }}
                />

                {/* Online indicator */}
                {isOnline && (
                    <div className="absolute top-3 right-3 z-20">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                background: 'hsl(var(--emerald))',
                                boxShadow: '0 0 8px hsl(160 72% 40% / 0.6)',
                            }}
                        />
                    </div>
                )}

                {/* Available Now badge */}
                {availableNow && (
                    <div
                        className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1"
                        style={{
                            background: 'hsl(0 92% 54%)',
                            boxShadow: '0 2px 12px hsl(0 92% 54% / 0.4)',
                        }}
                    >
                        <Radio className="w-2.5 h-2.5 text-white animate-pulse" strokeWidth={2.5}/>
                        <span className="text-[8px] font-black tracking-[0.15em] uppercase text-white">
                            RIGHT NOW
                        </span>
                    </div>
                )}

                {/* Name + info overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 p-4 z-20">
                    <div className="flex items-center gap-1.5 mb-1">
                        <h3
                            className="text-[15px] font-black tracking-[-0.01em] leading-tight text-white truncate"
                        >
                            {displayName}
                        </h3>
                        {isVerified && (
                            <BadgeCheck
                                className="w-4 h-4 shrink-0"
                                style={{color: 'hsl(var(--cyan))'}}
                                strokeWidth={2}
                            />
                        )}
                        {isPremium && <CrownBadge size="sm"/>}
                    </div>
                    <div className="flex items-center gap-2">
                        {age !== undefined && (
                            <span className="text-[11px] font-semibold text-white/60">
                                {age}
                            </span>
                        )}
                        {distance && (
                            <>
                                {age !== undefined && (
                                    <span className="w-0.5 h-0.5 rounded-full bg-white/30"/>
                                )}
                                <span className="text-[11px] font-semibold text-white/60">
                                    {distance}
                                </span>
                            </>
                        )}
                        {isOnline && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-white/30"/>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wider"
                                    style={{color: 'hsl(var(--emerald))'}}
                                >
                                    Online
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// PAGE HEADER
// Source: src/components/ui/PageHeader.tsx
// ════════════════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';

interface PageHeaderAction {
    icon: React.ElementType;
    onClick: () => void;
    label?: string;
    badge?: number;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Show back arrow — navigates to `backTo` or browser back */
    back?: boolean | string;
    /** Right-side action buttons */
    actions?: PageHeaderAction[];
    /** Inline search toggle */
    search?: { value: string; onChange: (v: string) => void; placeholder?: string };
    /** Show filter button */
    filter?: boolean | (() => void);
    /** Left-align title instead of center */
    leftAligned?: boolean;
    /** Extra className */
    className?: string;
    children?: React.ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    back,
    actions = [],
    search,
    filter,
    leftAligned = false,
    className,
    children,
}: PageHeaderProps) {
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        if (typeof back === 'string') {
            navigate(back);
        } else {
            navigate(-1);
        }
    }, [back, navigate]);

    const showBack = !!back;
    const showFilter = !!filter;

    return (
        <header
            className={cn(
                'sticky top-0 z-30 glass-nav',
                'flex flex-col justify-center',
                'px-4',
                'pt-[env(safe-area-inset-top,0px)]',
                'min-h-14',
                className,
            )}
        >
            <div className="flex items-center gap-3 h-14">
                {/* Left: Back button (44px touch target) */}
                {showBack ? (
                    <button
                        onClick={handleBack}
                        aria-label="Go back"
                        className={cn(
                            'flex items-center justify-center',
                            'w-11 h-11 -ml-2 shrink-0',
                            'rounded-full',
                            'text-muted-foreground hover:text-foreground',
                            'hover:bg-surface-2',
                            'transition-colors duration-120',
                            'active:scale-95',
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
                    </button>
                ) : (
                    /* Spacer when no back to keep title alignment consistent */
                    !leftAligned && <div className="w-9 shrink-0" />
                )}

                {/* Center / Left: Title + subtitle */}
                <div
                    className={cn(
                        'flex-1 min-w-0',
                        leftAligned ? 'text-left' : 'text-center',
                    )}
                >
                    <h1
                        className={cn(
                            'text-xl font-black tracking-tight leading-tight truncate',
                            'text-foreground',
                        )}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {showFilter && (
                        <button
                            onClick={typeof filter === 'function' ? filter : undefined}
                            aria-label="Filter"
                            className={cn(
                                'flex items-center justify-center',
                                'w-11 h-11 rounded-full',
                                'text-muted-foreground hover:text-foreground',
                                'hover:bg-surface-2',
                                'transition-colors duration-120',
                                'active:scale-95',
                            )}
                        >
                            <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
                        </button>
                    )}

                    {actions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={i}
                                onClick={action.onClick}
                                aria-label={action.label}
                                className={cn(
                                    'relative flex items-center justify-center',
                                    'w-11 h-11 rounded-full',
                                    'text-muted-foreground hover:text-foreground',
                                    'hover:bg-surface-2',
                                    'transition-colors duration-120',
                                    'active:scale-95',
                                )}
                            >
                                <Icon className="w-5 h-5" strokeWidth={2} />
                                {action.badge != null && action.badge > 0 && (
                                    <span
                                        className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            color: '#fff',
                                        }}
                                    >
                                        {action.badge > 99 ? '99+' : action.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Default search action if search prop exists */}
                    {search && !actions.some(a => a.icon === Search) && (
                        <button
                            aria-label="Search"
                            className={cn(
                                'flex items-center justify-center',
                                'w-11 h-11 rounded-full',
                                'text-muted-foreground hover:text-foreground',
                                'hover:bg-surface-2',
                                'transition-colors duration-120',
                                'active:scale-95',
                            )}
                        >
                            <Search className="w-5 h-5" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            {/* Optional inline search expansion */}
            <AnimatePresence>
                {search && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search.value}
                                    onChange={e => search.onChange(e.target.value)}
                                    placeholder={search.placeholder || 'Search…'}
                                    autoComplete="off"
                                    className={cn(
                                        'w-full h-11 pl-10 pr-4',
                                        'bg-surface-2 border border-border rounded-xl',
                                        'text-sm text-foreground placeholder:text-muted-foreground',
                                        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50',
                                        'transition-all duration-120',
                                    )}
                                />
                                {search.value && (
                                    <button
                                        onClick={() => search.onChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slot for children (e.g. FilterBar) */}
            {children}
        </header>
    );
}


// ════════════════════════════════════════════════════════
// BOTTOM NAV
// Source: src/components/ui/BottomNav.tsx
// ════════════════════════════════════════════════════════


const TABS = [
    {id: 'grid', path: '/app/grid', icon: Compass, key: 'nav.discover'},
    {id: 'right-now', path: '/app/right-now', icon: Radio, key: 'nav.nearby'},
    {id: 'messages', path: '/app/messages', icon: MessageCircle, key: 'nav.chats'},
    {id: 'events', path: '/app/events', icon: Sparkles, key: 'nav.party'},
    {id: 'profile', path: '/app/profile/me', icon: User, key: 'nav.me'},
];

function resolveActive(pathname: string): string {
    if (pathname.startsWith('/app/chat')) return 'messages';
    if (pathname.startsWith('/app/right-now')) return 'right-now';
    if (pathname.startsWith('/app/profile/me')) return 'profile';
    if (pathname.startsWith('/app/events') || pathname.startsWith('/app/chills') || pathname.startsWith('/app/house-parties')) return 'events';
    const match = TABS.find(t => pathname.startsWith(t.path));
    return match?.id || 'grid';
}

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const {unreadCount} = useNotifications();
    const {t} = useLocaleStore();
    const activeId = resolveActive(location.pathname);

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                height: 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px))',
                background: 'hsl(224 14% 4% / 0.9)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                borderTop: '1px solid hsl(224 8% 100% / 0.055)',
                /* Subtle top edge light */
                boxShadow: '0 -1px 0 hsl(0 0% 100% / 0.04), 0 -4px 16px hsl(0 0% 0% / 0.35)',
            }}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Active track — thin top line that slides */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{background: 'hsl(224 8% 100% / 0.06)'}}
            />

            <div
                className="flex items-stretch justify-around max-w-lg mx-auto px-2"
                style={{height: 'var(--nav-h, 56px)'}}
            >
                {TABS.map(tab => {
                    const isActive = activeId === tab.id;
                    const Icon = tab.icon;
                    const isRightNow = tab.id === 'right-now';

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            aria-label={t(tab.key)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'relative flex flex-col items-center justify-center flex-1 gap-[3px]',
                                'transition-colors duration-120 active:scale-[0.88]',
                                isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/35 hover:text-muted-foreground/70',
                            )}
                        >
                            {/* Active indicator — sharp 2px line from top */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-top-line"
                                    className="absolute top-0 w-4 h-[2px] rounded-b-full"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        boxShadow: '0 0 8px hsl(221 90% 60% / 0.6)',
                                    }}
                                    initial={{opacity: 0, scaleX: 0}}
                                    animate={{opacity: 1, scaleX: 1}}
                                    transition={{type: 'spring', stiffness: 700, damping: 45}}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative">
                                <motion.div
                                    animate={
                                        isActive
                                            ? {scale: 1.08, y: -0.5}
                                            : {scale: 1, y: 0}
                                    }
                                    transition={{type: 'spring', stiffness: 700, damping: 40}}
                                >
                                    <Icon
                                        style={{
                                            width: 24,
                                            height: 24,
                                            color: isActive ? 'hsl(var(--foreground))' : 'currentColor',
                                        }}
                                        strokeWidth={isActive ? 2.2 : 1.65}
                                    />
                                </motion.div>

                                {/* Unread badge */}
                                {tab.id === 'messages' && unreadCount > 0 && (
                                    <motion.span
                                        initial={{scale: 0, opacity: 0}}
                                        animate={{scale: 1, opacity: 1}}
                                        className="absolute -top-[5px] -right-[7px] min-w-[13px] h-[13px] rounded-sm flex items-center justify-center px-[3px]"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            fontSize: '7px',
                                            fontWeight: 900,
                                            color: '#fff',
                                            boxShadow: '0 0 6px hsl(221 90% 60% / 0.5)',
                                        }}
                                    >
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </motion.span>
                                )}

                                {/* Right Now live indicator */}
                                {isRightNow && (
                                    <span
                                        className="absolute -top-[2px] -right-[3px] w-[5px] h-[5px] rounded-full border border-background"
                                        style={{background: 'hsl(var(--emerald))'}}
                                    />
                                )}
                            </div>

                            {/* Label — only visible when active */}
                            <motion.span
                                animate={{opacity: isActive ? 1 : 0, y: isActive ? 0 : 1}}
                                transition={{duration: 0.12}}
                                className="text-[10px] font-bold tracking-wide leading-none pointer-events-none"
                            >
                                {t(tab.key)}
                            </motion.span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}


// ════════════════════════════════════════════════════════
// HOME PAGE
// Source: src/pages/HomePage.tsx
// ════════════════════════════════════════════════════════

import {
    ArrowRight,
    BadgeCheck,
    Brain,
    Calendar,
    Crown,
    Globe,
    Lock,
    MapPin,
    MessageCircle,
    Radio,
    Shield,
    Sparkles,
    Star,
    Trophy,
} from 'lucide-react';

// ── Animated counter ─────────────────────────────────────────
function Counter({end, duration = 1800, suffix = '', prefix = ''}: {
    end: number; duration?: number; suffix?: string; prefix?: string;
}) {
    const [n, setN] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, {once: true, margin: '-30px'});
    useEffect(() => {
        if (!inView) return;
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setN(Math.floor(e * end));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, end, duration]);
    const d = n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K`
            : n;
    return <span ref={ref} className="num-display">{prefix}{d}{suffix}</span>;
}

// ── Reveal wrapper ────────────────────────────────────────────
function Reveal({children, delay = 0, y = 28}: {
    children: React.ReactNode; delay?: number; y?: number;
}) {
    return (
        <motion.div
            initial={{opacity: 0, y}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-60px'}}
            transition={{delay, duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
        >
            {children}
        </motion.div>
    );
}

// ── Section divider ──────────────────────────────────────────
function SectionDivider({accent = 'primary'}: { accent?: string }) {
    return (
        <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px" style={{background: 'hsl(var(--border))'}}/>
            <div className="w-1 h-1 rotate-45" style={{background: `hsl(var(--${accent}))`}}/>
            <div className="flex-1 h-px" style={{background: 'hsl(var(--border))'}}/>
        </div>
    );
}

// ── Data ─────────────────────────────────────────────────────
const TICKER_ITEMS = [
    '520,000+ MEMBERS', '14,800 ACTIVE TODAY', 'AI-POWERED MATCHING',
    '230+ CITIES WORLDWIDE', 'REAL-TIME PROXIMITY', 'GDPR CERTIFIED',
    '4.9★ APP STORE', 'END-TO-END ENCRYPTED', 'FREE TO JOIN',
    'PHOTO VERIFIED PROFILES', 'ELITE EVENTS SYSTEM', 'LIVE AI COACH',
];

const FEATURES = [
    {
        id: 'ai',
        label: 'AI KING',
        title: 'Your Personal AI Wingman',
        desc: 'Openers that convert. Safety checks. Date planning. Real-time social coaching that learns your style and adapts to every interaction.',
        icon: Brain,
        accent: 'gold',
        size: 'large',
        stat: '3.2× more matches',
    },
    {
        id: 'now',
        label: 'RIGHT NOW',
        title: 'Real-Time Availability',
        desc: 'Signal you\'re available. See who\'s nearby and ready — with zero friction. The hook-up layer built for kings who don\'t wait.',
        icon: Radio,
        accent: 'red',
        size: 'small',
        stat: '< 4 min response',
    },
    {
        id: 'safe',
        label: 'VERIFIED SAFE',
        title: 'Trust Infrastructure',
        desc: 'Photo ID, behavioral scoring, community moderation. Safety isn\'t a feature here — it\'s the architecture.',
        icon: Shield,
        accent: 'emerald',
        size: 'small',
        stat: '99.4% report rate',
    },
    {
        id: 'chat',
        label: 'REAL-TIME CHAT',
        title: 'DMs, Rooms & Voice',
        desc: 'Group circles, event rooms, direct threads — reactions, voice notes, read receipts, AI quick replies. Communication that keeps up.',
        icon: MessageCircle,
        accent: 'royal',
        size: 'small',
        stat: '1.2s delivery',
    },
    {
        id: 'events',
        label: 'EVENTS & CIRCLES',
        title: 'Private Events Engine',
        desc: 'Host or attend — private parties, recurring meetups, house events. Analytics, ticketing, co-host workflows.',
        icon: Calendar,
        accent: 'violet',
        size: 'small',
        stat: '4,200+ events / mo',
    },
    {
        id: 'map',
        label: 'LIVE MAP',
        title: 'Precision Proximity',
        desc: 'Know who\'s near — on your terms. Full privacy toggles, fuzzy distance, opt-in visibility. Power without exposure.',
        icon: MapPin,
        accent: 'amber',
        size: 'small',
        stat: '±50m accuracy',
    },
    {
        id: 'albums',
        label: 'PRIVATE ALBUMS',
        title: 'Selective Photo Sharing',
        desc: 'Unlock access for specific users. Revoke instantly. Your content, your rules, enforced at infrastructure level.',
        icon: Lock,
        accent: 'rose',
        size: 'small',
        stat: 'Revoke anytime',
    },
    {
        id: 'rank',
        label: 'PROGRESSION',
        title: 'Elite Rank System',
        desc: 'Earn trust. Unlock platform power. From New to Elite — every rank carries real capability: wider reach, exclusive circles, priority placement.',
        icon: Trophy,
        accent: 'gold',
        size: 'large',
        stat: '6 rank tiers',
    },
];

const TIERS = [
    {
        id: 'free', name: 'FREE', price: '0', period: 'forever',
        desc: 'Full access to basics',
        accent: 'hsl(var(--muted-foreground))',
        features: ['Profile + photo gallery', 'Join public circles', 'Basic DMs', 'Standard discovery', 'Privacy controls'],
        cta: 'Start Free', popular: false,
    },
    {
        id: 'plus', name: 'PLUS', price: '9', period: '/mo',
        desc: 'Remove all limits',
        accent: 'hsl(var(--primary))',
        features: ['Expanded filters', 'Unlimited interactions', 'AI match recommendations', 'See compatibility scores', 'Travel mode', 'Priority inbox'],
        cta: 'Go Plus', popular: false,
    },
    {
        id: 'pro', name: 'PRO', price: '24', period: '/mo',
        desc: 'Operate like a host',
        accent: 'hsl(var(--cyan))',
        features: ['Everything in Plus', 'AI event drafting', 'Host analytics dashboard', 'Co-host workflows', 'Attendee segmentation', 'Premium circles'],
        cta: 'Go Pro', popular: true,
    },
    {
        id: 'elite', name: 'ELITE', price: '69', period: '/mo',
        desc: 'Exclusive access tier',
        accent: 'hsl(var(--gold))',
        features: ['Priority placement', 'Elite-only circles', 'White-glove events', 'Dedicated support', 'Premium safety', 'Early access'],
        cta: 'Go Elite', popular: false,
    },
];

const QUOTES = [
    {
        text: 'This is what the community deserves. Premium design, real people, fast matching. Finally an app that doesn\'t feel cheap.',
        name: 'Kai T.',
        city: 'London',
        level: 'PRO MEMBER',
        stars: 5
    },
    {
        text: 'AI King writes better openers than me. Booked a coffee date within 20 minutes of signing up. The intelligence layer is genuinely insane.',
        name: 'Dev M.',
        city: 'New York',
        level: 'ELITE HOST',
        stars: 5
    },
];

// ── MAIN ─────────────────────────────────────────────────────
export default function HomePage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const {scrollY} = useScroll({container: containerRef});
    const heroY = useTransform(scrollY, [0, 600], [0, -60]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.25]);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);

    return (
        <div
            ref={containerRef}
            className="text-foreground overflow-x-hidden overflow-y-auto"
            style={{background: 'hsl(var(--background))', minHeight: '100%', height: '100%'}}
        >

            {/* ════ NAV ════ */}
            <header
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 md:px-10"
                style={{
                    height: 60,
                    background: 'hsl(220 18% 2% / 0.85)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    borderBottom: '1px solid hsl(220 12% 100% / 0.055)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 flex items-center justify-center"
                        style={{background: 'var(--gradient-red)', boxShadow: '0 0 14px hsl(0 92% 54% / 0.45)'}}
                    >
                        <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.2}/>
                    </div>
                    <div>
                        <span className="text-[13px] font-black tracking-[-0.02em] leading-none">FIND YOUR KING</span>
                        <span
                            className="block text-[7px] font-black tracking-[0.22em] uppercase mt-0.5"
                            style={{color: 'hsl(var(--primary))'}}
                        >by FIND YOUR KING</span>
                    </div>
                </div>

                {/* Nav links — desktop */}
                <nav className="hidden md:flex items-center gap-6">
                    {['Features', 'Pricing', 'Safety', 'Events'].map(l => (
                        <button
                            key={l}
                            className="text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors duration-120 tracking-wide"
                        >{l}</button>
                    ))}
                </nav>

                {/* CTAs */}
                <div className="flex items-center gap-2.5">
                    <Link to="/connect">
                        <button
                            className="hidden sm:block text-[11px] font-black tracking-[0.1em] uppercase px-4 h-8 text-muted-foreground hover:text-foreground transition-colors duration-120">
                            Sign In
                        </button>
                    </Link>
                    <Link to="/connect?mode=register">
                        <button
                            className="text-[11px] font-black tracking-[0.1em] uppercase px-5 h-8 transition-all duration-120 active:scale-[0.97]"
                            style={{
                                background: 'var(--gradient-red)',
                                color: '#fff',
                                boxShadow: '0 2px 14px hsl(0 92% 54% / 0.35)',
                            }}
                        >
                            Join Free
                        </button>
                    </Link>
                </div>
            </header>

            {/* ════ HERO ════ */}
            <section
                ref={heroRef}
                className="relative flex flex-col justify-end overflow-hidden grain-overlay"
                style={{minHeight: '100svh', paddingTop: 60, position: 'relative'}}
            >
                {/* Deep nebula background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                radial-gradient(ellipse 100% 70% at 5% 0%, hsl(0 92% 54% / 0.11) 0%, transparent 55%),
                radial-gradient(ellipse 80% 60% at 95% 100%, hsl(42 98% 56% / 0.08) 0%, transparent 55%),
                radial-gradient(ellipse 50% 80% at 50% 50%, hsl(214 85% 58% / 0.04) 0%, transparent 65%)
              `,
                        }}
                    />
                    {/* Fine dot grid */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.08) 1px, transparent 1px)`,
                            backgroundSize: '32px 32px',
                            opacity: 0.4,
                        }}
                    />
                    {/* Left crimson stripe */}
                    <div
                        className="absolute top-0 left-0 bottom-0 w-[3px]"
                        style={{
                            background: 'linear-gradient(180deg, transparent 0%, hsl(0 92% 54%) 30%, hsl(0 92% 54%) 70%, transparent 100%)',
                            opacity: 0.7,
                        }}
                    />
                </div>

                {/* Hero content */}
                <motion.div
                    style={{y: heroY, opacity: heroOpacity}}
                    className="relative z-10 px-6 sm:px-10 md:px-14 lg:px-20 pb-16 md:pb-24"
                >
                    {/* Overline eyebrow */}
                    <motion.div
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                        className="flex items-center gap-3 mb-8"
                    >
            <span
                className="w-[6px] h-[6px] rounded-full relative"
                style={{background: 'hsl(var(--destructive))'}}
            >
              <span
                  className="absolute inset-0 rounded-full animate-ping opacity-75"
                  style={{background: 'hsl(var(--destructive))'}}
              />
            </span>
                        <span
                            className="text-[9px] font-black tracking-[0.3em] uppercase"
                            style={{color: 'hsl(var(--destructive))'}}
                        >520,000+ Kings Worldwide · Live Now</span>
                    </motion.div>

                    {/* Main headline — EDITORIAL SCALE */}
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.18, duration: 0.7}}
                    >
                        <h1 className="text-mega mb-0">
                            <motion.span
                                initial={{opacity: 0, x: -30}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                className="block"
                            >FIND
                            </motion.span>
                            <motion.span
                                initial={{opacity: 0, x: -30}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.28, duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                className="block"
                                style={{
                                    WebkitTextStroke: '1px hsl(var(--foreground))',
                                    WebkitTextFillColor: 'transparent',
                                    textStroke: '1px hsl(var(--foreground))',
                                }}
                            >YOUR
                            </motion.span>
                            <motion.span
                                initial={{opacity: 0, x: -30}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.36, duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                className="block text-gradient"
                                style={{fontSize: 'clamp(64px, 14vw, 158px)'}}
                            >KING.
                            </motion.span>
                        </h1>
                    </motion.div>

                    {/* Horizontal rule + subtext */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.5, duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
                        className="mt-10 max-w-xl"
                    >
                        <div
                            className="w-16 h-[2px] mb-6"
                            style={{background: 'hsl(var(--destructive))'}}
                        />
                        <p
                            className="text-[15px] leading-relaxed mb-10 max-w-[500px]"
                            style={{color: 'hsl(var(--muted-foreground))'}}
                        >
                            The premium gay social platform built for men who know what they want.
                            Real connections. Live events. AI-powered intelligence. Enterprise-grade privacy.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-3 mb-10">
                            <Link to="/connect?mode=register">
                                <GoldButton size="lg">
                                    <Crown className="w-4 h-4" strokeWidth={2}/> Claim Your Throne
                                </GoldButton>
                            </Link>
                            <Link to="/connect">
                                <button
                                    className="flex items-center gap-2.5 px-8 h-12 text-[12px] font-black tracking-[0.1em] uppercase transition-all duration-120"
                                    style={{
                                        color: 'hsl(var(--foreground))',
                                        border: '1px solid hsl(var(--border-strong))',
                                    }}
                                >
                                    Sign In <ArrowRight className="w-3.5 h-3.5"/>
                                </button>
                            </Link>
                        </div>

                        {/* Trust chips */}
                        <div className="flex flex-wrap items-center gap-4">
                            {['GDPR', 'SSL 256-bit', '18+ Only', '4.9★ App Store'].map((t) => (
                                <div key={t} className="flex items-center gap-1.5">
                                    <BadgeCheck className="w-3 h-3 shrink-0" style={{color: 'hsl(var(--emerald))'}}/>
                                    <span
                                        className="text-[10px] font-semibold text-muted-foreground/70 tracking-wide">{t}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Stat column — bottom right */}
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.7, duration: 0.6}}
                    className="absolute bottom-10 right-6 sm:right-10 md:right-14 lg:right-20 z-10 flex flex-col items-end gap-6 hidden sm:flex"
                >
                    {[
                        {n: 520000, s: '+', label: 'Members', color: 'hsl(var(--primary))'},
                        {n: 14800, s: '+', label: 'Active Today', color: 'hsl(var(--cyan))'},
                        {n: 230, s: '+', label: 'Cities', color: 'hsl(var(--muted-foreground))'},
                    ].map(({n, s, label, color}) => (
                        <div key={label} className="text-right">
                            <div className="text-[28px] font-black leading-none num-display" style={{color}}>
                                <Counter end={n} suffix={s}/>
                            </div>
                            <div
                                className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground/50 mt-1">{label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 1.1, duration: 0.6}}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
                >
                    <div
                        className="w-[1px] h-8 overflow-hidden"
                        style={{background: 'hsl(var(--border))'}}
                    >
                        <motion.div
                            className="w-full h-4"
                            style={{background: 'hsl(var(--primary))'}}
                            animate={{y: ['-100%', '200%']}}
                            transition={{duration: 1.4, repeat: Infinity, ease: 'easeInOut'}}
                        />
                    </div>
                    <span
                        className="text-[7px] font-black tracking-[0.3em] uppercase text-muted-foreground/30">Scroll</span>
                </motion.div>
            </section>

            {/* ════ TICKER MARQUEE ════ */}
            <div
                className="overflow-hidden py-4 relative"
                style={{
                    background: 'hsl(var(--destructive))',
                    borderTop: '1px solid hsl(0 0% 0% / 0.2)',
                    borderBottom: '1px solid hsl(0 0% 0% / 0.2)',
                }}
            >
                <div className="marquee-track whitespace-nowrap" aria-hidden>
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i}
                              className="inline-flex items-center gap-4 px-6 text-[10px] font-black tracking-[0.22em] uppercase text-white">
              {item}
                            <span className="w-1 h-1 bg-white/40 rotate-45 inline-block"/>
            </span>
                    ))}
                </div>
            </div>

            {/* ════ MANIFESTO ════ */}
            <section className="py-28 px-6 sm:px-10 md:px-14 lg:px-20 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: 'radial-gradient(ellipse 70% 60% at 80% 50%, hsl(42 98% 56% / 0.04) 0%, transparent 65%)'}}
                />
                <div className="max-w-5xl">
                    <Reveal>
                        <p className="eyebrow mb-6">PLATFORM MANIFESTO</p>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <h2
                            className="font-black leading-[0.92] tracking-[-0.04em] mb-8"
                            style={{fontSize: 'clamp(32px, 6vw, 72px)'}}
                        >
                            Built for men who refuse{' '}
                            <span
                                className="italic font-light"
                                style={{
                                    WebkitTextStroke: '1px hsl(var(--foreground) / 0.5)',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >to settle</span>{' '}
                            for average.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.14}>
                        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl mb-10">
                            Every feature is engineered around one truth: you deserve a platform as premium as
                            the life you live. AI-powered. Safety-first. Designed with the intelligence, privacy,
                            and aesthetic that the community has always deserved — and never had.
                        </p>
                    </Reveal>

                    {/* Horizontal stat row */}
                    <Reveal delay={0.2}>
                        <div
                            className="grid grid-cols-2 md:grid-cols-4 border-t border-b"
                            style={{borderColor: 'hsl(var(--border))'}}
                        >
                            {[
                                {n: 520000, s: '+', l: 'Members', c: 'hsl(var(--primary))'},
                                {n: 14800, s: '+', l: 'Daily Active', c: 'hsl(var(--cyan))'},
                                {n: 98, s: '%', l: 'Satisfaction', c: 'hsl(var(--emerald))'},
                                {n: 230, s: '+', l: 'Cities', c: 'hsl(var(--gold))'},
                            ].map(({n, s, l, c}, i) => (
                                <div
                                    key={l}
                                    className="py-8 px-6 flex flex-col gap-1"
                                    style={{
                                        borderRight: i < 3 ? '1px solid hsl(var(--border))' : 'none',
                                        background: i % 2 === 0 ? 'transparent' : 'hsl(var(--surface-1) / 0.4)',
                                    }}
                                >
                                    <div className="text-[36px] font-black tracking-[-0.04em] num-display"
                                         style={{color: c}}>
                                        <Counter end={n} suffix={s}/>
                                    </div>
                                    <div
                                        className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60">{l}</div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ════ FEATURES BENTO ════ */}
            <section className="py-24 px-6 sm:px-10 md:px-14 lg:px-20 relative">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: 'radial-gradient(ellipse 60% 50% at 15% 60%, hsl(214 85% 58% / 0.05) 0%, transparent 60%)'}}
                />
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <div className="mb-16">
                            <p className="eyebrow mb-5">PLATFORM CAPABILITIES</p>
                            <div className="flex items-end justify-between gap-8 flex-wrap">
                                <h2
                                    className="font-black leading-[0.93] tracking-[-0.04em]"
                                    style={{fontSize: 'clamp(28px, 5vw, 58px)'}}
                                >
                                    Nine reasons this is<br/>
                                    <span className="text-gradient">the only app you need.</span>
                                </h2>
                                <Link to="/connect?mode=register">
                                    <button
                                        className="hidden md:flex items-center gap-2 text-[11px] font-black tracking-[0.1em] uppercase px-6 h-10 transition-all duration-120 shrink-0"
                                        style={{
                                            border: '1px solid hsl(var(--border-strong))',
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    >
                                        See All Features <ArrowRight className="w-3 h-3"/>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </Reveal>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
                         style={{background: 'hsl(var(--border))'}}>
                        {FEATURES.map((feat, i) => {
                            const Icon = feat.icon;
                            const accentColor = `hsl(var(--${feat.accent}))`;
                            const isLarge = feat.size === 'large';

                            return (
                                <motion.div
                                    key={feat.id}
                                    initial={{opacity: 0, y: 20}}
                                    whileInView={{opacity: 1, y: 0}}
                                    viewport={{once: true, margin: '-40px'}}
                                    transition={{delay: (i % 3) * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                                    onHoverStart={() => setActiveFeature(feat.id)}
                                    onHoverEnd={() => setActiveFeature(null)}
                                    className={`relative group cursor-default p-8 overflow-hidden card-luxury ${
                                        isLarge ? 'lg:col-span-2 md:col-span-2' : ''
                                    }`}
                                    style={{
                                        background: activeFeature === feat.id
                                            ? `hsl(var(--surface-2))`
                                            : 'hsl(var(--surface-0))',
                                    }}
                                >
                                    {/* Top accent line on hover */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                                        style={{background: `linear-gradient(90deg, ${accentColor}, transparent)`}}
                                    />
                                    {/* Number watermark */}
                                    <div
                                        className="absolute bottom-6 right-6 text-[52px] font-black leading-none tracking-[-0.04em] opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300 select-none"
                                        style={{color: accentColor}}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className="w-10 h-10 flex items-center justify-center mb-6"
                                        style={{
                                            background: `hsl(var(--${feat.accent}) / 0.08)`,
                                            border: `1px solid hsl(var(--${feat.accent}) / 0.2)`,
                                        }}
                                    >
                                        <Icon className="w-4 h-4" style={{color: accentColor}} strokeWidth={1.8}/>
                                    </div>

                                    {/* Label */}
                                    <p
                                        className="text-[8px] font-black tracking-[0.26em] uppercase mb-2"
                                        style={{color: accentColor}}
                                    >{feat.label}</p>

                                    {/* Title */}
                                    <h3 className="text-[15px] font-black tracking-[-0.02em] mb-3 leading-tight">{feat.title}</h3>

                                    {/* Desc */}
                                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-5">{feat.desc}</p>

                                    {/* Stat pill */}
                                    <div
                                        className="inline-flex items-center gap-1.5 px-3 py-1"
                                        style={{
                                            background: `hsl(var(--${feat.accent}) / 0.07)`,
                                            border: `1px solid hsl(var(--${feat.accent}) / 0.15)`,
                                        }}
                                    >
                                        <div className="w-1 h-1 rounded-full" style={{background: accentColor}}/>
                                        <span className="text-[9px] font-black tracking-[0.12em] uppercase"
                                              style={{color: accentColor}}>
                      {feat.stat}
                    </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ════ HOW IT WORKS ════ */}
            <section
                className="py-24 px-6 sm:px-10 md:px-14 lg:px-20 relative overflow-hidden"
                style={{background: 'hsl(var(--surface-1))'}}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: 'radial-gradient(ellipse 60% 50% at 90% 20%, hsl(0 92% 54% / 0.06) 0%, transparent 60%)'}}
                />
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <p className="eyebrow mb-5">GETTING STARTED</p>
                        <h2
                            className="font-black leading-[0.93] tracking-[-0.04em] mb-16"
                            style={{fontSize: 'clamp(28px, 5vw, 58px)'}}
                        >
                            Up and running<br/>
                            <span className="text-gradient">in three steps.</span>
                        </h2>
                    </Reveal>

                    <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-px"
                        style={{background: 'hsl(var(--border))'}}
                    >
                        {[
                            {
                                n: '01', label: 'CREATE', title: 'Build your profile',
                                desc: 'Sign up in 60 seconds. Upload photos, set your preferences, choose your tribes. Your identity, your rules.',
                                accent: 'hsl(var(--primary))',
                            },
                            {
                                n: '02', label: 'DISCOVER', title: 'Find your people',
                                desc: 'Browse nearby kings, join live events, activate Right Now mode. AI matches you based on behavior, not just photos.',
                                accent: 'hsl(var(--cyan))',
                            },
                            {
                                n: '03', label: 'CONNECT', title: 'Make it happen',
                                desc: 'Send a message, RSVP to an event, drop a pin. AI King helps you craft the perfect opener. The rest is chemistry.',
                                accent: 'hsl(var(--gold))',
                            },
                        ].map(({n, label, title, desc, accent}, i) => (
                            <Reveal key={n} delay={i * 0.1}>
                                <div
                                    className="relative p-8 md:p-10 h-full"
                                    style={{background: 'hsl(var(--surface-0))'}}
                                >
                                    <div
                                        className="text-[72px] font-black leading-none tracking-[-0.05em] mb-6 opacity-[0.07]"
                                        style={{color: accent}}
                                    >{n}</div>
                                    <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-3"
                                       style={{color: accent}}>{label}</p>
                                    <h3 className="text-[16px] font-black tracking-[-0.02em] mb-4">{title}</h3>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>

                                    <div className="absolute top-8 right-8">
                                        <div className="w-2 h-2" style={{background: accent, opacity: 0.4}}/>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={0.3}>
                        <div className="mt-10 text-center">
                            <Link to="/connect?mode=register">
                                <button
                                    className="inline-flex items-center gap-2.5 px-10 h-12 text-[12px] font-black tracking-[0.12em] uppercase transition-all duration-120 active:scale-[0.97]"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        color: 'hsl(var(--background))',
                                        boxShadow: '0 4px 24px hsl(42 98% 56% / 0.35)',
                                    }}
                                >
                                    <Sparkles className="w-4 h-4" strokeWidth={2}/> Start For Free
                                </button>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ════ MEMBERSHIP TIERS ════ */}
            <section className="py-24 px-6 sm:px-10 md:px-14 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <p className="eyebrow mb-5">MEMBERSHIP</p>
                        <div className="flex items-end justify-between gap-8 flex-wrap mb-14">
                            <h2
                                className="font-black leading-[0.93] tracking-[-0.04em]"
                                style={{fontSize: 'clamp(28px, 5vw, 58px)'}}
                            >
                                Choose your<br/>
                                <span className="text-gradient-king">level of access.</span>
                            </h2>
                            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
                                Start free. Upgrade when you're ready to dominate. Cancel anytime, no questions asked.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
                         style={{background: 'hsl(var(--border))'}}>
                        {TIERS.map((tier, i) => (
                            <motion.div
                                key={tier.id}
                                initial={{opacity: 0, y: 20}}
                                whileInView={{opacity: 1, y: 0}}
                                viewport={{once: true}}
                                transition={{delay: i * 0.07, duration: 0.45}}
                                className="relative flex flex-col"
                                style={{background: tier.popular ? 'hsl(var(--surface-2))' : 'hsl(var(--surface-0))'}}
                            >
                                {/* Popular top bar */}
                                {tier.popular && (
                                    <div
                                        className="absolute top-0 left-0 right-0 h-[2px]"
                                        style={{background: `linear-gradient(90deg, transparent 5%, ${tier.accent}, transparent 95%)`}}
                                    />
                                )}
                                {tier.popular && (
                                    <div
                                        className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-full px-3 py-[3px] text-[8px] font-black tracking-[0.18em] uppercase"
                                        style={{background: tier.accent, color: 'hsl(var(--background))'}}
                                    >
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="p-7 flex-1">
                                    <div className="flex items-center justify-between mb-5">
                                        <span className="text-[8px] font-black tracking-[0.24em] uppercase"
                                              style={{color: tier.accent}}>{tier.name}</span>
                                        <div className="w-1 h-1 rotate-45"
                                             style={{background: tier.accent, opacity: 0.5}}/>
                                    </div>
                                    <div className="mb-1">
                                        <span className="text-[11px] font-semibold text-muted-foreground">$</span>
                                        <span
                                            className="text-[40px] font-black leading-none tracking-[-0.04em] num-display">{tier.price}</span>
                                        <span className="text-[11px] text-muted-foreground">{tier.period}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mb-6">{tier.desc}</p>

                                    <ul className="space-y-2.5 mb-6">
                                        {tier.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2">
                                                <div className="w-3.5 h-3.5 mt-px shrink-0"
                                                     style={{color: tier.accent}}>
                                                    <BadgeCheck className="w-3.5 h-3.5"/>
                                                </div>
                                                <span
                                                    className="text-[11px] text-foreground/70 leading-tight">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-5 pt-0">
                                    <Link to="/connect?mode=register">
                                        <button
                                            className="w-full py-3 text-[11px] font-black tracking-[0.12em] uppercase transition-all duration-120 active:scale-[0.97]"
                                            style={{
                                                background: tier.popular ? tier.accent : 'transparent',
                                                color: tier.popular ? 'hsl(var(--background))' : tier.accent,
                                                border: `1px solid ${tier.accent.replace(')', ' / 0.35)')}`,
                                            }}
                                        >
                                            {tier.cta} →
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════ SOCIAL PROOF ════ */}
            <section
                className="py-24 px-6 sm:px-10 md:px-14 lg:px-20"
                style={{background: 'hsl(var(--surface-1))'}}
            >
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <p className="eyebrow mb-14">WHAT KINGS SAY</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{background: 'hsl(var(--border))'}}>
                        {QUOTES.map((q, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="p-10 md:p-12" style={{background: 'hsl(var(--surface-0))'}}>
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-8">
                                        {Array.from({length: q.stars}).map((_, si) => (
                                            <Star
                                                key={si}
                                                className="w-3.5 h-3.5 fill-current"
                                                style={{color: 'hsl(var(--primary))'}}
                                            />
                                        ))}
                                    </div>

                                    {/* Pull quote */}
                                    <div
                                        className="text-[11px] font-black text-muted-foreground/30 mb-4 select-none"
                                        style={{fontSize: 48, lineHeight: 0.8, fontFamily: 'Georgia, serif'}}
                                    >"
                                    </div>
                                    <blockquote
                                        className="font-semibold leading-[1.4] tracking-[-0.01em] mb-8"
                                        style={{
                                            fontSize: 'clamp(14px, 2vw, 18px)',
                                            color: 'hsl(var(--foreground) / 0.9)'
                                        }}
                                    >
                                        {q.text}
                                    </blockquote>

                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 flex items-center justify-center text-[11px] font-black"
                                            style={{
                                                background: i === 0 ? 'var(--gradient-primary)' : 'var(--gradient-royal)',
                                                color: '#fff',
                                            }}
                                        >
                                            {q.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black tracking-[-0.01em]">{q.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{q.city} · <span
                                                style={{color: 'hsl(var(--primary))'}}>{q.level}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════ FINAL CTA ════ */}
            <section
                className="relative overflow-hidden py-32 px-6 sm:px-10 md:px-14 lg:px-20 text-center"
                style={{background: 'hsl(0 80% 8%)'}}
            >
                {/* Ambient glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, hsl(0 92% 54% / 0.25) 0%, transparent 65%),
              radial-gradient(ellipse 60% 40% at 50% 100%, hsl(42 98% 56% / 0.12) 0%, transparent 60%)
            `,
                    }}
                />
                {/* Fine grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(hsl(0 92% 54%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 92% 54%) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                    }}
                />

                <Reveal>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <p
                            className="text-[9px] font-black tracking-[0.35em] uppercase mb-8"
                            style={{color: 'hsl(0 92% 54% / 0.7)'}}
                        >Your Kingdom Awaits</p>

                        <h2
                            className="font-black leading-[0.88] tracking-[-0.055em] mb-8"
                            style={{
                                fontSize: 'clamp(44px, 10vw, 110px)',
                                color: '#fff',
                            }}
                        >
                            YOUR THRONE<br/>
                            <span
                                style={{
                                    WebkitTextStroke: '1px hsl(0 0% 100% / 0.35)',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >IS WAITING.</span>
                        </h2>

                        <p
                            className="text-[14px] leading-relaxed mb-12 max-w-lg mx-auto"
                            style={{color: 'hsl(0 0% 100% / 0.5)'}}
                        >
                            Join 520,000+ kings building real connections every day.
                            Free forever. Upgrade when you're ready to rule.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                            <Link to="/connect?mode=register">
                                <button
                                    className="inline-flex items-center gap-2.5 px-12 h-14 text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-120 active:scale-[0.97]"
                                    style={{
                                        background: 'hsl(var(--destructive))',
                                        color: '#fff',
                                        boxShadow: '0 4px 40px hsl(0 92% 54% / 0.6), 0 1px 0 hsl(0 0% 100% / 0.15) inset',
                                    }}
                                >
                                    <Crown className="w-4 h-4" strokeWidth={2.2}/> Create Free Account
                                </button>
                            </Link>
                            <Link to="/connect">
                                <button
                                    className="inline-flex items-center gap-2.5 px-12 h-14 text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-120"
                                    style={{
                                        background: 'transparent',
                                        color: 'hsl(0 0% 100% / 0.65)',
                                        border: '1px solid hsl(0 0% 100% / 0.15)',
                                    }}
                                >
                                    Sign In <ArrowRight className="w-3.5 h-3.5"/>
                                </button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {[
                                {icon: Lock, label: 'End-to-End Encrypted'},
                                {icon: Shield, label: 'GDPR Compliant'},
                                {icon: BadgeCheck, label: '18+ Platform'},
                                {icon: Globe, label: '230+ Cities'},
                            ].map(({icon: Icon, label}) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <Icon className="w-3 h-3" style={{color: 'hsl(0 0% 100% / 0.3)'}}
                                          strokeWidth={1.5}/>
                                    <span className="text-[10px] font-semibold"
                                          style={{color: 'hsl(0 0% 100% / 0.35)'}}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ════ FOOTER ════ */}
            <footer
                className="py-12 px-6 sm:px-10 md:px-14 lg:px-20"
                style={{
                    background: 'hsl(var(--surface-0))',
                    borderTop: '1px solid hsl(var(--border))',
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div
                                    className="w-7 h-7 flex items-center justify-center"
                                    style={{
                                        background: 'var(--gradient-red)',
                                        boxShadow: '0 0 12px hsl(0 92% 54% / 0.4)'
                                    }}
                                >
                                    <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.2}/>
                                </div>
                                <div>
                                    <p className="text-[12px] font-black tracking-[-0.01em]">FIND YOUR KING</p>
                                    <p className="text-[7px] font-black tracking-[0.22em] uppercase text-muted-foreground mt-0.5">by
                                        FIND YOUR KING</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground max-w-[220px] leading-relaxed">
                                The premium gay social platform. Real connections, live events, enterprise-grade
                                privacy.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {[
                                {
                                    heading: 'Platform',
                                    links: [{label: 'Features', href: '#'}, {
                                        label: 'Pricing',
                                        href: '#'
                                    }, {label: 'Safety', href: '#'}, {label: 'Events', href: '#'}]
                                },
                                {
                                    heading: 'Legal',
                                    links: [{label: 'Privacy', href: '/legal/privacy'}, {
                                        label: 'Terms',
                                        href: '/legal/terms'
                                    }, {label: 'Cookies', href: '/legal/cookies'}, {
                                        label: 'Community',
                                        href: '/legal/community-guidelines'
                                    }]
                                },
                                {
                                    heading: 'Company',
                                    links: [{label: 'About', href: '#'}, {label: 'Blog', href: '#'}, {
                                        label: 'Press',
                                        href: '#'
                                    }, {label: 'Contact', href: '#'}]
                                },
                            ].map(({heading, links}) => (
                                <div key={heading}>
                                    <p className="text-[9px] font-black tracking-[0.22em] uppercase text-muted-foreground/50 mb-3">{heading}</p>
                                    <ul className="space-y-2.5">
                                        {links.map(({label, href}) => (
                                            <li key={label}>
                                                <Link to={href}
                                                      className="text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors duration-120">
                                                    {label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
                        style={{borderTop: '1px solid hsl(var(--border) / 0.5)'}}
                    >
                        <p className="text-[10px] text-muted-foreground/40">© 2026 FIND YOUR KING · Find Your King · All rights
                            reserved</p>
                        <div
                            className="px-3 py-1 text-[9px] font-black tracking-[0.14em] uppercase"
                            style={{color: 'hsl(var(--rose))', border: '1px solid hsl(var(--rose) / 0.25)'}}
                        >18+ ONLY
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// CONNECT PAGE
// Source: src/pages/ConnectPage.tsx
// ════════════════════════════════════════════════════════

import {
    ArrowRight,
    BadgeCheck,
    Brain,
    Crown,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Radio,
    Shield,
    Sparkles,
    Trophy,
    Zap,
    SkipForward,
} from 'lucide-react';

// ── Brand panel perks ───────────────────────────────────────────
const PERKS = [
    {icon: Brain, label: 'AI King', desc: 'Your personal AI wingman'},
    {icon: Radio, label: 'Right Now', desc: 'Real-time nearby availability'},
    {icon: Trophy, label: 'Elite Circles', desc: 'Trust-based progression'},
    {icon: Shield, label: 'Verified & Safe', desc: 'Photo ID + community trust'},
];

// ── Main ────────────────────────────────────────────────────────
const ConnectPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isRegisterMode = searchParams.get('mode') === 'register';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(isRegisterMode);
    const [isMagicLink, setIsMagicLink] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const {toast} = useToast();

    const handleSkipAuth = () => {
        toast({
            title: 'Skipped Authentication',
            description: 'Continuing without sign in.',
        });
        navigate('/app/grid');
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const {error} = await supabase.auth.signInWithOtp({
                email,
                options: {emailRedirectTo: `${window.location.origin}/auth/callback`},
            });
            if (error) throw error;
            setMagicLinkSent(true);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({title: 'Error', description: errorMessage, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isMagicLink) return handleMagicLink(e);
        setIsLoading(true);
        try {
            if (isRegister) {
                if (password !== confirmPassword) {
                    toast({title: "Passwords don't match", variant: 'destructive'});
                    return;
                }

                const {error} = await supabase.auth.signUp({
                    email,
                    password,
                    options: {emailRedirectTo: `${window.location.origin}/auth/callback`},
                });
                if (error) throw error;
                toast({title: 'Welcome to the kingdom!', description: 'Check your email to verify your account.'});
            } else {

                const {error} = await supabase.auth.signInWithPassword({email, password});
                if (error) throw error;
                toast({title: 'Welcome back, King!'});
                window.location.href = '/app';
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({title: 'Error', description: errorMessage, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    // ── Magic link sent state ──
    if (magicLinkSent) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{background: 'hsl(var(--background))'}}
            >
                <motion.div
                    initial={{opacity: 0, scale: 0.95}}
                    animate={{opacity: 1, scale: 1}}
                    className="max-w-md w-full text-center"
                >
                    <div
                        className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
                        style={{background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)'}}
                    >
                        <Sparkles className="w-7 h-7 text-white"/>
                    </div>
                    <h1 className="text-[28px] font-black tracking-[-0.03em] mb-3">CHECK YOUR INBOX</h1>
                    <p className="text-muted-foreground mb-8 text-[14px] leading-relaxed">
                        We sent a magic link to <strong className="text-foreground">{email}</strong>.
                        Click it to sign in instantly — no password needed.
                    </p>
                    <button
                        onClick={() => {
                            setMagicLinkSent(false);
                            setEmail('');
                        }}
                        className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Use a different email
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* ── Left: Brand Panel ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] shrink-0 relative overflow-hidden p-10 xl:p-12"
                style={{
                    background: 'hsl(var(--surface-1))',
                    borderRight: '1px solid hsl(var(--border))',
                }}
            >
                {/* Ambient nebula */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, hsl(214 100% 58% / 0.1) 0%, transparent 65%),
              radial-gradient(ellipse 60% 40% at 80% 80%, hsl(188 100% 50% / 0.07) 0%, transparent 60%)
            `,
                    }}
                />
                {/* Grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Top: Logo */}
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2.5 mb-16">
                        <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 0 20px hsl(214 100% 58% / 0.4)',
                            }}
                        >
                            <Crown className="w-4 h-4 text-white"/>
                        </div>
                        <div>
                            <p className="text-[14px] font-black tracking-[-0.02em] leading-none">FIND YOUR KING</p>
                            <p className="text-[8px] font-black tracking-[0.1em] uppercase text-muted-foreground mt-0.5">CONNECT
                                · EXPLORE</p>
                        </div>
                    </Link>

                    <div
                        className="w-8 h-[1px] mb-6"
                        style={{background: 'hsl(var(--primary))'}}
                    />
                    <h2
                        className="font-black leading-[0.95] tracking-[-0.04em] mb-4"
                        style={{fontSize: 'clamp(28px, 3vw, 40px)'}}
                    >
                        {isRegister ? 'JOIN THE\nKINGDOM.' : 'WELCOME\nBACK, KING.'}
                    </h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
                        {isRegister
                            ? 'Create your profile and start connecting with men who know what they want.'
                            : 'Your kingdom is waiting. Sign in to discover who\'s nearby and ready.'}
                    </p>
                </div>

                {/* Middle: Perks */}
                <div className="relative z-10 space-y-4">
                    <p
                        className="text-[9px] font-black tracking-[0.2em] uppercase mb-5"
                        style={{color: 'hsl(var(--muted-foreground))'}}
                    >Platform Capabilities</p>
                    {PERKS.map(({icon: Icon, label, desc}, i) => (
                        <motion.div
                            key={label}
                            initial={{opacity: 0, x: -16}}
                            animate={{opacity: 1, x: 0}}
                            transition={{delay: 0.1 + i * 0.08}}
                            className="flex items-center gap-3"
                        >
                            <div
                                className="w-8 h-8 flex items-center justify-center shrink-0"
                                style={{
                                    background: 'hsl(var(--primary) / 0.08)',
                                    border: '1px solid hsl(var(--primary) / 0.18)',
                                }}
                            >
                                <Icon className="w-3.5 h-3.5" style={{color: 'hsl(var(--primary))'}} strokeWidth={1.8}/>
                            </div>
                            <div>
                                <p className="text-[12px] font-black">{label}</p>
                                <p className="text-[11px] text-muted-foreground">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom: Trust */}
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-4">
                        {['GDPR', 'SSL', '18+', '4.9★'].map((t) => (
                            <div key={t} className="flex items-center gap-1.5">
                                <BadgeCheck
                                    className="w-3 h-3"
                                    style={{color: 'hsl(var(--emerald))'}}
                                />
                                <span className="text-[10px] font-semibold text-muted-foreground">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: Auth Form ── */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile logo */}
                <div className="lg:hidden px-6 pt-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 flex items-center justify-center"
                            style={{background: 'var(--gradient-primary)'}}
                        >
                            <Crown className="w-3.5 h-3.5 text-white"/>
                        </div>
                        <span className="text-[13px] font-black tracking-tight">FIND YOUR KING</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
                    <div className="w-full max-w-[420px] glass-effect glow-gold-ring p-8 sm:p-10">
                        <motion.div
                            initial={{opacity: 0, y: 16}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
                        >
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-hero mb-2">
                                    {isRegister ? 'Create Account' : 'Sign In'}
                                </h1>
                                <p className="text-[14px] text-muted-foreground font-semibold">
                                    {isRegister
                                        ? 'Join 520,000+ members worldwide'
                                        : 'Your throne awaits'}
                                </p>
                            </div>

                            {/* Magic link toggle */}
                            <button
                                type="button"
                                onClick={() => setIsMagicLink(!isMagicLink)}
                                className="w-full flex items-center justify-center gap-2 h-10 mb-5 text-[12px] font-black tracking-[0.08em] uppercase transition-all duration-120"
                                style={{
                                    background: isMagicLink ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                                    color: isMagicLink ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                    border: isMagicLink ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid hsl(var(--border))',
                                }}
                            >
                                <Sparkles className="w-3.5 h-3.5"/>
                                {isMagicLink ? 'Using Magic Link ✓' : 'Use Magic Link (No Password)'}
                            </button>

                            {/* Divider */}
                            {!isMagicLink && (
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 h-[1px]" style={{background: 'hsl(var(--border))'}}/>
                                    <span
                                        className="text-[10px] font-black tracking-[0.12em] uppercase text-muted-foreground">
                    or with password
                  </span>
                                    <div className="flex-1 h-[1px]" style={{background: 'hsl(var(--border))'}}/>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-[11px] font-black tracking-[0.12em] uppercase mb-2"
                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                    >Email Address</label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                                            style={{color: 'hsl(var(--muted-foreground))'}}
                                        />
                                        <Input
                                            id="email"
                                            type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="king@example.com" autoFocus
                                            required
                                            className="pl-11 h-12 text-[14px] font-semibold"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {!isMagicLink && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            exit={{opacity: 0, height: 0}}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {/* Password */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label
                                                        htmlFor="password"
                                                        className="text-[11px] font-black tracking-[0.12em] uppercase"
                                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                                    >Password</label>
                                                    {!isRegister && (
                                                        <Link
                                                            to="/auth/reset-password"
                                                            className="text-[11px] font-semibold transition-colors"
                                                            style={{color: 'hsl(var(--primary))'}}
                                                        >Forgot?</Link>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <Lock
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                                    />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        required
                                                        className="pl-11 pr-10 h-12 text-[14px] font-semibold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword
                                                            ? <EyeOff className="w-[18px] h-[18px]"/>
                                                            : <Eye className="w-[18px] h-[18px]"/>}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm password */}
                                            {isRegister && (
                                                <div>
                                                    <label
                                                        htmlFor="confirm"
                                                        className="block text-[11px] font-black tracking-[0.12em] uppercase mb-2"
                                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                                    >Confirm Password</label>
                                                    <div className="relative">
                                                        <Lock
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                                                            style={{color: 'hsl(var(--muted-foreground))'}}
                                                        />
                                                        <Input
                                                            id="confirm"
                                                            type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            required
                                                            className="pl-11 h-12 text-[14px] font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-13 flex items-center justify-center gap-2 text-[13px] btn-gold disabled:opacity-50 disabled:pointer-events-none"
                                    style={{marginTop: '8px'}}
                                >
                                    {isLoading ? (
                                        <div
                                            className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"
                                            style={{borderRadius: 0}}
                                        />
                                    ) : isMagicLink ? (
                                        <><Zap className="w-4 h-4"/> Send Magic Link</>
                                    ) : isRegister ? (
                                        <><Crown className="w-4 h-4"/> Create Account</>
                                    ) : (
                                        <><ArrowRight className="w-4 h-4"/> Sign In</>
                                    )}
                                </button>
                            </form>

                            {/* Toggle mode */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsRegister(!isRegister);
                                        setIsMagicLink(false);
                                    }}
                                    className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {isRegister
                                        ? 'Already have an account? Sign in →'
                                        : "Don't have an account? Join us →"}
                                </button>
                            </div>

                            {/* OAuth Buttons */}
                            {!isRegister && (
                                <div className="mt-6 space-y-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await supabase.auth.signInWithOAuth({
                                                provider: 'google',
                                                options: { redirectTo: `${window.location.origin}/auth/callback` }
                                            });
                                        }}
                                        className="w-full h-11 flex items-center justify-center gap-2 border border-border/30 bg-surface-1 hover:bg-surface-2 transition-colors text-[13px] font-semibold rounded-xl"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                        Continue with Google
                                    </button>
                                </div>
                            )}

                            {/* Skip Button */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleSkipAuth}
                                    className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1 mx-auto"
                                    disabled={isLoading}
                                >
                                    <SkipForward className="w-3 h-3" />
                                    Skip for now
                                </button>
                            </div>

                            {/* Register trust note */}
                            {isRegister && (
                                <p className="mt-4 text-center text-[10px] text-muted-foreground leading-relaxed">
                                    By creating an account you agree to our{' '}
                                    <Link to="/terms-of-service"
                                          className="hover:text-foreground transition-colors underline underline-offset-2">Terms</Link>
                                    {' '}and{' '}
                                    <Link to="/privacy-policy"
                                          className="hover:text-foreground transition-colors underline underline-offset-2">Privacy
                                        Policy</Link>.
                                    Platform is for adults 18+ only.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom footer strip */}
                <div
                    className="px-6 py-4 flex items-center justify-center gap-6"
                    style={{borderTop: '1px solid hsl(var(--border))'}}
                >
                    {[
                        {icon: Lock, label: 'Encrypted'},
                        {icon: Shield, label: 'GDPR'},
                        {icon: BadgeCheck, label: '18+ Only'},
                    ].map(({icon: Icon, label}) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <Icon
                                className="w-3 h-3"
                                style={{color: 'hsl(var(--muted-foreground))'}}
                                strokeWidth={1.5}
                            />
                            <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConnectPage;


// ════════════════════════════════════════════════════════
// CALLBACK PAGE
// Source: src/pages/auth/Callback.tsx
// ════════════════════════════════════════════════════════

// =============================================================================
// Callback.tsx v2.0 — PKCE-first auth callback handler
// Fixes: old code called getSession() before exchangeCodeForSession (wrong order for PKCE)
// Handles: email confirmation, OAuth, magic link — all via code exchange
// =============================================================================

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const urlError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // ── 1. Handle OAuth/OTP errors in URL ──────────────────────────────
        if (urlError) {
          if (cancelled) return;
          setStatus('error');
          setMessage(errorDescription || urlError);
          toast({
            title: 'Authentication error',
            description: errorDescription || urlError,
            variant: 'destructive',
          });
          setTimeout(() => {
            if (!cancelled) navigate('/connect', { replace: true });
          }, 3000);
          return;
        }

        // ── 2. PKCE: exchange code for session first ──────────────────────
        if (code) {
          const { session: exchangedSession, error: exchangeError } =
            await supabaseAuth.exchangeCodeForSession(code);

          if (cancelled) return;

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            setMessage(exchangeError.message);
            toast({
              title: 'Authentication failed',
              description: exchangeError.message,
              variant: 'destructive',
            });
            setTimeout(() => {
              if (!cancelled) navigate('/connect', { replace: true });
            }, 3000);
            return;
          }

          if (exchangedSession) {
            // Ensure profile exists for this user
            await supabaseAuth.ensureProfile(exchangedSession.user);

            if (cancelled) return;
            setStatus('success');

            const isEmailConfirmation = !exchangedSession.user.app_metadata?.provider ||
              exchangedSession.user.app_metadata?.provider === 'email';

            setMessage(isEmailConfirmation ? 'Email confirmed successfully!' : 'Successfully signed in!');

            toast({
              title: isEmailConfirmation ? 'Email confirmed!' : 'Welcome back!',
              description: isEmailConfirmation
                ? 'Your account has been activated.'
                : 'You have been successfully authenticated.',
            });

            // Check if user has completed onboarding
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('user_id', exchangedSession.user.id)
              .single();

            setTimeout(() => {
              if (cancelled) return;
              if (profile?.onboarding_completed) {
                navigate('/app/grid', { replace: true });
              } else {
                navigate('/onboarding', { replace: true });
              }
            }, 1500);
            return;
          }
        }

        // ── 3. Fallback: check for existing session (e.g. page refresh) ───
        const { session: existingSession, error: sessionError } = await supabaseAuth.getSession();

        if (cancelled) return;

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage(sessionError.message);
          toast({
            title: 'Authentication failed',
            description: sessionError.message,
            variant: 'destructive',
          });
          setTimeout(() => {
            if (!cancelled) navigate('/connect', { replace: true });
          }, 3000);
          return;
        }

        if (existingSession) {
          setStatus('success');
          setMessage('Successfully signed in!');
          toast({
            title: 'Welcome back!',
            description: 'You have been successfully authenticated.',
          });

          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('user_id', existingSession.user.id)
            .single();

          setTimeout(() => {
            if (cancelled) return;
            if (profile?.onboarding_completed) {
              navigate('/app/grid', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          }, 1500);
          return;
        }

        // ── 4. No session, no code — unexpected ───────────────────────────
        setStatus('error');
        setMessage('No authentication data found. Please try signing in again.');
        setTimeout(() => {
          if (!cancelled) navigate('/connect', { replace: true });
        }, 3000);
      } catch (err) {
        if (cancelled) return;
        console.error('Callback handling error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
        toast({
          title: 'Authentication error',
          description: 'An unexpected error occurred during sign in.',
          variant: 'destructive',
        });
        setTimeout(() => {
          if (!cancelled) navigate('/connect', { replace: true });
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, toast]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[140px]"
          style={{ background: 'hsl(var(--primary)/0.07)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6 max-w-sm relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 flex items-center justify-center mx-auto"
          style={{
            background: status === 'success'
              ? 'hsl(var(--primary)/0.1)'
              : status === 'error'
              ? 'hsl(var(--destructive)/0.1)'
              : 'hsl(var(--primary)/0.05)',
            border: status === 'success'
              ? '1px solid hsl(var(--primary)/0.2)'
              : status === 'error'
              ? '1px solid hsl(var(--destructive)/0.2)'
              : '1px solid hsl(var(--primary)/0.1)',
          }}
        >
          {status === 'loading' && (
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-10 h-10" style={{ color: 'hsl(var(--primary))' }} />
          )}
          {status === 'error' && (
            <AlertCircle className="w-10 h-10" style={{ color: 'hsl(var(--destructive))' }} />
          )}
        </motion.div>

        {/* Branding */}
        <div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-12 h-12 mb-4 mx-auto"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 40px hsl(var(--primary)/0.5)',
            }}
          >
            <Crown className="w-6 h-6 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <h2 className="text-[24px] font-black tracking-tight leading-none mb-2">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Welcome!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {status === 'loading' && 'Please wait while we verify your identity...'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>
          </motion.div>
        </div>

        {/* Loading indicator */}
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}

        {/* Auto-redirect message */}
        {status !== 'loading' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] text-muted-foreground/50"
          >
            Redirecting automatically...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}


// ════════════════════════════════════════════════════════
// SIGN IN PAGE
// Source: src/pages/auth/SignIn.tsx
// ════════════════════════════════════════════════════════


export default function SignIn() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {signIn, isLoading, error, errorCode, clearError, isInitialized} = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clear auth errors when user changes input
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [email, password, error, clearError]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all fields.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const {error} = await signIn(email, password);

            if (error) {
                // Error is already handled by the auth hook
                return;
            }

            toast({
                title: 'Welcome back!',
                description: 'Successfully signed in.',
            });

            navigate('/app/grid');
        } catch (err) {
            toast({
                title: 'Sign in failed',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipAuth = () => {
        toast({
            title: 'Skipped Authentication',
            description: 'Continuing without sign in.',
        });
        navigate('/app/grid');
    };

    // Don't render until auth is initialized
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Obsidian ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[140px]"
                    style={{background: 'hsl(var(--primary)/0.07)'}}
                />
                <div
                    className="absolute bottom-0 right-0 w-[300px] h-[300px] blur-[120px]"
                    style={{background: 'hsl(var(--gold)/0.04)'}}
                />
                {/* Grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <motion.div
                initial={{opacity: 0, y: 28}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="w-full max-w-sm relative z-10"
            >
                {/* Branding */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{delay: 0.1, type: 'spring', stiffness: 300}}
                        className="inline-flex items-center justify-center w-14 h-14 mb-5"
                        style={{
                            background: 'hsl(var(--primary))',
                            boxShadow: '0 0 40px hsl(var(--primary)/0.5), 0 0 80px hsl(var(--primary)/0.2)',
                        }}
                    >
                        <Crown className="w-7 h-7 text-white"/>
                    </motion.div>
                    <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.18}}>
                        <p className="eyebrow mb-1.5" style={{color: 'hsl(var(--primary))'}}>FIND YOUR KING</p>
                        <h1 className="text-[28px] font-black tracking-tight leading-none">
                            Sign In
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-2">Access your royal account</p>
                    </motion.div>
                </div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        className="mb-6"
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {errorCode === AuthErrorCode.INVALID_CREDENTIALS
                                    ? 'Invalid email or password. Please try again.'
                                    : errorCode === AuthErrorCode.RATE_LIMITED
                                    ? 'Too many attempts. Please wait a moment and try again.'
                                    : errorCode === AuthErrorCode.EMAIL_NOT_CONFIRMED
                                    ? 'Please confirm your email before signing in.'
                                    : errorCode === AuthErrorCode.NETWORK_ERROR
                                    ? 'Network error. Please check your connection and try again.'
                                    : error.message
                                }
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                <motion.form
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.22}}
                    onSubmit={handleSignIn}
                    className="space-y-4"
                >
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label
                            className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Email</Label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                autoComplete="email"
                                data-testid="input-email"
                                disabled={isLoading || isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label
                                className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Password</Label>
                            <Link
                                to="/auth/reset-password"
                                className="text-[11px] font-semibold transition-colors"
                                style={{color: 'hsl(var(--primary))'}}
                            >
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                autoComplete="current-password"
                                data-testid="input-password"
                                disabled={isLoading || isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                disabled={isLoading || isSubmitting}
                            >
                                {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-13 text-[13px] font-black tracking-wider mt-2"
                        style={{
                            background: 'hsl(var(--primary))',
                            color: '#fff',
                            boxShadow: '0 8px 32px hsl(var(--primary)/0.35)'
                        }}
                        disabled={isLoading || isSubmitting}
                        data-testid="button-submit"
                    >
                        {(isLoading || isSubmitting) ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"/>
                        ) : (
                            <><ArrowRight className="w-4 h-4 mr-2"/> Sign In</>
                        )}
                    </Button>
                </motion.form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border/20"/>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-border/20"/>
                </div>

                {/* Magic link */}
                <Link to="/auth/magic-link">
                    <button
                        type="button"
                        className="w-full h-11 flex items-center justify-center gap-2 border border-border/30 bg-surface-1 hover:bg-surface-2 transition-colors text-[13px] font-semibold"
                        data-testid="button-magic-link"
                        disabled={isLoading || isSubmitting}
                    >
                        <Mail className="w-4 h-4 text-muted-foreground/60"/>
                        Sign in with Magic Link
                    </button>
                </Link>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                        Don't have an account?{' '}
                        <Link
                            to="/auth/sign-up"
                            className="font-black transition-colors"
                            style={{color: 'hsl(var(--primary))'}}
                        >
                            Create Account <ChevronRight className="inline w-3 h-3"/>
                        </Link>
                    </p>
                </div>

                {/* Skip Button */}
                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipAuth}
                        className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        disabled={isLoading || isSubmitting}
                    >
                        <SkipForward className="w-3 h-3 mr-1" />
                        Skip for now
                    </Button>
                </div>

                {/* Trust signals */}
                <div className="mt-8 flex items-center justify-center gap-5">
                    {['Verified members', 'Privacy first', '18+ only'].map((f) => (
                        <span key={f}
                              className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
              {f}
            </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// SIGN UP PAGE
// Source: src/pages/auth/SignUp.tsx
// ════════════════════════════════════════════════════════


export default function SignUp() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {signUp, isLoading, error, errorCode, clearError, isInitialized} = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    // Clear auth errors when user changes input
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [displayName, email, password, error, clearError]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!displayName || !email || !password) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all fields.',
                variant: 'destructive'
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: 'Password too short',
                description: 'At least 8 characters required.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const {error} = await signUp(email, password, displayName);

            if (!error) {
                setSent(true);
            }
            // Error is displayed via the error state from useAuth
        } catch (err) {
            toast({
                title: 'Sign up failed',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipAuth = () => {
        toast({
            title: 'Skipped Authentication',
            description: 'Continuing without sign up.',
        });
        navigate('/app/grid');
    };

    // Don't render until auth is initialized
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    /* ── Email sent confirmation ── */
    if (sent) return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative"
            style={{background: 'hsl(var(--background))'}}
        >
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[160px]"
                    style={{background: 'hsl(var(--primary)/0.06)'}}/>
            </div>
            <motion.div
                initial={{opacity: 0, scale: 0.92, y: 20}}
                animate={{opacity: 1, scale: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="text-center space-y-5 max-w-sm relative z-10"
            >
                <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{delay: 0.15, type: 'spring', stiffness: 260, damping: 20}}
                    className="w-20 h-20 flex items-center justify-center mx-auto"
                    style={{background: 'hsl(var(--primary))', boxShadow: '0 0 60px hsl(var(--primary)/0.45)'}}
                >
                    <CheckCircle2 className="w-10 h-10 text-white"/>
                </motion.div>
                <div>
                    <h2 className="text-[26px] font-black tracking-tight leading-none mb-2">Check Your Email</h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        We sent a confirmation link to{' '}
                        <strong className="text-foreground font-bold">{email}</strong>.
                        Click it to activate your account and claim your throne.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/connect')}
                    className="w-full h-12 border border-border/30 bg-surface-1 hover:bg-surface-2 transition-colors text-[13px] font-bold flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4"/>
                    Back to Sign In
                </button>
                <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                    Didn't receive it? Check your spam folder.
                </p>
            </motion.div>
        </div>
    );

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[140px]"
                    style={{background: 'hsl(var(--primary)/0.07)'}}
                />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <motion.div
                initial={{opacity: 0, y: 28}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="w-full max-w-sm relative z-10"
            >
                {/* Branding */}
                <div className="text-center mb-9">
                    <motion.div
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{delay: 0.1, type: 'spring', stiffness: 300}}
                        className="inline-flex items-center justify-center w-14 h-14 mb-5"
                        style={{
                            background: 'hsl(var(--primary))',
                            boxShadow: '0 0 40px hsl(var(--primary)/0.5), 0 0 80px hsl(var(--primary)/0.2)',
                        }}
                    >
                        <Crown className="w-7 h-7 text-white"/>
                    </motion.div>
                    <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.18}}>
                        <p className="eyebrow mb-1.5" style={{color: 'hsl(var(--primary))'}}>FIND YOUR KING</p>
                        <h1 className="text-[28px] font-black tracking-tight leading-none">Create Account</h1>
                        <p className="text-[13px] text-muted-foreground mt-2">Join 520,000+ kings worldwide</p>
                    </motion.div>
                </div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        className="mb-6"
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {errorCode === AuthErrorCode.RATE_LIMITED
                                    ? 'Too many attempts. Please wait a moment and try again.'
                                    : errorCode === AuthErrorCode.EMAIL_ALREADY_EXISTS
                                    ? 'An account with this email already exists. Try signing in instead.'
                                    : error.message
                                }
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                <motion.form
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.22}}
                    onSubmit={handleSignUp}
                    className="space-y-4"
                >
                    {/* Display Name */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Display
                            Name</Label>
                        <div className="relative">
                            <User
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name" autoComplete="name"
                                className="pl-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                data-testid="input-display-name"
                                disabled={isLoading || isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label
                            className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Email</Label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                autoComplete="email"
                                data-testid="input-email"
                                disabled={isLoading || isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                            Password
                            <span
                                className="text-muted-foreground/40 ml-1 normal-case font-normal">(min. 8 characters)</span>
                        </Label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type={showPw ? "text" : "password"} autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                data-testid="input-password"
                                disabled={isLoading || isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                disabled={isLoading || isSubmitting}
                            >
                                {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                        By creating an account you agree to our{' '}
                        <Link to="/legal/terms"
                              className="underline text-muted-foreground hover:text-foreground transition-colors">Terms</Link>{' '}
                        and{' '}
                        <Link to="/legal/privacy"
                              className="underline text-muted-foreground hover:text-foreground transition-colors">Privacy
                            Policy</Link>.
                        {' '}You must be 18+ to use this platform.
                    </p>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-13 text-[13px] font-black tracking-wider"
                        style={{
                            background: 'hsl(var(--primary))',
                            color: '#fff',
                            boxShadow: '0 8px 32px hsl(var(--primary)/0.35)'
                        }}
                        disabled={isLoading || isSubmitting}
                        data-testid="button-submit"
                    >
                        {(isLoading || isSubmitting) ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"/>
                        ) : (
                            <><ArrowRight className="w-4 h-4 mr-2"/> Create Account</>
                        )}
                    </Button>
                </motion.form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                        Already a member?{' '}
                        <Link
                            to="/connect"
                            className="font-black transition-colors"
                            style={{color: 'hsl(var(--primary))'}}
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Skip Button */}
                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipAuth}
                        className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        disabled={isLoading || isSubmitting}
                    >
                        <SkipForward className="w-3 h-3 mr-1" />
                        Skip for now
                    </Button>
                </div>

                {/* Trust signals */}
                <div className="mt-8 flex items-center justify-center gap-5">
                    {['Free to join', 'Verified profiles', 'Privacy first'].map((f) => (
                        <span key={f}
                              className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
              {f}
            </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// GRID PAGE
// Source: src/features/grid/pages/GridPage.tsx
// ════════════════════════════════════════════════════════

import {
    BadgeCheck,
    CircleDot,
    Clock,
    Crown,
    Grid3X3,
    Heart,
    Image,
    LayoutGrid,
    MapPin,
    MessageCircle,
    Radio,
    RefreshCw,
    Search,
    SlidersHorizontal,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react';

const TRIBES = ['Bear', 'Jock', 'Twink', 'Daddy', 'Muscle', 'Otter', 'Cub', 'Leather', 'Geek', 'Trans', 'Femme', 'Masc'];
const LOOKING_FOR = ['Chat', 'Friends', 'Dates', 'Relationship', 'Hookup', 'Networking', 'Travel Buddy'];
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Stocky', 'Large', 'Muscular'];
const POSITIONS = ['Top', 'Bottom', 'Vers', 'Side', 'Oral'];

const SORT_OPTIONS = [
    {id: 'distance', label: 'Nearest', Icon: MapPin},
    {id: 'recently_active', label: 'Active', Icon: Clock},
    {id: 'newest', label: 'New', Icon: Zap},
    {id: 'popularity', label: 'Popular', Icon: TrendingUp},
];

const QUICK_CHIPS = [
    {id: 'online', label: 'Online', Icon: Radio},
    {id: 'right_now', label: 'Right Now', Icon: Zap},
    {id: 'verified', label: 'Verified', Icon: BadgeCheck},
    {id: 'new', label: 'New', Icon: CircleDot},
    {id: 'photo', label: 'Photo', Icon: Image},
    {id: 'popular', label: 'Popular', Icon: TrendingUp},
];

const GRADIENTS = [
    'linear-gradient(160deg, hsl(0 88% 45%/0.5), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(218 85% 50%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(155 65% 36%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(35 92% 50%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(268 75% 52%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(340 80% 50%/0.45), hsl(230 7% 7%))',
];

interface Filters {
    search: string;
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    onlineOnly: boolean;
    verifiedOnly: boolean;
    hasPhotos: boolean;
    tribes: string[];
    lookingFor: string[];
    bodyTypes: string[];
    positions: string[];
    sortBy: string;
    quickChips: string[];
}

const DEFAULT: Filters = {
    search: '', ageMin: 18, ageMax: 65, maxDistance: 50,
    onlineOnly: false, verifiedOnly: false, hasPhotos: false,
    tribes: [], lookingFor: [], bodyTypes: [], positions: [],
    sortBy: 'distance', quickChips: [],
};

/* ── Grid card — premium 2050 profile card ── */
const GridCard = memo(({profile, isFav, onFav, onMessage, onView, compact}: {
    profile: any; isFav: boolean; compact: boolean;
    onFav: (id: string) => void; onMessage: (id: string) => void; onView: (id: string) => void;
}) => {
    const [imgErr, setImgErr] = useState(false);
    const [favAnim, setFavAnim] = useState(false);
    const initial = (profile.display_name || 'U')[0].toUpperCase();
    const isOnline = profile.is_online;
    const isVerified = profile.is_verified;
    const isPremium = profile.is_premium;
    const isRightNow = profile.is_available_now;
    const grad = GRADIENTS[(profile.user_id || '').charCodeAt(0) % GRADIENTS.length];

    const handleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFavAnim(true);
        setTimeout(() => setFavAnim(false), 600);
        onFav(profile.user_id);
    };

    const distLabel = profile.distance !== undefined
        ? profile.distance < 1 ? '< 1 km' : `${Math.round(profile.distance)} km`
        : profile.city || null;

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.91, y: 8}}
            animate={{opacity: 1, scale: 1, y: 0}}
            transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
            whileTap={{scale: 0.96}}
            className="relative overflow-hidden cursor-pointer group select-none"
            style={{
                aspectRatio: compact ? '1/1.2' : '2/2.9',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
            }}
            onClick={() => onView(profile.user_id)}
        >
            {/* ── Photo / placeholder ── */}
            {profile.avatar_url && !imgErr ? (
                <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Profile'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgErr(true)}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{background: grad}}>
                    <span
                        className="font-black text-white/[0.07] select-none"
                        style={{fontSize: compact ? '32px' : '44px', letterSpacing: '-0.02em'}}
                    >
                        {initial}
                    </span>
                </div>
            )}

            {/* ── Gradient overlays ── */}
            <div className="absolute inset-0 photo-overlay-bottom pointer-events-none"/>
            <div className="absolute inset-0 photo-overlay-top pointer-events-none"/>

            {/* ── Hover overlay ── */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/12 transition-colors duration-300 pointer-events-none"/>

            {/* ── Premium border ring (when premium) ── */}
            {isPremium && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid hsl(42 98% 56% / 0.4)',
                        boxShadow: 'inset 0 0 0 1px hsl(42 98% 56% / 0.12)',
                    }}
                />
            )}

            {/* ── Top row: online + badges ── */}
            <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between z-10">
                {/* Online badge */}
                {isOnline ? (
                    <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                        style={{
                            background: 'hsl(220 18% 2% / 0.75)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid hsl(142 76% 42% / 0.3)',
                        }}
                    >
                        <span className="relative flex h-[5px] w-[5px] shrink-0">
                            <span
                                className="absolute inset-0 rounded-full animate-ping opacity-75"
                                style={{background: 'hsl(var(--status-online))'}}
                            />
                            <span
                                className="relative rounded-full w-full h-full"
                                style={{background: 'hsl(var(--status-online))'}}
                            />
                        </span>
                        {!compact && (
                            <span
                                className="text-[7px] font-black uppercase tracking-wider"
                                style={{color: 'hsl(var(--status-online))'}}
                            >
                                Live
                            </span>
                        )}
                    </div>
                ) : <div/>}

                {/* Right badges */}
                <div className="flex gap-0.5">
                    {isRightNow && (
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 18, height: 18,
                                borderRadius: 4,
                                background: 'var(--gradient-gold)',
                                boxShadow: '0 0 8px hsl(42 98% 56% / 0.5)',
                            }}
                        >
                            <Zap className="w-[9px] h-[9px] text-white fill-white"/>
                        </div>
                    )}
                    {isVerified && (
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 18, height: 18,
                                borderRadius: 4,
                                background: 'hsl(214 85% 55% / 0.9)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <BadgeCheck className="w-[9px] h-[9px] text-white"/>
                        </div>
                    )}
                    {isPremium && (
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 18, height: 18,
                                borderRadius: 4,
                                background: 'var(--gradient-gold)',
                                boxShadow: '0 0 10px hsl(42 98% 56% / 0.55)',
                            }}
                        >
                            <Crown className="w-[9px] h-[9px] text-black"/>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Fav button ── */}
            <motion.button
                className="absolute z-10 flex items-center justify-center"
                style={{
                    top: compact ? 24 : 28,
                    left: 6,
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: isFav ? 'hsl(0 85% 58%)' : 'hsl(220 18% 2% / 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: isFav ? '1px solid hsl(0 85% 70% / 0.4)' : '1px solid hsl(0 0% 100% / 0.1)',
                    opacity: isFav ? 1 : 0,
                    boxShadow: isFav ? '0 0 12px hsl(0 85% 58% / 0.45)' : 'none',
                }}
                animate={favAnim ? {scale: [1, 1.45, 1]} : {}}
                transition={{duration: 0.4}}
                whileHover={{opacity: 1}}
                onClick={handleFav}
                aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
            >
                <Heart
                    className="w-2.5 h-2.5"
                    style={{
                        color: 'white',
                        fill: isFav ? 'white' : 'none',
                    }}
                />
            </motion.button>
            {/* Force fav visible on hover */}
            <div
                className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{top: compact ? 24 : 28, left: 6, width: 22, height: 22, borderRadius: 5, pointerEvents: 'none', background: isFav ? 'transparent' : 'hsl(220 18% 2% / 0.6)', backdropFilter: 'blur(8px)'}}
            />

            {/* ── Info panel ── */}
            <div className="absolute bottom-0 left-0 right-0 px-2 pb-2.5 z-10">
                {/* Name + age */}
                <div className="flex items-baseline gap-1">
                    <span className="font-black text-white leading-none truncate" style={{fontSize: compact ? '10px' : '11px', letterSpacing: '-0.01em'}}>
                        {profile.display_name || 'Anonymous'}
                    </span>
                    {profile.age && (
                        <span className="text-white/55 font-normal shrink-0" style={{fontSize: compact ? '9px' : '10px'}}>
                            {profile.age}
                        </span>
                    )}
                </div>

                {/* Distance/location */}
                {!compact && distLabel && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-[8px] h-[8px] text-white/40 shrink-0"/>
                        <span className="text-[8px] text-white/40 truncate">{distLabel}</span>
                    </div>
                )}

                {/* Action row — slides up on hover */}
                <div className="flex gap-1 mt-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                    <button
                        onClick={e => { e.stopPropagation(); onMessage(profile.user_id); }}
                        className="flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[8.5px] font-bold text-white transition-all"
                        style={{
                            borderRadius: 4,
                            background: 'hsl(220 18% 100% / 0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid hsl(0 0% 100% / 0.1)',
                        }}
                    >
                        <MessageCircle className="w-[8px] h-[8px]"/>
                        {!compact && 'Message'}
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onView(profile.user_id); }}
                        className="flex-1 flex items-center justify-center py-1.5 text-[8.5px] font-black text-white transition-all"
                        style={{
                            borderRadius: 4,
                            background: 'var(--gradient-gold)',
                            boxShadow: '0 2px 8px hsl(42 98% 56% / 0.4)',
                        }}
                    >
                        View
                    </button>
                </div>
            </div>
        </motion.div>
    );
});
GridCard.displayName = 'GridCard';

/* ── Skeleton ── */
const CardSkeleton = ({compact}: {compact: boolean}) => (
    <div
        className="overflow-hidden relative"
        style={{
            aspectRatio: compact ? '1/1.2' : '2/2.9',
            borderRadius: 'var(--radius-sm)',
            background: 'hsl(var(--surface-2))',
        }}
    >
        <div
            className="absolute inset-0"
            style={{
                background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.04) 50%, transparent 100%)',
                backgroundSize: '400px 100%',
                animation: 'skeleton-wave 1.6s ease-in-out infinite',
            }}
        />
    </div>
);

/* ── ChipGroup ── */
function ChipGroup({title, options, selected, onToggle}: {
    title: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <p className="section-label">{title}</p>
            <div className="flex flex-wrap gap-1">
                {options.map(opt => {
                    const active = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => onToggle(opt)}
                            className={cn(
                                'px-2 py-0.5 rounded-sm text-[11px] font-bold border transition-all duration-100',
                                active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-transparent border-border/35 text-muted-foreground hover:border-primary/30',
                            )}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Filters sheet ── */
function FiltersSheet({open, onClose, filters, onApply}: {
    open: boolean; onClose: () => void; filters: Filters; onApply: (f: Filters) => void;
}) {
    const [local, setLocal] = useState<Filters>(filters);
    const upd = <K extends keyof Filters>(k: K, v: Filters[K]) => setLocal(p => ({...p, [k]: v}));
    const toggle = <K extends 'tribes' | 'lookingFor' | 'bodyTypes' | 'positions'>(k: K, val: string) =>
        setLocal(p => ({
            ...p,
            [k]: (p[k] as string[]).includes(val)
                ? (p[k] as string[]).filter(x => x !== val)
                : [...(p[k] as string[]), val],
        }));

    const activeCount = [
        local.onlineOnly, local.verifiedOnly, local.hasPhotos,
        local.tribes.length, local.lookingFor.length, local.bodyTypes.length, local.positions.length,
        local.ageMin !== 18 || local.ageMax !== 65, local.maxDistance !== 50,
    ].filter(Boolean).length;

    return (
        <Sheet open={open} onOpenChange={v => !v && onClose()}>
            <SheetContent
                side="bottom"
                className="h-[93dvh] overflow-y-auto bg-background p-0 border-border/25 scrollbar-hide"
                style={{borderRadius: '10px 10px 0 0'}}
            >
                {/* Handle */}
                <div className="flex justify-center pt-2.5 pb-0">
                    <div className="w-7 h-[3px] rounded-full bg-border/40"/>
                </div>

                {/* Sticky header */}
                <div
                    className="sticky top-0 z-10 bg-background/96 backdrop-blur-2xl border-b border-border/15 px-4 py-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-primary"/>
                            <span className="font-black text-[14px]">Filters</span>
                            {activeCount > 0 && (
                                <span
                                    className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-black">{activeCount}</span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setLocal(DEFAULT);
                                onApply(DEFAULT);
                                onClose();
                            }}
                            className="text-[11px] text-muted-foreground font-bold hover:text-foreground transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="px-4 pt-4 pb-10 space-y-5">
                    {/* Sort */}
                    <div className="space-y-1.5">
                        <p className="section-label">Sort By</p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {SORT_OPTIONS.map(s => {
                                const Icon = s.Icon;
                                return (
                                    <button key={s.id} onClick={() => upd('sortBy', s.id)}
                                            className={cn(
                                                'flex flex-col items-center gap-1 py-2 px-1 rounded-sm text-[10px] font-bold border transition-all',
                                                local.sortBy === s.id
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-card border-border/30 text-muted-foreground hover:border-primary/25'
                                            )}>
                                        <Icon className="w-3 h-3 shrink-0" strokeWidth={2.2}/>
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Toggles — row-list pattern, no card wrappers */}
                    <div>
                        <p className="section-label mb-1.5">Quick Filters</p>
                        {[
                            {key: 'onlineOnly' as const, label: 'Online now', sub: 'Active users only'},
                            {key: 'verifiedOnly' as const, label: 'Verified only', sub: 'Photo-verified'},
                            {key: 'hasPhotos' as const, label: 'Has photos', sub: 'Profiles with photos'},
                        ].map(({key, label, sub}) => (
                            <div key={key} className="row-item gap-3">
                                <div className="flex-1">
                                    <p className="text-[12.5px] font-semibold">{label}</p>
                                    <p className="text-[10.5px] text-muted-foreground">{sub}</p>
                                </div>
                                <Switch checked={local[key]} onCheckedChange={v => upd(key, v)}/>
                            </div>
                        ))}
                    </div>

                    {/* Age */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-baseline">
                            <p className="section-label">Age Range</p>
                            <span className="text-[12px] font-black text-primary">{local.ageMin} – {local.ageMax}</span>
                        </div>
                        <Slider min={18} max={80} step={1} value={[local.ageMin, local.ageMax]}
                                onValueChange={([a, b]) => {
                                    upd('ageMin', a);
                                    upd('ageMax', b);
                                }}/>
                    </div>

                    {/* Distance */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-baseline">
                            <p className="section-label">Max Distance</p>
                            <span className="text-[12px] font-black text-primary">
                {local.maxDistance >= 200 ? '200+ km' : `${local.maxDistance} km`}
              </span>
                        </div>
                        <Slider min={1} max={200} step={1} value={[local.maxDistance]}
                                onValueChange={([v]) => upd('maxDistance', v)}/>
                    </div>

                    <ChipGroup title="Tribes" options={TRIBES} selected={local.tribes}
                               onToggle={v => toggle('tribes', v)}/>
                    <ChipGroup title="Looking For" options={LOOKING_FOR} selected={local.lookingFor}
                               onToggle={v => toggle('lookingFor', v)}/>
                    <ChipGroup title="Body Type" options={BODY_TYPES} selected={local.bodyTypes}
                               onToggle={v => toggle('bodyTypes', v)}/>
                    <ChipGroup title="Position" options={POSITIONS} selected={local.positions}
                               onToggle={v => toggle('positions', v)}/>

                    <div className="flex gap-2.5 pt-1">
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-sm font-bold text-[12px] border-border/40"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] h-10 rounded-sm font-bold text-[12px] border-0"
                            style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 4px 18px hsl(var(--primary)/0.28)'
                            }}
                            onClick={() => {
                                onApply(local);
                                onClose();
                            }}
                        >
                            Show Results
                            {activeCount > 0 && (
                                <span
                                    className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-white/18 text-[9px] font-black">{activeCount}</span>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

/* ── Main ── */
export default function GridPage() {
    const navigate = useNavigate();
    const {isFavorite, toggleFavorite} = useFavorites();
    const createConversation = useCreateConversation();

    const [filters, setFilters] = useState<Filters>(DEFAULT);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cols, setCols] = useState<2 | 3>(2);

    const {data: profiles = [], isLoading, refetch, isFetching} = useProfilesGrid(filters);

    const activeFilterCount = useMemo(() => [
        filters.onlineOnly, filters.verifiedOnly, filters.hasPhotos,
        filters.tribes.length, filters.lookingFor.length,
        filters.bodyTypes.length, filters.positions.length,
        filters.ageMin !== 18 || filters.ageMax !== 65,
        filters.maxDistance !== 50,
    ].filter(Boolean).length, [filters]);

    const toggleChip = (id: string) =>
        setFilters(p => ({
            ...p,
            quickChips: p.quickChips.includes(id) ? p.quickChips.filter(c => c !== id) : [...p.quickChips, id],
        }));

    const filtered = useMemo(() => profiles.filter((p: any) => {
        if (filters.search && !(p.display_name || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.onlineOnly && !p.is_online) return false;
        if (filters.verifiedOnly && !p.is_verified) return false;
        if (filters.hasPhotos && !p.avatar_url) return false;
        if (filters.ageMin > 18 && p.age && p.age < filters.ageMin) return false;
        if (filters.ageMax < 65 && p.age && p.age > filters.ageMax) return false;
        if (filters.tribes.length && !(p.tribes || []).some((t: string) => filters.tribes.includes(t))) return false;
        if (filters.lookingFor.length && !(p.looking_for || []).some((l: string) => filters.lookingFor.includes(l))) return false;
        if (filters.quickChips.includes('online') && !p.is_online) return false;
        if (filters.quickChips.includes('verified') && !p.is_verified) return false;
        if (filters.quickChips.includes('photo') && !p.avatar_url) return false;
        return true;
    }), [profiles, filters]);

    const handleMessage = useCallback(async (userId: string) => {
        try {
            const cid = await createConversation.mutateAsync(userId);
            navigate(`/app/chat/${cid}`);
        } catch {
            navigate('/app/messages');
        }
    }, [createConversation, navigate]);

    const compact = cols === 3;

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ── Header ── */}
            <header className="flex-shrink-0 glass-nav border-b border-white/[0.035] z-20">
                <div className="px-3 pt-3 pb-1.5 space-y-2">

                    {/* Title row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-[17px] font-black tracking-tight">Discover</h1>
                            {!isLoading && (
                                <span
                                    className="px-1.5 py-0.5 text-[9.5px] font-bold text-muted-foreground"
                                    style={{background: 'hsl(var(--secondary)/0.5)', borderRadius: '4px'}}
                                >
                  {filtered.length}
                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setSearchOpen(s => !s)}
                                className={cn(
                                    'w-7 h-7 rounded-sm flex items-center justify-center transition-all active:scale-90',
                                    searchOpen ? 'bg-primary/12 border border-primary/25 text-primary' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Search className="w-3.5 h-3.5"/>
                            </button>

                            <button
                                onClick={() => setFiltersOpen(true)}
                                className={cn(
                                    'relative w-7 h-7 rounded-sm flex items-center justify-center transition-all active:scale-90',
                                    activeFilterCount > 0 ? 'bg-primary/12 border border-primary/25 text-primary' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5"/>
                                {activeFilterCount > 0 && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary text-primary-foreground text-[6.5px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                                )}
                            </button>

                            <button
                                onClick={() => refetch()}
                                className={cn('w-7 h-7 rounded-sm flex items-center justify-center transition-all active:scale-90 text-muted-foreground hover:text-foreground', isFetching && 'animate-spin')}
                            >
                                <RefreshCw className="w-3.5 h-3.5"/>
                            </button>

                            <button
                                onClick={() => setCols(c => c === 2 ? 3 : 2)}
                                className="w-7 h-7 rounded-sm flex items-center justify-center active:scale-90 transition-all text-muted-foreground hover:text-foreground"
                            >
                                {cols === 2
                                    ? <Grid3X3 className="w-3.5 h-3.5"/>
                                    : <LayoutGrid className="w-3.5 h-3.5"/>}
                            </button>
                        </div>
                    </div>

                    {/* Search input */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                className="overflow-hidden"
                            >
                                <div className="relative pb-0.5">
                                    <Search
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none"/>
                                    <Input
                                        autoFocus
                                        placeholder="Search by name…"
                                        value={filters.search}
                                        onChange={e => setFilters(p => ({...p, search: e.target.value}))}
                                        className="pl-8 pr-7 h-8 bg-secondary/35 border-border/25 rounded-sm text-[12.5px]"
                                    />
                                    {filters.search && (
                                        <button
                                            onClick={() => setFilters(p => ({...p, search: ''}))}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-sm bg-muted flex items-center justify-center"
                                        >
                                            <X className="w-2 h-2 text-muted-foreground"/>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick filter chips — no emoji, tight */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                        {QUICK_CHIPS.map(chip => {
                            const Icon = chip.Icon;
                            const active = filters.quickChips.includes(chip.id);
                            return (
                                <button
                                    key={chip.id}
                                    onClick={() => toggleChip(chip.id)}
                                    className={cn(
                                        'flex items-center gap-0.5 px-2 py-0.5 whitespace-nowrap text-[10.5px] font-bold border shrink-0 transition-all duration-100',
                                        active
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'border-border/25 text-muted-foreground hover:border-primary/25',
                                    )}
                                    style={{borderRadius: '4px'}}
                                >
                                    <Icon className="w-2 h-2 shrink-0" strokeWidth={2.5}/>
                                    {chip.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── Grid ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className={cn('grid p-1.5', cols === 2 ? 'grid-cols-2 gap-1' : 'grid-cols-3 gap-1')}>
                    {isLoading
                        ? Array.from({length: cols === 2 ? 12 : 18}).map((_, i) => <CardSkeleton key={i}
                                                                                                 compact={compact}/>)
                        : filtered.length > 0
                            ? filtered.map((profile: any) => (
                                <GridCard
                                    key={profile.user_id}
                                    profile={profile}
                                    compact={compact}
                                    isFav={isFavorite(profile.user_id)}
                                    onFav={toggleFavorite}
                                    onMessage={handleMessage}
                                    onView={id => navigate(`/app/profile/${id}`)}
                                />
                            ))
                            : (
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="col-span-full flex flex-col items-center justify-center py-20 gap-4 px-8 text-center"
                                >
                                    <div className="w-12 h-12 bg-secondary flex items-center justify-center"
                                         style={{borderRadius: '8px'}}>
                                        <Search className="w-6 h-6 text-muted-foreground/35"/>
                                    </div>
                                    <div>
                                        <p className="font-black text-[15px]">No profiles found</p>
                                        <p className="text-[12px] text-muted-foreground mt-1">Adjust your filters to see
                                            more guys</p>
                                    </div>
                                    <button
                                        onClick={() => setFilters(DEFAULT)}
                                        className="px-4 py-1.5 rounded-sm border border-border/40 text-[12px] font-bold text-muted-foreground hover:text-foreground hover:border-border transition-all"
                                    >
                                        Clear filters
                                    </button>
                                </motion.div>
                            )
                    }
                </div>
                <div className="h-3"/>
            </div>

            <FiltersSheet
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
                onApply={setFilters}
            />
        </div>
    );
}


// ════════════════════════════════════════════════════════
// MESSAGES PAGE
// Source: src/features/chat/pages/MessagesPage.tsx
// ════════════════════════════════════════════════════════

import {format, isToday, isYesterday} from 'date-fns';

type Tab = 'chats' | 'requests';

const fmtTime = (d?: string) => {
    if (!d) return '';
    try {
        const date = new Date(d);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM d');
    } catch {
        return '';
    }
};

// Deterministic avatar gradient
const AVATAR_GRADS = [
    ['hsl(0,80%,55%)', 'hsl(25,90%,55%)'],
    ['hsl(218,80%,55%)', 'hsl(268,70%,55%)'],
    ['hsl(155,60%,40%)', 'hsl(170,55%,38%)'],
    ['hsl(35,85%,52%)', 'hsl(10,80%,52%)'],
    ['hsl(268,70%,55%)', 'hsl(340,75%,55%)'],
];
const getGrad = (id: string) => AVATAR_GRADS[(id || '').charCodeAt(0) % AVATAR_GRADS.length];

export default function MessagesPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('chats');
    const {conversations, isLoading} = useConversations();

    const filtered = useMemo(() => {
        if (!conversations) return [];
        if (!searchQuery) return conversations;
        return conversations.filter(c =>
            (c.other_user?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const totalUnread = useMemo(() =>
            conversations.reduce((a, c) => a + (c.unread_count || 0), 0),
        [conversations]
    );

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ─ Header ─ */}
            <header className="flex-shrink-0 glass-nav border-b border-white/[0.04] z-40">
                <div className="px-4 pt-4 pb-2.5">

                    {/* Title row */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[22px] font-black tracking-tight">Messages</h1>
                                <AnimatePresence>
                                    {totalUnread > 0 && (
                                        <motion.span
                                            initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}}
                                            className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black min-w-[18px] text-center"
                                        >
                                            {totalUnread}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{filtered.length} conversation{filtered.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => {
                                    setSearchOpen(s => !s);
                                    if (searchOpen) setSearchQuery('');
                                }}
                                className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90',
                                    searchOpen ? 'bg-primary/15 border border-primary/30 text-primary' : 'bg-secondary/60 text-muted-foreground',
                                )}>
                                {searchOpen ? <X className="w-4 h-4"/> : <Search className="w-4 h-4"/>}
                            </button>
                            <button
                                onClick={() => navigate('/app/grid')}
                                className="w-9 h-9 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center active:scale-90 transition-all">
                                <PenSquare className="w-4 h-4 text-primary"/>
                            </button>
                        </div>
                    </div>

                    {/* Search input */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                className="overflow-hidden mb-2.5"
                            >
                                <div className="relative">
                                    <Search
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"/>
                                    <Input
                                        autoFocus
                                        placeholder="Search conversations…"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-9 h-10 bg-secondary/40 border-border/30  text-[13px]"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                            <X className="w-2.5 h-2.5 text-muted-foreground"/>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tabs */}
                    <div className="flex gap-0 p-0.5 bg-secondary/40 ">
                        {(['chats', 'requests'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn(
                                    'relative flex-1 py-1.5 px-4 rounded-[10px] text-[12px] font-bold transition-all duration-200',
                                    tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                                )}>
                                {t === 'chats' ? 'Chats' : 'Requests'}
                                {t === 'requests' && (
                                    <span
                                        className="ml-1.5 px-1 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-black">0</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ─ List ─ */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        /* Skeletons */
                        <div key="skel" className="px-4 pt-3 space-y-1">
                            {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="flex items-center gap-3.5 py-3 animate-pulse">
                                    <div className="w-[54px] h-[54px] rounded-full bg-secondary shrink-0"/>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-secondary rounded-full w-32"/>
                                        <div className="h-3 bg-secondary/60 rounded-full w-52"/>
                                    </div>
                                    <div className="h-2.5 w-8 bg-secondary rounded-full"/>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <motion.div key="list" initial={{opacity: 0}} animate={{opacity: 1}}>

                            {/* Pinned / unread section marker */}
                            {totalUnread > 0 && (
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em]">
                                        Unread · {totalUnread}
                                    </p>
                                </div>
                            )}

                            {filtered.map((conv, index) => {
                                const hasUnread = (conv.unread_count || 0) > 0;
                                const [g1, g2] = getGrad(conv.id);
                                const name = conv.other_user?.display_name || 'User';
                                const initial = name[0].toUpperCase();
                                const lastMsg = conv.last_message?.content || 'Start a conversation…';
                                const isOnline = conv.other_user?.is_online;

                                return (
                                    <motion.button
                                        key={conv.id}
                                        initial={{opacity: 0, x: -12}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: index * 0.02, duration: 0.2}}
                                        onClick={() => navigate(`/app/chat/${conv.id}`)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 text-left relative transition-colors duration-100',
                                            'hover:bg-secondary/15 active:bg-secondary/25',
                                            hasUnread && 'bg-primary/[0.025]',
                                        )}
                                    >
                                        {/* Unread line */}
                                        {hasUnread && (
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-9 bg-primary rounded-r-full"/>
                                        )}

                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className={cn(
                                                'p-[2px] rounded-full transition-all',
                                                hasUnread ? 'bg-gradient-to-br' : 'bg-transparent',
                                            )}
                                                 style={hasUnread ? {backgroundImage: `linear-gradient(135deg, ${g1}, ${g2})`} : {}}>
                                                <Avatar className="w-[52px] h-[52px] border-2 border-background">
                                                    <AvatarImage src={conv.other_user?.avatar_url || ''}/>
                                                    <AvatarFallback
                                                        className="text-[15px] font-black"
                                                        style={{
                                                            backgroundImage: `linear-gradient(135deg, ${g1}, ${g2})`,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {initial}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            {isOnline && (
                                                <span
                                                    className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background"/>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                          <span className={cn(
                              'text-[13px] truncate',
                              hasUnread ? 'font-black text-foreground' : 'font-semibold text-foreground/85',
                          )}>
                            {name}
                          </span>
                                                    {isOnline && <span
                                                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>}
                                                </div>
                                                <span className={cn(
                                                    'text-[11px] shrink-0 font-medium',
                                                    hasUnread ? 'text-primary font-bold' : 'text-muted-foreground',
                                                )}>
                          {fmtTime(conv.last_message?.created_at)}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn(
                                                    'text-[12px] truncate leading-snug',
                                                    hasUnread ? 'text-foreground/85 font-medium' : 'text-muted-foreground',
                                                )}>
                                                    {lastMsg}
                                                </p>
                                                {hasUnread ? (
                                                    <motion.span
                                                        initial={{scale: 0}} animate={{scale: 1}}
                                                        className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center"
                                                    >
                                                        {conv.unread_count}
                                                    </motion.span>
                                                ) : conv.last_message ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-primary/40 shrink-0"/>
                                                ) : null}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                            <div className="h-4"/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{opacity: 0, scale: 0.95}}
                            animate={{opacity: 1, scale: 1}}
                            className="flex flex-col items-center justify-center py-28 px-8 text-center gap-4"
                        >
                            <div className="w-16 h-16  bg-secondary flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-muted-foreground/50"/>
                            </div>
                            <div>
                                <p className="font-black text-[16px]">
                                    {searchQuery ? 'No results' : tab === 'requests' ? 'No requests' : 'No conversations'}
                                </p>
                                <p className="text-[13px] text-muted-foreground mt-1">
                                    {searchQuery ? 'Try a different name' : 'Browse profiles and tap Message to start chatting'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// CHAT PAGE
// Source: src/features/chat/pages/ChatThread.tsx
// ════════════════════════════════════════════════════════


export default function ChatThread() {
    const {conversationId} = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();

    const {data: conversation, isLoading} = useQuery({
        queryKey: ['conversation-detail', conversationId],
        queryFn: async () => {
            if (!conversationId || !user) return null;

            const {data: conv, error} = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();

            if (error) throw error;

            const otherUserId =
                conv.participant_one === user.id ? conv.participant_two : conv.participant_one;

            const {data: profile} = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url, is_online, last_seen')
                .eq('user_id', otherUserId)
                .single();

            return {
                ...conv,
                other_user: profile,
                unread_count: 0,
                last_message: null,
            };
        },
        enabled: !!conversationId && !!user,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"/>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Conversation not found
            </div>
        );
    }

    return (
        <UnifiedChatWindow
            conversation={conversation as any}
            onBack={() => navigate('/app/messages')}
            onViewProfile={(id: string) => navigate(`/app/profile/${id}`)}
        />
    );
}


// ════════════════════════════════════════════════════════
// EVENTS PAGE
// Source: src/features/events/pages/EventsHub.tsx
// ════════════════════════════════════════════════════════

import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Film,
  Gamepad2,
  Lock,
  Map,
  MapPin,
  Music,
  Plus,
  RefreshCw,
  Shield,
  TreePine,
  Users,
  Utensils,
  Wine,
  X,
  Zap,
} from 'lucide-react';

type EventTab = 'discover' | 'attending' | 'hosting';

const CATEGORY_TABS = [
    {id: 'all', label: 'All', icon: Zap},
    {id: 'gym', label: 'Gym', icon: Dumbbell},
    {id: 'cinema', label: 'Cinema', icon: Film},
    {id: 'meetup', label: 'Meetup', icon: Users},
    {id: 'drinks', label: 'Drinks', icon: Wine},
    {id: 'food', label: 'Food', icon: Utensils},
    {id: 'music', label: 'Music', icon: Music},
    {id: 'outdoor', label: 'Outdoors', icon: TreePine},
    {id: 'gaming', label: 'Gaming', icon: Gamepad2},
];

const VIBE_TAGS = ['Chill', 'Social', 'Gaming', 'Music', 'Drinks', 'Movies', 'Outdoors', 'Fitness', 'Food', 'Art'];

const formatDate = (d?: string) => {
    if (!d) return '—';
    const date = parseISO(d);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE d MMM');
};

// ─── Event List Card (mirroring screenshot style) ─────────────────────────
const EventListCard = memo(({event, onDetail, currentUserId}: {
    event: Event; onDetail: (e: Event) => void; currentUserId?: string;
}) => {
    const isParty = event.event_type === 'party';
    const isHost = event.host_id === currentUserId;
    const hostName = event.host?.display_name || 'Host';
    const hostAvatar = event.host?.avatar_url;

    return (
        <motion.div
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            whileTap={{scale: 0.99}}
            onClick={() => onDetail(event)}
            className="mx-3 mb-2 cursor-pointer active:opacity-80 transition-opacity"
        >
            {/* ── Main content — borderless row, premium hospitality style ── */}
            <div className="flex gap-3 py-3 border-b border-border/12">

                {/* Host avatar */}
                <div className="relative shrink-0 mt-0.5">
                    <Avatar className="w-10 h-10" style={{borderRadius: '6px'}}>
                        <AvatarImage src={hostAvatar || ''} style={{borderRadius: '5px'}}/>
                        <AvatarFallback
                            className="text-sm font-bold bg-secondary"
                            style={{borderRadius: '5px'}}
                        >
                            {hostName[0]}
                        </AvatarFallback>
                    </Avatar>
                    {(event.host as any)?.is_online && (
                        <span
                            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-background"
                        />
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                    {/* Host + party badge */}
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground">{hostName}</span>
                        {isParty && (
                            <span
                                className="flex items-center gap-0.5 text-[8.5px] font-black text-primary uppercase tracking-wide"
                                style={{
                                    background: 'hsl(var(--primary)/0.08)',
                                    borderRadius: '3px',
                                    padding: '1px 5px'
                                }}
                            >
                <Shield className="w-2 h-2"/> Safe
              </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[13.5px] font-black leading-snug">{event.title}</h3>

                    {/* Description */}
                    {event.description && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                            {event.description}
                        </p>
                    )}

                    {/* Meta + tags row */}
                    <div className="flex items-center flex-wrap gap-2.5 mt-1.5 text-[10.5px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5"/>
                {formatDate(event.event_date)} · {event.start_time?.slice(0, 5)}
            </span>
                        <span className="flex items-center gap-1">
              <Users className="w-2.5 h-2.5"/>
                            {event.attendee_count}/{event.max_attendees}
            </span>
                        {event.location && (
                            <span className="flex items-center gap-1 truncate max-w-[90px]">
                <MapPin className="w-2.5 h-2.5 shrink-0"/>
                                {isParty && !isHost
                                    ? <span className="flex items-center gap-0.5"><Lock
                                        className="w-2 h-2"/> Hidden</span>
                                    : <span className="truncate">{event.location}</span>
                                }
              </span>
                        )}
                        {(event as any).vibe_tags?.slice(0, 2).map((tag: string) => (
                            <span
                                key={tag}
                                className="text-[9.5px] font-semibold text-muted-foreground/70"
                                style={{
                                    background: 'hsl(var(--secondary)/0.5)',
                                    borderRadius: '3px',
                                    padding: '1px 5px'
                                }}
                            >
                {tag}
              </span>
                        ))}
                    </div>

                    {event.is_attending && (
                        <div className="flex items-center gap-1 mt-1.5 text-emerald-500">
                            <Check className="w-3 h-3"/>
                            <span className="text-[10.5px] font-bold">Going</span>
                        </div>
                    )}
                </div>

                {/* Chevron */}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 self-center"/>
            </div>
        </motion.div>
    );
});
EventListCard.displayName = 'EventListCard';

// ─── Event Detail Sheet ───────────────────────────────────────────────────
function EventDetailSheet({event, open, onOpenChange, onJoin, onLeave, currentUserId}: {
    event: Event | null; open: boolean; onOpenChange: (v: boolean) => void;
    onJoin: (id: string) => void; onLeave: (id: string) => void;
    currentUserId?: string;
}) {
    const navigate = useNavigate();
    if (!event) return null;
    const eventType = EVENT_TYPES.find(t => t.id === event.event_type);
    const isHost = event.host_id === currentUserId;
    const isParty = event.event_type === 'party';
    const isFull = (event.attendee_count || 0) >= event.max_attendees;
    const fillPct = Math.min(100, Math.round(((event.attendee_count || 0) / event.max_attendees) * 100));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom"
                          className="h-[94dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/30">
                <div className="flex justify-center pt-3.5 pb-1">
                    <div className="w-9 h-1 rounded-full bg-border"/>
                </div>

                {/* Hero */}
                <div className="relative h-48 overflow-hidden"
                     style={{background: 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.12), hsl(var(--secondary)))'}}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[90px] opacity-25 select-none">{eventType?.icon || '📅'}</span>
                    </div>
                    {isParty && (
                        <div
                            className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5  bg-black/50 backdrop-blur-md border border-primary/30">
                            <Shield className="w-3.5 h-3.5 text-primary"/>
                            <span className="text-xs font-bold text-primary">Party Safety Active</span>
                        </div>
                    )}
                    {event.is_premium_only && (
                        <div className="absolute top-4 right-4 px-3 py-1.5  bg-black/50 backdrop-blur-md border"
                             style={{borderColor: 'hsl(var(--gold)/0.4)'}}>
                            <span className="text-xs font-bold" style={{color: 'hsl(var(--gold))'}}>👑 VIP Only</span>
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-4 pb-10">
                    <div>
                        <h2 className="text-[22px] font-black">{event.title}</h2>
                        <p className="text-sm text-muted-foreground capitalize">{eventType?.label}</p>
                    </div>

                    {/* Party Safety Protocol */}
                    {isParty && (
                        <div className="p-4  bg-primary/5 border border-primary/15 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                                    <Shield className="w-3.5 h-3.5 text-primary"/>
                                </div>
                                <p className="font-black text-sm">Party Safety Protocol</p>
                            </div>
                            <div className="space-y-2">
                                {[
                                    {icon: Lock, text: 'Precise address revealed only after host approval'},
                                    {icon: Bell, text: 'Safety check-in available on arrival'},
                                    {icon: AlertTriangle, text: 'Emergency panic button active during event'},
                                    {icon: Shield, text: 'All attendees are ID-verified users'},
                                ].map(({icon: Icon, text}) => (
                                    <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        <Icon className="w-3.5 h-3.5 shrink-0 text-primary"/> {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {[
                            {
                                icon: Calendar,
                                value: event.event_date ? format(parseISO(event.event_date), 'EEEE, MMM d') : '—'
                            },
                            {
                                icon: Clock,
                                value: `${event.start_time?.slice(0, 5)}${event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}`
                            },
                        ].map(({icon: Icon, value}) => (
                            <div key={value} className="flex items-center gap-2 p-3  bg-secondary/40">
                                <Icon className="w-4 h-4 text-muted-foreground shrink-0"/>
                                <span className="text-sm font-semibold">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2.5 p-3  bg-secondary/40">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0"/>
                        {isParty && !isHost ? (
                            <span className="text-sm text-muted-foreground/60 italic flex items-center gap-1">
                <Lock className="w-3 h-3"/> Unlocked after approval
              </span>
                        ) : (
                            <span className="text-sm font-semibold">{event.location}</span>
                        )}
                    </div>

                    {/* Capacity bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5"/>{event.attendee_count} / {event.max_attendees} attending
              </span>
                            <span
                                className={cn('font-bold', fillPct >= 90 ? 'text-destructive' : 'text-muted-foreground')}>{fillPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-border overflow-hidden">
                            <motion.div
                                initial={{width: 0}} animate={{width: `${fillPct}%`}}
                                transition={{duration: 0.7, ease: 'easeOut'}}
                                className={cn('h-full rounded-full', fillPct >= 90 ? 'bg-destructive' : 'gradient-primary')}
                            />
                        </div>
                    </div>

                    {event.description && (
                        <div className="p-4  bg-card border border-border/25">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">About</p>
                            <p className="text-sm leading-relaxed">{event.description}</p>
                        </div>
                    )}

                    {/* Host */}
                    <button
                        onClick={() => {
                            event.host_id && navigate(`/app/profile/${event.host_id}`);
                            onOpenChange(false);
                        }}
                        className="flex items-center gap-3 p-4  bg-card border border-border/25 w-full text-left hover:border-primary/25 active:scale-[0.99] transition-all"
                    >
                        <Avatar className="w-12 h-12 border-2 border-border/40">
                            <AvatarImage src={event.host?.avatar_url || ''}/>
                            <AvatarFallback
                                className="text-lg font-bold">{event.host?.display_name?.[0] || 'H'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{event.host?.display_name || 'Host'}</p>
                            <p className="text-xs text-muted-foreground">Event host</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                    </button>

                    {/* CTA */}
                    {!isHost && (
                        event.is_attending ? (
                            <button onClick={() => {
                                onLeave(event.id);
                                onOpenChange(false);
                            }}
                                    className="w-full h-14  border-2 border-destructive/30 text-destructive font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                                <X className="w-5 h-5"/> Leave Event
                            </button>
                        ) : (
                            <button disabled={isFull} onClick={() => {
                                onJoin(event.id);
                                onOpenChange(false);
                            }}
                                    className="w-full h-14  gradient-primary shadow-[0_6px_28px_hsl(var(--primary)/0.35)] font-bold text-primary-foreground flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-50">
                                <Check className="w-5 h-5"/>
                                {isParty ? 'Request to Join' : isFull ? 'Event is Full' : 'Join Event'}
                            </button>
                        )
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ─── Create Event Sheet ────────────────────────────────────────────────────
function CreateEventSheet({open, onClose}: { open: boolean; onClose: () => void }) {
    const createEvent = useCreateEvent();
    const [form, setForm] = useState({
        title: '', description: '', event_type: 'meetup',
        location: '', event_date: '', start_time: '',
        max_attendees: 20, is_party: false, visibility: 'public',
        vibe_tags: [] as string[],
    });
    const upd = (k: string, v: unknown) => setForm(p => ({...p, [k]: v}));
    const toggleTag = (tag: string) => setForm(p => ({
        ...p, vibe_tags: p.vibe_tags.includes(tag) ? p.vibe_tags.filter(t => t !== tag) : [...p.vibe_tags, tag],
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createEvent.mutate({
            ...form,
            event_type: form.is_party ? 'party' : form.event_type,
        }, {onSuccess: onClose});
    };

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="bottom" className="h-[95dvh] rounded-t-3xl overflow-y-auto p-0 bg-background">
                <div className="flex justify-center pt-3.5 pb-1">
                    <div className="w-9 h-1 rounded-full bg-border"/>
                </div>
                <div className="px-5 pb-2 pt-1">
                    <SheetTitle className="text-lg font-black">Create Chill Session</SheetTitle>
                </div>
                <form onSubmit={handleSubmit} className="px-5 pb-10 space-y-5">
                    {/* What's the vibe */}
                    <Input
                        placeholder="What's the vibe?"
                        value={form.title}
                        onChange={(e) => upd('title', e.target.value)}
                        className="h-12 text-sm bg-secondary/40 border-border/30  font-semibold"
                        required
                    />

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Description</Label>
                        <Textarea
                            placeholder="Tell people what to expect…"
                            value={form.description}
                            onChange={(e) => upd('description', e.target.value)}
                            className="min-h-[100px]  bg-secondary/40 border-border/30 text-sm resize-none"
                        />
                    </div>

                    {/* Vibe Tags */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Vibe Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {VIBE_TAGS.map((tag) => {
                                const active = form.vibe_tags.includes(tag);
                                return (
                                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                            className={cn(
                                                'px-3.5 py-1.5  text-sm font-semibold border transition-all',
                                                active ? 'gradient-primary text-white border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/40'
                                            )}>
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date / Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-sm font-semibold">
                                <Clock className="w-3.5 h-3.5"/> Date *
                            </Label>
                            <Input type="date" value={form.event_date}
                                   onChange={(e) => upd('event_date', e.target.value)}
                                   className="h-11  bg-secondary/40 border-border/30 text-sm" required/>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Time *</Label>
                            <Input type="time" value={form.start_time}
                                   onChange={(e) => upd('start_time', e.target.value)}
                                   className="h-11  bg-secondary/40 border-border/30 text-sm" required/>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-sm font-semibold">
                            <MapPin className="w-3.5 h-3.5"/> Location
                        </Label>
                        <Input
                            placeholder="Where's the spot?"
                            value={form.location}
                            onChange={(e) => upd('location', e.target.value)}
                            className="h-11  bg-secondary/40 border-border/30 text-sm"
                        />
                    </div>

                    {/* Max attendees */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-sm font-semibold">
                            <Users className="w-3.5 h-3.5"/> Max Attendees: {form.max_attendees}
                        </Label>
                        <Input type="range" min={2} max={200} value={form.max_attendees}
                               onChange={(e) => upd('max_attendees', Number(e.target.value))}
                               className="w-full"/>
                    </div>

                    {/* Party toggle */}
                    <div className="flex items-center justify-between p-4  bg-card border border-border/30">
                        <div>
                            <p className="font-bold text-sm flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-primary"/> House Party Mode
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">Enables safety protocol & address
                                gating</p>
                        </div>
                        <Switch checked={form.is_party} onCheckedChange={(v) => upd('is_party', v)}/>
                    </div>

                    <button
                        type="submit"
                        disabled={createEvent.isPending || !form.title || !form.event_date || !form.start_time}
                        className="w-full h-14  gradient-primary shadow-[0_4px_24px_hsl(var(--primary)/0.4)] font-black text-primary-foreground flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {createEvent.isPending ? (
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                        ) : (
                            <><Plus className="w-5 h-5"/> Create Session</>
                        )}
                    </button>
                </form>
            </SheetContent>
        </Sheet>
    );
}

// ─── Main EventsHub ────────────────────────────────────────────────────────
export default function EventsHub() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {t} = useLocaleStore();
    const eventsQuery = useEvents();
    const {isLoading, refetch} = eventsQuery;
    const joinEvent = useJoinEvent();
    const leaveEvent = useLeaveEvent();

    const [tab, setTab] = useState<EventTab>('discover');
    const [category, setCategory] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [detailEvent, setDetailEvent] = useState<Event | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    const openDetail = (event: Event) => {
        setDetailEvent(event);
        setDetailOpen(true);
    };

    const allEvents = eventsQuery.data || [];
    const filtered = useMemo(() => {
        let list = [...allEvents];
        if (tab === 'attending') list = list.filter(e => e.is_attending && e.host_id !== user?.id);
        if (tab === 'hosting') list = list.filter(e => e.host_id === user?.id);
        if (category !== 'all') list = list.filter(e => e.event_type === category || (category === 'gym' && e.event_type === 'fitness'));
        return list;
    }, [allEvents, tab, category, user?.id]);

    const nearbyCount = filtered.length;

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            {/* ─── Header ─── */}
            <header className="flex-shrink-0 bg-background/95 backdrop-blur-2xl border-b border-border/20 z-40">
                <div className="px-4 pt-4 pb-0">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-[15px] font-black tracking-widest uppercase">{t('events.title')}</h1>
                        <div className="flex gap-2">
                            <button onClick={() => refetch()}
                                    className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center active:rotate-180 transition-transform duration-500">
                                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground"/>
                            </button>
                            <button onClick={() => setCreateOpen(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5  gradient-primary shadow-[0_4px_16px_hsl(var(--primary)/0.35)] text-white text-xs font-black active:scale-95 transition-all">
                                <Plus className="w-3.5 h-3.5"/> {t('events.host')}
                            </button>
                        </div>
                    </div>

                    {/* Main tabs — matching screenshot pill style */}
                    <div className="flex gap-2 pb-3">
                        {(['discover', 'attending', 'hosting'] as EventTab[]).map((t_) => {
                            const labels: Record<EventTab, string> = {
                                discover: t('events.discover'),
                                attending: t('events.attending'),
                                hosting: t('events.hosting'),
                            };
                            const icons: Record<EventTab, React.ReactNode> = {
                                discover: <Sparkles className="w-3.5 h-3.5"/>,
                                attending: <Check className="w-3.5 h-3.5"/>,
                                hosting: <Calendar className="w-3.5 h-3.5"/>,
                            };
                            const isActive = tab === t_;
                            return (
                                <button key={t_} onClick={() => setTab(t_)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-4 py-2  text-xs font-bold border transition-all',
                                            isActive
                                                ? 'gradient-primary text-white border-primary shadow-[0_4px_16px_hsl(var(--primary)/0.3)]'
                                                : 'bg-card border-border/40 text-muted-foreground hover:border-primary/30'
                                        )}>
                                    {icons[t_]} {labels[t_]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Category chips */}
                    <div ref={categoryRef} className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                        {CATEGORY_TABS.map(({id, label, icon: Icon}) => {
                            const isActive = category === id;
                            return (
                                <button key={id} onClick={() => setCategory(id)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-2  border text-[11px] font-bold shrink-0 transition-all',
                                            isActive
                                                ? 'bg-card border-primary/50 text-foreground'
                                                : 'bg-secondary/30 border-border/20 text-muted-foreground hover:border-border/50'
                                        )}>
                                    <Icon className={cn('w-4 h-4', isActive && 'text-primary')}/>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ─── List ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pt-3">
                {/* Nearby count + map button */}
                {tab === 'discover' && !isLoading && (
                    <div className="flex items-center justify-between px-4 mb-3">
                        <p className="text-sm text-muted-foreground">
                            <span className="text-foreground font-bold">{nearbyCount}</span> {t('events.nearby')}
                        </p>
                        <button
                            onClick={() => navigate('/app/right-now/map')}
                            className="flex items-center gap-1.5 px-3.5 py-2  border border-border/40 bg-card text-xs font-bold hover:border-primary/30 active:scale-95 transition-all"
                        >
                            <Map className="w-3.5 h-3.5 text-muted-foreground"/> {t('events.map')}
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="px-4 space-y-3">
                            {Array.from({length: 3}).map((_, i) => (
                                <div key={i} className="h-36 bg-card animate-pulse  border border-border/20"/>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <motion.div key={tab + category} initial={{opacity: 0}} animate={{opacity: 1}}>
                            {filtered.map((event) => (
                                <EventListCard
                                    key={event.id}
                                    event={event}
                                    onDetail={openDetail}
                                    currentUserId={user?.id}
                                />
                            ))}
                            <div className="h-4"/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{opacity: 0, scale: 0.96}} animate={{opacity: 1, scale: 1}}
                            className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5"
                        >
                            <div className="w-20 h-20  bg-secondary flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-muted-foreground/40"/>
                            </div>
                            <div>
                                <p className="font-black text-base">
                                    {tab === 'hosting' ? 'Not hosting any events' : tab === 'attending' ? 'Not attending any events' : 'No events nearby'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {tab === 'hosting' ? 'Create your first event to get started' : 'Check back later or create your own!'}
                                </p>
                            </div>
                            <button
                                onClick={() => setCreateOpen(true)}
                                className="flex items-center gap-2 h-12 px-6  gradient-primary shadow-[0_4px_24px_hsl(var(--primary)/0.4)] font-bold text-white active:scale-[0.98] transition-all"
                            >
                                <Plus className="w-4 h-4"/> Host Event
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sheets */}
            <CreateEventSheet open={createOpen} onClose={() => setCreateOpen(false)}/>
            <EventDetailSheet
                event={detailEvent}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onJoin={(id) => joinEvent.mutate(id)}
                onLeave={(id) => leaveEvent.mutate(id)}
                currentUserId={user?.id}
            />
        </div>
    );
}

// Missing import for Sparkles
function Sparkles(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            <path d="M20 3v4"/>
            <path d="M22 5h-4"/>
            <path d="M4 17v2"/>
            <path d="M5 18H3"/>
        </svg>
    );
}


// ════════════════════════════════════════════════════════
// PROFILE PAGE
// Source: src/features/profile/pages/MePage.tsx
// ════════════════════════════════════════════════════════

import {
    BadgeCheck,
    Bell,
    Bot,
    Camera,
    Check,
    ChevronRight,
    Crown,
    Edit3,
    Eye,
    GripVertical,
    Heart,
    Lock,
    LogOut,
    MapPin,
    Plus,
    RefreshCw,
    Settings,
    Share2,
    Shield,
    Star,
    Trash2,
    Zap,
} from 'lucide-react';
import {
    useAddProfilePhoto,
    useDeleteProfilePhoto,
    useProfilePhotos,
    useReorderPhotos,
    useSetPrimaryPhoto
} from '@/hooks/useProfilePhotos';

const TRIBES = ['Bear', 'Jock', 'Twink', 'Daddy', 'Muscle', 'Otter', 'Cub', 'Leather', 'Geek', 'Trans', 'Non-binary', 'Femme', 'Masc', 'Poz'];
const LOOKING_FOR = ['Chat', 'Friends', 'Dates', 'Relationship', 'Hookup', 'Networking', 'Travel Buddy'];
const POSITIONS = ['Top', 'Bottom', 'Vers', 'Side', 'Oral'];
const REL_STATUSES = ['Single', 'Partnered', 'Open', 'Complicated'];

type EditSheet = 'none' | 'basics' | 'about' | 'tribes' | 'looking-for' | 'privacy' | 'photos';

// ── Real-time save toast ─────────────────────────────────────
function SaveToast({saving}: { saving: boolean }) {
    return (
        <AnimatePresence>
            {saving && (
                <motion.div
                    initial={{opacity: 0, y: 20, scale: 0.9}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: 10, scale: 0.9}}
                    className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5  shadow-lg"
                    style={{background: 'hsl(155 65% 42%)', boxShadow: '0 4px 20px hsl(155 65% 42% / 0.4)'}}
                >
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                    <span className="text-[12px] font-bold text-white">Saving…</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Compact stat — no card wrapper, tight ────────────────────
function Stat({value, label, icon: Icon, color}: {
    value: string | number; label: string; icon: React.FC<any>; color: string;
}) {
    return (
        <div className="flex-1 flex flex-col items-center py-3"
             style={{borderRight: '1px solid hsl(var(--border)/0.2)'}}>
            <Icon className={cn('w-3.5 h-3.5 mb-1', color)}/>
            <span className={cn('text-[19px] font-black leading-none', color)}>{value}</span>
            <span
                className="text-[8.5px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider text-center">{label}</span>
        </div>
    );
}

// ── Photo Grid (9-slot, drag to reorder) ────────────────────
function PhotoGrid({userId}: { userId: string }) {
    const {data: photos = [], isLoading} = useProfilePhotos(userId);
    const add = useAddProfilePhoto();
    const remove = useDeleteProfilePhoto();
    const setPrim = useSetPrimaryPhoto();
    const reorder = useReorderPhotos();
    const fileRef = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState<typeof photos>([]);
    const [reordering, setReordering] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const MAX = 9;

    const startReorder = () => {
        setItems([...photos]);
        setReordering(true);
    };
    const saveReorder = () => {
        reorder.mutate(items.map(p => p.id));
        setReordering(false);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        add.mutate({file: f, isPrimary: photos.length === 0});
        e.target.value = '';
    };

    const displayPhotos = reordering ? items : photos;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em]">
                    Photos · {photos.length}/{MAX}
                </p>
                <div className="flex items-center gap-2">
                    {photos.length > 1 && (
                        reordering ? (
                            <button onClick={saveReorder}
                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 active:opacity-70">
                                <Check className="w-3 h-3"/> Done
                            </button>
                        ) : (
                            <button onClick={startReorder}
                                    className="flex items-center gap-1 text-[11px] font-bold text-primary active:opacity-70">
                                <GripVertical className="w-3 h-3"/> Reorder
                            </button>
                        )
                    )}
                </div>
            </div>

            {reordering ? (
                <Reorder.Group axis="x" values={items} onReorder={setItems} className="grid grid-cols-3 gap-2">
                    {items.map((photo) => (
                        <Reorder.Item key={photo.id} value={photo} className="aspect-square">
                            <div className="aspect-square  overflow-hidden relative cursor-grab active:cursor-grabbing">
                                <img src={photo.url} alt="" className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <GripVertical className="w-6 h-6 text-white/80"/>
                                </div>
                                {photo.is_primary && (
                                    <div
                                        className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary text-[8px] font-black text-white">
                                        MAIN
                                    </div>
                                )}
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {isLoading ? (
                        Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="aspect-square  bg-secondary animate-pulse"/>
                        ))
                    ) : (
                        Array.from({length: MAX}).map((_, idx) => {
                            const photo = displayPhotos[idx];
                            const isSelected = selected === photo?.id;

                            if (photo) {
                                return (
                                    <motion.div
                                        key={photo.id}
                                        initial={{opacity: 0, scale: 0.88}}
                                        animate={{opacity: 1, scale: 1}}
                                        className="aspect-square  overflow-hidden relative group"
                                        onClick={() => setSelected(isSelected ? null : photo.id)}
                                    >
                                        <img src={photo.url} alt="" className="w-full h-full object-cover"/>

                                        {/* Overlay */}
                                        <div className={cn(
                                            'absolute inset-0 transition-all duration-200',
                                            isSelected ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/35',
                                        )}/>

                                        {/* Primary badge */}
                                        {photo.is_primary && (
                                            <div
                                                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary text-[8px] font-black text-white shadow-sm">
                                                MAIN
                                            </div>
                                        )}

                                        {/* Action overlay */}
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                    className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5"
                                                >
                                                    {!photo.is_primary && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPrim.mutate(photo.id);
                                                                setSelected(null);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5  bg-primary/90 text-white text-[9px] font-bold">
                                                            <Star className="w-2.5 h-2.5"/> Set Main
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            remove.mutate(photo.id);
                                                            setSelected(null);
                                                        }}
                                                        className="w-8 h-8  bg-destructive/80 flex items-center justify-center shrink-0">
                                                        <Trash2 className="w-3 h-3 text-white"/>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            }

                            // Add slot
                            if (idx === photos.length) {
                                return (
                                    <label key={`add-${idx}`}
                                           className="aspect-square  border-2 border-dashed border-border/40 bg-secondary/15 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all">
                                        {add.isPending ? (
                                            <div
                                                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5 text-muted-foreground/50 mb-1"/>
                                                <span
                                                    className="text-[9px] text-muted-foreground/50 font-medium">Add</span>
                                            </>
                                        )}
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                               onChange={handleFile}/>
                                    </label>
                                );
                            }

                            return <div key={`empty-${idx}`}
                                        className="aspect-square  bg-secondary/8 border border-border/8"/>;
                        })
                    )}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center">
                Tap photo to edit · Drag to reorder · Max {MAX} photos
            </p>
        </div>
    );
}

// ── Quick action tile — tighter, sharper ─────────────────────
function ActionTile({icon: Icon, label, onClick, badge, highlight, dim}: {
    icon: React.FC<any>; label: string; onClick?: () => void;
    badge?: string; highlight?: boolean; dim?: boolean;
}) {
    return (
        <motion.button
            whileTap={{scale: 0.94}}
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 border transition-all duration-150',
                highlight ? 'border-primary/25' : 'border-border/15',
                dim && 'opacity-40',
            )}
            style={{
                borderRadius: '6px',
                background: highlight ? 'hsl(var(--primary)/0.07)' : 'hsl(var(--secondary)/0.25)'
            }}
        >
            <div
                className="w-8 h-8 flex items-center justify-center"
                style={{
                    borderRadius: '6px',
                    background: highlight ? 'var(--gradient-primary)' : 'hsl(var(--secondary)/0.7)'
                }}
            >
                <Icon className={cn('w-4 h-4', highlight ? 'text-white' : 'text-muted-foreground')}/>
            </div>
            <span
                className={cn('text-[10.5px] font-bold text-center leading-tight', highlight ? 'text-primary' : 'text-foreground/75')}>
        {label}
      </span>
            {badge && (
                <span
                    className="text-muted-foreground text-[8.5px] font-black tracking-widest"
                    style={{background: 'hsl(var(--secondary)/0.8)', borderRadius: '3px', padding: '1px 5px'}}
                >
          {badge}
        </span>
            )}
        </motion.button>
    );
}

// ── Main ─────────────────────────────────────────────────────
export default function MePage() {
    const navigate = useNavigate();
    const {user, signOut} = useAuth();
    const {profile, isLoading} = useProfile();
    const {isPremium, currentPlan} = useSubscription();
    const updateProfile = useUpdateProfile();
    const {t} = useLocaleStore();

    const [editSheet, setEditSheet] = useState<EditSheet>('none');
    const [editForm, setEditForm] = useState<Record<string, unknown>>({});
    const [view, setView] = useState<'account' | 'photos'>('account');
    const coverRef = useRef<HTMLInputElement>(null);

    const openEdit = (sheet: EditSheet) => {
        if (!profile) return;
        setEditForm({
            display_name: profile.display_name || '',
            age: profile.age || '',
            height: (profile as any).height || '',
            weight: (profile as any).weight || '',
            city: profile.city || '',
            bio: profile.bio || '',
            tribes: profile.tribes || [],
            looking_for: profile.looking_for || [],
            relationship_status: (profile as any).relationship_status || '',
            position: (profile as any).position || '',
            show_distance: (profile as any).show_distance ?? true,
            show_online: (profile as any).show_online ?? true,
            incognito: (profile as any).incognito ?? false,
        });
        setEditSheet(sheet);
    };

    const upd = (k: string, v: unknown) => setEditForm(p => ({...p, [k]: v}));
    const toggleArr = (k: 'tribes' | 'looking_for', val: string) => {
        const arr = (editForm[k] as string[]) || [];
        setEditForm(p => ({...p, [k]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]}));
    };
    const handleSave = () => updateProfile.mutate(editForm as any, {onSuccess: () => setEditSheet('none')});

    const Handle = () => (
        <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-border/60"/>
        </div>
    );

    const SaveRow = () => (
        <div className="flex gap-3 pt-4 pb-2">
            <Button variant="outline" className="flex-1 h-12  font-bold" onClick={() => setEditSheet('none')}>
                Cancel
            </Button>
            <Button
                className="flex-[2] h-12  font-bold gradient-primary shadow-[0_4px_20px_hsl(var(--primary)/0.3)] border-0"
                onClick={handleSave} disabled={updateProfile.isPending}
            >
                {updateProfile.isPending ? (
                    <>
                        <div
                            className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                        Saving…</>
                ) : (
                    <><Check className="w-4 h-4 mr-1.5"/>Save</>
                )}
            </Button>
        </div>
    );

    // Loading skeleton
    if (isLoading) return (
        <div className="h-full bg-background overflow-y-auto">
            <div className="h-36 bg-secondary animate-pulse"/>
            <div className="px-4 -mt-10 space-y-4">
                <div className="w-20 h-20 rounded-full bg-secondary animate-pulse border-4 border-background"/>
                <div className="h-5 w-32 bg-secondary rounded animate-pulse"/>
                <div className="h-3 w-24 bg-secondary/60 rounded animate-pulse"/>
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({length: 6}).map((_, i) => <div key={i} className="h-20 bg-secondary animate-pulse "/>)}
                </div>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-14 h-14  gradient-primary flex items-center justify-center">
                <Crown className="w-7 h-7 text-white"/>
            </div>
            <p className="text-muted-foreground text-[14px]">Profile not found. Complete your setup.</p>
            <Button onClick={() => navigate('/onboarding')} className="gradient-primary border-0  h-11 px-6 font-bold">
                Get Started
            </Button>
        </div>
    );

    // Completeness
    const checks = [
        profile.display_name, profile.age, profile.city, profile.bio,
        profile.avatar_url,
        (profile.tribes || []).length > 0,
        (profile.looking_for || []).length > 0,
        (profile as any).height,
        (profile as any).position,
        user?.email,
    ];
    const completeness = Math.round(checks.filter(Boolean).length / checks.length * 100);
    const missing = [
        !profile.bio && 'Bio',
        !profile.avatar_url && 'Photo',
        !(profile as any).position && 'Position',
        !profile.age && 'Age',
        !profile.city && 'City',
        !(profile as any).height && 'Height',
        !(profile.tribes || []).length && 'Tribe',
    ].filter(Boolean) as string[];

    const tribes = profile.tribes || [];
    const lookingFor = profile.looking_for || [];

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <SaveToast saving={updateProfile.isPending}/>

            <div className="flex-1 overflow-y-auto scrollbar-hide">

                {/* ─── Sticky header ─ */}
                <header
                    className="sticky top-0 z-40 glass-nav border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
                    <h1 className="text-[15px] font-black uppercase tracking-[0.08em]">My Profile</h1>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center active:rotate-180 transition-transform duration-500"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground"/>
                    </button>
                </header>

                {/* ─── Full-bleed cover ─ */}
                <div className="relative">
                    {/* Cover image */}
                    <div className="relative h-40 overflow-hidden">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt=""
                                 className="w-full h-full object-cover scale-110 blur-sm brightness-[0.35]"/>
                        ) : (
                            <div className="absolute inset-0" style={{
                                background: 'linear-gradient(135deg, hsl(var(--primary)/0.25) 0%, hsl(var(--card)) 50%, hsl(var(--accent)/0.15) 100%)',
                            }}/>
                        )}
                        {/* Gradient fade to background */}
                        <div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"/>
                    </div>

                    {/* Avatar – overlapping */}
                    <div className="absolute bottom-[-36px] left-4">
                        <div className="relative">
                            {/* Gradient ring */}
                            <div className="p-[2.5px] rounded-full shadow-lg"
                                 style={{background: 'var(--gradient-primary)'}}>
                                <Avatar className="w-[72px] h-[72px] border-[3px] border-background">
                                    <AvatarImage src={profile.avatar_url || ''}/>
                                    <AvatarFallback className="text-[26px] font-black bg-secondary">
                                        {(profile.display_name || 'U')[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {/* Camera FAB */}
                            <button
                                onClick={() => openEdit('photos')}
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-primary flex items-center justify-center border-2 border-background shadow-md active:scale-90 transition-transform"
                            >
                                <Camera className="w-3 h-3 text-white"/>
                            </button>
                        </div>
                    </div>

                    {/* Edit button – top right of cover zone */}
                    <div className="absolute bottom-[-28px] right-4">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3  border-border/50 text-[12px] font-bold bg-background/80 backdrop-blur-sm"
                            onClick={() => openEdit('basics')}
                        >
                            <Edit3 className="w-3 h-3 mr-1.5"/>Edit
                        </Button>
                    </div>
                </div>

                {/* ─── Profile info ─ */}
                <div className="px-4 pt-12 pb-0">
                    {/* Name + verification */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h2 className="text-[20px] font-black tracking-tight">
                                    {profile.display_name || 'Set your name'}
                                </h2>
                                {profile.is_verified && <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0"/>}
                                {isPremium && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                                         style={{background: 'hsl(var(--gold)/0.15)'}}>
                                        <Crown className="w-3 h-3" style={{color: 'hsl(var(--gold))'}}/>
                                        <span className="text-[9px] font-black" style={{color: 'hsl(var(--gold))'}}>
                      {(currentPlan || 'PRO').toUpperCase()}
                    </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-muted-foreground">
                                {profile.age && <span>{profile.age}</span>}
                                {profile.city && (
                                    <>
                                        <span>·</span>
                                        <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3"/>{profile.city}
                    </span>
                                    </>
                                )}
                                {(profile as any).position && (
                                    <>
                                        <span>·</span>
                                        <span>{(profile as any).position}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio ? (
                        <p className="text-[13px] text-foreground/70 leading-relaxed mb-4 line-clamp-3">{profile.bio}</p>
                    ) : (
                        <button onClick={() => openEdit('about')}
                                className="w-full mb-4 py-3  border border-dashed border-border/40 text-[12px] text-muted-foreground font-medium hover:border-primary/30 transition-colors">
                            + Add a bio
                        </button>
                    )}

                    {/* Tribes + Looking For pills */}
                    {(tribes.length > 0 || lookingFor.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {tribes.slice(0, 3).map(t => (
                                <span key={t} className="chip chip-primary">{t}</span>
                            ))}
                            {lookingFor.slice(0, 3).map(l => (
                                <span key={l} className="chip chip-muted">{l}</span>
                            ))}
                        </div>
                    )}

                    {/* Completeness bar */}
                    <div className="mb-4 p-3.5  bg-secondary/20 border border-border/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-muted-foreground">Profile strength</span>
                            <span className="text-[12px] font-black text-primary">{completeness}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                            <motion.div
                                initial={{width: 0}}
                                animate={{width: `${completeness}%`}}
                                transition={{duration: 1, ease: [0.16, 1, 0.3, 1]}}
                                className="h-full rounded-full gradient-primary"
                            />
                        </div>
                        {missing.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                                Add {missing.slice(0, 3).join(', ')}{missing.length > 3 ? ` +${missing.length - 3}` : ''} to
                                boost visibility
                            </p>
                        )}
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-2 mb-5">
                        <Stat value={0} label="Views" icon={Eye} color="text-muted-foreground"/>
                        <Stat value={0} label="Taps" icon={Zap} color="text-primary"/>
                        <Stat value={0} label="Likes" icon={Heart} color="text-muted-foreground"/>
                        <Stat value="4.8" label="Score" icon={Star} color="text-[hsl(var(--gold))]"/>
                    </div>
                </div>

                {/* ─── View tabs ─ */}
                <div className="px-4 mb-4">
                    <div className="flex gap-0 p-0.5 bg-secondary/40 ">
                        {(['account', 'photos'] as const).map((v) => (
                            <button key={v} onClick={() => setView(v)}
                                    className={cn(
                                        'flex-1 py-1.5 rounded-[10px] text-[12px] font-bold transition-all duration-200',
                                        view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                                    )}>
                                {v === 'account' ? 'Account' : 'Photos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Account view ─ */}
                <AnimatePresence mode="wait">
                    {view === 'account' ? (
                        <motion.div key="account" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="px-4 space-y-3">
                            {/* Quick actions grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <ActionTile icon={Bot} label="AI King" highlight
                                            onClick={() => navigate('/app/settings')}/>
                                <ActionTile icon={Crown}
                                            label={isPremium ? (currentPlan?.toUpperCase() || 'PRO') : 'Upgrade'}
                                            onClick={() => navigate('/app/settings/subscription')}/>
                                <ActionTile icon={Settings} label="Settings" onClick={() => navigate('/app/settings')}/>
                                <ActionTile icon={Bell} label="Notifications"
                                            onClick={() => navigate('/app/notifications')}/>
                                <ActionTile icon={Shield} label="Privacy" onClick={() => navigate('/app/safety')}/>
                                <ActionTile icon={Lock} label="Security"
                                            onClick={() => navigate('/app/settings/security')}/>
                            </div>

                            {/* Profile quick-edit links */}
                            {[
                                {
                                    label: 'Edit Basics',
                                    sub: `${profile.display_name || '—'}${profile.age ? `, ${profile.age}` : ''}`,
                                    sheet: 'basics' as EditSheet
                                },
                                {
                                    label: 'My Tribes',
                                    sub: tribes.length ? tribes.join(', ') : 'Not set',
                                    sheet: 'tribes' as EditSheet
                                },
                                {
                                    label: 'Looking For',
                                    sub: lookingFor.length ? lookingFor.join(', ') : 'Not set',
                                    sheet: 'looking-for' as EditSheet
                                },
                                {
                                    label: 'Bio & About',
                                    sub: profile.bio ? `${profile.bio.slice(0, 50)}…` : 'Not set',
                                    sheet: 'about' as EditSheet
                                },
                                {label: 'Privacy', sub: 'Distance, online status', sheet: 'privacy' as EditSheet},
                            ].map(({label, sub, sheet}) => (
                                <motion.button
                                    key={label}
                                    whileTap={{scale: 0.99}}
                                    onClick={() => openEdit(sheet)}
                                    className="w-full flex items-center justify-between px-4 py-3.5  bg-card border border-border/20 hover:border-border/35 transition-colors"
                                >
                                    <div className="text-left min-w-0">
                                        <p className="text-[13px] font-bold">{label}</p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sub}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0"/>
                                </motion.button>
                            ))}

                            {/* Share + sign out */}
                            <Button
                                variant="outline"
                                className="w-full h-12  font-bold border-border/40 text-[13px]"
                                onClick={() => navigator.share?.({
                                    title: profile.display_name || 'My Profile',
                                    url: window.location.href
                                })}
                            >
                                <Share2 className="w-4 h-4 mr-2"/> Share My Profile
                            </Button>

                            {/* Footer */}
                            <div
                                className="flex items-center justify-between px-1 py-2 text-[11px] text-muted-foreground/40">
                                <span>FindYourKing · Zenith Ω v1.0</span>
                                <button
                                    onClick={signOut}
                                    className="flex items-center gap-1.5 text-destructive/50 hover:text-destructive transition-colors">
                                    <LogOut className="w-3 h-3"/> Sign out
                                </button>
                            </div>

                            <div className="h-4"/>
                        </motion.div>
                    ) : (
                        <motion.div key="photos" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="px-4 pb-8">
                            <PhotoGrid userId={user?.id || ''}/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Edit Sheets ─ */}

            {/* Photos */}
            <Sheet open={editSheet === 'photos'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[92dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">My
                        Photos</SheetTitle></div>
                    <div className="px-5 pb-10"><PhotoGrid userId={user?.id || ''}/></div>
                </SheetContent>
            </Sheet>

            {/* Basics */}
            <Sheet open={editSheet === 'basics'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[92dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Edit
                        Profile</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        {[
                            {key: 'display_name', label: 'Display Name', type: 'text', ph: 'Your name'},
                            {key: 'age', label: 'Age', type: 'number', ph: '25'},
                            {key: 'city', label: 'City', type: 'text', ph: 'London, UK'},
                            {key: 'height', label: 'Height (cm)', type: 'number', ph: '180'},
                            {key: 'weight', label: 'Weight (kg)', type: 'number', ph: '75'},
                        ].map(({key, label, type, ph}) => (
                            <div key={key} className="space-y-1.5">
                                <Label
                                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">{label}</Label>
                                <Input
                                    type={type} placeholder={ph}
                                    value={String(editForm[key] || '')}
                                    onChange={(e) => upd(key, type === 'number' ? (Number(e.target.value) || '') : e.target.value)}
                                    className="h-12  bg-secondary/40 border-border/25 text-[13px]"
                                />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <Label
                                className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Position</Label>
                            <div className="flex flex-wrap gap-2">
                                {POSITIONS.map((p) => {
                                    const active = editForm.position === p;
                                    return (
                                        <button key={p} onClick={() => upd('position', active ? '' : p)}
                                                className={cn(
                                                    'px-3 py-1.5  text-[12px] font-bold border transition-all',
                                                    active ? 'bg-primary text-primary-foreground border-primary' : 'border-border/40 text-muted-foreground',
                                                )}>
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* About/Bio */}
            <Sheet open={editSheet === 'about'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[80dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Bio &
                        About</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        <div className="space-y-1.5">
                            <Label
                                className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Bio</Label>
                            <Textarea
                                placeholder="Tell people about yourself, your interests, what you're looking for…"
                                value={String(editForm.bio || '')}
                                onChange={(e) => upd('bio', e.target.value)}
                                className="min-h-[120px]  bg-secondary/40 border-border/25 text-[13px] resize-none"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">{String(editForm.bio || '').length}/500</p>
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Tribes */}
            <Sheet open={editSheet === 'tribes'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[80dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">My
                        Tribes</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {TRIBES.map((tribe) => {
                                const active = ((editForm.tribes as string[]) || []).includes(tribe);
                                return (
                                    <button key={tribe} onClick={() => toggleArr('tribes', tribe)}
                                            className={cn(
                                                'px-3.5 py-2  text-[12px] font-bold border transition-all',
                                                active
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                                                    : 'border-border/40 text-muted-foreground hover:border-primary/30',
                                            )}>
                                        {tribe}
                                    </button>
                                );
                            })}
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Looking For */}
            <Sheet open={editSheet === 'looking-for'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[72dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Looking
                        For</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {LOOKING_FOR.map((l) => {
                                const active = ((editForm.looking_for as string[]) || []).includes(l);
                                return (
                                    <button key={l} onClick={() => toggleArr('looking_for', l)}
                                            className={cn(
                                                'px-3.5 py-2  text-[12px] font-bold border transition-all',
                                                active
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                                                    : 'border-border/40 text-muted-foreground',
                                            )}>
                                        {l}
                                    </button>
                                );
                            })}
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Privacy */}
            <Sheet open={editSheet === 'privacy'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[65dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Privacy</SheetTitle>
                    </div>
                    <div className="px-5 pb-10 space-y-3">
                        {[
                            {key: 'show_distance', label: 'Show distance', sub: 'Others can see how far you are'},
                            {key: 'show_online', label: 'Show online status', sub: 'Others see when you\'re active'},
                            {key: 'incognito', label: 'Incognito mode', sub: 'Browse without being seen'},
                        ].map(({key, label, sub}) => (
                            <div key={key}
                                 className="flex items-center justify-between p-4  bg-secondary/20 border border-border/20">
                                <div>
                                    <p className="text-[13px] font-bold">{label}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                                </div>
                                <Switch
                                    checked={!!(editForm[key])}
                                    onCheckedChange={(v) => upd(key, v)}
                                />
                            </div>
                        ))}
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// SETTINGS PAGE
// Source: src/features/settings/pages/SettingsPage.tsx
// ════════════════════════════════════════════════════════


const NAV_ITEMS = [
    {
        id: 'account',
        icon: User,
        label: 'Account',
        desc: 'Email, password, delete account',
        path: '/app/settings/account'
    },
    {
        id: 'privacy',
        icon: Shield,
        label: 'Privacy & Security',
        desc: 'Visibility, data, blocking',
        path: '/app/settings/privacy'
    },
    {
        id: 'biometric',
        icon: Fingerprint,
        label: 'Face ID / Touch ID',
        desc: 'Use biometrics to unlock the app',
        path: '/app/settings/security',
        action: 'biometric' as const,
    },
    {
        id: 'notifications',
        icon: Bell,
        label: 'Notifications',
        desc: 'Push, email, in-app alerts',
        path: '/app/settings/notifications'
    },
    {
        id: 'subscription',
        icon: CreditCard,
        label: 'Subscription',
        desc: 'Plans, billing, manage',
        path: '/app/settings/subscription'
    },
    {
        id: 'help',
        icon: HelpCircle,
        label: 'Help & Support',
        desc: 'FAQ, contact, community guidelines',
        path: '/app/settings/help'
    },
];

export default function SettingsPage() {
    const navigate = useNavigate();
    const {user, signOut} = useAuth();
    const {profile} = useProfile();
    const {isPremium, currentPlan} = useSubscription();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ── Header ── */}
            <header
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 border-b border-border/15 z-10"
                style={{background: 'hsl(var(--background)/0.94)', backdropFilter: 'blur(20px)'}}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="w-7 h-7 rounded-sm flex items-center justify-center bg-secondary/50 active:scale-90 transition-all"
                >
                    <ChevronRight className="w-5 h-5 rotate-180"/>
                </button>
                <div className="flex items-center gap-1.5 flex-1">
                    <Settings className="w-5 h-5 text-primary"/>
                    <h1 className="font-black text-[14px] tracking-tight">Settings</h1>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <motion.div
                    initial={{opacity: 0, y: 6}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.2, ease: [0.16, 1, 0.3, 1]}}
                    className="px-4 py-3 max-w-lg mx-auto"
                >

                    {/* ── Profile hero — borderless, photo + name + tier ── */}
                    {profile && (
                        <button
                            onClick={() => navigate('/app/profile/me')}
                            className="w-full flex items-center gap-3 py-3.5 mb-1 active:opacity-70 transition-opacity text-left"
                        >
                            <div className="relative shrink-0">
                                <Avatar className="w-14 h-14 border border-border/25" style={{borderRadius: '8px'}}>
                                    <AvatarImage src={profile.avatar_url || ''} style={{borderRadius: '7px'}}/>
                                    <AvatarFallback
                                        className="text-lg font-black bg-secondary"
                                        style={{borderRadius: '7px'}}
                                    >
                                        {(profile.display_name || 'U')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                {isPremium && (
                                    <div
                                        className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center"
                                        style={{borderRadius: '4px', background: 'hsl(var(--gold))'}}
                                    >
                                        <Crown className="w-2.5 h-2.5 text-black"/>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-[15px] truncate">{profile.display_name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                {isPremium && (
                                    <p className="text-[9.5px] font-black mt-0.5 uppercase tracking-widest"
                                       style={{color: 'hsl(var(--gold))'}}>
                                        {currentPlan} Member
                                    </p>
                                )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0"/>
                        </button>
                    )}

                    {/* ── Divider ── */}
                    <div className="h-px bg-border/15 mb-2"/>

                    {/* ── Section Header ── */}
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-4 py-2">Preferences</p>

                    {/* ── Nav — row-list, no card wrappers ── */}
                    <div>
                        {NAV_ITEMS.map((item, i) => {
                            const Icon = item.icon;
                            const isSubscription = item.id === 'subscription';
                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{opacity: 0, x: -6}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: i * 0.035, duration: 0.18}}
                                    onClick={() => navigate(item.path)}
                                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border/12 last:border-0 active:opacity-60 transition-opacity text-left"
                                >
                                    <div
                                        className="w-8 h-8 flex items-center justify-center shrink-0"
                                        style={{borderRadius: '6px', background: 'hsl(var(--primary)/0.09)'}}
                                    >
                                        <Icon className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[13px]">{item.label}</p>
                                        <p className="text-[10.5px] text-muted-foreground truncate">{item.desc}</p>
                                    </div>
                                    {isSubscription && !isPremium && (
                                        <span
                                            className="text-[8.5px] px-1.5 py-0.5 font-black shrink-0 uppercase tracking-wider"
                                            style={{
                                                borderRadius: '3px',
                                                background: 'hsl(var(--gold)/0.1)',
                                                color: 'hsl(var(--gold))',
                                                border: '1px solid hsl(var(--gold)/0.22)',
                                            }}
                                        >
                      UPGRADE
                    </span>
                                    )}
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/35 shrink-0"/>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ── Divider ── */}
                    <div className="h-px bg-border/15 mt-2 mb-2"/>

                    {/* ── Sign out — minimal text row ── */}
                    <motion.button
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.22}}
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 py-3 active:opacity-60 transition-opacity text-left"
                    >
                        <div
                            className="w-8 h-8 flex items-center justify-center shrink-0"
                            style={{borderRadius: '6px', background: 'hsl(var(--destructive)/0.1)'}}
                        >
                            <LogOut className="w-5 h-5 text-destructive"/>
                        </div>
                        <p className="font-semibold text-[13px] text-destructive flex-1">Sign Out</p>
                    </motion.button>

                    {/* ── Version ── */}
                    <p className="text-center text-[9px] text-muted-foreground/30 font-bold pt-4 pb-6 uppercase tracking-widest">
                        FIND YOUR KING v1.0.0
                    </p>
                </motion.div>
            </div>
        </div>
    );
}


// ════════════════════════════════════════════════════════
// APP LAYOUT
// Source: src/pages/AppLayout.tsx
// ════════════════════════════════════════════════════════


// ── Page loader ──────────────────────────────────────────────
const PageLoader = () => (
    <div className="flex-1 flex items-center justify-center bg-background">
        <div className="relative w-8 h-8">
            <svg className="w-full h-full animate-spin" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" stroke="hsl(var(--primary)/0.15)" strokeWidth="2.5"/>
                <path
                    d="M16 3 A13 13 0 0 1 29 16"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
            <div
                className="absolute inset-0 blur-md rounded-full opacity-40"
                style={{background: 'hsl(var(--primary)/0.25)'}}
            />
        </div>
    </div>
);

// ── Config ───────────────────────────────────────────────────
const HIDE_NAV_PATTERNS = [
    /^\/app\/chat\//,
    /^\/app\/right-now\/map/,
    /^\/app\/map/,
];

const NAV_H = 56;
const SIDEBAR_W = 224;

const SIDEBAR_ITEMS = [
    {id: 'grid', path: '/app/grid', icon: Compass, label: 'Discover', desc: 'Browse profiles'},
    {id: 'right-now', path: '/app/right-now', icon: Radio, label: 'Right Now', desc: 'Live nearby', live: true},
    {id: 'messages', path: '/app/messages', icon: MessageCircle, label: 'Messages', desc: 'Chats'},
    {id: 'events', path: '/app/events', icon: Sparkles, label: 'Events', desc: 'Parties & meetups'},
    {id: 'profile', path: '/app/profile/me', icon: User, label: 'My Profile', desc: 'View & edit'},
];

function resolveActive(pathname: string): string {
    if (pathname.startsWith('/app/chat')) return 'messages';
    if (pathname.startsWith('/app/right-now')) return 'right-now';
    if (pathname.startsWith('/app/profile/me')) return 'profile';
    if (pathname.startsWith('/app/events')) return 'events';
    const match = SIDEBAR_ITEMS.find(t => pathname.startsWith(t.path));
    return match?.id || 'grid';
}

// ── Desktop Sidebar ─────────────────────────────────────────
function DesktopSidebar({onAIOpen}: {onAIOpen: () => void}) {
    const navigate = useNavigate();
    const location = useLocation();
    const {unreadCount} = useNotifications();
    const activeId = resolveActive(location.pathname);

    return (
        <aside
            className="hidden lg:flex flex-col shrink-0 z-40 relative"
            style={{
                width: `${SIDEBAR_W}px`,
                background: 'hsl(224 14% 3.5%)',
                borderRight: '1px solid hsl(224 8% 100% / 0.06)',
                boxShadow: '1px 0 0 hsl(224 8% 100% / 0.025)',
            }}
        >
            {/* Ambient top glow */}
            <div
                className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                style={{background: 'radial-gradient(ellipse 120% 60% at 50% -10%, hsl(42 98% 56% / 0.06) 0%, transparent 70%)'}}
            />

            {/* ── Brand logo ── */}
            <div
                className="relative px-4 py-4 shrink-0"
                style={{borderBottom: '1px solid hsl(224 8% 100% / 0.055)'}}
            >
                <div className="flex items-center gap-2.5">
                    {/* Crown icon mark */}
                    <motion.div
                        whileHover={{scale: 1.06}}
                        transition={{type: 'spring', stiffness: 600, damping: 30}}
                        className="relative w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{
                            background: 'var(--gradient-gold)',
                            boxShadow: '0 0 16px hsl(42 98% 56% / 0.4), 0 0 32px hsl(42 98% 56% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                        }}
                    >
                        <Crown className="w-4 h-4 text-white" strokeWidth={2.5}/>
                    </motion.div>

                    <div className="min-w-0">
                        <p className="font-black text-[13px] tracking-[-0.02em] leading-none text-foreground">
                            FIND YOUR KING
                        </p>
                        <p className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.08em] mt-0.5 uppercase">
                            Connect · Explore
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Navigation label ── */}
            <div className="px-4 pt-5 pb-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground/40">
                    Navigation
                </p>
            </div>

            {/* ── Nav items ── */}
            <nav className="flex-1 px-2 pb-2 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
                {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeId === item.id;
                    const showBadge = item.id === 'messages' && unreadCount > 0;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'relative flex items-center gap-2.5 px-3 py-2.5 text-left w-full',
                                'rounded-[var(--radius-sm)] transition-all duration-120',
                                'group',
                                isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50 hover:text-foreground/80',
                            )}
                            style={isActive ? {
                                background: 'hsl(var(--surface-2))',
                                boxShadow: 'var(--shadow-xs), inset 0 1px 0 hsl(0 0% 100% / 0.03)',
                            } : {}}
                        >
                            {/* Hover fill */}
                            {!isActive && (
                                <div className="absolute inset-0 rounded-[var(--radius-sm)] bg-surface-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120"/>
                            )}

                            {/* Active left accent bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-accent"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                                    style={{
                                        background: 'var(--gradient-gold)',
                                        boxShadow: '0 0 8px hsl(42 98% 56% / 0.55)',
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative shrink-0">
                                <Icon
                                    className="w-[15px] h-[15px]"
                                    style={{color: isActive ? 'hsl(var(--foreground))' : 'currentColor'}}
                                    strokeWidth={isActive ? 2.2 : 1.7}
                                />
                            </div>

                            {/* Label */}
                            <span className="text-[12.5px] font-semibold flex-1 leading-none">
                                {item.label}
                            </span>

                            {/* Messages badge */}
                            {showBadge && (
                                <motion.span
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="ml-auto min-w-[16px] h-4 rounded-[3px] text-[8px] font-black flex items-center justify-center px-1 text-white"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        boxShadow: '0 0 8px hsl(42 98% 56% / 0.4)',
                                    }}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </motion.span>
                            )}

                            {/* Live dot for Right Now */}
                            {item.live && (
                                <span className="relative ml-auto">
                                    <span
                                        className="block w-[6px] h-[6px] rounded-full"
                                        style={{background: 'hsl(var(--status-online))'}}
                                    />
                                    <span
                                        className="absolute inset-0 rounded-full animate-ping opacity-75"
                                        style={{background: 'hsl(var(--status-online))'}}
                                    />
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Bottom utilities ── */}
            <div
                className="relative px-2 py-3 flex flex-col gap-0.5 shrink-0"
                style={{borderTop: '1px solid hsl(224 8% 100% / 0.055)'}}
            >
                {/* AI Assistant */}
                <button
                    onClick={onAIOpen}
                    className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-left w-full group transition-all duration-120 overflow-hidden"
                >
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{background: 'hsl(42 98% 56% / 0.06)'}}
                    />
                    <div
                        className="relative w-5 h-5 rounded-[3px] flex items-center justify-center shrink-0"
                        style={{background: 'hsl(42 98% 56% / 0.15)'}}
                    >
                        <Bot className="w-3 h-3" style={{color: 'hsl(var(--primary))'}} strokeWidth={2}/>
                    </div>
                    <span className="text-[12.5px] font-semibold text-muted-foreground/50 group-hover:text-foreground/80 transition-colors flex-1">
                        AI Assistant
                    </span>
                    <span
                        className="text-[7.5px] font-black px-1.5 py-0.5 rounded-[3px] tracking-wide"
                        style={{background: 'hsl(42 98% 56% / 0.12)', color: 'hsl(var(--primary))'}}
                    >
                        AI
                    </span>
                </button>

                <button
                    onClick={() => navigate('/app/notifications')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12.5px] font-semibold text-muted-foreground/50 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Bell className="w-[15px] h-[15px] shrink-0" strokeWidth={1.7}/>
                    Notifications
                </button>

                <button
                    onClick={() => navigate('/app/settings')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12.5px] font-semibold text-muted-foreground/50 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Settings className="w-[15px] h-[15px] shrink-0" strokeWidth={1.7}/>
                    Settings
                </button>
            </div>
        </aside>
    );
}

// ── Main layout ──────────────────────────────────────────────
const AppLayout = () => {
    const [searchParams] = useSearchParams();
    const {toast} = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const [aiOpen, setAiOpen] = useState(false);

    usePresence();

    const hideNav = HIDE_NAV_PATTERNS.some(p => p.test(location.pathname));

    useEffect(() => {
        document.documentElement.style.setProperty('--nav-h', `${NAV_H}px`);
        document.documentElement.style.setProperty('--sidebar-w', `${SIDEBAR_W}px`);
    }, []);

    useEffect(() => {
        const payment = searchParams.get('payment');
        if (payment === 'success') {
            toast({title: 'Payment Successful', description: 'Your subscription is now active!'});
        } else if (payment === 'cancelled') {
            toast({
                title: 'Payment Cancelled',
                description: 'Your subscription was not processed.',
                variant: 'destructive',
            });
        }
    }, [searchParams, toast]);

    return (
        <div className="w-full flex overflow-hidden" style={{height: '100dvh', background: 'hsl(var(--background))'}}>

            {/* Desktop sidebar */}
            <DesktopSidebar onAIOpen={() => setAiOpen(true)}/>

            {/* Main content column */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">

                {/* Notifications bell — top right */}
                <div className="fixed top-3 right-3 z-[60] hidden lg:block">
                    <NotificationsPanel/>
                </div>

                {/* Page content */}
                <main
                    className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0"
                    style={{
                        paddingBottom: !hideNav
                            ? 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px))'
                            : 0,
                    }}
                >
                    <Suspense fallback={<PageLoader/>}>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={location.pathname}
                                initial={{opacity: 0, y: 6}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -4}}
                                transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                                className="flex-1 flex flex-col min-h-0"
                            >
                                <Outlet/>
                            </motion.div>
                        </AnimatePresence>
                    </Suspense>
                </main>

                {/* Mobile bottom nav */}
                {!hideNav && <div className="lg:hidden"><BottomNav/></div>}

                {/* AI FAB — mobile only */}
                <AnimatePresence>
                    {!hideNav && (
                        <motion.button
                            key="ai-fab"
                            initial={{scale: 0, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0, opacity: 0}}
                            transition={{delay: 0.5, type: 'spring', stiffness: 500, damping: 26}}
                            whileTap={{scale: 0.88}}
                            onClick={() => setAiOpen(true)}
                            className="lg:hidden fixed right-4 z-50 w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center"
                            style={{
                                bottom: 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px) + 12px)',
                                background: 'var(--gradient-gold)',
                                boxShadow: '0 4px 24px hsl(42 98% 56% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                            }}
                            aria-label="Open AI Assistant"
                        >
                            <Crown className="w-4.5 h-4.5 text-white" strokeWidth={2.2}/>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <AIKing open={aiOpen} onClose={() => setAiOpen(false)}/>
            <PWAInstallBanner/>
        </div>
    );
};

export default AppLayout;

