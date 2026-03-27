/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Application Configuration - Single Source of Truth
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Unified configuration for FindYourKingZero platform.
 * Replaces: AppConfig.ts, EnterpriseConfig.ts, EnhancedEnterpriseConfig.ts
 *
 * @version 4.0.0
 */
import {z} from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════
// Environment Schema & Types
// ═══════════════════════════════════════════════════════════════════════════════

const EnvSchema = z.object({
  isDevelopment: z.boolean(),
  isProduction: z.boolean(),
  isTest: z.boolean(),
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
  p2pAppId: z.string().default('findyourking-zero'),
  p2pPassword: z.string().optional(),
  openaiApiKey: z.string().optional(),
  aiModel: z.string().default('gpt-4'),
  analyticsId: z.string().optional(),
  sentryDsn: z.string().optional(),
  enableP2P: z.boolean().default(true),
  enableAI: z.boolean().default(true),
  enableAnalytics: z.boolean().default(false),
  enableDebug: z.boolean().default(false),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// Environment Detection
// ═══════════════════════════════════════════════════════════════════════════════

const env: EnvConfig = EnvSchema.parse({
  isDevelopment: import.meta.env.DEV ?? false,
  isProduction: import.meta.env.PROD ?? false,
  isTest: import.meta.env.MODE === 'test',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  p2pAppId: import.meta.env.VITE_P2P_APP_ID ?? 'findyourking-zero',
  p2pPassword: import.meta.env.VITE_P2P_PASSWORD ?? undefined,
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY ?? undefined,
  aiModel: import.meta.env.VITE_AI_MODEL ?? 'gpt-4',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID ?? undefined,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN ?? undefined,
  enableP2P: import.meta.env.VITE_ENABLE_P2P !== 'false',
  enableAI: import.meta.env.VITE_ENABLE_AI !== 'false',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
});

// ═══════════════════════════════════════════════════════════════════════════════
// Application Constants
// ═══════════════════════════════════════════════════════════════════════════════

export const APP = {
  name: 'FindYourKing',
  version: '4.0.0',
  description: 'Modern dating platform for the LGBTQ+ community',
  website: 'https://fyking.men',
  support: 'support@fyking.men',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// API Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const API_CONFIG = {
  baseUrl: env.supabaseUrl,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// P2P Network Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const P2P_CONFIG = {
  appId: env.p2pAppId,
  password: env.p2pPassword,
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  maxPeers: 50,
  maxRooms: 10,
  maxMessageSize: 1024 * 1024, // 1MB
  connectionTimeout: 10000,
  heartbeatInterval: 30000,
  reconnectDelay: 5000,
  maxReconnectAttempts: 5,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Dating Platform Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const DATING_CONFIG = {
  maxNearbyProfiles: 100,
  maxDistanceKm: 50,
  defaultAgeRange: [18, 99] as [number, number],
  defaultMaxDistance: 50,
  minCompatibilityScore: 0.3,
  maxMatchesPerDay: 50,
  matchExpiryDays: 30,
  maxMessageLength: 5000,
  maxMediaSize: 10 * 1024 * 1024, // 10MB
  messageRetentionDays: 30,
  callTimeout: 30000,
  maxCallDuration: 3600000, // 1 hour
  locationUpdateInterval: 30000,
  locationAccuracyMeters: 100,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Subscription Tiers — Using canonical string literal type
// ═══════════════════════════════════════════════════════════════════════════════

import type { SubscriptionTier } from '@/types';

export type SubscriptionTierConfig = {
  name: string;
  price: number;
  features: string[];
  limits: {
    dailySwipes: number;
    dailyMessages: number;
    photoUploads: number;
    profileViews: number;
  };
};

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  'free': {
    name: 'Free',
    price: 0,
    features: ['Basic profile', 'Limited discovery (20/day)', 'Basic messaging', 'Standard support'],
    limits: { dailySwipes: 20, dailyMessages: 10, photoUploads: 5, profileViews: 50 },
  },
  'plus': {
    name: 'Plus',
    price: 9.99,
    features: ['Unlimited discovery', 'Advanced filters', 'See who viewed you', 'Travel mode', 'Priority support'],
    limits: { dailySwipes: -1, dailyMessages: -1, photoUploads: 20, profileViews: -1 },
  },
  'premium': {
    name: 'Premium',
    price: 24.99,
    features: ['Everything in Plus', 'AI recommendations', 'Advanced analytics', 'Host tools', 'Premium support'],
    limits: { dailySwipes: -1, dailyMessages: -1, photoUploads: 50, profileViews: -1 },
  },
  'elite': {
    name: 'Elite',
    price: 59.99,
    features: ['Everything in Premium', 'Priority placement', 'Elite circles', 'Concierge support', 'Exclusive events'],
    limits: { dailySwipes: -1, dailyMessages: -1, photoUploads: -1, profileViews: -1 },
  },
} as const;

// Re-export the type for convenience
export type { SubscriptionTier } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Security Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const SECURITY_CONFIG = {
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  minPasswordLength: 8,
  encryptionAlgorithm: 'AES-256-GCM',
  apiRateLimitPerMinute: 100,
  messageRateLimitPerMinute: 30,
  uploadRateLimitPerMinute: 10,
  enableAIModeration: true,
  moderationThreshold: 0.7,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Performance Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const PERFORMANCE_CONFIG = {
  enableCaching: true,
  cacheTimeoutMs: 5 * 60 * 1000, // 5 minutes
  maxCacheSizeBytes: 50 * 1024 * 1024, // 50MB
  enableLazyLoading: true,
  imageLazyLoadThresholdPx: 100,
  defaultPageSize: 20,
  maxPageSize: 100,
  searchDebounceMs: 300,
  scrollDebounceMs: 100,
  resizeDebounceMs: 200,
  enableVirtualization: true,
  virtualListOverscan: 5,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// AI Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const AI_CONFIG = {
  enabled: env.enableAI,
  provider: 'openai' as const,
  model: env.aiModel,
  embeddingModel: 'text-embedding-3-small' as const,
  defaultTemperature: 0.7,
  defaultMaxTokens: 1000,
  timeoutMs: 30000,
  features: {
    chat: true,
    streaming: true,
    quickReplies: true,
    moderation: true,
    analysis: true,
    matching: true,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Feature Flags
// ═══════════════════════════════════════════════════════════════════════════════

export const FEATURE_FLAGS = {
  enableP2P: env.enableP2P,
  enableAI: env.enableAI,
  enableAnalytics: env.enableAnalytics,
  enableDebug: env.enableDebug,
  enableLocationBasedMatching: true,
  enableVideoCalls: true,
  enableVoiceMessages: true,
  enableEvents: true,
  enableGroups: true,
  enableSubscriptions: true,
  enablePhotoVerification: true,
  enableIDVerification: true,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Unified Config Export
// ═══════════════════════════════════════════════════════════════════════════════

export const config = {
  env,
  app: APP,
  api: API_CONFIG,
  p2p: P2P_CONFIG,
  dating: DATING_CONFIG,
  subscriptions: SUBSCRIPTION_TIERS,
  security: SECURITY_CONFIG,
  performance: PERFORMANCE_CONFIG,
  ai: AI_CONFIG,
  features: FEATURE_FLAGS,
} as const;

export type Config = typeof config;
export default config;
