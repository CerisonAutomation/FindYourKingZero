/**
 * =============================================================================
 * CANONICAL P2P DATING ENGINE v15.0 — Enterprise-Grade P2P Consolidation
 * =============================================================================
 *
 * Consolidates ALL P2P dating functionality into ONE canonical source.
 * Single source of truth for P2P operations across the application.
 *
 * Standards: 15/10 Legendary | Enterprise Production | Zero-Trust
 *
 * @module lib/p2p
 * @version 15.0.0
 */

// =============================================================================
// CORE P2P ENGINE
// =============================================================================
export {
  HybridP2PDatingEngine,
  type HybridEngineConfig,
  type EngineEvents,
} from '../HybridP2PDatingEngine';

// =============================================================================
// P2P TYPES
// =============================================================================
export type {
  P2PConfig,
  P2PMessage,
  P2PCall,
  UserProfile,
  LocationData,
  UserPreferences,
  PrivacySettings,
  VerificationStatus,
  UserStats,
  SocialLinks,
  Photo,
  Call,
  PaymentRequest,
  Group,
  Event,
} from '../../types';

// =============================================================================
// SIGNALING STRATEGIES
// =============================================================================
export {
  BitTorrentStrategy,
  NostrStrategy,
  MQTTStrategy,
  IPFSStrategy,
  WebRTCStrategy,
  SupabaseRealtimeStrategy,
  type SignalingStrategy,
} from './SignalingStrategy';

// =============================================================================
// AI MATCHING ENGINE
// =============================================================================
export {
  AIMatchingEngine,
  type MatchScore,
} from '../ai/AIMatchingEngine';

// =============================================================================
// ENCRYPTION
// =============================================================================
export {
  ZeroKnowledgeEncryption,
  type EncryptionKeyPair,
} from '../encryption/ZeroKnowledgeEncryption';

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================
export {
  PerformanceMonitor,
} from '../performance/PerformanceMonitor';

// =============================================================================
// ACCESSIBILITY
// =============================================================================
export {
  AccessibilityManager,
} from '../accessibility/AccessibilityManager';

// =============================================================================
// UNIFIED P2P SERVICES — Chat, Files, Location, Calls
// =============================================================================
export {
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
} from './UnifiedP2P';

// =============================================================================
// LEGACY RE-EXPORTS — Backward Compatibility
// =============================================================================

// Simple hook for basic P2P usage - now exported from unified hooks
export { useP2PDating } from '@/hooks/unified';
