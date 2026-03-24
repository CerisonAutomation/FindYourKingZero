// upstash.ts — client-side rate limiting & presence (no Node.js imports)
// @upstash/redis and @upstash/ratelimit are server-only.
// On the client we use lightweight localStorage-backed alternatives.

const PREFIX = 'fyk:upstash:';

/** Lightweight client-side presence tracker (replaces @upstash/redis on client) */
export function trackPresence(userId: string, h3Hex: string): void {
  try {
    localStorage.setItem(`${PREFIX}presence:${userId}`, JSON.stringify({
      h3Hex,
      ts: Date.now(),
    }));
  } catch { /* storage full — ignore */ }
}

export function getPresence(userId: string): { h3Hex: string; ts: number } | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}presence:${userId}`);
    return raw ? (JSON.parse(raw) as { h3Hex: string; ts: number }) : null;
  } catch {
    return null;
  }
}

/** Client-side usage tracker (replaces @upstash/ratelimit on client) */
export function trackUsage(feature: string): number {
  const key = `${PREFIX}usage:${feature}:${new Date().toDateString()}`;
  const current = parseInt(localStorage.getItem(key) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
}

export function getUsage(feature: string): number {
  const key = `${PREFIX}usage:${feature}:${new Date().toDateString()}`;
  return parseInt(localStorage.getItem(key) ?? '0', 10);
}
