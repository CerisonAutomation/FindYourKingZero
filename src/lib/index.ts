/**
 * =============================================================================
 * LIB CANONICAL BARREL — Enterprise-Grade Library Consolidation
 * =============================================================================
 *
 * Single source of truth for ALL library functionality (non-AI, non-auth).
 * Consolidates P2P, encryption, enterprise services, and utilities.
 *
 * Standards: 15/10 Legendary | Zero-Trust | Enterprise Production
 *
 * @module lib
 * @version 15.0.0
 */

// =============================================================================
// P2P & DATING — All peer-to-peer functionality
// =============================================================================
export {
  HybridP2PDatingEngine,
  type HybridEngineConfig,
  type EngineEvents,
  BitTorrentStrategy,
  NostrStrategy,
  MQTTStrategy,
  IPFSStrategy,
  WebRTCStrategy,
  SupabaseRealtimeStrategy,
  type SignalingStrategy,
  P2PChatEngine,
  P2PFileTransfer,
  P2PLocation,
  P2PCallSignaling,
  UnifiedP2PRoom,
  getDirectRoomId,
  getGroupRoomId,
  getLocationRoomId,
  type ChatMessage,
  type FileTransfer,
  type LocationPayload,
  type PresencePayload,
  type TypingPayload,
  type ReadReceipt,
  type ReactionPayload,
  type CallSignal,
} from './p2p/canonical';

// =============================================================================
// ENCRYPTION — Zero-knowledge security
// =============================================================================
export {
  ZeroKnowledgeEncryption,
  type EncryptionKeyPair,
} from './encryption/ZeroKnowledgeEncryption';

// =============================================================================
// ENTERPRISE SERVICES — Core business logic
// =============================================================================
export {
  EnterpriseServices,
} from './EnterpriseServices';

// =============================================================================
// UTILITIES — Common helper functions
// =============================================================================
export {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  formatDistance,
  formatAge,
  formatDuration,
  formatCurrency,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeString,
  chunk,
  shuffle,
  unique,
  groupBy,
  debounce,
  throttle,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  getOptimizedImageUrl,
  generateBlurHash,
  hexToRgb,
  getContrastColor,
  createSafeAsync,
  measurePerformance,
  generateAriaLabel,
  getFocusableElements,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDate,
  isFunction,
} from './utils';

// =============================================================================
// VALIDATORS — Input validation
// =============================================================================
export {
  emailSchema,
  passwordSchema,
  displayNameSchema,
  bioSchema,
  messageSchema,
  ageSchema,
  dateOfBirthSchema,
  profileUpdateSchema,
  reportSchema,
  bookingSchema,
  eventSchema,
  filterPreferencesSchema,
  signupSchema,
  loginSchema,
  type ProfileUpdateInput,
  type ReportInput,
  type BookingInput,
  type EventInput,
  type FilterPreferencesInput,
  type SignupInput,
  type LoginInput,
} from './validators';

// =============================================================================
// FORMATTERS — Data formatting
// =============================================================================
export * from './formatters';

// =============================================================================
// GEOLOCATION — Location services
// =============================================================================
export * from './geoService';

// =============================================================================
// DEEPLINKS — URL handling and routing
// =============================================================================
export * from './deeplinks';

// =============================================================================
// HAPTICS — Touch feedback
// =============================================================================
export * from './haptics';

// =============================================================================
// I18N — Internationalization
// =============================================================================
export * from './i18n';

// =============================================================================
// LOGGER — Application logging
// =============================================================================
export * from './logger';

// =============================================================================
// ANIMATIONS — UI animations
// =============================================================================
export * from './animations';

// =============================================================================
// CONSTANTS — Application constants
// =============================================================================
export * from './constants';

// =============================================================================
// IMAGE PRELOADING — Asset optimization
// =============================================================================
export * from './imagePreload';

// =============================================================================
// QUICK REPLIES — Messaging utilities
// =============================================================================
export * from './quickReplies';

// =============================================================================
// SHARING — Social sharing
// =============================================================================
export * from './share';

// =============================================================================
// CONFIG — Environment configuration
// =============================================================================
export * from './config';
