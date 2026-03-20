// Application constants
export const APP = {
  NAME: 'FindYourKingZero',
  VERSION: '2.0.0',
  DESCRIPTION: 'Enterprise Dating Platform',
  AUTHOR: 'Enterprise Team',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    SIGN_OUT: '/auth/signout',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Users & Profiles
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    SEARCH: '/users/search',
    MATCHES: '/users/matches',
    PREFERENCES: '/users/preferences',
    PHOTOS: '/users/photos',
    VERIFICATION: '/users/verification',
  },

  // Conversations
  CONVERSATIONS: {
    BASE: '/conversations',
    MESSAGES: '/conversations/messages',
    TYPING: '/conversations/typing',
    ONLINE: '/conversations/online',
  },

  // Events
  EVENTS: {
    BASE: '/events',
    ATTENDEES: '/events/attendees',
    MY_EVENTS: '/events/my',
    NEARBY: '/events/nearby',
  },

  // AI Services
  AI: {
    CHAT: '/ai/chat',
    BIO_GENERATION: '/ai/bio',
    COMPATIBILITY: '/ai/compatibility',
    MODERATION: '/ai/moderation',
    SUGGESTIONS: '/ai/suggestions',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: '/notifications/read',
    SETTINGS: '/notifications/settings',
  },

  // Analytics
  ANALYTICS: {
    BASE: '/analytics',
    ENGAGEMENT: '/analytics/engagement',
    MATCHES: '/analytics/matches',
    EVENTS: '/analytics/events',
  },
} as const;

// Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  SVG: 'image/svg+xml',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  WEBP: 'image/webp',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',

  // App state
  LAST_ACTIVE: 'last_active',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATION_PERMISSION: 'notification_permission',

  // Drafts
  MESSAGE_DRAFTS: 'message_drafts',
  EVENT_DRAFT: 'event_draft',
  PROFILE_DRAFT: 'profile_draft',

  // Cache
  CACHED_PROFILES: 'cached_profiles',
  CACHED_EVENTS: 'cached_events',
  CACHED_CONVERSATIONS: 'cached_conversations',

  // Settings
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  DEFAULT_PAGE: 1,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_AUDIO_SIZE: 10 * 1024 * 1024, // 10MB,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  MAX_PHOTOS_PER_PROFILE: 6,
  MAX_FILES_PER_MESSAGE: 5,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  // Profile
  MIN_AGE: 18,
  MAX_AGE: 120,
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MAX_INTERESTS_COUNT: 10,
  MAX_INTEREST_LENGTH: 30,

  // Messages
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_MESSAGE_HISTORY: 100,

  // Events
  MIN_EVENT_TITLE_LENGTH: 3,
  MAX_EVENT_TITLE_LENGTH: 100,
  MIN_EVENT_DESCRIPTION_LENGTH: 10,
  MAX_EVENT_DESCRIPTION_LENGTH: 2000,
  MAX_EVENT_TAGS_COUNT: 10,
  MAX_EVENT_RULES_LENGTH: 1000,
  MAX_EVENT_PHOTOS_COUNT: 5,

  // General
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
} as const;

// Time constants
export const TIME = {
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30,
  DAYS_IN_YEAR: 365,
  MILLISECONDS_IN_SECOND: 1000,

  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 60000, // 1 minute
  WEBSOCKET_TIMEOUT: 5000, // 5 seconds

  // Intervals
  TYPING_INDICATOR_TIMEOUT: 3000, // 3 seconds
  ONLINE_STATUS_TIMEOUT: 300000, // 5 minutes
  NOTIFICATION_CHECK_INTERVAL: 30000, // 30 seconds

  // Debounce
  SEARCH_DEBOUNCE: 300, // 300ms
  INPUT_DEBOUNCE: 200, // 200ms
  SCROLL_DEBOUNCE: 100, // 100ms,
} as const;

// UI constants
export const UI = {
  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },

  // Spacing
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
    '3XL': '4rem',
  },

  // Animation
  ANIMATION: {
    DURATION: {
      FAST: '150ms',
      NORMAL: '300ms',
      SLOW: '500ms',
    },
    EASING: {
      EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
      EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
      EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-index
  Z_INDEX: {
    BASE: 0,
    DROPDOWN: 10,
    STICKY: 20,
    MODAL: 30,
    POPOVER: 40,
    TOOLTIP: 50,
    NOTIFICATION: 60,
    LOADING: 70,
    MAXIMUM: 100,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Authentication
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // Validation
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  REQUIRED_FIELD: 'This field is required.',

  // File upload
  FILE_TOO_LARGE: 'File size exceeds maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',

  // General
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This resource already exists.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  REGISTER_SUCCESS: 'Account created successfully.',

  // Profile
  PROFILE_UPDATED: 'Profile updated successfully.',
  PHOTO_UPLOADED: 'Photo uploaded successfully.',

  // Messages
  MESSAGE_SENT: 'Message sent successfully.',

  // Events
  EVENT_CREATED: 'Event created successfully.',
  EVENT_UPDATED: 'Event updated successfully.',
  EVENT_JOINED: 'Successfully joined event.',

  // General
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  COPIED: 'Copied to clipboard.',
} as const;

// Feature flags
export const FEATURES = {
  // Development
  DEV_MODE: process.env.NODE_ENV === 'development',
  DEBUG_MODE: process.env.VITE_DEBUG === 'true',

  // Features
  AI_CHAT: true,
  VIDEO_CALLS: true,
  GROUP_EVENTS: true,
  ADVANCED_MATCHING: true,
  CONTENT_MODERATION: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  DARK_MODE: true,
  MULTI_LANGUAGE: true,

  // Beta features
  BETA_FEATURES: {
    AI_DATING_COACH: false,
    VOICE_MESSAGES: false,
    STORIES: false,
    GAMIFICATION: false,
  },
} as const;

// Environment variables
export const ENV = {
  // API
  API_BASE_URL: process.env.VITE_API_BASE_URL || '/api',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',

  // External services
  OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',

  // App
  APP_VERSION: process.env.VITE_APP_VERSION || APP.VERSION,
  BUILD_NUMBER: process.env.VITE_BUILD_NUMBER || '1',

  // Analytics
  SENTRY_DSN: process.env.VITE_SENTRY_DSN || '',
  GOOGLE_ANALYTICS_ID: process.env.VITE_GA_ID || '',

  // Social
  FACEBOOK_APP_ID: process.env.VITE_FACEBOOK_APP_ID || '',
  GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '',
} as const;

// Regex patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9-]+$/,
  ZIP_CODE_US: /^\d{5}(-\d{4})?$/,
  CREDIT_CARD: /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/,
} as const;

// Default values
export const DEFAULTS = {
  // User preferences
  THEME: 'light',
  LANGUAGE: 'en',
  TIMEZONE: 'UTC',

  // Pagination
  PAGE_SIZE: PAGINATION.DEFAULT_PAGE_SIZE,
  PAGE: PAGINATION.DEFAULT_PAGE,

  // Form values
  EMPTY_STRING: '',
  EMPTY_ARRAY: [],
  EMPTY_OBJECT: {},

  // Dates
  CURRENT_DATE: new Date(),
  MIN_DATE: new Date(1900, 0, 1),
  MAX_DATE: new Date(2100, 11, 31),
} as const;

export default {
  APP,
  API_ENDPOINTS,
  STATUS_CODES,
  HTTP_METHODS,
  CONTENT_TYPES,
  STORAGE_KEYS,
  PAGINATION,
  UPLOAD_LIMITS,
  VALIDATION_LIMITS,
  TIME,
  UI,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  ENV,
  REGEX,
  DEFAULTS,
};
