// ═══════════════════════════════════════════════════════════════
// SERVICES: Cache — Client-side caching layer
// Reduces API calls, improves perceived performance
// ═══════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 200;

  set<T>(key: string, data: T, ttlMs = 300_000): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidate(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Stats for debugging
  stats() {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

export const cache = new ClientCache();

// Cache key builders
export const cacheKeys = {
  profile: (id: string) => `profile:${id}`,
  nearby: (hex: string) => `nearby:${hex}`,
  messages: (matchId: string) => `messages:${matchId}`,
  events: (type?: string) => `events:${type ?? 'all'}`,
  matches: () => 'matches:list',
  presence: (hex: string) => `presence:${hex}`,
};

// TTL presets
export const cacheTTL = {
  profile: 300_000,      // 5 min
  nearby: 30_000,        // 30 sec (live data)
  messages: 60_000,      // 1 min
  events: 600_000,       // 10 min
  presence: 15_000,      // 15 sec (very live)
  search: 120_000,       // 2 min
};
