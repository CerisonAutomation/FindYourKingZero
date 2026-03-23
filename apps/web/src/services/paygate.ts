// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE: Paygate — Subscription tier enforcement
// Client-side paygate checks before API calls
// ═══════════════════════════════════════════════════════════════

import { useAuthStore } from '@/store';

export type Tier = 'free' | 'plus' | 'pro' | 'elite';

interface FeatureGate {
  feature: string;
  requiredTier: Tier;
  dailyLimit?: number; // for free tier
  description: string;
}

// Feature → Tier mapping (mirrors competitor paygates)
const GATES: Record<string, FeatureGate> = {
  // Free limits
  'profile-views':     { feature: 'profile-views',     requiredTier: 'free',  dailyLimit: 20,  description: '20 profile views/day on Free' },
  'favorites':         { feature: 'favorites',         requiredTier: 'free',  dailyLimit: 5,   description: '5 favorites on Free' },
  'events':            { feature: 'events',            requiredTier: 'free',  dailyLimit: 3,   description: '3 events/month on Free' },
  'basic-filters':     { feature: 'basic-filters',     requiredTier: 'free',  description: 'Basic filters on Free' },
  'grid-view':         { feature: 'grid-view',         requiredTier: 'free',  description: 'Grid view on Free' },

  // Plus features
  'swipe-view':        { feature: 'swipe-view',        requiredTier: 'plus',  description: 'Swipe mode requires Plus' },
  'list-view':         { feature: 'list-view',         requiredTier: 'plus',  description: 'List view requires Plus' },
  'read-receipts':     { feature: 'read-receipts',     requiredTier: 'plus',  description: 'Read receipts require Plus' },
  'who-viewed':        { feature: 'who-viewed',        requiredTier: 'plus',  description: 'See who viewed you requires Plus' },
  'travel-mode':       { feature: 'travel-mode',       requiredTier: 'plus',  description: 'Travel mode requires Plus' },
  'advanced-filters':  { feature: 'advanced-filters',  requiredTier: 'plus',  description: 'Advanced filters require Plus' },
  'expiring-photos':   { feature: 'expiring-photos',   requiredTier: 'plus',  description: 'Expiring photos require Plus' },

  // Pro features
  'ai-smart-replies':  { feature: 'ai-smart-replies',  requiredTier: 'pro',   description: 'AI Smart Replies require Pro' },
  'incognito':         { feature: 'incognito',         requiredTier: 'pro',   description: 'Incognito mode requires Pro' },
  'superlike':         { feature: 'superlike',         requiredTier: 'pro',   dailyLimit: 5, description: '5 superlikes/day on Pro' },
  'profile-boost':     { feature: 'profile-boost',     requiredTier: 'pro',   description: 'Profile boost requires Pro' },
  'verified-badge':    { feature: 'verified-badge',    requiredTier: 'pro',   description: 'Verified badge requires Pro' },
  'video-calls':       { feature: 'video-calls',       requiredTier: 'pro',   description: 'Video calls require Pro' },
  'private-albums':    { feature: 'private-albums',    requiredTier: 'pro',   description: 'Private albums require Pro' },
  'auto-translate':    { feature: 'auto-translate',    requiredTier: 'pro',   description: 'Auto-translate requires Pro' },
  'toxicity-shield':   { feature: 'toxicity-shield',   requiredTier: 'pro',   description: 'Toxicity shield requires Pro' },

  // Elite features
  'top-of-search':     { feature: 'top-of-search',     requiredTier: 'elite', description: 'Top of search requires Elite' },
  'unlimited-super':   { feature: 'unlimited-super',   requiredTier: 'elite', description: 'Unlimited superlikes requires Elite' },
  'ai-concierge':      { feature: 'ai-concierge',      requiredTier: 'elite', description: 'AI concierge requires Elite' },
  'group-video':       { feature: 'group-video',       requiredTier: 'elite', description: 'Group video calls require Elite' },
  'custom-themes':     { feature: 'custom-themes',     requiredTier: 'elite', description: 'Custom themes require Elite' },
  'analytics':         { feature: 'analytics',         requiredTier: 'elite', description: 'Analytics dashboard requires Elite' },
  'discreet-mode':     { feature: 'discreet-mode',     requiredTier: 'elite', description: 'Discreet mode requires Elite' },
  'pin-lock':          { feature: 'pin-lock',          requiredTier: 'elite', description: 'PIN lock requires Elite' },
};

const TIER_LEVEL: Record<Tier, number> = { free: 0, plus: 1, pro: 2, elite: 3 };

// Daily usage tracking (localStorage)
const USAGE_KEY = 'king-usage';

interface UsageRecord {
  date: string;
  counts: Record<string, number>;
}

function getUsage(): UsageRecord {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as UsageRecord;
      const today = new Date().toISOString().slice(0, 10);
      if (data.date === today) return data;
    }
  } catch {}
  return { date: new Date().toISOString().slice(0, 10), counts: {} };
}

function incrementUsage(feature: string): number {
  const usage = getUsage();
  usage.counts[feature] = (usage.counts[feature] ?? 0) + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return usage.counts[feature];
}

// ── Public API ────────────────────────────────────────────────

export function getUserTier(): Tier {
  // In production: read from user profile/API
  return useAuthStore.getState().user?.premium ? 'pro' : 'free';
}

export function canAccess(feature: string): { allowed: boolean; reason?: string; upgradeTo?: Tier } {
  const gate = GATES[feature];
  if (!gate) return { allowed: true }; // Ungated feature

  const tier = getUserTier();
  const tierLevel = TIER_LEVEL[tier];
  const requiredLevel = TIER_LEVEL[gate.requiredTier];

  // Tier check
  if (tierLevel < requiredLevel) {
    return {
      allowed: false,
      reason: gate.description,
      upgradeTo: gate.requiredTier,
    };
  }

  // Daily limit check (even for paid tiers if applicable)
  if (gate.dailyLimit) {
    const usage = getUsage();
    const count = usage.counts[feature] ?? 0;
    if (count >= gate.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily limit reached (${gate.dailyLimit}/${gate.dailyLimit})`,
        upgradeTo: tier === 'free' ? 'plus' : 'pro',
      };
    }
  }

  return { allowed: true };
}

export function trackUsage(feature: string): number {
  return incrementUsage(feature);
}

export function getRemainingUses(feature: string): number | 'unlimited' {
  const gate = GATES[feature];
  if (!gate?.dailyLimit) return 'unlimited';
  const usage = getUsage();
  const count = usage.counts[feature] ?? 0;
  return Math.max(0, gate.dailyLimit - count);
}

// Hook for React components
export function usePaygate(feature: string) {
  const check = canAccess(feature);
  const remaining = getRemainingUses(feature);

  return {
    ...check,
    remaining,
    track: () => trackUsage(feature),
    gate: GATES[feature],
  };
}
