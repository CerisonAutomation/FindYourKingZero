// =====================================================
// ENTERPRISE SUPABASE CLIENT - PRODUCTION READY
// =====================================================
// Optimized for Vercel deployment with proper validation

import {createClient, Session, AuthError} from '@supabase/supabase-js';
import type {Database} from './types';

// Environment variable validation with production-safe fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const error = new Error(
    'Missing required Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );

  // In production, log error details for debugging
  if (import.meta.env.PROD) {
    console.error('Supabase Configuration Error:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_PUBLISHABLE_KEY,
      environment: import.meta.env.MODE
    });
  }

  // Don't throw in development to prevent build failures
  if (import.meta.env.PROD) {
    throw error;
  }
}

// Create Supabase client with enterprise configuration
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'findyourking-web@3.0.0',
        'X-Client-Type': 'web',
        'X-Environment': import.meta.env.MODE,
      },
    },
    db: {
      schema: 'public',
    },
  }
);

// Export configuration for debugging
export const supabaseConfig = {
  url: SUPABASE_URL,
  hasKey: !!SUPABASE_PUBLISHABLE_KEY,
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
};

// =====================================================
// TYPES
// =====================================================
interface AuthResponse {
  session: Session | null;
  user: any;
  error: AuthError | null;
}

// =====================================================
// ENTERPRISE AUTHENTICATION SERVICE
// =====================================================
export const supabaseAuth = {
  /**
   * Get current session with error handling
   */
  getSession: async (): Promise<AuthResponse> => {
    try {
      const {data: {session}, error} = await supabase.auth.getSession();
      return {session, user: session?.user ?? null, error};
    } catch (err) {
      console.error('Error getting session:', err);
      return {session: null, user: null, error: err as AuthError};
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const {data: {session}, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return {session, user: session?.user ?? null, error};
    } catch (err) {
      console.error('Error signing in:', err);
      return {session: null, user: null, error: err as AuthError};
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResponse> => {
    try {
      const {data: {session}, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {display_name: displayName},
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return {session, user: session?.user ?? null, error};
    } catch (err) {
      console.error('Error signing up:', err);
      return {session: null, user: null, error: err as AuthError};
    }
  },

  /**
   * Sign in with magic link
   */
  signInWithMagicLink: async (email: string): Promise<{error: AuthError | null}> => {
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email,
        options: {emailRedirectTo: `${window.location.origin}/auth/callback`},
      });
      return {error};
    } catch (err) {
      console.error('Error sending magic link:', err);
      return {error: err as AuthError};
    }
  },

  /**
   * Get by ID
   */
  getById: async <T>(
    table: keyof Database['public']['Tables'],
    id: string
  ): Promise<{data: T | null; error: Error | null}> => {
    try {
      const {data, error} = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {data: data as T, error: null};
    } catch (err) {
      console.error(`Error getting ${table} by ID:`, err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * Sign out
   */
  signOut: async (): Promise<{error: AuthError | null}> => {
    try {
      const {error} = await supabase.auth.signOut();
      return {error};
    } catch (err) {
      console.error('Error signing out:', err);
      return {error: err as AuthError};
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void
  ) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// =====================================================
// ENTERPRISE DATABASE SERVICE
// =====================================================
export const supabaseDb = {
  /**
   * Execute a query with error handling and logging
   */
  query: async <T>(
    queryBuilder: PromiseLike<{data: T | null; error: any}>,
    operation: string
  ): Promise<{data: T | null; error: Error | null}> => {
    try {
      const {data, error} = await queryBuilder;
      if (error) {
        console.error(`Database error in ${operation}:`, error);
        return {data: null, error: new Error(error.message)};
      }
      return {data, error: null};
    } catch (err) {
      console.error(`Unexpected error in ${operation}:`, err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * Insert with returning
   */
  insert: async <T>(
    table: keyof Database['public']['Tables'],
    data: any,
    returning = '*'
  ): Promise<{data: T | null; error: Error | null}> => {
    try {
      const {data: result, error} = await supabase
        .from(table)
        .insert(data)
        .select(returning)
        .single();
      if (error) throw error;
      return {data: result as T, error: null};
    } catch (err) {
      console.error(`Error inserting into ${table}:`, err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * Update with returning
   */
  update: async <T>(
    table: keyof Database['public']['Tables'],
    data: any,
    match: Record<string, any>,
    returning = '*'
  ): Promise<{data: T | null; error: Error | null}> => {
    try {
      const {data: result, error} = await supabase
        .from(table)
        .update(data)
        .match(match)
        .select(returning)
        .single();
      if (error) throw error;
      return {data: result as T, error: null};
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * Delete with returning
   */
  delete: async <T>(
    table: keyof Database['public']['Tables'],
    match: Record<string, any>,
    returning = '*'
  ): Promise<{data: T | null; error: Error | null}> => {
    try {
      const {data: result, error} = await supabase
        .from(table)
        .delete()
        .match(match)
        .select(returning)
        .single();
      if (error) throw error;
      return {data: result as T, error: null};
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * Get by ID
   */
  getById: async <T>(
    table: keyof Database['public']['Tables'],
    id: string
  ): Promise<{data: T | null; error: Error | null}> => {
    try {
      const {data, error} = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {data: data as T, error: null};
    } catch (err) {
      console.error(`Error getting ${table} by ID:`, err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * List with pagination
   */
  list: async <T>(
    table: keyof Database['public']['Tables'],
    options: {
      page?: number;
      pageSize?: number;
      orderBy?: string;
      ascending?: boolean;
      filters?: Record<string, any>;
    } = {}
  ): Promise<{data: T[] | null; error: Error | null; count: number | null}> => {
    try {
      const {
        page = 1,
        pageSize = 20,
        orderBy = 'created_at',
        ascending = false,
        filters = {}
      } = options;

      let query = supabase.from(table).select('*', {count: 'exact'});

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'string' && value.includes('%')) {
            query = query.like(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      query = query.order(orderBy, {ascending});

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const {data, error, count} = await query;
      if (error) throw error;

      return {data: data as T[], error: null, count};
    } catch (err) {
      console.error(`Error listing ${table}:`, err);
      return {data: null, error: err as Error, count: null};
    }
  },
};

// =====================================================
// ENTERPRISE REALTIME SERVICE
// =====================================================
export const supabaseRealtime = {
  /**
   * Subscribe to table changes
   */
  subscribeToTable: (
    table: keyof Database['public']['Tables'],
    callback: (payload: any) => void,
    filters?: {column: string; value: any}[]
  ) => {
    const channelName = `${table}-changes-${Date.now()}`;
    let channel = supabase.channel(channelName);

    if (filters) {
      filters.forEach(({column, value}) => {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table as string,
            filter: `${column}=eq.${value}`,
          },
          callback
        );
      });
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as string,
        },
        callback
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to presence
   */
  subscribeToPresence: (
    userId: string,
    callback: (presence: any) => void
  ) => {
    const channel = supabase.channel(`presence-${userId}`);

    channel.on('presence', {event: 'sync'}, () => {
      const presenceState = channel.presenceState();
      callback(presenceState);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

// =====================================================
// ENTERPRISE GEOSPATIAL SERVICE (PostGIS)
// =====================================================
export const supabaseGeo = {
  /**
   * Find nearby profiles using PostGIS
   */
  findNearbyProfiles: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    options: {
      limit?: number;
      excludeUserId?: string;
      minAge?: number;
      maxAge?: number;
      isOnline?: boolean;
      isVerified?: boolean;
    } = {}
  ) => {
    try {
      const {
        limit = 100,
        excludeUserId,
        minAge,
        maxAge,
        isOnline,
        isVerified
      } = options;

      // Use PostGIS ST_DWithin for efficient geospatial queries
      let query = supabase
        .from('profiles')
        .select(`
          *,
          distance: ST_Distance(
            location,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) / 1000.0
        `)
        .not('location', 'is', null)
        .not('is_banned', 'eq', true)
        .not('is_active', 'eq', false);

      // Apply geospatial filter using ST_DWithin
      query = query.filter(
        'location',
        'st_dwithin',
        `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusKm * 1000}`
      );

      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId);
      }

      if (minAge) {
        query = query.gte('age', minAge);
      }

      if (maxAge) {
        query = query.lte('age', maxAge);
      }

      if (isOnline) {
        query = query.eq('is_online', true);
      }

      if (isVerified) {
        query = query.eq('is_verified', true);
      }

      // Order by distance
      query = query.order('distance', {ascending: true});

      if (limit) {
        query = query.limit(limit);
      }

      const {data, error} = await query;
      if (error) throw error;

      return {data, error: null};
    } catch (err) {
      console.error('Error finding nearby profiles:', err);
      return {data: null, error: err as Error};
    }
  },

  /**
   * Update user location
   */
  updateUserLocation: async (
    userId: string,
    latitude: number,
    longitude: number,
    accuracy: number = 0
  ) => {
    try {
      const {error} = await supabase
        .from('profiles')
        .update({
          location: `POINT(${longitude} ${latitude})`,
          latitude,
          longitude,
          location_accuracy: accuracy,
          location_updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Also update presence
      await supabase
        .from('presence')
        .upsert({
          user_id: userId,
          current_location: `POINT(${longitude} ${latitude})`,
          location_accuracy: accuracy,
          location_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      return {error: null};
    } catch (err) {
      console.error('Error updating user location:', err);
      return {error: err as Error};
    }
  },

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};

// =====================================================
// EXPORT DEFAULT CLIENT
// =====================================================
export default supabase;
