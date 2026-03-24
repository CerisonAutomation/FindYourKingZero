// ═══════════════════════════════════════════════════════════════
// LIB: Supabase client — optional, graceful degradation
// App works via Vercel serverless API if Supabase is not configured
// ═══════════════════════════════════════════════════════════════
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = !!(url && key);

export const supabase: SupabaseClient<Database> | null = supabaseEnabled
  ? createClient<Database>(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'king-session',
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
      global: {
        headers: { 'x-app-version': import.meta.env.VITE_APP_VERSION ?? '0.0.0' },
        fetch: (_url, options) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 30_000);
          return fetch(_url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(id));
        },
      },
      db: { schema: 'public' },
    })
  : null;
