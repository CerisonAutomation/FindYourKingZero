/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 ENTERPRISE CONFIGURATION - 15/10 Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralized enterprise configuration for the FindYourKingZero platform.
 * Single source of truth for all environment-specific settings.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 * @license Enterprise
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const ENV = {
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',

  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // P2P Configuration
  p2pAppId: import.meta.env.VITE_P2P_APP_ID || 'findyourking-zero',
  p2pPassword: import.meta.env.VITE_P2P_PASSWORD || undefined,

  // AI Services
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  aiModel: import.meta.env.VITE_AI_MODEL || 'gpt-4',

  // Analytics
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',

  // Feature Flags
  enableP2P: import.meta.env.VITE_ENABLE_P2P !== 'false',
  enableAI: import.meta.env.VITE_ENABLE_AI !== 'false',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const APP = {
  name: 'FindYourKingZero',
  version: '2.0.0',
  description: 'Enterprise Dating Platform',
  author: 'FindYourKingZero Enterprise Team',

  // URLs
  website: 'https://fyking.men',
  support: 'support@fyking.men',
  privacy: 'https://fyking.men/privacy',
  terms: 'https://fyking.men/terms',

  // Social
  twitter: '@findyourkingzero',
  instagram: '@findyourkingzero',
  discord: 'https://discord.gg/findyourkingzero',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// P2P NETWORK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const P2P_CONFIG = {
  // Network
  appId: ENV.p2pAppId,
  password: ENV.p2pPassword,

  // TURN/STUN servers
  iceServers: [
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'stun:stun1.l.google.com:19302',
    },
  ],

  // Connection limits
  maxPeers: 50,
  maxRooms: 10,
  maxMessageSize: 1024 * 1024, // 1MB

  // Timeouts
  connectionTimeout: 10000,
  heartbeatInterval: 30000,
  reconnectDelay: 5000,
  maxReconnectAttempts: 5,

  // Discovery
  discoveryInterval: 60000,
  peerTimeout: 120000,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DATING PLATFORM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const DATING_CONFIG = {
  // Discovery
  maxNearbyProfiles: 100,
  maxDistance: 50, // km
  defaultAgeRange: [18, 99] as [number, number],
  defaultMaxDistance: 50,

  // Matching
  minCompatibilityScore: 0.3,
  maxMatchesPerDay: 50,
  matchExpiryDays: 30,

  // Messaging
  maxMessageLength: 5000,
  maxMediaSize: 10 * 1024 * 1024, // 10MB
  messageRetentionDays: 30,

  // Calls
  callTimeout: 30000,
  maxCallDuration: 3600000, // 1 hour

  // Location
  locationUpdateInterval: 30000,
  locationAccuracy: 100, // meters

  // Safety
  maxReportsPerUser: 10,
  autoBanThreshold: 5,
  moderationDelay: 1000,

  // Performance
  cacheTimeout: 300000, // 5 minutes
  syncInterval: 5000,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TIERS
// ═══════════════════════════════════════════════════════════════════════════════

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic profile',
      'Limited discovery (20/day)',
      'Basic messaging',
      'Standard support',
    ],
    limits: {
      dailySwipes: 20,
      dailyMessages: 10,
      photoUploads: 5,
      profileViews: 50,
    },
  },
  plus: {
    name: 'Plus',
    price: 9.99,
    features: [
      'Unlimited discovery',
      'Advanced filters',
      'See who viewed you',
      'Travel mode',
      'Priority support',
    ],
    limits: {
      dailySwipes: -1, // unlimited
      dailyMessages: -1,
      photoUploads: 20,
      profileViews: -1,
    },
  },
  pro: {
    name: 'Pro',
    price: 24.99,
    features: [
      'Everything in Plus',
      'AI recommendations',
      'Advanced analytics',
      'Host tools',
      'Premium support',
    ],
    limits: {
      dailySwipes: -1,
      dailyMessages: -1,
      photoUploads: 50,
      profileViews: -1,
    },
  },
  elite: {
    name: 'Elite',
    price: 59.99,
    features: [
      'Everything in Pro',
      'Priority placement',
      'Elite circles',
      'Concierge support',
      'Exclusive events',
    ],
    limits: {
      dailySwipes: -1,
      dailyMessages: -1,
      photoUploads: -1,
      profileViews: -1,
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const SECURITY_CONFIG = {
  // Authentication
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes

  // Password
  minPasswordLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,

  // Encryption
  encryptionAlgorithm: 'AES-256-GCM',
  keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Rate limiting
  apiRateLimit: 100, // requests per minute
  messageRateLimit: 30, // messages per minute
  uploadRateLimit: 10, // uploads per minute

  // Content moderation
  enableAIModeration: true,
  moderationThreshold: 0.7,
  autoModeration: true,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const PERFORMANCE_CONFIG = {
  // Caching
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
  maxCacheSize: 50 * 1024 * 1024, // 50MB

  // Lazy loading
  enableLazyLoading: true,
  imageLazyLoadThreshold: 100, // pixels
  componentLazyLoadDelay: 100, // ms

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // Debouncing
  searchDebounce: 300, // ms
  scrollDebounce: 100, // ms
  resizeDebounce: 200, // ms

  // Virtualization
  enableVirtualization: true,
  virtualListOverscan: 5,

  // Bundle optimization
  enableCodeSplitting: true,
  chunkSizeWarning: 500000, // 500KB
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const ACCESSIBILITY_CONFIG = {
  // Screen reader
  enableScreenReaderSupport: true,
  announcePageChanges: true,
  announceNotifications: true,

  // Keyboard navigation
  enableKeyboardNavigation: true,
  focusTrapModals: true,
  skipLinks: true,

  // Visual
  highContrastMode: false,
  reducedMotion: false,
  largeText: false,

  // ARIA
  enableARIALabels: true,
  enableARIALiveRegions: true,
  enableARIADescriptions: true,

  // Focus management
  focusOutlineWidth: '2px',
  focusOutlineStyle: 'solid',
  focusOutlineColor: 'hsl(var(--ring))',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNATIONALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

export const I18N_CONFIG = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'],
  fallbackLocale: 'en',

  // Date/time formatting
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'YYYY-MM-DD HH:mm',

  // Number formatting
  numberFormat: {
    decimal: '.',
    thousands: ',',
    precision: 2,
  },

  // Currency
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'BRL'],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

export const FEATURE_FLAGS = {
  // Core features
  enableP2P: ENV.enableP2P,
  enableAI: ENV.enableAI,
  enableAnalytics: ENV.enableAnalytics,
  enableDebug: ENV.enableDebug,

  // Dating features
  enableLocationBasedMatching: true,
  enableAdvancedFilters: true,
  enableVideoCalls: true,
  enableVoiceMessages: true,

  // Social features
  enableEvents: true,
  enableGroups: true,
  enableStories: false,
  enableLiveStreaming: false,

  // Safety features
  enableAIModeration: true,
  enablePhotoVerification: true,
  enableIDVerification: true,
  enableBackgroundChecks: false,

  // Monetization
  enableSubscriptions: true,
  enableInAppPurchases: true,
  enableAdvertising: false,

  // Experimental
  enableBlockchainVerification: false,
  enableMetaverseIntegration: false,
  enableARFeatures: false,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  ENV,
  APP,
  P2P_CONFIG,
  DATING_CONFIG,
  SUBSCRIPTION_TIERS,
  SECURITY_CONFIG,
  PERFORMANCE_CONFIG,
  ACCESSIBILITY_CONFIG,
  I18N_CONFIG,
  FEATURE_FLAGS,
};