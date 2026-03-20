// Production constants and configuration

export const APP_CONFIG = {
    name: 'Find Your King',
    version: '1.0.0',
    description: 'Premium dating app for discerning individuals',
    tagline: 'Your Kingdom Awaits',

    // Feature flags
    features: {
        realTimeChat: true,
        videoCall: false,
        voiceMessage: true,
        paymentEnabled: true,
        pushNotifications: true,
        locationTracking: true,
        aiMatching: true,
        liveMap: true,
    },

    // Limits
    limits: {
        maxPhotos: 9,
        maxBioLength: 500,
        maxMessageLength: 1000,
        maxConversationsPerDay: 50,
        freeProfileViewsPerDay: 10,
        freeMessagesPerDay: 5,
    },

    // Rate limiting
    rateLimits: {
        messagesPerMinute: 30,
        profileViewsPerMinute: 60,
        searchQueriesPerMinute: 20,
    },
} as const;

export const VERIFICATION_LEVELS = {
    NONE: 0,
    EMAIL: 1,
    PHONE: 2,
    PHOTO: 3,
    AGE: 4,
    ID: 5,
    FULL: 6,
} as const;

export const SUBSCRIPTION_PLANS = {
    FREE: 'free',
    BASIC: 'basic',
    PREMIUM: 'premium',
    VIP: 'vip',
} as const;

export const TRIBES = [
    'Bear', 'Otter', 'Twink', 'Jock', 'Daddy',
    'Leather', 'Geek', 'Muscle', 'Chub', 'Silver Fox',
    'Femme', 'Masc', 'Versatile', 'Outdoorsy', 'Creative',
] as const;

export const LOOKING_FOR = [
    'Chat', 'Friendship', 'Dating', 'Relationship',
    'Networking', 'Fun', 'Travel Buddy', 'Gym Partner',
    'Casual', 'Long-term', 'Open',
] as const;

export const INTERESTS = [
    'Fitness', 'Travel', 'Music', 'Art', 'Food',
    'Movies', 'Gaming', 'Reading', 'Sports', 'Outdoors',
    'Fashion', 'Tech', 'Photography', 'Dancing', 'Cooking',
    'Yoga', 'Meditation', 'Hiking', 'Beach', 'Nightlife',
] as const;

export const EVENT_TYPES = [
    'Party', 'Social', 'Sports', 'Art', 'Music',
    'Food & Drink', 'Wellness', 'Travel', 'Gaming', 'Other',
] as const;

export const REPORT_REASONS = [
    'Inappropriate content',
    'Harassment',
    'Fake profile',
    'Spam',
    'Underage',
    'Other',
] as const;

// Animation presets
export const ANIMATION_PRESETS = {
    fadeIn: {
        initial: {opacity: 0},
        animate: {opacity: 1},
        exit: {opacity: 0},
    },
    slideUp: {
        initial: {opacity: 0, y: 20},
        animate: {opacity: 1, y: 0},
        exit: {opacity: 0, y: -20},
    },
    scaleIn: {
        initial: {opacity: 0, scale: 0.95},
        animate: {opacity: 1, scale: 1},
        exit: {opacity: 0, scale: 0.95},
    },
    slideFromRight: {
        initial: {opacity: 0, x: 100},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: -100},
    },
} as const;

// Breakpoints
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

// Time constants
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language',
    ONBOARDING_COMPLETE: 'onboarding_complete',
    COOKIE_CONSENT: 'cookie_consent',
    LAST_LOCATION: 'last_location',
    DRAFT_MESSAGE: 'draft_message',
    RECENT_SEARCHES: 'recent_searches',
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_REQUIRED: 'Please sign in to continue.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'Something went wrong. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    PROFILE_UPDATED: 'Profile updated successfully.',
    MESSAGE_SENT: 'Message sent.',
    PHOTO_UPLOADED: 'Photo uploaded successfully.',
    FAVORITE_ADDED: 'Added to favorites.',
    FAVORITE_REMOVED: 'Removed from favorites.',
    VERIFICATION_SUBMITTED: 'Verification submitted. We\'ll review it shortly.',
    SUBSCRIPTION_ACTIVATED: 'Welcome to Premium! Enjoy your new features.',
    REPORT_SUBMITTED: 'Thank you for your report. We\'ll review it shortly.',
} as const;
