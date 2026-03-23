// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE: Rate Limiter — Client-side rate limiting
// Prevents abuse, spam, and excessive API calls
// ═══════════════════════════════════════════════════════════════

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}

interface RateLimitState {
  requests: number[];
}

const STORAGE_KEY = 'king-rate-limits';

function getState(): Record<string, RateLimitState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(state: Record<string, RateLimitState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function cleanup(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter(t => t > cutoff);
}

// ── Rate limiter instance ────────────────────────────────────

export function createRateLimiter(config: RateLimitConfig) {
  return {
    check(): { allowed: boolean; remaining: number; resetMs: number } {
      const state = getState();
      const key = config.key;
      const entry = state[key] ?? { requests: [] };
      entry.requests = cleanup(entry.requests, config.windowMs);

      const remaining = config.maxRequests - entry.requests.length;
      const oldestInWindow = entry.requests[0] ?? Date.now();
      const resetMs = Math.max(0, config.windowMs - (Date.now() - oldestInWindow));

      if (remaining <= 0) {
        saveState(state);
        return { allowed: false, remaining: 0, resetMs };
      }

      entry.requests.push(Date.now());
      state[key] = entry;
      saveState(state);

      return { allowed: true, remaining: remaining - 1, resetMs };
    },

    reset() {
      const state = getState();
      delete state[config.key];
      saveState(state);
    },
  };
}

// ── Pre-configured limiters ──────────────────────────────────

export const rateLimiters = {
  // Message sending: 30 per minute
  messages: createRateLimiter({ maxRequests: 30, windowMs: 60_000, key: 'rl-messages' }),

  // Profile views: 20 per day (free), enforced by paygate too
  profileViews: createRateLimiter({ maxRequests: 200, windowMs: 86_400_000, key: 'rl-profile-views' }),

  // Swipes: 100 per hour
  swipes: createRateLimiter({ maxRequests: 100, windowMs: 3_600_000, key: 'rl-swipes' }),

  // API calls: 60 per minute (general)
  api: createRateLimiter({ maxRequests: 60, windowMs: 60_000, key: 'rl-api' }),

  // Search: 10 per minute
  search: createRateLimiter({ maxRequests: 10, windowMs: 60_000, key: 'rl-search' }),

  // Reports: 5 per hour
  reports: createRateLimiter({ maxRequests: 5, windowMs: 3_600_000, key: 'rl-reports' }),

  // Event creation: 3 per day
  events: createRateLimiter({ maxRequests: 3, windowMs: 86_400_000, key: 'rl-events' }),

  // Taps/likes: 50 per hour
  taps: createRateLimiter({ maxRequests: 50, windowMs: 3_600_000, key: 'rl-taps' }),

  // File uploads: 10 per hour
  uploads: createRateLimiter({ maxRequests: 10, windowMs: 3_600_000, key: 'rl-uploads' }),

  // Auth attempts: 5 per 15 min
  auth: createRateLimiter({ maxRequests: 5, windowMs: 900_000, key: 'rl-auth' }),
};

// ── React hook ────────────────────────────────────────────────

export function useRateLimit(limiterKey: keyof typeof rateLimiters) {
  const limiter = rateLimiters[limiterKey];

  return {
    check: () => limiter.check(),
    reset: () => limiter.reset(),
    wrap: async <T>(fn: () => Promise<T>): Promise<T | null> => {
      const result = limiter.check();
      if (!result.allowed) {
        console.warn(`[Rate Limit] ${limiterKey} exceeded. Reset in ${result.resetMs}ms`);
        return null;
      }
      return fn();
    },
  };
}
