// Gamechanger #19 — Zod v3 schemas (upgrade path to v4 ready)
// Single source of truth: schema drives form + type + validation
import { z } from 'zod';

export const ProfileSchema = z.object({
  displayName:  z.string().min(2).max(32),
  age:          z.number().int().min(18).max(99),
  bio:          z.string().max(500).optional(),
  tribe:        z.enum(['bear','twink','otter','daddy','jock','pup','leather','geek','trans','nonbinary']).optional(),
  lookingFor:   z.array(z.enum(['chat','dates','hookup','relationship','friends'])).min(1),
  distance:     z.number().min(0).max(160),
  nsfw:         z.boolean().default(false),
});

export const MessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type:    z.enum(['text','image','voice','location']).default('text'),
});

export const SignUpSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  age:      z.number().int().min(18, 'Must be 18+'),
});

export const SignInSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type SignUp  = z.infer<typeof SignUpSchema>;
export type SignIn  = z.infer<typeof SignInSchema>;
