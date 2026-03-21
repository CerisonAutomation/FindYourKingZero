// =====================================================
// ENTERPRISE TYPESCRIPT DEFINITIONS - COMPLETE DATABASE SCHEMA
// =====================================================
// Auto-generated with enterprise-level type safety

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// =====================================================
// ENHANCED ENUM TYPES
// =====================================================
export type MediaType = 'image' | 'video' | 'audio' | 'file' | 'gif' | 'sticker'
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'pix' | 'call' | 'location' | 'reaction' | 'typing'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'
export type SubscriptionTier = 'free' | 'premium' | 'vip' | 'enterprise'
export type PrivacyLevel = 'public' | 'friends' | 'private' | 'stealth'
export type RelationshipType = 'casual' | 'dating' | 'relationship' | 'friendship' | 'networking'
export type PresenceStatus = 'online' | 'away' | 'busy' | 'invisible' | 'offline'
export type MatchStatus = 'pending' | 'mutual' | 'expired' | 'blocked'

// =====================================================
// DATABASE TYPE DEFINITIONS
// =====================================================
export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            // LEGACY TABLES
            album_photos: {
                Row: {
                    album_id: string
                    caption: string | null
                    created_at: string | null
                    id: string
                    order_index: number | null
                    url: string
                    user_id: string
                }
                Insert: {
                    album_id: string
                    caption?: string | null
                    created_at?: string | null
                    id?: string
                    order_index?: number | null
                    url: string
                    user_id: string
                }
                Update: {
                    album_id?: string
                    caption?: string | null
                    created_at?: string | null
                    id?: string
                    order_index?: number | null
                    url?: string
                    user_id?: string
                }
                Relationships: [{
                    foreignKeyName: "album_photos_album_id_fkey"
                    columns: ["album_id"]
                    isOneToOne: false
                    referencedRelation: "albums"
                    referencedColumns: ["id"]
                }]
            }
            albums: {
                Row: {
                    cover_url: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    is_private: boolean | null
                    name: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    cover_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_private?: boolean | null
                    name: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    cover_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_private?: boolean | null
                    name?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            blocks: {
                Row: {
                    blocked_id: string
                    blocker_id: string
                    created_at: string | null
                    id: string
                }
                Insert: {
                    blocked_id: string
                    blocker_id: string
                    created_at?: string | null
                    id?: string
                }
                Update: {
                    blocked_id?: string
                    blocker_id?: string
                    created_at?: string | null
                    id?: string
                }
                Relationships: []
            }
            bookings: {
                Row: {
                    booking_date: string
                    created_at: string | null
                    duration_hours: number
                    id: string
                    location: string | null
                    notes: string | null
                    payment_status: string | null
                    provider_id: string
                    seeker_id: string
                    start_time: string
                    status: string | null
                    stripe_payment_id: string | null
                    total_amount: number | null
                    updated_at: string | null
                }
                Insert: {
                    booking_date: string
                    created_at?: string | null
                    duration_hours?: number
                    id?: string
                    location?: string | null
                    notes?: string | null
                    payment_status?: string | null
                    provider_id: string
                    seeker_id: string
                    start_time: string
                    status?: string | null
                    stripe_payment_id?: string | null
                    total_amount?: number | null
                    updated_at?: string | null
                }
                Update: {
                    booking_date?: string
                    created_at?: string | null
                    duration_hours?: number
                    id?: string
                    location?: string | null
                    notes?: string | null
                    payment_status?: string | null
                    provider_id?: string
                    seeker_id?: string
                    start_time?: string
                    status?: string | null
                    stripe_payment_id?: string | null
                    total_amount?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            conversations: {
                Row: {
                    created_at: string | null
                    id: string
                    last_message_at: string | null
                    participant_one: string
                    participant_two: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    last_message_at?: string | null
                    participant_one: string
                    participant_two: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    last_message_at?: string | null
                    participant_one?: string
                    participant_two?: string
                }
                Relationships: [{
                    foreignKeyName: "conversations_participant_one_fkey"
                    columns: ["participant_one"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["user_id"]
                }, {
                    foreignKeyName: "conversations_participant_two_fkey"
                    columns: ["participant_two"]
                    isOneToOne: false
                    referencedRelation: "profiles"
                    referencedColumns: ["user_id"]
                }]
            }
            events: {
                Row: {
                    cover_image: string | null
                    created_at: string | null
                    description: string | null
                    end_time: string | null
                    event_date: string
                    event_type: string
                    host_id: string
                    id: string
                    is_premium_only: boolean | null
                    is_public: boolean | null
                    latitude: number | null
                    location: string
                    longitude: number | null
                    max_attendees: number | null
                    start_time: string
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    cover_image?: string | null
                    created_at?: string | null
                    description?: string | null
                    end_time?: string | null
                    event_date: string
                    event_type?: string
                    host_id: string
                    id?: string
                    is_premium_only?: boolean | null
                    is_public?: boolean | null
                    latitude?: number | null
                    location: string
                    longitude?: number | null
                    max_attendees?: number | null
                    start_time: string
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    cover_image?: string | null
                    created_at?: string | null
                    description?: string | null
                    end_time?: string | null
                    event_date?: string
                    event_type?: string
                    host_id?: string
                    id?: string
                    is_premium_only?: boolean | null
                    is_public?: boolean | null
                    latitude?: number | null
                    location?: string
                    longitude?: number | null
                    max_attendees?: number | null
                    start_time?: string
                    title?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            event_attendees: {
                Row: {
                    event_id: string
                    id: string
                    joined_at: string | null
                    status: string
                    user_id: string
                }
                Insert: {
                    event_id: string
                    id?: string
                    joined_at?: string | null
                    status?: string
                    user_id: string
                }
                Update: {
                    event_id?: string
                    id?: string
                    joined_at?: string | null
                    status?: string
                    user_id?: string
                }
                Relationships: [{
                    foreignKeyName: "event_attendees_event_id_fkey"
                    columns: ["event_id"]
                    isOneToOne: false
                    referencedRelation: "events"
                    referencedColumns: ["id"]
                }]
            }
            favorites: {
                Row: {
                    created_at: string | null
                    favorited_user_id: string
                    id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    favorited_user_id: string
                    id?: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    favorited_user_id?: string
                    id?: string
                    user_id?: string
                }
                Relationships: []
            }
            gdpr_consent_records: {
                Row: {
                    consent_given: boolean
                    consent_type: string
                    consent_version: string | null
                    given_at: string | null
                    id: string
                    ip_address: unknown
                    user_agent: string | null
                    user_id: string
                    withdrawn_at: string | null
                }
                Insert: {
                    consent_given: boolean
                    consent_type: string
                    consent_version?: string | null
                    given_at?: string | null
                    id?: string
                    ip_address?: unknown
                    user_agent?: string | null
                    user_id: string
                    withdrawn_at?: string | null
                }
                Update: {
                    consent_given?: boolean
                    consent_type?: string
                    consent_version?: string | null
                    given_at?: string | null
                    id?: string
                    ip_address?: unknown
                    user_agent?: string | null
                    user_id?: string
                    withdrawn_at?: string | null
                }
                Relationships: []
            }
            gdpr_data_requests: {
                Row: {
                    download_expires_at: string | null
                    download_url: string | null
                    id: string
                    notes: string | null
                    processed_at: string | null
                    processed_by: string | null
                    request_type: string
                    requested_at: string | null
                    scheduled_deletion_at: string | null
                    status: string | null
                    user_id: string
                }
                Insert: {
                    download_expires_at?: string | null
                    download_url?: string | null
                    id?: string
                    notes?: string | null
                    processed_at?: string | null
                    processed_by?: string | null
                    request_type: string
                    requested_at?: string | null
                    scheduled_deletion_at?: string | null
                    status?: string | null
                    user_id: string
                }
                Update: {
                    download_expires_at?: string | null
                    download_url?: string | null
                    id?: string
                    notes?: string | null
                    processed_at?: string | null
                    processed_by?: string | null
                    request_type?: string
                    requested_at?: string | null
                    scheduled_deletion_at?: string | null
                    status?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            matches: {
                Row: {
                    id: string
                    matched_at: string | null
                    user_one: string
                    user_two: string
                    // NEW ENHANCED FIELDS
                    status: MatchStatus
                    match_score: number
                    compatibility_score: number
                    ai_match_reason: string | null
                    match_algorithm: string
                    initiated_by: string | null
                    expires_at: string | null
                    last_interaction_at: string | null
                    interaction_count: number
                    metadata: Json
                    updated_at: string
                }
                Insert: {
                    id?: string
                    matched_at?: string | null
                    user_one: string
                    user_two: string
                    status?: MatchStatus
                    match_score?: number
                    compatibility_score?: number
                    ai_match_reason?: string | null
                    match_algorithm?: string
                    initiated_by?: string | null
                    expires_at?: string | null
                    last_interaction_at?: string | null
                    interaction_count?: number
                    metadata?: Json
                    updated_at?: string
                }
                Update: {
                    id?: string
                    matched_at?: string | null
                    user_one?: string
                    user_two?: string
                    status?: MatchStatus
                    match_score?: number
                    compatibility_score?: number
                    ai_match_reason?: string | null
                    match_algorithm?: string
                    initiated_by?: string | null
                    expires_at?: string | null
                    last_interaction_at?: string | null
                    interaction_count?: number
                    metadata?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            meet_now: {
                Row: {
                    created_at: string | null
                    expires_at: string
                    id: string
                    latitude: number
                    longitude: number
                    message: string | null
                    status: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    expires_at: string
                    id?: string
                    latitude: number
                    longitude: number
                    message?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    expires_at?: string
                    id?: string
                    latitude?: number
                    longitude?: number
                    message?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            message_reactions: {
                Row: {
                    created_at: string | null
                    emoji: string
                    id: string
                    message_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    emoji: string
                    id?: string
                    message_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    emoji?: string
                    id?: string
                    message_id?: string
                    user_id?: string
                }
                Relationships: [{
                    foreignKeyName: "message_reactions_message_id_fkey"
                    columns: ["message_id"]
                    isOneToOne: false
                    referencedRelation: "messages"
                    referencedColumns: ["id"]
                }]
            }
            messages: {
                Row: {
                    content: string
                    conversation_id: string
                    created_at: string | null
                    id: string
                    is_read: boolean | null
                    media_url: string | null
                    message_type: string | null
                    read_at: string | null
                    sender_id: string
                    // NEW ENHANCED FIELDS
                    reactions: Json
                    is_edited: boolean
                    is_unsent: boolean
                    is_deleted: boolean
                    deleted_at: string | null
                    expires_at: string | null
                    delivery_status: string
                    reply_to_id: string | null
                    forward_count: number
                    priority: string
                    encryption_key: string | null
                    metadata: Json
                    updated_at: string
                }
                Insert: {
                    content: string
                    conversation_id: string
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    media_url?: string | null
                    message_type?: string | null
                    read_at?: string | null
                    sender_id: string
                    reactions?: Json
                    is_edited?: boolean
                    is_unsent?: boolean
                    is_deleted?: boolean
                    deleted_at?: string | null
                    expires_at?: string | null
                    delivery_status?: string
                    reply_to_id?: string | null
                    forward_count?: number
                    priority?: string
                    encryption_key?: string | null
                    metadata?: Json
                    updated_at?: string
                }
                Update: {
                    content?: string
                    conversation_id?: string
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    media_url?: string | null
                    message_type?: string | null
                    read_at?: string | null
                    sender_id?: string
                    reactions?: Json
                    is_edited?: boolean
                    is_unsent?: boolean
                    is_deleted?: boolean
                    deleted_at?: string | null
                    expires_at?: string | null
                    delivery_status?: string
                    reply_to_id?: string | null
                    forward_count?: number
                    priority?: string
                    encryption_key?: string | null
                    metadata?: Json
                    updated_at?: string
                }
                Relationships: [{
                    foreignKeyName: "messages_conversation_id_fkey"
                    columns: ["conversation_id"]
                    isOneToOne: false
                    referencedRelation: "conversations"
                    referencedColumns: ["id"]
                }]
            }
            notifications: {
                Row: {
                    body: string | null
                    created_at: string | null
                    data: Json | null
                    id: string
                    is_read: boolean | null
                    title: string
                    type: string
                    user_id: string
                    // NEW ENHANCED FIELDS
                    priority: string
                    read_at: string | null
                    is_push_sent: boolean
                    push_sent_at: string | null
                    is_email_sent: boolean
                    email_sent_at: string | null
                    expires_at: string | null
                    action_url: string | null
                    action_text: string | null
                    category: string
                    metadata: Json
                }
                Insert: {
                    body?: string | null
                    created_at?: string | null
                    data?: Json | null
                    id?: string
                    is_read?: boolean | null
                    title: string
                    type: string
                    user_id: string
                    priority?: string
                    read_at?: string | null
                    is_push_sent?: boolean
                    push_sent_at?: string | null
                    is_email_sent?: boolean
                    email_sent_at?: string | null
                    expires_at?: string | null
                    action_url?: string | null
                    action_text?: string | null
                    category?: string
                    metadata?: Json
                }
                Update: {
                    body?: string | null
                    created_at?: string | null
                    data?: Json | null
                    id?: string
                    is_read?: boolean | null
                    title?: string
                    type?: string
                    user_id?: string
                    priority?: string
                    read_at?: string | null
                    is_push_sent?: boolean
                    push_sent_at?: string | null
                    is_email_sent?: boolean
                    email_sent_at?: string | null
                    expires_at?: string | null
                    action_url?: string | null
                    action_text?: string | null
                    category?: string
                    metadata?: Json
                }
                Relationships: []
            }
            parties: {
                Row: {
                    cover_image: string | null
                    created_at: string | null
                    description: string | null
                    dress_code: string | null
                    end_time: string | null
                    host_id: string
                    id: string
                    is_active: boolean | null
                    latitude: number
                    location: string
                    longitude: number
                    max_guests: number | null
                    party_type: string
                    start_time: string
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    cover_image?: string | null
                    created_at?: string | null
                    description?: string | null
                    dress_code?: string | null
                    end_time?: string | null
                    host_id: string
                    id?: string
                    is_active?: boolean | null
                    latitude: number
                    location: string
                    longitude: number
                    max_guests?: number | null
                    party_type?: string
                    start_time: string
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    cover_image?: string | null
                    created_at?: string | null
                    description?: string | null
                    dress_code?: string | null
                    end_time?: string | null
                    host_id?: string
                    id?: string
                    is_active?: boolean | null
                    latitude?: number
                    location?: string
                    longitude?: number
                    max_guests?: number | null
                    party_type?: string
                    start_time?: string
                    title?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            party_rsvps: {
                Row: {
                    created_at: string | null
                    id: string
                    message: string | null
                    party_id: string
                    status: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    message?: string | null
                    party_id: string
                    status?: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    message?: string | null
                    party_id?: string
                    status?: string
                    user_id?: string
                }
                Relationships: [{
                    foreignKeyName: "party_rsvps_party_id_fkey"
                    columns: ["party_id"]
                    isOneToOne: false
                    referencedRelation: "parties"
                    referencedColumns: ["id"]
                }]
            }
            profile_photos: {
                Row: {
                    created_at: string | null
                    id: string
                    is_primary: boolean | null
                    order_index: number | null
                    url: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_primary?: boolean | null
                    order_index?: number | null
                    url: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_primary?: boolean | null
                    order_index?: number | null
                    url?: string
                    user_id?: string
                }
                Relationships: []
            }
            profile_views: {
                Row: {
                    id: string
                    viewed_at: string | null
                    viewed_id: string
                    viewer_id: string
                }
                Insert: {
                    id?: string
                    viewed_at?: string | null
                    viewed_id: string
                    viewer_id: string
                }
                Update: {
                    id?: string
                    viewed_at?: string | null
                    viewed_id?: string
                    viewer_id?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    // LEGACY FIELDS
                    account_deletion_requested_at: string | null
                    age: number | null
                    age_verified: boolean | null
                    age_verified_at: string | null
                    avatar_url: string | null
                    bio: string | null
                    city: string | null
                    country: string | null
                    created_at: string | null
                    data_processing_consent: boolean | null
                    date_of_birth: string | null
                    display_name: string | null
                    favorites_count: number | null
                    gdpr_consent_date: string | null
                    height: number | null
                    hourly_rate: number | null
                    id: string
                    id_verified: boolean | null
                    id_verified_at: string | null
                    interests: string[] | null
                    is_available_now: boolean | null
                    is_online: boolean | null
                    is_verified: boolean | null
                    last_seen: string | null
                    latitude: number | null
                    longitude: number | null
                    looking_for: string[] | null
                    marketing_consent: boolean | null
                    phone_verified: boolean | null
                    phone_verified_at: string | null
                    photo_verified: boolean | null
                    photo_verified_at: string | null
                    rating: number | null
                    tribes: string[] | null
                    updated_at: string | null
                    user_id: string
                    views_count: number | null
                    weight: number | null
                    // NEW ENHANCED FIELDS
                    location: unknown // geography(POINT, 4326)
                    location_accuracy: number
                    location_updated_at: string
                    is_premium: boolean
                    verification_status: VerificationStatus
                    verification_score: number
                    travel_mode_active: boolean
                    travel_mode_lat: number | null
                    travel_mode_lng: number | null
                    travel_mode_destination: string | null
                    last_online_at: string
                    status_text: string | null
                    expires_at: string | null
                    is_active: boolean
                    is_banned: boolean
                    ban_reason: string | null
                    ban_expires_at: string | null
                    profile_completion_score: number
                    ai_enhanced_bio: string | null
                    voice_bio_url: string | null
                    zodiac_sign: string | null
                    body_type: string | null
                    ethnicity: string | null
                    languages: string[]
                    education: string | null
                    occupation: string | null
                    income_range: string | null
                    lifestyle: string | null
                    relationship_goals: RelationshipType
                    hiv_status: string | null
                    prep_status: string | null
                    last_test_date: string | null
                    vaccination_status: string | null
                    preferred_position: string[]
                    kinks: string[]
                    limits: string[]
                    safe_sex_only: boolean
                    party_friendly: boolean
                    cannabis_friendly: boolean
                    poppers_friendly: boolean
                    chemsex_friendly: boolean
                }
                Insert: {
                    account_deletion_requested_at?: string | null
                    age?: number | null
                    age_verified?: boolean | null
                    age_verified_at?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    city?: string | null
                    country?: string | null
                    created_at?: string | null
                    data_processing_consent?: boolean | null
                    date_of_birth?: string | null
                    display_name?: string | null
                    favorites_count?: number | null
                    gdpr_consent_date?: string | null
                    height?: number | null
                    hourly_rate?: number | null
                    id?: string
                    id_verified?: boolean | null
                    id_verified_at?: string | null
                    interests?: string[] | null
                    is_available_now?: boolean | null
                    is_online?: boolean | null
                    is_verified?: boolean | null
                    last_seen?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    looking_for?: string[] | null
                    marketing_consent?: boolean | null
                    phone_verified?: boolean | null
                    phone_verified_at?: string | null
                    photo_verified?: boolean | null
                    photo_verified_at?: string | null
                    rating?: number | null
                    tribes?: string[] | null
                    updated_at?: string | null
                    user_id: string
                    views_count?: number | null
                    weight?: number | null
                    location?: unknown
                    location_accuracy?: number
                    location_updated_at?: string
                    is_premium?: boolean
                    verification_status?: VerificationStatus
                    verification_score?: number
                    travel_mode_active?: boolean
                    travel_mode_lat?: number | null
                    travel_mode_lng?: number | null
                    travel_mode_destination?: string | null
                    last_online_at?: string
                    status_text?: string | null
                    expires_at?: string | null
                    is_active?: boolean
                    is_banned?: boolean
                    ban_reason?: string | null
                    ban_expires_at?: string | null
                    profile_completion_score?: number
                    ai_enhanced_bio?: string | null
                    voice_bio_url?: string | null
                    zodiac_sign?: string | null
                    body_type?: string | null
                    ethnicity?: string | null
                    languages?: string[]
                    education?: string | null
                    occupation?: string | null
                    income_range?: string | null
                    lifestyle?: string | null
                    relationship_goals?: RelationshipType
                    hiv_status?: string | null
                    prep_status?: string | null
                    last_test_date?: string | null
                    vaccination_status?: string | null
                    preferred_position?: string[]
                    kinks?: string[]
                    limits?: string[]
                    safe_sex_only?: boolean
                    party_friendly?: boolean
                    cannabis_friendly?: boolean
                    poppers_friendly?: boolean
                    chemsex_friendly?: boolean
                }
                Update: {
                    account_deletion_requested_at?: string | null
                    age?: number | null
                    age_verified?: boolean | null
                    age_verified_at?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    city?: string | null
                    country?: string | null
                    created_at?: string | null
                    data_processing_consent?: boolean | null
                    date_of_birth?: string | null
                    display_name?: string | null
                    favorites_count?: number | null
                    gdpr_consent_date?: string | null
                    height?: number | null
                    hourly_rate?: number | null
                    id?: string
                    id_verified?: boolean | null
                    id_verified_at?: string | null
                    interests?: string[] | null
                    is_available_now?: boolean | null
                    is_online?: boolean | null
                    is_verified?: boolean | null
                    last_seen?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    looking_for?: string[] | null
                    marketing_consent?: boolean | null
                    phone_verified?: boolean | null
                    phone_verified_at?: string | null
                    photo_verified?: boolean | null
                    photo_verified_at?: string | null
                    rating?: number | null
                    tribes?: string[] | null
                    updated_at?: string | null
                    user_id?: string
                    views_count?: number | null
                    weight?: number | null
                    location?: unknown
                    location_accuracy?: number
                    location_updated_at?: string
                    is_premium?: boolean
                    verification_status?: VerificationStatus
                    verification_score?: number
                    travel_mode_active?: boolean
                    travel_mode_lat?: number | null
                    travel_mode_lng?: number | null
                    travel_mode_destination?: string | null
                    last_online_at?: string
                    status_text?: string | null
                    expires_at?: string | null
                    is_active?: boolean
                    is_banned?: boolean
                    ban_reason?: string | null
                    ban_expires_at?: string | null
                    profile_completion_score?: number
                    ai_enhanced_bio?: string | null
                    voice_bio_url?: string | null
                    zodiac_sign?: string | null
                    body_type?: string | null
                    ethnicity?: string | null
                    languages?: string[]
                    education?: string | null
                    occupation?: string | null
                    income_range?: string | null
                    lifestyle?: string | null
                    relationship_goals?: RelationshipType
                    hiv_status?: string | null
                    prep_status?: string | null
                    last_test_date?: string | null
                    vaccination_status?: string | null
                    preferred_position?: string[]
                    kinks?: string[]
                    limits?: string[]
                    safe_sex_only?: boolean
                    party_friendly?: boolean
                    cannabis_friendly?: boolean
                    poppers_friendly?: boolean
                    chemsex_friendly?: boolean
                }
                Relationships: []
            }
            push_subscriptions: {
                Row: {
                    auth_key: string
                    created_at: string | null
                    endpoint: string
                    id: string
                    p256dh: string
                    user_id: string
                }
                Insert: {
                    auth_key: string
                    created_at?: string | null
                    endpoint: string
                    id?: string
                    p256dh: string
                    user_id: string
                }
                Update: {
                    auth_key?: string
                    created_at?: string | null
                    endpoint?: string
                    id?: string
                    p256dh?: string
                    user_id?: string
                }
                Relationships: []
            }
            reports: {
                Row: {
                    created_at: string | null
                    details: string | null
                    id: string
                    reason: string
                    reported_id: string
                    reporter_id: string
                    status: string | null
                    // NEW ENHANCED FIELDS
                    category: string
                    severity: string
                    description: string | null
                    evidence_urls: string[]
                    evidence_data: Json
                    priority: string
                    assigned_to: string | null
                    auto_action_taken: string | null
                    human_action_required: boolean
                    resolved_at: string | null
                    resolution_notes: string | null
                    appeal_status: string | null
                    appeal_reason: string | null
                    metadata: Json
                    updated_at: string
                }
                Insert: {
                    created_at?: string | null
                    details?: string | null
                    id?: string
                    reason: string
                    reported_id: string
                    reporter_id: string
                    status?: string | null
                    category?: string
                    severity?: string
                    description?: string | null
                    evidence_urls?: string[]
                    evidence_data?: Json
                    priority?: string
                    assigned_to?: string | null
                    auto_action_taken?: string | null
                    human_action_required?: boolean
                    resolved_at?: string | null
                    resolution_notes?: string | null
                    appeal_status?: string | null
                    appeal_reason?: string | null
                    metadata?: Json
                    updated_at?: string
                }
                Update: {
                    created_at?: string | null
                    details?: string | null
                    id?: string
                    reason?: string
                    reported_id?: string
                    reporter_id?: string
                    status?: string | null
                    category?: string
                    severity?: string
                    description?: string | null
                    evidence_urls?: string[]
                    evidence_data?: Json
                    priority?: string
                    assigned_to?: string | null
                    auto_action_taken?: string | null
                    human_action_required?: boolean
                    resolved_at?: string | null
                    resolution_notes?: string | null
                    appeal_status?: string | null
                    appeal_reason?: string | null
                    metadata?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            
            // =====================================================
            // NEW ENTERPRISE TABLES
            // =====================================================
            
            media_galleries: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    is_private: boolean
                    is_premium_only: boolean
                    allow_comments: boolean
                    allow_reactions: boolean
                    auto_delete_after: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name?: string
                    description?: string | null
                    is_private?: boolean
                    is_premium_only?: boolean
                    allow_comments?: boolean
                    allow_reactions?: boolean
                    auto_delete_after?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    is_private?: boolean
                    is_premium_only?: boolean
                    allow_comments?: boolean
                    allow_reactions?: boolean
                    auto_delete_after?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            media_items: {
                Row: {
                    id: string
                    gallery_id: string | null
                    user_id: string
                    url: string
                    thumbnail_url: string | null
                    blur_hash: string | null
                    type: MediaType
                    file_size: number | null
                    width: number | null
                    height: number | null
                    duration: number | null
                    caption: string | null
                    tags: string[]
                    is_private: boolean
                    is_ephemeral: boolean
                    expires_at: string | null
                    view_count: number
                    like_count: number
                    metadata: Json
                    ai_tags: string[]
                    content_rating: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    gallery_id?: string | null
                    user_id: string
                    url: string
                    thumbnail_url?: string | null
                    blur_hash?: string | null
                    type?: MediaType
                    file_size?: number | null
                    width?: number | null
                    height?: number | null
                    duration?: number | null
                    caption?: string | null
                    tags?: string[]
                    is_private?: boolean
                    is_ephemeral?: boolean
                    expires_at?: string | null
                    view_count?: number
                    like_count?: number
                    metadata?: Json
                    ai_tags?: string[]
                    content_rating?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    gallery_id?: string | null
                    user_id?: string
                    url?: string
                    thumbnail_url?: string | null
                    blur_hash?: string | null
                    type?: MediaType
                    file_size?: number | null
                    width?: number | null
                    height?: number | null
                    duration?: number | null
                    caption?: string | null
                    tags?: string[]
                    is_private?: boolean
                    is_ephemeral?: boolean
                    expires_at?: string | null
                    view_count?: number
                    like_count?: number
                    metadata?: Json
                    ai_tags?: string[]
                    content_rating?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            p2p_rooms: {
                Row: {
                    id: string
                    name: string | null
                    description: string | null
                    type: string
                    creator_id: string
                    is_private: boolean
                    is_encrypted: boolean
                    max_participants: number
                    requires_approval: boolean
                    auto_delete_after: string | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name?: string | null
                    description?: string | null
                    type?: string
                    creator_id: string
                    is_private?: boolean
                    is_encrypted?: boolean
                    max_participants?: number
                    requires_approval?: boolean
                    auto_delete_after?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    description?: string | null
                    type?: string
                    creator_id?: string
                    is_private?: boolean
                    is_encrypted?: boolean
                    max_participants?: number
                    requires_approval?: boolean
                    auto_delete_after?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            p2p_room_participants: {
                Row: {
                    id: string
                    room_id: string
                    user_id: string
                    role: string
                    joined_at: string
                    left_at: string | null
                    is_muted: boolean
                    is_banned: boolean
                    last_read_at: string | null
                    typing_status: boolean
                    typing_since: string | null
                    metadata: Json
                }
                Insert: {
                    id?: string
                    room_id: string
                    user_id: string
                    role?: string
                    joined_at?: string
                    left_at?: string | null
                    is_muted?: boolean
                    is_banned?: boolean
                    last_read_at?: string | null
                    typing_status?: boolean
                    typing_since?: string | null
                    metadata?: Json
                }
                Update: {
                    id?: string
                    room_id?: string
                    user_id?: string
                    role?: string
                    joined_at?: string
                    left_at?: string | null
                    is_muted?: boolean
                    is_banned?: boolean
                    last_read_at?: string | null
                    typing_status?: boolean
                    typing_since?: string | null
                    metadata?: Json
                }
                Relationships: []
            }
            
            match_preferences: {
                Row: {
                    id: string
                    user_id: string
                    min_age: number
                    max_age: number
                    max_distance_km: number
                    relationship_types: RelationshipType[]
                    body_types: string[]
                    ethnicities: string[]
                    positions: string[]
                    kinks: string[]
                    hiv_status_preference: string
                    requires_verification: boolean
                    requires_premium: boolean
                    auto_match_enabled: boolean
                    ai_learning_enabled: boolean
                    last_calculated_at: string | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    min_age?: number
                    max_age?: number
                    max_distance_km?: number
                    relationship_types?: RelationshipType[]
                    body_types?: string[]
                    ethnicities?: string[]
                    positions?: string[]
                    kinks?: string[]
                    hiv_status_preference?: string
                    requires_verification?: boolean
                    requires_premium?: boolean
                    auto_match_enabled?: boolean
                    ai_learning_enabled?: boolean
                    last_calculated_at?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    min_age?: number
                    max_age?: number
                    max_distance_km?: number
                    relationship_types?: RelationshipType[]
                    body_types?: string[]
                    ethnicities?: string[]
                    positions?: string[]
                    kinks?: string[]
                    hiv_status_preference?: string
                    requires_verification?: boolean
                    requires_premium?: boolean
                    auto_match_enabled?: boolean
                    ai_learning_enabled?: boolean
                    last_calculated_at?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            verification_requests: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    status: VerificationStatus
                    priority: string
                    assigned_to: string | null
                    submitted_at: string
                    reviewed_at: string | null
                    approved_at: string | null
                    rejected_at: string | null
                    expires_at: string | null
                    score: number
                    notes: string | null
                    rejection_reason: string | null
                    evidence_urls: string[]
                    metadata: Json
                    ai_confidence: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    status?: VerificationStatus
                    priority?: string
                    assigned_to?: string | null
                    submitted_at?: string
                    reviewed_at?: string | null
                    approved_at?: string | null
                    rejected_at?: string | null
                    expires_at?: string | null
                    score?: number
                    notes?: string | null
                    rejection_reason?: string | null
                    evidence_urls?: string[]
                    metadata?: Json
                    ai_confidence?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    status?: VerificationStatus
                    priority?: string
                    assigned_to?: string | null
                    submitted_at?: string
                    reviewed_at?: string | null
                    approved_at?: string | null
                    rejected_at?: string | null
                    expires_at?: string | null
                    score?: number
                    notes?: string | null
                    rejection_reason?: string | null
                    evidence_urls?: string[]
                    metadata?: Json
                    ai_confidence?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            verification_documents: {
                Row: {
                    id: string
                    request_id: string
                    type: string
                    url: string
                    thumbnail_url: string | null
                    file_size: number | null
                    checksum: string | null
                    ai_analysis: Json
                    ai_confidence: number | null
                    human_review_required: boolean
                    reviewed_by: string | null
                    review_notes: string | null
                    uploaded_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    request_id: string
                    type: string
                    url: string
                    thumbnail_url?: string | null
                    file_size?: number | null
                    checksum?: string | null
                    ai_analysis?: Json
                    ai_confidence?: number | null
                    human_review_required?: boolean
                    reviewed_by?: string | null
                    review_notes?: string | null
                    uploaded_at?: string
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    request_id?: string
                    type?: string
                    url?: string
                    thumbnail_url?: string | null
                    file_size?: number | null
                    checksum?: string | null
                    ai_analysis?: Json
                    ai_confidence?: number | null
                    human_review_required?: boolean
                    reviewed_by?: string | null
                    review_notes?: string | null
                    uploaded_at?: string
                    deleted_at?: string | null
                }
                Relationships: []
            }
            
            moderation_actions: {
                Row: {
                    id: string
                    user_id: string
                    moderator_id: string
                    action: string
                    reason: string
                    duration: string | null
                    expires_at: string | null
                    is_permanent: boolean
                    evidence_report_id: string | null
                    notes: string | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    moderator_id: string
                    action: string
                    reason: string
                    duration?: string | null
                    expires_at?: string | null
                    is_permanent?: boolean
                    evidence_report_id?: string | null
                    notes?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    moderator_id?: string
                    action?: string
                    reason?: string
                    duration?: string | null
                    expires_at?: string | null
                    is_permanent?: boolean
                    evidence_report_id?: string | null
                    notes?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            privacy_settings: {
                Row: {
                    user_id: string
                    profile_visibility: PrivacyLevel
                    location_visibility: PrivacyLevel
                    last_seen_visibility: PrivacyLevel
                    online_status_visibility: PrivacyLevel
                    gallery_visibility: PrivacyLevel
                    allow_stranger_messages: boolean
                    allow_friend_requests: boolean
                    allow_tagging: boolean
                    allow_screenshots: boolean
                    auto_delete_messages: boolean
                    message_retention_days: number
                    blur_stranger_photos: boolean
                    hide_age: boolean
                    hide_distance: boolean
                    data_collection_opt_out: boolean
                    ai_training_opt_out: boolean
                    analytics_opt_out: boolean
                    marketing_opt_out: boolean
                    search_opt_out: boolean
                    blocked_countries: string[]
                    time_restriction_start: string | null
                    time_restriction_end: string | null
                    do_not_disturb: boolean
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    profile_visibility?: PrivacyLevel
                    location_visibility?: PrivacyLevel
                    last_seen_visibility?: PrivacyLevel
                    online_status_visibility?: PrivacyLevel
                    gallery_visibility?: PrivacyLevel
                    allow_stranger_messages?: boolean
                    allow_friend_requests?: boolean
                    allow_tagging?: boolean
                    allow_screenshots?: boolean
                    auto_delete_messages?: boolean
                    message_retention_days?: number
                    blur_stranger_photos?: boolean
                    hide_age?: boolean
                    hide_distance?: boolean
                    data_collection_opt_out?: boolean
                    ai_training_opt_out?: boolean
                    analytics_opt_out?: boolean
                    marketing_opt_out?: boolean
                    search_opt_out?: boolean
                    blocked_countries?: string[]
                    time_restriction_start?: string | null
                    time_restriction_end?: string | null
                    do_not_disturb?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    profile_visibility?: PrivacyLevel
                    location_visibility?: PrivacyLevel
                    last_seen_visibility?: PrivacyLevel
                    online_status_visibility?: PrivacyLevel
                    gallery_visibility?: PrivacyLevel
                    allow_stranger_messages?: boolean
                    allow_friend_requests?: boolean
                    allow_tagging?: boolean
                    allow_screenshots?: boolean
                    auto_delete_messages?: boolean
                    message_retention_days?: number
                    blur_stranger_photos?: boolean
                    hide_age?: boolean
                    hide_distance?: boolean
                    data_collection_opt_out?: boolean
                    ai_training_opt_out?: boolean
                    analytics_opt_out?: boolean
                    marketing_opt_out?: boolean
                    search_opt_out?: boolean
                    blocked_countries?: string[]
                    time_restriction_start?: string | null
                    time_restriction_end?: string | null
                    do_not_disturb?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            presence: {
                Row: {
                    user_id: string
                    status: PresenceStatus
                    last_seen_at: string
                    current_location: unknown // geography(POINT, 4326)
                    location_accuracy: number
                    location_updated_at: string
                    device_info: Json
                    app_version: string | null
                    network_type: string | null
                    battery_level: number | null
                    is_active: boolean
                    session_count: number
                    total_session_time: string
                    metadata: Json
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    status?: PresenceStatus
                    last_seen_at?: string
                    current_location?: unknown
                    location_accuracy?: number
                    location_updated_at?: string
                    device_info?: Json
                    app_version?: string | null
                    network_type?: string | null
                    battery_level?: number | null
                    is_active?: boolean
                    session_count?: number
                    total_session_time?: string
                    metadata?: Json
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    status?: PresenceStatus
                    last_seen_at?: string
                    current_location?: unknown
                    location_accuracy?: number
                    location_updated_at?: string
                    device_info?: Json
                    app_version?: string | null
                    network_type?: string | null
                    battery_level?: number | null
                    is_active?: boolean
                    session_count?: number
                    total_session_time?: string
                    metadata?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            
            activity_logs: {
                Row: {
                    id: string
                    user_id: string
                    action: string
                    target_type: string | null
                    target_id: string | null
                    ip_address: string | null
                    user_agent: string | null
                    location: unknown // geography(POINT, 4326)
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    action: string
                    target_type?: string | null
                    target_id?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    location?: unknown
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    action?: string
                    target_type?: string | null
                    target_id?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    location?: unknown
                    metadata?: Json
                    created_at?: string
                }
                Relationships: []
            }
            
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    tier: SubscriptionTier
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    stripe_price_id: string | null
                    status: string
                    current_period_start: string | null
                    current_period_end: string | null
                    trial_end: string | null
                    cancel_at_period_end: boolean
                    canceled_at: string | null
                    payment_method: string | null
                    billing_cycle: string
                    auto_renew: boolean
                    grace_period_ends_at: string | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tier?: SubscriptionTier
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    stripe_price_id?: string | null
                    status?: string
                    current_period_start?: string | null
                    current_period_end?: string | null
                    trial_end?: string | null
                    cancel_at_period_end?: boolean
                    canceled_at?: string | null
                    payment_method?: string | null
                    billing_cycle?: string
                    auto_renew?: boolean
                    grace_period_ends_at?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tier?: SubscriptionTier
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    stripe_price_id?: string | null
                    status?: string
                    current_period_start?: string | null
                    current_period_end?: string | null
                    trial_end?: string | null
                    cancel_at_period_end?: boolean
                    canceled_at?: string | null
                    payment_method?: string | null
                    billing_cycle?: string
                    auto_renew?: boolean
                    grace_period_ends_at?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            subscription_features: {
                Row: {
                    id: string
                    tier: SubscriptionTier
                    feature_name: string
                    feature_value: string | null
                    is_enabled: boolean
                    limit_value: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tier: SubscriptionTier
                    feature_name: string
                    feature_value?: string | null
                    is_enabled?: boolean
                    limit_value?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tier?: SubscriptionTier
                    feature_name?: string
                    feature_value?: string | null
                    is_enabled?: boolean
                    limit_value?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            
            notification_preferences: {
                Row: {
                    user_id: string
                    push_enabled: boolean
                    email_enabled: boolean
                    in_app_enabled: boolean
                    quiet_hours_enabled: boolean
                    quiet_hours_start: string
                    quiet_hours_end: string
                    message_notifications: boolean
                    match_notifications: boolean
                    like_notifications: boolean
                    view_notifications: boolean
                    profile_visit_notifications: boolean
                    safety_notifications: boolean
                    billing_notifications: boolean
                    marketing_notifications: boolean
                    do_not_disturb: boolean
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    push_enabled?: boolean
                    email_enabled?: boolean
                    in_app_enabled?: boolean
                    quiet_hours_enabled?: boolean
                    quiet_hours_start?: string
                    quiet_hours_end?: string
                    message_notifications?: boolean
                    match_notifications?: boolean
                    like_notifications?: boolean
                    view_notifications?: boolean
                    profile_visit_notifications?: boolean
                    safety_notifications?: boolean
                    billing_notifications?: boolean
                    marketing_notifications?: boolean
                    do_not_disturb?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    push_enabled?: boolean
                    email_enabled?: boolean
                    in_app_enabled?: boolean
                    quiet_hours_enabled?: boolean
                    quiet_hours_start?: string
                    quiet_hours_end?: string
                    message_notifications?: boolean
                    match_notifications?: boolean
                    like_notifications?: boolean
                    view_notifications?: boolean
                    profile_visit_notifications?: boolean
                    safety_notifications?: boolean
                    billing_notifications?: boolean
                    marketing_notifications?: boolean
                    do_not_disturb?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            ai_profiles: {
                Row: {
                    id: string
                    user_id: string
                    personality_traits: Json
                    compatibility_scores: Json
                    behavior_patterns: Json
                    preferences_learned: Json
                    risk_score: number
                    authenticity_score: number
                    engagement_prediction: number
                    last_analyzed_at: string | null
                    model_version: string | null
                    training_data_count: number
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    personality_traits?: Json
                    compatibility_scores?: Json
                    behavior_patterns?: Json
                    preferences_learned?: Json
                    risk_score?: number
                    authenticity_score?: number
                    engagement_prediction?: number
                    last_analyzed_at?: string | null
                    model_version?: string | null
                    training_data_count?: number
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    personality_traits?: Json
                    compatibility_scores?: Json
                    behavior_patterns?: Json
                    preferences_learned?: Json
                    risk_score?: number
                    authenticity_score?: number
                    engagement_prediction?: number
                    last_analyzed_at?: string | null
                    model_version?: string | null
                    training_data_count?: number
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            
            ai_content_moderation: {
                Row: {
                    id: string
                    content_type: string
                    content_id: string
                    user_id: string
                    risk_score: number
                    risk_level: string
                    categories: string[]
                    auto_action_taken: string | null
                    human_review_required: boolean
                    reviewed_by: string | null
                    reviewed_at: string | null
                    final_action: string | null
                    model_version: string | null
                    confidence: number
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    content_type: string
                    content_id: string
                    user_id: string
                    risk_score?: number
                    risk_level?: string
                    categories?: string[]
                    auto_action_taken?: string | null
                    human_review_required?: boolean
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    final_action?: string | null
                    model_version?: string | null
                    confidence?: number
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    content_type?: string
                    content_id?: string
                    user_id?: string
                    risk_score?: number
                    risk_level?: string
                    categories?: string[]
                    auto_action_taken?: string | null
                    human_review_required?: boolean
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    final_action?: string | null
                    model_version?: string | null
                    confidence?: number
                    metadata?: Json
                    created_at?: string
                }
                Relationships: []
            }
            
            analytics_events: {
                Row: {
                    id: string
                    user_id: string | null
                    session_id: string | null
                    event_type: string
                    event_name: string
                    properties: Json
                    timestamp: string
                    ip_address: string | null
                    user_agent: string | null
                    location: unknown // geography(POINT, 4326)
                    app_version: string | null
                    device_info: Json
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    session_id?: string | null
                    event_type: string
                    event_name: string
                    properties?: Json
                    timestamp?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    location?: unknown
                    app_version?: string | null
                    device_info?: Json
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    session_id?: string | null
                    event_type?: string
                    event_name?: string
                    properties?: Json
                    timestamp?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    location?: unknown
                    app_version?: string | null
                    device_info?: Json
                }
                Relationships: []
            }
            
            user_metrics: {
                Row: {
                    user_id: string
                    total_views: number
                    total_likes: number
                    total_matches: number
                    total_messages_sent: number
                    total_messages_received: number
                    total_profile_views: number
                    total_time_spent: string
                    average_session_duration: string
                    swipe_right_count: number
                    swipe_left_count: number
                    match_rate: number
                    response_rate: number
                    premium_conversion_date: string | null
                    last_active_date: string | null
                    retention_days: number
                    churn_probability: number
                    lifetime_value: number
                    calculated_at: string
                    metadata: Json
                }
                Insert: {
                    user_id: string
                    total_views?: number
                    total_likes?: number
                    total_matches?: number
                    total_messages_sent?: number
                    total_messages_received?: number
                    total_profile_views?: number
                    total_time_spent?: string
                    average_session_duration?: string
                    swipe_right_count?: number
                    swipe_left_count?: number
                    match_rate?: number
                    response_rate?: number
                    premium_conversion_date?: string | null
                    last_active_date?: string | null
                    retention_days?: number
                    churn_probability?: number
                    lifetime_value?: number
                    calculated_at?: string
                    metadata?: Json
                }
                Update: {
                    user_id?: string
                    total_views?: number
                    total_likes?: number
                    total_matches?: number
                    total_messages_sent?: number
                    total_messages_received?: number
                    total_profile_views?: number
                    total_time_spent?: string
                    average_session_duration?: string
                    swipe_right_count?: number
                    swipe_left_count?: number
                    match_rate?: number
                    response_rate?: number
                    premium_conversion_date?: string | null
                    last_active_date?: string | null
                    retention_days?: number
                    churn_probability?: number
                    lifetime_value?: number
                    calculated_at?: string
                    metadata?: Json
                }
                Relationships: []
            }

            // =====================================================
            // MISSING TABLES — Added for full schema coverage
            // =====================================================

            threads: {
                Row: {
                    id: string
                    title: string | null
                    created_by: string
                    is_private: boolean
                    max_members: number | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title?: string | null
                    created_by: string
                    is_private?: boolean
                    max_members?: number | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string | null
                    created_by?: string
                    is_private?: boolean
                    max_members?: number | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }

            thread_members: {
                Row: {
                    id: string
                    thread_id: string
                    user_id: string
                    role: string
                    joined_at: string
                    last_read_at: string | null
                    is_muted: boolean
                    metadata: Json
                }
                Insert: {
                    id?: string
                    thread_id: string
                    user_id: string
                    role?: string
                    joined_at?: string
                    last_read_at?: string | null
                    is_muted?: boolean
                    metadata?: Json
                }
                Update: {
                    id?: string
                    thread_id?: string
                    user_id?: string
                    role?: string
                    joined_at?: string
                    last_read_at?: string | null
                    is_muted?: boolean
                    metadata?: Json
                }
                Relationships: [{
                    foreignKeyName: "thread_members_thread_id_fkey"
                    columns: ["thread_id"]
                    isOneToOne: false
                    referencedRelation: "threads"
                    referencedColumns: ["id"]
                }]
            }

            user_favorites: {
                Row: {
                    id: string
                    user_id: string
                    favorited_user_id: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    favorited_user_id: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    favorited_user_id?: string
                    created_at?: string | null
                }
                Relationships: []
            }

            user_blocks: {
                Row: {
                    id: string
                    user_id: string
                    blocked_user_id: string
                    reason: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    blocked_user_id: string
                    reason?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    blocked_user_id?: string
                    reason?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }

            friend_requests: {
                Row: {
                    id: string
                    sender_id: string
                    receiver_id: string
                    status: string
                    message: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    sender_id: string
                    receiver_id: string
                    status?: string
                    message?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    sender_id?: string
                    receiver_id?: string
                    status?: string
                    message?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }

            friendships: {
                Row: {
                    id: string
                    user_id: string
                    friend_id: string
                    status: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    friend_id: string
                    status?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    friend_id?: string
                    status?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }

            blog_posts: {
                Row: {
                    id: string
                    author_id: string
                    title: string
                    slug: string
                    content: string
                    excerpt: string | null
                    cover_image: string | null
                    tags: string[]
                    category: string | null
                    is_published: boolean
                    published_at: string | null
                    view_count: number
                    like_count: number
                    comment_count: number
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    author_id: string
                    title: string
                    slug: string
                    content: string
                    excerpt?: string | null
                    cover_image?: string | null
                    tags?: string[]
                    category?: string | null
                    is_published?: boolean
                    published_at?: string | null
                    view_count?: number
                    like_count?: number
                    comment_count?: number
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    author_id?: string
                    title?: string
                    slug?: string
                    content?: string
                    excerpt?: string | null
                    cover_image?: string | null
                    tags?: string[]
                    category?: string | null
                    is_published?: boolean
                    published_at?: string | null
                    view_count?: number
                    like_count?: number
                    comment_count?: number
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }

            user_subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    subscription_id: string
                    tier: SubscriptionTier
                    status: string
                    starts_at: string
                    ends_at: string | null
                    auto_renew: boolean
                    payment_method: string | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    subscription_id: string
                    tier: SubscriptionTier
                    status?: string
                    starts_at?: string
                    ends_at?: string | null
                    auto_renew?: boolean
                    payment_method?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    subscription_id?: string
                    tier?: SubscriptionTier
                    status?: string
                    starts_at?: string
                    ends_at?: string | null
                    auto_renew?: boolean
                    payment_method?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [{
                    foreignKeyName: "user_subscriptions_subscription_id_fkey"
                    columns: ["subscription_id"]
                    isOneToOne: false
                    referencedRelation: "subscriptions"
                    referencedColumns: ["id"]
                }]
            }

            user_roles: {
                Row: {
                    id: string
                    user_id: string
                    role: string
                    granted_by: string | null
                    granted_at: string
                    expires_at: string | null
                    is_active: boolean
                    metadata: Json
                }
                Insert: {
                    id?: string
                    user_id: string
                    role: string
                    granted_by?: string | null
                    granted_at?: string
                    expires_at?: string | null
                    is_active?: boolean
                    metadata?: Json
                }
                Update: {
                    id?: string
                    user_id?: string
                    role?: string
                    granted_by?: string | null
                    granted_at?: string
                    expires_at?: string | null
                    is_active?: boolean
                    metadata?: Json
                }
                Relationships: []
            }

            posts: {
                Row: {
                    id: string
                    author_id: string
                    content: string
                    media_urls: string[]
                    is_public: boolean
                    like_count: number
                    comment_count: number
                    share_count: number
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    author_id: string
                    content: string
                    media_urls?: string[]
                    is_public?: boolean
                    like_count?: number
                    comment_count?: number
                    share_count?: number
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    author_id?: string
                    content?: string
                    media_urls?: string[]
                    is_public?: boolean
                    like_count?: number
                    comment_count?: number
                    share_count?: number
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }

        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// =====================================================
// CONVENIENCE TYPE ALIASES
// =====================================================
type PublicTables = Database['public']['Tables'];

/** Extract the Row type for a given table name */
export type TableRow<T extends keyof PublicTables> = PublicTables[T]['Row'];

/** Extract the Insert type for a given table name */
export type TableInsert<T extends keyof PublicTables> = PublicTables[T]['Insert'];

/** Extract the Update type for a given table name */
export type TableUpdate<T extends keyof PublicTables> = PublicTables[T]['Update'];

// ── Row types ──────────────────────────────────────────────────────────────────
export type Profile = TableRow<'profiles'>;
export type ProfilePhoto = TableRow<'profile_photos'>;
export type ProfileView = TableRow<'profile_views'>;
export type Match = TableRow<'matches'>;
export type Favorite = TableRow<'favorites'>;
export type UserFavorite = TableRow<'user_favorites'>;
export type Conversation = TableRow<'conversations'>;
export type Thread = TableRow<'threads'>;
export type ThreadMember = TableRow<'thread_members'>;
export type Message = TableRow<'messages'>;
export type MessageReaction = TableRow<'message_reactions'>;
export type Event = TableRow<'events'>;
export type EventAttendee = TableRow<'event_attendees'>;
export type Party = TableRow<'parties'>;
export type PartyRsvp = TableRow<'party_rsvps'>;
export type Album = TableRow<'albums'>;
export type AlbumPhoto = TableRow<'album_photos'>;
export type Post = TableRow<'posts'>;
export type BlogPost = TableRow<'blog_posts'>;
export type Booking = TableRow<'bookings'>;
export type Subscription = TableRow<'subscriptions'>;
export type UserSubscription = TableRow<'user_subscriptions'>;
export type Block = TableRow<'blocks'>;
export type UserBlock = TableRow<'user_blocks'>;
export type Report = TableRow<'reports'>;
export type FriendRequest = TableRow<'friend_requests'>;
export type Friendship = TableRow<'friendships'>;
export type Notification = TableRow<'notifications'>;
export type PushSubscription = TableRow<'push_subscriptions'>;
export type GdprConsentRecord = TableRow<'gdpr_consent_records'>;
export type GdprDataRequest = TableRow<'gdpr_data_requests'>;
export type VerificationDocument = TableRow<'verification_documents'>;
export type VerificationRequest = TableRow<'verification_requests'>;
export type UserRole = TableRow<'user_roles'>;
export type MeetNow = TableRow<'meet_now'>;

// ── Insert types ───────────────────────────────────────────────────────────────
export type ProfileInsert = TableInsert<'profiles'>;
export type MessageInsert = TableInsert<'messages'>;
export type ConversationInsert = TableInsert<'conversations'>;
export type MatchInsert = TableInsert<'matches'>;
export type EventInsert = TableInsert<'events'>;
export type NotificationInsert = TableInsert<'notifications'>;
export type ReportInsert = TableInsert<'reports'>;
export type FriendRequestInsert = TableInsert<'friend_requests'>;
export type BookingInsert = TableInsert<'bookings'>;
export type BlogPostInsert = TableInsert<'blog_posts'>;

// ── Update types ───────────────────────────────────────────────────────────────
export type ProfileUpdate = TableUpdate<'profiles'>;
export type MessageUpdate = TableUpdate<'messages'>;
export type ConversationUpdate = TableUpdate<'conversations'>;
export type MatchUpdate = TableUpdate<'matches'>;
export type EventUpdate = TableUpdate<'events'>;
export type NotificationUpdate = TableUpdate<'notifications'>;

// ── Common query result types ──────────────────────────────────────────────────
export interface PaginatedResult<T> {
    data: T[];
    count: number | null;
    hasMore: boolean;
    page: number;
    pageSize: number;
}

export interface QueryFilters {
    [key: string]: string | number | boolean | string[] | null | undefined;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    ascending?: boolean;
}