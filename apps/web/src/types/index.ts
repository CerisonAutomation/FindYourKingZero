// ═══════════════════════════════════════════════════════════════
// FIND YOUR KING — Core Type Definitions
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────
export const AuthSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  createdAt: z.number(),
});
export type Auth = z.infer<typeof AuthSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(2).max(50),
  age: z.number().min(18).max(99),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

// ── User / Profile ───────────────────────────────────────────
export const TribeSchema = z.enum([
  'Bear', 'Muscle', 'Jock', 'Daddy', 'Otter', 'Twink',
  'Leather', 'Masc', 'Geek', 'Alt', 'Clean-cut', 'Discreet',
]);
export type Tribe = z.infer<typeof TribeSchema>;

export const LookingForSchema = z.enum([
  'Chat', 'Events', 'Dates', 'Friends', 'Right Now',
  'Relationship', 'Hookup', 'Networking',
]);
export type LookingFor = z.infer<typeof LookingForSchema>;

export const PositionSchema = z.enum(['Top', 'Bottom', 'Vers', 'Vers Top', 'Vers Bot', 'Side', '']);
export type Position = z.infer<typeof PositionSchema>;

export const HIVStatusSchema = z.enum(['Neg', 'Neg on PrEP', 'Poz Undetectable', 'Poz', 'Unknown', '']);
export type HIVStatus = z.infer<typeof HIVStatusSchema>;

export const RelationshipStatusSchema = z.enum(['Single', 'Open', 'Partnered', 'Complicated']);
export type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>;

export interface UserProfile {
  id: string;
  authId: string;
  name: string;
  display_name?: string;
  email?: string;
  age: number;
  bio: string;
  avatar: string;
  photos: string[];
  city: string;
  lat: number;
  lng: number;
  distance?: number;            // km — optional, computed client-side
  h3Hex: string;
  tribes: Tribe[];
  lookingFor: LookingFor[];
  height: string;
  weight?: string;
  position: Position;
  relationshipStatus: RelationshipStatus;
  hivStatus: HIVStatus;
  onPrEP: boolean;
  verified: boolean;
  premium: boolean;
  subscription_tier?: 'free' | 'king' | 'emperor';
  online: boolean;
  lastSeen: number;
  publicKey: JsonWebKey;
  createdAt: number;
}

// Partial profile used during sign-in/sign-up before full data loads
export type PartialUserProfile = Pick<UserProfile, 'id'> &
  Partial<Omit<UserProfile, 'id'>> & {
    email?: string;
    name: string;
  };

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  h3Hex?: string;
}

export interface UserPresence {
  userId: string;
  h3Hex: string;
  lat: number;
  lng: number;
  online: boolean;
  lastSeen: number;
  intent?: string;
}

// ── Match ─────────────────────────────────────────────────────
export interface Match {
  id: string;
  userIdA: string;
  userIdB: string;
  compatibility: number;
  matchedAt: number;
  lastMessageAt: number;
  lastMessage: string;
  unreadCount: number;
}

// ── Message ───────────────────────────────────────────────────
export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'location';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  type: MessageType;
  content: string;
  encryptedContent?: string;
  iv?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    lat?: number;
    lng?: number;
  };
  read: boolean;
  delivered: boolean;
  createdAt: number;
}

export interface P2PMessage {
  [key: string]: unknown;       // Index signature satisfies DataPayload constraint
  type: 'text' | 'typing' | 'read' | 'reaction' | 'file-start' | 'file-chunk' | 'file-end';
  payload: unknown;
  msgId: string;
  ts: number;
  senderId: string;
}

// ── Event ─────────────────────────────────────────────────────
export const EventTypeSchema = z.enum([
  'Party', 'Gym', 'Drinks', 'Music', 'Outdoor', 'Gaming', 'Cinema', 'Food',
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export interface KingEvent {
  id: string;
  title: string;
  type: EventType;
  description: string;
  date: number;
  time: string;
  location: string;
  lat: number;
  lng: number;
  capacity: number;
  attendees: string[];
  hostId: string;
  tags: string[];
  createdAt: number;
}

// ── Notification ──────────────────────────────────────────────
export type NotificationType = 'tap' | 'woof' | 'superlike' | 'match' | 'message' | 'event' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  text: string;
  fromUserId?: string;
  read: boolean;
  createdAt: number;
}

// ── AI ────────────────────────────────────────────────────────
export interface AIRequest {
  type: 'smart-reply' | 'toxicity' | 'translate' | 'icebreaker' | 'profile-tip';
  payload: unknown;
  id: string;
}

export interface AIResponse {
  id: string;
  result: unknown;
  error?: string;
}

// ── Subscription ──────────────────────────────────────────────
export interface SubscriptionTier {
  id: 'free' | 'plus' | 'pro' | 'elite';
  name: string;
  price: number;
  features: string[];
}

// ── Screen ────────────────────────────────────────────────────
export type Screen =
  | 'landing' | 'signin' | 'signup' | 'onboarding'
  | 'discover' | 'view-profile'
  | 'messages' | 'chat'
  | 'right-now'
  | 'events' | 'event-detail'
  | 'profile' | 'edit-profile'
  | 'notifications' | 'settings' | 'subscription';

// ── Theme ─────────────────────────────────────────────────────
export const COLORS = {
  red: '#E5192E',
  blue: '#2563EB',
  green: '#16A34A',
  yellow: '#D97706',
  purple: '#7C3AED',
  pink: '#EC4899',
  cyan: '#06B6D4',
  bg: '#060610',
  bg1: '#0A0A1A',
  bg2: '#0E0E22',
  bg3: '#13132E',
  w60: 'rgba(255,255,255,.60)',
  w40: 'rgba(255,255,255,.40)',
  w35: 'rgba(255,255,255,.35)',
  w30: 'rgba(255,255,255,.30)',
  w20: 'rgba(255,255,255,.20)',
  w12: 'rgba(255,255,255,.12)',
  w10: 'rgba(255,255,255,.10)',
  w08: 'rgba(255,255,255,.08)',
  w07: 'rgba(255,255,255,.07)',
  w06: 'rgba(255,255,255,.06)',
  w04: 'rgba(255,255,255,.04)',
} as const;

export const EVENT_COLORS: Record<EventType, string> = {
  Party: COLORS.red, Gym: COLORS.blue, Drinks: COLORS.yellow,
  Music: COLORS.purple, Outdoor: COLORS.green, Gaming: COLORS.pink,
  Cinema: COLORS.cyan, Food: COLORS.yellow,
};

export const EVENT_EMOJI: Record<EventType, string> = {
  Party: '🎉', Gym: '🏋️', Drinks: '🍻', Music: '🎵',
  Outdoor: '🌿', Gaming: '🎮', Cinema: '🎬', Food: '🍽️',
};
