// ═══════════════════════════════════════════════════════════════
// INTEGRATION: Upstash Redis + Rate Limiting
// Vercel-compatible serverless Redis for presence + rate limits
// ═══════════════════════════════════════════════════════════════

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize from Vercel env vars
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// ── Rate Limiters (server-side, Upstash-backed) ──────────────

export const rateLimiters = {
  messages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    analytics: true,
    prefix: 'rl:messages',
  }),

  swipes: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    analytics: true,
    prefix: 'rl:swipes',
  }),

  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    analytics: true,
    prefix: 'rl:api',
  }),

  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '15 m'),
    analytics: true,
    prefix: 'rl:auth',
  }),

  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'rl:search',
  }),

  uploads: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'rl:uploads',
  }),

  reports: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '1 h'),
    analytics: true,
    prefix: 'rl:reports',
  }),
};

// ── Presence (Redis-backed with TTL) ─────────────────────────

export const presence = {
  async set(userId: string, data: { h3Hex: string; lat: number; lng: number; online: boolean; intent?: string }) {
    await redis.setex(`presence:${userId}`, 3600, JSON.stringify({ ...data, lastSeen: Date.now() }));
  },

  async get(userId: string) {
    const data = await redis.get(`presence:${userId}`);
    return data ? JSON.parse(data as string) : null;
  },

  async getByHex(hex: string) {
    // Scan for all presence keys and filter by h3Hex
    const keys = await redis.keys('presence:*');
    const presences = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data as string);
        if (parsed.h3Hex?.startsWith(hex.slice(0, 6))) {
          presences.push({ id: key.replace('presence:', ''), ...parsed });
        }
      }
    }
    return presences;
  },

  async delete(userId: string) {
    await redis.del(`presence:${userId}`);
  },

  async getOnlineCount() {
    const keys = await redis.keys('presence:*');
    return keys.length;
  },
};

// ── Usage Tracking (for paygates) ────────────────────────────

export const usage = {
  async increment(userId: string, feature: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `usage:${userId}:${feature}:${today}`;
    const count = await redis.incr(key);
    await redis.expire(key, 86400); // Expire after 24h
    return count;
  },

  async get(userId: string, feature: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `usage:${userId}:${feature}:${today}`;
    const count = await redis.get(key);
    return typeof count === 'number' ? count : 0;
  },

  async canUse(userId: string, feature: string, limit: number): Promise<boolean> {
    const count = await this.get(userId, feature);
    return count < limit;
  },
};

// ── Cache (Redis-backed) ─────────────────────────────────────

export const redisCache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) as T : null;
  },

  async set(key: string, value: any, ttlSeconds = 300) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async delete(key: string) {
    await redis.del(key);
  },

  async invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  },
};

export { redis };
