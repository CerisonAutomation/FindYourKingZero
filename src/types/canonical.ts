/**
 * =============================================================================
 * CANONICAL TYPES — Unified Type Definitions v15.0
 * =============================================================================
 *
 * Single source of truth for ALL types across the application.
 * Eliminates type duplication and inconsistencies.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module types
 * @version 15.0.0
 */

// ═════════════════════════════════════════════════════════════════════════════
// USER & PROFILE TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Canonical user role hierarchy */
export type UserRole = 'guest' | 'user' | 'premium' | 'moderator' | 'admin' | 'superadmin';

/** Subscription tiers */
export type SubscriptionTier = 'free' | 'plus' | 'premium' | 'elite';

/** Canonical user profile - used across all features */
export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  bio: string;
  avatarUrl: string | null;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    timestamp: number;
  } | null;
  isOnline: boolean;
  isVerified: boolean;
  membershipTier: SubscriptionTier;
  interests: string[];
  tribes: string[];
  relationshipGoals: string[];
  position: 'top' | 'vers' | 'bottom' | 'flexible' | null;
  relationshipStatus: 'single' | 'dating' | 'relationship' | 'open' | null;
  hivStatus: 'negative' | 'positive' | 'on-prep' | 'undetectable' | null;
  pronouns: string;
  lastSeen: string;
  distance?: number;
  compatibility?: number;
  // Legacy compatibility
  verification?: boolean;
  stats?: {
    profileViews: number;
    matches: number;
    messages: number;
  };
  isPremium?: boolean;
}

/** Profile for dating/matching features (alias for unified type) */
export type DatingProfile = UserProfile;

/** Profile for grid display */
export type GridProfile = UserProfile;

/** Profile for events */
export type EventProfile = UserProfile;

// ═════════════════════════════════════════════════════════════════════════════
// AUTH TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Auth error codes */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  RATE_LIMITED = 'rate_limited',
  NETWORK_ERROR = 'network_error',
  BIOMETRIC_FAILED = 'biometric_failed',
  BIOMETRIC_UNSUPPORTED = 'biometric_unsupported',
  SESSION_EXPIRED = 'session_expired',
  UNKNOWN = 'unknown',
}

/** Classified auth error */
export interface ClassifiedAuthError {
  code: AuthErrorCode;
  message: string;
  retryable: boolean;
  originalError: Error | null;
  timestamp?: string;
  requestId?: string;
}

/** Biometric authentication result */
export interface BiometricResult {
  success: boolean;
  method: 'webauthn' | 'capacitor' | 'unsupported';
  credentialId?: string;
  error?: string;
  timestamp?: string;
}

/** User permissions matrix */
export interface UserPermissions {
  canMessage: boolean;
  canVoiceChat: boolean;
  canVideoChat: boolean;
  canGroupChat: boolean;
  canViewProfiles: boolean;
  canAdvancedSearch: boolean;
  canSeePremiumFeatures: boolean;
  canUseAI: boolean;
  canUseAICoaching: boolean;
  canUseAIMatching: boolean;
  canHostEvents: boolean;
  canJoinEvents: boolean;
  canCreateParties: boolean;
  maxPhotos: number;
  maxVideos: number;
  canGoLive: boolean;
  maxDailySwipes: number | 'unlimited';
  canSuperLike: boolean;
  canRewind: boolean;
  canBoostProfile: boolean;
  canReport: boolean;
  canBlock: boolean;
  canVerifyIdentity: boolean;
  canModerate: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// CHAT & MESSAGING TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Canonical message type */
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'video' | 'location' | 'reaction' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    reaction?: string;
    replyTo?: string;
    editHistory?: Array<{ content: string; timestamp: number }>;
    selfDestruct?: number;
    readReceipt?: boolean;
  };
  isRead: boolean;
  isDeleted?: boolean;
}

/** Chat room/conversation */
export interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | 'nearby' | 'global' | 'tribe' | 'private' | 'event';
  name: string;
  description?: string;
  participants: string[];
  createdAt: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Event/Party type */
export interface Event {
  id: string;
  hostId: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    venueName?: string;
  };
  startTime: string;
  endTime?: string;
  type: 'party' | 'gathering' | 'meetup' | 'virtual';
  maxAttendees: number;
  attendees: string[];
  isPublic: boolean;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'ended' | 'cancelled';
  createdAt: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// DATING & MATCHING TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Match between two users */
export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  matchedAt: string;
  lastMessageAt?: string;
  isActive: boolean;
  compatibilityScore?: number;
}

/** Swipe action result */
export interface SwipeResult {
  profileId: string;
  action: 'like' | 'pass' | 'superlike';
  timestamp: string;
  isMatch?: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// API & RESPONSE TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: ClassifiedAuthError | Error | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/** Paginated result */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT PROP TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Route guard configuration */
export interface RouteGuardConfig {
  requiredRoles?: UserRole[];
  requiredPermissions?: (keyof UserPermissions)[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// ═════════════════════════════════════════════════════════════════════════════
// RE-EXPORT LEGACY ALIASES FOR BACKWARD COMPATIBILITY
// ═════════════════════════════════════════════════════════════════════════════

/** @deprecated Use UserProfile instead */
export type Profile = UserProfile;

/** @deprecated Use Message instead */
export type ChatMessage = Message;

/** @deprecated Use Event instead */
export type Party = Event;
