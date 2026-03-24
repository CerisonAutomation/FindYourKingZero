// ═══════════════════════════════════════════════════════════════
// LIB: Supabase client — typed, hardened, singleton, realtime-ready
// ═══════════════════════════════════════════════════════════════
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any; // TODO: generate via: supabase gen types types-only > src/lib/database.types.ts

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.\n' +
      'Copy .env.example → .env.local and fill in your project credentials.',
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(url, key, {
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
});
