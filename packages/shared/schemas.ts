// ═══════════════════════════════════════════════════════════════
// PACKAGES: Shared Zod schemas + types
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod';

export const TribeEnum = z.enum([
  'Bear', 'Muscle', 'Jock', 'Daddy', 'Otter', 'Twink',
  'Leather', 'Masc', 'Geek', 'Alt', 'Clean-cut', 'Discreet',
]);

export const LookingForEnum = z.enum([
  'Chat', 'Events', 'Dates', 'Friends', 'Right Now',
  'Relationship', 'Hookup', 'Networking',
]);

export const EventTypeEnum = z.enum([
  'Party', 'Gym', 'Drinks', 'Music', 'Outdoor', 'Gaming', 'Cinema', 'Food',
]);

// ── Auth schemas ──────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  name: z.string().min(2).max(50),
  age: z.number().min(18).max(99),
});

// ── Profile schemas ───────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
  photos: z.array(z.string().url()).max(6).optional(),
  tribes: z.array(TribeEnum).max(5).optional(),
  lookingFor: z.array(LookingForEnum).max(4).optional(),
  height: z.string().max(10).optional(),
  position: z.enum(['Top', 'Bottom', 'Vers', 'Vers Top', 'Vers Bot', 'Side', '']).optional(),
  relationshipStatus: z.enum(['Single', 'Open', 'Partnered', 'Complicated']).optional(),
  hivStatus: z.enum(['Neg', 'Neg on PrEP', 'Poz Undetectable', 'Poz', 'Unknown', '']).optional(),
  onPrEP: z.boolean().optional(),
  publicKey: z.any().optional(),
});

// ── Message schemas ───────────────────────────────────────────
export const SendMessageSchema = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'file', 'voice', 'location']).default('text'),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ── Event schemas ─────────────────────────────────────────────
export const CreateEventSchema = z.object({
  title: z.string().min(3).max(100),
  type: EventTypeEnum,
  description: z.string().max(1000).optional(),
  date: z.number(),  // timestamp
  time: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  capacity: z.number().min(1).max(1000),
  tags: z.array(z.string()).max(10).optional(),
});

export const UpdateEventSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  capacity: z.number().min(1).max(1000).optional(),
});

// ── Presence schemas ──────────────────────────────────────────
export const UpdatePresenceSchema = z.object({
  h3Hex: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  online: z.boolean(),
  intent: z.string().max(50).optional(),
});

// ── Report schemas ────────────────────────────────────────────
export const ReportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'fake', 'underage', 'other']),
  details: z.string().max(1000).optional(),
});

// Re-export types
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdatePresenceInput = z.infer<typeof UpdatePresenceSchema>;
