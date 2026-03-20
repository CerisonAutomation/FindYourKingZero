// =====================================================
// COMPREHENSIVE TYPE DEFINITIONS FOR DATING PLATFORM
// =====================================================

// Base types
export type UUID = string;
export type Timestamp = string;
export type ISODateTime = string;

// Enum types
export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    EXPIRED = 'expired'
}

export enum ReportStatus {
    PENDING = 'pending',
    REVIEWING = 'reviewing',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed'
}

export enum SubscriptionTier {
    FREE = 'free',
    PREMIUM = 'premium',
    VIP = 'vip',
    ENTERPRISE = 'enterprise'
}

export enum PrivacyLevel {
    PUBLIC = 'public',
    FRIENDS = 'friends',
    PRIVATE = 'private',
    STEALTH = 'stealth'
}

export enum RelationshipType {
    CASUAL = 'casual',
    DATING = 'dating',
    RELATIONSHIP = 'relationship',
    FRIENDSHIP = 'friendship',
    NETWORKING = 'networking'
}

export enum PresenceStatus {
    ONLINE = 'online',
    AWAY = 'away',
    BUSY = 'busy',
    INVISIBLE = 'invisible',
    OFFLINE = 'offline'
}

export enum MatchStatus {
    PENDING = 'pending',
    MUTUAL = 'mutual',
    EXPIRED = 'expired',
    BLOCKED = 'blocked'
}

export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    FILE = 'file',
    GIF = 'gif',
    STICKER = 'sticker'
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    FILE = 'file',
    PIX = 'pix',
    CALL = 'call',
    LOCATION = 'location',
    REACTION = 'reaction',
    TYPING = 'typing'
}

// Core profile interface
export interface Profile {
    id: UUID;
    user_id: UUID;
    name: string;
    age?: number;
    birth_date?: string;
    bio?: string;
    avatar?: string;
    photos: string[];
    location?: {
        lat: number;
        lng: number;
    };
    location_accuracy?: number;
    location_updated_at?: ISODateTime;
    distance?: number;
    height?: string;
    weight?: string;
    body_type?: string;
    ethnicity?: string;
    languages: string[];
    education?: string;
    occupation?: string;
    income_range?: string;
    lifestyle?: string;
    tribes: string[];
    lookingFor: string[];
    interests: string[];
    kinks: string[];
    limits: string[];
    hiv_status?: string;
    prep_status?: string;
    last_test_date?: string;
    vaccination_status?: string;
    preferred_position: string[];
    safe_sex_only: boolean;
    party_friendly: boolean;
    cannabis_friendly: boolean;
    poppers_friendly: boolean;
    chemsex_friendly: boolean;
    relationship_goals: RelationshipType;
    isOnline: boolean;
    lastSeen?: Date;
    last_online_at?: ISODateTime;
    isVerified: boolean;
    verification_status: VerificationStatus;
    verification_score: number;
    isPremium: boolean;
    is_active: boolean;
    is_banned: boolean;
    ban_reason?: string;
    ban_expires_at?: ISODateTime;
    expires_at?: ISODateTime;
    profile_completion_score: number;
    ai_enhanced_bio?: string;
    voice_bio_url?: string;
    zodiac_sign?: string;
    travel_mode_active: boolean;
    travel_mode_lat?: number;
    travel_mode_lng?: number;
    travel_mode_destination?: string;
    status_text?: string;
    role: 'seeker' | 'provider';
    hourly_rate?: number;
    rating?: number;
    review_count?: number;
    profile_embedding?: number[];
    bio_embedding?: number[];
    interests_embedding?: number[];
    preferences_embedding?: number[];
    embedding_model_version?: string;
    embedding_updated_at?: ISODateTime;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// Message interfaces
export interface Message {
    id: UUID;
    conversation_id: UUID;
    sender_id: UUID;
    content: string;
    type: MessageType;
    timestamp: ISODateTime;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    is_encrypted: boolean;
    is_edited: boolean;
    is_unsent: boolean;
    is_deleted: boolean;
    deleted_at?: ISODateTime;
    expires_at?: ISODateTime;
    delivery_status: string;
    reply_to_id?: UUID;
    forward_count: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    encryption_key?: string;
    metadata: Record<string, any>;
    reactions: MessageReaction[];
    updated_at: ISODateTime;
}

export interface MessageReaction {
    id: UUID;
    message_id: UUID;
    user_id: UUID;
    emoji: string;
    created_at: ISODateTime;
}

export interface Conversation {
    id: UUID;
    participant_one: UUID;
    participant_two: UUID;
    participant: Profile;
    last_message?: Message;
    unread_count: number;
    updated_at: ISODateTime;
    created_at: ISODateTime;
}

// Enhanced booking interface
export interface Booking {
    id: UUID;
    seeker_id: UUID;
    provider_id: UUID;
    provider?: Profile;
    seeker?: Profile;
    date: ISODateTime;
    start_time: string;
    end_time: string;
    duration: number;
    location: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    total_amount: number;
    notes?: string;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// User statistics
export interface UserStats {
    views: number;
    favorites: number;
    matches: number;
    bookings_completed: number;
    rating: number;
    total_views: number;
    total_likes: number;
    total_matches: number;
    total_messages_sent: number;
    total_messages_received: number;
    total_profile_views: number;
    total_time_spent: string;
    average_session_duration: string;
    swipe_right_count: number;
    swipe_left_count: number;
    match_rate: number;
    response_rate: number;
    premium_conversion_date?: ISODateTime;
    last_active_date?: ISODateTime;
    retention_days: number;
    churn_probability: number;
    lifetime_value: number;
    calculated_at: ISODateTime;
}

// Filter preferences
export interface FilterPreferences {
    age_range: [number, number];
    distance_radius: number;
    tribes: string[];
    lookingFor: string[];
    show_online_only: boolean;
    show_verified_only: boolean;
    min_age?: number;
    max_age?: number;
    max_distance_km?: number;
    relationship_types: RelationshipType[];
    body_types: string[];
    ethnicities: string[];
    positions: string[];
    kinks: string[];
    hiv_status_preference: string;
    requires_verification: boolean;
    requires_premium: boolean;
    auto_match_enabled: boolean;
    ai_learning_enabled: boolean;
    last_calculated_at?: ISODateTime;
    metadata: Record<string, any>;
}

// AI and matching interfaces
export interface AIProfile {
    id: UUID;
    user_id: UUID;
    personality_traits: Record<string, number>;
    compatibility_scores: Record<string, number>;
    behavior_patterns: Record<string, any>;
    preferences_learned: Record<string, any>;
    risk_score: number;
    authenticity_score: number;
    engagement_prediction: number;
    last_analyzed_at?: ISODateTime;
    model_version?: string;
    training_data_count: number;
    metadata: Record<string, any>;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface MatchingCandidate {
    id: UUID;
    user_id: UUID;
    candidate_id: UUID;
    similarity_score: number;
    compatibility_score: number;
    match_probability: number;
    algorithm_version: string;
    factors: Record<string, any>;
    last_calculated_at: ISODateTime;
    expires_at: ISODateTime;
    is_active: boolean;
    metadata: Record<string, any>;
    created_at: ISODateTime;
}

export interface Match {
    id: UUID;
    user_one: UUID;
    user_two: UUID;
    status: MatchStatus;
    match_score: number;
    compatibility_score: number;
    ai_match_reason?: string;
    match_algorithm: string;
    initiated_by?: UUID;
    expires_at?: ISODateTime;
    last_interaction_at?: ISODateTime;
    interaction_count: number;
    metadata: Record<string, any>;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// Privacy and safety interfaces
export interface PrivacySettings {
    user_id: UUID;
    profile_visibility: PrivacyLevel;
    location_visibility: PrivacyLevel;
    last_seen_visibility: PrivacyLevel;
    online_status_visibility: PrivacyLevel;
    gallery_visibility: PrivacyLevel;
    allow_stranger_messages: boolean;
    allow_friend_requests: boolean;
    allow_tagging: boolean;
    allow_screenshots: boolean;
    auto_delete_messages: boolean;
    message_retention_days: number;
    blur_stranger_photos: boolean;
    hide_age: boolean;
    hide_distance: boolean;
    data_collection_opt_out: boolean;
    ai_training_opt_out: boolean;
    analytics_opt_out: boolean;
    marketing_opt_out: boolean;
    search_opt_out: boolean;
    blocked_countries: string[];
    time_restriction_start?: string;
    time_restriction_end?: string;
    do_not_disturb: boolean;
    metadata: Record<string, any>;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface Report {
    id: UUID;
    reporter_id: UUID;
    reported_id: UUID;
    reason: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
    evidence_urls: string[];
    evidence_data: Record<string, any>;
    status: ReportStatus;
    priority: string;
    assigned_to?: UUID;
    auto_action_taken?: string;
    human_action_required: boolean;
    resolved_at?: ISODateTime;
    resolution_notes?: string;
    appeal_status?: string;
    appeal_reason?: string;
    metadata: Record<string, any>;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// Notification interfaces
export interface Notification {
    id: UUID;
    user_id: UUID;
    type: 'message' | 'booking' | 'favorite' | 'view' | 'system' | 'match';
    title: string;
    body?: string;
    is_read: boolean;
    data: Record<string, any>;
    created_at: ISODateTime;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    read_at?: ISODateTime;
    is_push_sent: boolean;
    push_sent_at?: ISODateTime;
    is_email_sent: boolean;
    email_sent_at?: ISODateTime;
    expires_at?: ISODateTime;
    action_url?: string;
    action_text?: string;
    category: string;
    metadata: Record<string, any>;
}

export interface NotificationPreferences {
    user_id: UUID;
    push_enabled: boolean;
    email_enabled: boolean;
    in_app_enabled: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    message_notifications: boolean;
    match_notifications: boolean;
    like_notifications: boolean;
    view_notifications: boolean;
    profile_visit_notifications: boolean;
    safety_notifications: boolean;
    billing_notifications: boolean;
    marketing_notifications: boolean;
    do_not_disturb: boolean;
    metadata: Record<string, any>;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// Subscription interfaces
export interface Subscription {
    id: UUID;
    user_id: UUID;
    tier: SubscriptionTier;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    stripe_price_id?: string;
    status: string;
    current_period_start?: ISODateTime;
    current_period_end?: ISODateTime;
    trial_end?: ISODateTime;
    cancel_at_period_end: boolean;
    canceled_at?: ISODateTime;
    payment_method?: string;
    billing_cycle: 'monthly' | 'yearly';
    auto_renew: boolean;
    grace_period_ends_at?: ISODateTime;
    metadata: Record<string, any>;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// Event interfaces
export interface Event {
    id: UUID;
    title: string;
    description: string;
    type: 'party' | 'meetup' | 'chill' | 'workshop' | 'other';
    location: {
        name: string;
        address: string;
        lat: number;
        lng: number;
    };
    start_time: ISODateTime;
    end_time: ISODateTime;
    max_attendees?: number;
    current_attendees: number;
    price?: number;
    is_free: boolean;
    requires_approval: boolean;
    is_private: boolean;
    host_id: UUID;
    host?: Profile;
    images: string[];
    tags: string[];
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface EventAttendee {
    id: UUID;
    event_id: UUID;
    user_id: UUID;
    status: 'pending' | 'approved' | 'rejected' | 'attended' | 'no_show';
    joined_at: ISODateTime;
    notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        has_more: boolean;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

// Form types
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        custom?: (value: any) => string | undefined;
    };
}

// Component prop types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    testId?: string;
}

export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Hook return types
export interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

export interface UsePaginationState<T> {
    items: T[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    loadMore: () => void;
    refresh: () => void;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database types (generated from Supabase)
export type Database = {
    public: {
        Tables: {
            [key: string]: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Functions: {
            [key: string]: {
                Args: any;
                Returns: any;
            };
        };
        Views: {
            [key: string]: {
                Row: any;
            };
        };
    };
};
