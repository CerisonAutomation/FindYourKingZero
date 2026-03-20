import {z} from 'zod';
import {APP_CONFIG} from './constants';

// Email validation
export const emailSchema = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters');

// Password validation
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    );

// Display name validation
export const displayNameSchema = z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(
        /^[a-zA-Z0-9_\s-]+$/,
        'Display name can only contain letters, numbers, underscores, hyphens, and spaces'
    );

// Bio validation
export const bioSchema = z
    .string()
    .trim()
    .max(APP_CONFIG.limits.maxBioLength, `Bio must be less than ${APP_CONFIG.limits.maxBioLength} characters`)
    .optional();

// Message validation
export const messageSchema = z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(APP_CONFIG.limits.maxMessageLength, `Message must be less than ${APP_CONFIG.limits.maxMessageLength} characters`);

// Age validation (18+)
export const ageSchema = z
    .number()
    .int('Age must be a whole number')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Please enter a valid age');

// Date of birth validation
export const dateOfBirthSchema = z
    .string()
    .refine((date) => {
        const dob = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
            ? age - 1
            : age;
        return actualAge >= 18;
    }, 'You must be at least 18 years old');

// Profile update schema
export const profileUpdateSchema = z.object({
    display_name: displayNameSchema.optional(),
    bio: bioSchema,
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    height: z.number().int().min(100).max(250).optional().nullable(),
    weight: z.number().int().min(30).max(300).optional().nullable(),
    tribes: z.array(z.string().max(50)).max(10).optional(),
    interests: z.array(z.string().max(50)).max(20).optional(),
    looking_for: z.array(z.string().max(50)).max(10).optional(),
});

// Report schema
export const reportSchema = z.object({
    reason: z.string().min(1, 'Please select a reason'),
    details: z.string().trim().max(1000, 'Details must be less than 1000 characters').optional(),
});

// Booking schema
export const bookingSchema = z.object({
    booking_date: z.string().refine((date) => {
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
    }, 'Booking date must be today or in the future'),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
    duration_hours: z.number().int().min(1).max(24),
    location: z.string().trim().min(1).max(500).optional(),
    notes: z.string().trim().max(1000).optional(),
});

// Event schema
export const eventSchema = z.object({
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().max(2000).optional(),
    event_date: z.string(),
    start_time: z.string(),
    end_time: z.string().optional(),
    location: z.string().trim().min(1).max(500),
    event_type: z.string(),
    max_attendees: z.number().int().min(2).max(10000).optional(),
    is_public: z.boolean().default(true),
    is_premium_only: z.boolean().default(false),
});

// Filter preferences schema
export const filterPreferencesSchema = z.object({
    ageRange: z.tuple([z.number().min(18).max(120), z.number().min(18).max(120)]),
    distanceRadius: z.number().min(1).max(500),
    tribes: z.array(z.string()).max(10),
    lookingFor: z.array(z.string()).max(10),
    showOnlineOnly: z.boolean(),
    showVerifiedOnly: z.boolean(),
});

// Signup schema
export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Type exports
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type FilterPreferencesInput = z.infer<typeof filterPreferencesSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
