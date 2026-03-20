-- =====================================================
-- ULTIMATE DATING PLATFORM - COMPLETE SCHEMA MIGRATION
-- =====================================================
-- Privacy-first P2P-hybrid dating platform with enterprise features
-- Merged and consolidated from all previous migrations - FINAL VERSION

-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE ENHANCED ENUM TYPES
-- =====================================================
DO $$
BEGIN
    -- Media and message types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'file', 'gif', 'sticker');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'pix', 'call', 'location', 'reaction', 'typing');
    END IF;
    
    -- Verification and safety types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'vip', 'enterprise');
    END IF;
    
    -- Privacy and matching preferences
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_level') THEN
        CREATE TYPE privacy_level AS ENUM ('public', 'friends', 'private', 'stealth');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
        CREATE TYPE relationship_type AS ENUM ('casual', 'dating', 'relationship', 'friendship', 'networking');
    END IF;
    
    -- Presence and status types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'presence_status') THEN
        CREATE TYPE presence_status AS ENUM ('online', 'away', 'busy', 'invisible', 'offline');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('pending', 'mutual', 'expired', 'blocked');
    END IF;
END $$;

-- 3. ENHANCED PROFILES TABLE WITH COMPREHENSIVE FEATURES
-- =====================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location geography(POINT, 4326),
ADD COLUMN IF NOT EXISTS location_accuracy float DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS location_updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_score integer DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
ADD COLUMN IF NOT EXISTS travel_mode_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS travel_mode_lat double precision,
ADD COLUMN IF NOT EXISTS travel_mode_lng double precision,
ADD COLUMN IF NOT EXISTS travel_mode_destination text,
ADD COLUMN IF NOT EXISTS last_online_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS status_text text,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS ban_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS profile_completion_score integer DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
ADD COLUMN IF NOT EXISTS ai_enhanced_bio text,
ADD COLUMN IF NOT EXISTS voice_bio_url text,
ADD COLUMN IF NOT EXISTS zodiac_sign text,
ADD COLUMN IF NOT EXISTS body_type text,
ADD COLUMN IF NOT EXISTS ethnicity text,
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS income_range text,
ADD COLUMN IF NOT EXISTS lifestyle text,
ADD COLUMN IF NOT EXISTS relationship_goals relationship_type DEFAULT 'casual',
ADD COLUMN IF NOT EXISTS hiv_status text,
ADD COLUMN IF NOT EXISTS prep_status text,
ADD COLUMN IF NOT EXISTS last_test_date date,
ADD COLUMN IF NOT EXISTS vaccination_status text,
ADD COLUMN IF NOT EXISTS preferred_position text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kinks text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS limits text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS safe_sex_only boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS party_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cannabis_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS poppers_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS chemsex_friendly boolean DEFAULT false;

-- 4. MEDIA GALLERIES WITH COMPREHENSIVE FEATURES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.media_galleries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Gallery',
    description text,
    is_private boolean DEFAULT false,
    is_premium_only boolean DEFAULT false,
    allow_comments boolean DEFAULT true,
    allow_reactions boolean DEFAULT true,
    auto_delete_after timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id uuid REFERENCES public.media_galleries(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url text NOT NULL,
    thumbnail_url text,
    blur_hash text,
    type media_type NOT NULL DEFAULT 'image',
    file_size bigint,
    width integer,
    height integer,
    duration float, -- for video/audio
    caption text,
    tags text[] DEFAULT '{}',
    is_private boolean DEFAULT false,
    is_ephemeral boolean DEFAULT false,
    expires_at timestamptz,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    ai_tags text[] DEFAULT '{}',
    content_rating text DEFAULT 'safe', -- safe, mature, explicit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. ENHANCED MESSAGING SYSTEM WITH P2P FEATURES
-- =====================================================
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_unsent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'sent', -- sent, delivered, read, failed
ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.messages(id),
ADD COLUMN IF NOT EXISTS forward_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal', -- low, normal, high, urgent
ADD COLUMN IF NOT EXISTS encryption_key text, -- for end-to-end encryption
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 6. P2P ROOM MANAGEMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.p2p_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    description text,
    type text DEFAULT 'direct', -- direct, group, broadcast
    creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_private boolean DEFAULT true,
    is_encrypted boolean DEFAULT true,
    max_participants integer DEFAULT 2,
    requires_approval boolean DEFAULT false,
    auto_delete_after timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.p2p_room_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES public.p2p_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'participant', -- admin, moderator, participant
    joined_at timestamptz DEFAULT now(),
    left_at timestamptz,
    is_muted boolean DEFAULT false,
    is_banned boolean DEFAULT false,
    last_read_at timestamptz,
    typing_status boolean DEFAULT false,
    typing_since timestamptz,
    metadata jsonb DEFAULT '{}',
    UNIQUE(room_id, user_id)
);

-- 7. ENHANCED MATCHING SYSTEM
-- =====================================================
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS status match_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS match_score float DEFAULT 0.0 CHECK (match_score >= 0 AND match_score <= 1),
ADD COLUMN IF NOT EXISTS compatibility_score float DEFAULT 0.0 CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
ADD COLUMN IF NOT EXISTS ai_match_reason text,
ADD COLUMN IF NOT EXISTS match_algorithm text DEFAULT 'hybrid', -- basic, ai, hybrid, manual
ADD COLUMN IF NOT EXISTS initiated_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz,
ADD COLUMN IF NOT EXISTS interaction_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_different_users' AND conrelid = 'public.matches'::regclass) THEN
        ALTER TABLE public.matches ADD CONSTRAINT matches_different_users CHECK (user_one != user_two);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.match_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    min_age integer DEFAULT 18 CHECK (min_age >= 18),
    max_age integer DEFAULT 99 CHECK (max_age <= 99),
    max_distance_km integer DEFAULT 50,
    relationship_types relationship_type[] DEFAULT '{casual}',
    body_types text[] DEFAULT '{}',
    ethnicities text[] DEFAULT '{}',
    positions text[] DEFAULT '{}',
    kinks text[] DEFAULT '{}',
    hiv_status_preference text DEFAULT 'any',
    requires_verification boolean DEFAULT false,
    requires_premium boolean DEFAULT false,
    auto_match_enabled boolean DEFAULT true,
    ai_learning_enabled boolean DEFAULT true,
    last_calculated_at timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- 8. COMPREHENSIVE VERIFICATION SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL, -- age, photo, video, id, phone, address, income
    status verification_status DEFAULT 'pending',
    priority text DEFAULT 'normal',
    assigned_to uuid REFERENCES public.profiles(id), -- verifier
    submitted_at timestamptz DEFAULT now(),
    reviewed_at timestamptz,
    approved_at timestamptz,
    rejected_at timestamptz,
    expires_at timestamptz,
    score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    notes text,
    rejection_reason text,
    evidence_urls text[] DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    ai_confidence float,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verification_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
    type text NOT NULL, -- selfie, id_front, id_back, video, pose_photo, address_proof
    url text NOT NULL,
    thumbnail_url text,
    file_size bigint,
    checksum text,
    ai_analysis jsonb DEFAULT '{}',
    ai_confidence float,
    human_review_required boolean DEFAULT false,
    reviewed_by uuid REFERENCES public.profiles(id),
    review_notes text,
    uploaded_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- 9. SAFETY AND MODERATION SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason text NOT NULL,
    category text NOT NULL, -- harassment, spam, fake, underage, safety, other
    severity text DEFAULT 'medium', -- low, medium, high, critical
    description text,
    evidence_urls text[] DEFAULT '{}',
    evidence_data jsonb DEFAULT '{}',
    status report_status DEFAULT 'pending',
    priority text DEFAULT 'normal',
    assigned_to uuid REFERENCES public.profiles(id),
    auto_action_taken text, -- warning, suspension, ban
    human_action_required boolean DEFAULT false,
    resolved_at timestamptz,
    resolution_notes text,
    appeal_status text, -- none, pending, approved, rejected
    appeal_reason text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    moderator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL, -- warning, timeout, suspension, ban, shadowban
    reason text NOT NULL,
    duration interval, -- for temporary actions
    expires_at timestamptz,
    is_permanent boolean DEFAULT false,
    evidence_report_id uuid REFERENCES public.reports(id),
    notes text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 10. ADVANCED PRIVACY SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_visibility privacy_level DEFAULT 'public',
    location_visibility privacy_level DEFAULT 'friends',
    last_seen_visibility privacy_level DEFAULT 'friends',
    online_status_visibility privacy_level DEFAULT 'friends',
    gallery_visibility privacy_level DEFAULT 'public',
    allow_stranger_messages boolean DEFAULT true,
    allow_friend_requests boolean DEFAULT true,
    allow_tagging boolean DEFAULT true,
    allow_screenshots boolean DEFAULT true,
    auto_delete_messages boolean DEFAULT false,
    message_retention_days integer DEFAULT 30,
    blur_stranger_photos boolean DEFAULT true,
    hide_age boolean DEFAULT false,
    hide_distance boolean DEFAULT false,
    data_collection_opt_out boolean DEFAULT false,
    ai_training_opt_out boolean DEFAULT false,
    analytics_opt_out boolean DEFAULT false,
    marketing_opt_out boolean DEFAULT false,
    search_opt_out boolean DEFAULT false,
    blocked_countries text[] DEFAULT '{}',
    time_restriction_start time, -- quiet hours
    time_restriction_end time,
    do_not_disturb boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 11. PRESENCE AND ACTIVITY TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.presence (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    status presence_status DEFAULT 'offline',
    last_seen_at timestamptz DEFAULT now(),
    current_location geography(POINT, 4326),
    location_accuracy float DEFAULT 0.0,
    location_updated_at timestamptz DEFAULT now(),
    device_info jsonb DEFAULT '{}',
    app_version text,
    network_type text, -- wifi, cellular, none
    battery_level integer CHECK (battery_level >= 0 AND battery_level <= 100),
    is_active boolean DEFAULT true,
    session_count integer DEFAULT 0,
    total_session_time interval DEFAULT '0 minutes',
    metadata jsonb DEFAULT '{}',
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL, -- login, logout, view, like, message, match, etc.
    target_type text, -- user, message, media, etc.
    target_id uuid,
    ip_address inet,
    user_agent text,
    location geography(POINT, 4326),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- 12. PREMIUM SUBSCRIPTIONS AND BILLING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier subscription_tier DEFAULT 'free',
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_price_id text,
    status text DEFAULT 'active', -- active, canceled, past_due, incomplete
    current_period_start timestamptz,
    current_period_end timestamptz,
    trial_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    canceled_at timestamptz,
    payment_method text,
    billing_cycle text DEFAULT 'monthly', -- monthly, yearly
    auto_renew boolean DEFAULT true,
    grace_period_ends_at timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.subscription_features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tier subscription_tier NOT NULL,
    feature_name text NOT NULL,
    feature_value text,
    is_enabled boolean DEFAULT true,
    limit_value integer,
    created_at timestamptz DEFAULT now(),
    UNIQUE(tier, feature_name)
);

-- 13. ENHANCED NOTIFICATIONS SYSTEM
-- =====================================================
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal', -- low, normal, high, urgent
ADD COLUMN IF NOT EXISTS read_at timestamptz,
ADD COLUMN IF NOT EXISTS is_push_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS push_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS is_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS action_url text,
ADD COLUMN IF NOT EXISTS action_text text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general', -- general, safety, billing, social
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    push_enabled boolean DEFAULT true,
    email_enabled boolean DEFAULT true,
    in_app_enabled boolean DEFAULT true,
    quiet_hours_enabled boolean DEFAULT false,
    quiet_hours_start time DEFAULT '22:00:00',
    quiet_hours_end time DEFAULT '08:00:00',
    message_notifications boolean DEFAULT true,
    match_notifications boolean DEFAULT true,
    like_notifications boolean DEFAULT true,
    view_notifications boolean DEFAULT false,
    profile_visit_notifications boolean DEFAULT false,
    safety_notifications boolean DEFAULT true,
    billing_notifications boolean DEFAULT true,
    marketing_notifications boolean DEFAULT false,
    do_not_disturb boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 14. AI AND MACHINE LEARNING FEATURES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    personality_traits jsonb DEFAULT '{}',
    compatibility_scores jsonb DEFAULT '{}',
    behavior_patterns jsonb DEFAULT '{}',
    preferences_learned jsonb DEFAULT '{}',
    risk_score float DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 1),
    authenticity_score float DEFAULT 0.0 CHECK (authenticity_score >= 0 AND authenticity_score <= 1),
    engagement_prediction float DEFAULT 0.0 CHECK (engagement_prediction >= 0 AND engagement_prediction <= 1),
    last_analyzed_at timestamptz,
    model_version text,
    training_data_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.ai_content_moderation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL, -- message, image, profile, bio
    content_id uuid NOT NULL,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    risk_score float DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_level text DEFAULT 'low', -- low, medium, high, critical
    categories text[] DEFAULT '{}', -- spam, harassment, adult, violence, etc.
    auto_action_taken text, -- none, flag, hide, remove
    human_review_required boolean DEFAULT false,
    reviewed_by uuid REFERENCES public.profiles(id),
    reviewed_at timestamptz,
    final_action text,
    model_version text,
    confidence float DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- 15. ANALYTICS AND METRICS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id uuid,
    event_type text NOT NULL, -- page_view, click, swipe, match, message, etc.
    event_name text NOT NULL,
    properties jsonb DEFAULT '{}',
    timestamp timestamptz DEFAULT now(),
    ip_address inet,
    user_agent text,
    location geography(POINT, 4326),
    app_version text,
    device_info jsonb DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.user_metrics (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_views integer DEFAULT 0,
    total_likes integer DEFAULT 0,
    total_matches integer DEFAULT 0,
    total_messages_sent integer DEFAULT 0,
    total_messages_received integer DEFAULT 0,
    total_profile_views integer DEFAULT 0,
    total_time_spent interval DEFAULT '0 minutes',
    average_session_duration interval DEFAULT '0 minutes',
    swipe_right_count integer DEFAULT 0,
    swipe_left_count integer DEFAULT 0,
    match_rate float DEFAULT 0.0,
    response_rate float DEFAULT 0.0,
    premium_conversion_date timestamptz,
    last_active_date timestamptz,
    retention_days integer DEFAULT 0,
    churn_probability float DEFAULT 0.0,
    lifetime_value numeric(10,2) DEFAULT 0.00,
    calculated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'
);

-- 16. COMPREHENSIVE INDEXES FOR OPTIMAL PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING gist(location);
CREATE INDEX IF NOT EXISTS idx_profiles_travel_mode ON public.profiles USING gist(st_point(travel_mode_lng, travel_mode_lat));
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON public.profiles(verification_status, is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON public.profiles(is_premium, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_online ON public.profiles(last_online_at DESC, is_online DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON public.profiles(profile_completion_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_expires ON public.profiles(expires_at) WHERE expires_at IS NOT NULL;

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_items_user_gallery ON public.media_items(user_id, gallery_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type_private ON public.media_items(type, is_private);
CREATE INDEX IF NOT EXISTS idx_media_items_expires ON public.media_items(expires_at) WHERE expires_at IS NOT NULL;

-- P2P indexes
CREATE INDEX IF NOT EXISTS idx_p2p_rooms_creator ON public.p2p_rooms(creator_id, type);
CREATE INDEX IF NOT EXISTS idx_p2p_participants_room_user ON public.p2p_room_participants(room_id, user_id);

-- Matching indexes
CREATE INDEX IF NOT EXISTS idx_matches_users_status ON public.matches(user_one, user_two, status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches(match_score DESC, compatibility_score DESC);

-- Verification indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status, priority);

-- Safety indexes
CREATE INDEX IF NOT EXISTS idx_reports_status_priority ON public.reports(status, priority, created_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Presence indexes
CREATE INDEX IF NOT EXISTS idx_presence_status_online ON public.presence(status, last_seen_at);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON public.activity_logs(user_id, action, created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON public.analytics_events(user_id, timestamp);

-- AI indexes
CREATE INDEX IF NOT EXISTS idx_ai_profiles_user_score ON public.ai_profiles(user_id, authenticity_score);

-- 17. TRIGGERS FOR AUTOMATIC UPDATES AND DATA CONSISTENCY
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_media_galleries_updated_at ON public.media_galleries;
CREATE TRIGGER trg_media_galleries_updated_at BEFORE UPDATE ON public.media_galleries 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_media_items_updated_at ON public.media_items;
CREATE TRIGGER trg_media_items_updated_at BEFORE UPDATE ON public.media_items 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_p2p_rooms_updated_at ON public.p2p_rooms;
CREATE TRIGGER trg_p2p_rooms_updated_at BEFORE UPDATE ON public.p2p_rooms 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at BEFORE UPDATE ON public.matches 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_verification_requests_updated_at ON public.verification_requests;
CREATE TRIGGER trg_verification_requests_updated_at BEFORE UPDATE ON public.verification_requests 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at BEFORE UPDATE ON public.reports 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_privacy_settings_updated_at ON public.privacy_settings;
CREATE TRIGGER trg_privacy_settings_updated_at BEFORE UPDATE ON public.privacy_settings 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_presence_updated_at ON public.presence;
CREATE TRIGGER trg_presence_updated_at BEFORE UPDATE ON public.presence 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ai_profiles_updated_at ON public.ai_profiles;
CREATE TRIGGER trg_ai_profiles_updated_at BEFORE UPDATE ON public.ai_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 18. ADVANCED FUNCTIONS FOR SPATIAL QUERIES AND MATCHING
-- =====================================================

-- Enhanced nearby users search with AI matching
CREATE OR REPLACE FUNCTION public.find_nearby_users_enhanced(
    lat double precision,
    lng double precision,
    max_dist_meters float DEFAULT 50000,
    limit_count int DEFAULT 50,
    filters jsonb DEFAULT '{}'
)
RETURNS TABLE (
    user_id uuid,
    distance float,
    match_score float,
    profile jsonb
) AS $$
DECLARE
    min_age_from_filters integer;
    max_age_from_filters integer;
    requires_verification_from_filters boolean;
    premium_only_from_filters boolean;
BEGIN
    -- Extract filter values
    min_age_from_filters := COALESCE((filters->>'min_age')::integer, 18);
    max_age_from_filters := COALESCE((filters->>'max_age')::integer, 99);
    requires_verification_from_filters := COALESCE((filters->>'requires_verification')::boolean, false);
    premium_only_from_filters := COALESCE((filters->>'premium_only')::boolean, false);

    RETURN QUERY
    SELECT 
        p.user_id,
        CASE 
            WHEN p.travel_mode_active THEN 
                ST_Distance(
                    ST_SetSRID(ST_MakePoint(p.travel_mode_lng, p.travel_mode_lat), 4326)::geography,
                    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
                )
            ELSE 
                ST_Distance(p.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography)
        END as distance,
        COALESCE(ai.authenticity_score, 0.5) as match_score,
        to_jsonb(p) as profile
    FROM public.profiles p
    LEFT JOIN public.ai_profiles ai ON p.user_id = ai.user_id
    WHERE 
        -- Spatial filter
        ST_DWithin(
            CASE 
                WHEN p.travel_mode_active THEN 
                    ST_SetSRID(ST_MakePoint(p.travel_mode_lng, p.travel_mode_lat), 4326)::geography
                ELSE 
                    p.location
            END,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            max_dist_meters
        )
        -- Basic filters
        AND p.user_id != auth.uid()
        AND p.is_active = true
        AND p.is_banned = false
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND COALESCE(p.age, 18) >= min_age_from_filters
        AND COALESCE(p.age, 99) <= max_age_from_filters
        AND (NOT requires_verification_from_filters OR p.is_verified = true)
        AND (NOT premium_only_from_filters OR p.is_premium = true)
        -- Privacy and blocking
        AND NOT EXISTS (
            SELECT 1 FROM public.favorites ub
            WHERE (ub.user_id = auth.uid() AND ub.favorited_user_id = p.user_id)
            OR (ub.user_id = p.user_id AND ub.favorited_user_id = auth.uid())
        )
        -- Privacy settings
        AND EXISTS (
            SELECT 1 FROM public.privacy_settings ps
            WHERE ps.user_id = p.user_id
            AND (
                ps.profile_visibility = 'public'
                OR (ps.profile_visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM public.matches m 
                    WHERE ((m.user_one = auth.uid() AND m.user_two = p.user_id) 
                    OR (m.user_two = auth.uid() AND m.user_one = p.user_id))
                    AND m.status = 'mutual'
                ))
            )
        )
    ORDER BY distance ASC, match_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AI-powered matching algorithm
CREATE OR REPLACE FUNCTION public.calculate_match_score(
    user1_id uuid,
    user2_id uuid
)
RETURNS float AS $$
DECLARE
    base_score float := 0.5;
    distance_score float := 0.0;
    compatibility_score float := 0.0;
    verification_bonus float := 0.0;
    premium_bonus float := 0.0;
    activity_bonus float := 0.0;
    final_score float;
BEGIN
    -- Distance scoring
    SELECT 
        CASE 
            WHEN distance < 1000 THEN 1.0
            WHEN distance < 5000 THEN 0.8
            WHEN distance < 10000 THEN 0.6
            WHEN distance < 25000 THEN 0.4
            WHEN distance < 50000 THEN 0.2
            ELSE 0.0
        END INTO distance_score
    FROM (
        SELECT 
            CASE 
                WHEN p1.travel_mode_active AND p2.travel_mode_active THEN
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(p1.travel_mode_lng, p1.travel_mode_lat), 4326)::geography,
                        ST_SetSRID(ST_MakePoint(p2.travel_mode_lng, p2.travel_mode_lat), 4326)::geography
                    )
                WHEN p1.travel_mode_active THEN
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(p1.travel_mode_lng, p1.travel_mode_lat), 4326)::geography,
                        p2.location
                    )
                WHEN p2.travel_mode_active THEN
                    ST_Distance(
                        p1.location,
                        ST_SetSRID(ST_MakePoint(p2.travel_mode_lng, p2.travel_mode_lat), 4326)::geography
                    )
                ELSE
                    ST_Distance(p1.location, p2.location)
            END as distance
        FROM public.profiles p1, public.profiles p2
        WHERE p1.user_id = user1_id AND p2.user_id = user2_id
    ) d;

    -- Compatibility scoring from AI profiles
    SELECT COALESCE(compatibility_score, 0.5) INTO compatibility_score
    FROM public.ai_profiles
    WHERE user_id = user1_id;

    -- Verification bonus
    SELECT 
        CASE 
            WHEN p1.is_verified AND p2.is_verified THEN 0.2
            WHEN (p1.is_verified AND NOT p2.is_verified) 
            OR (p2.is_verified AND NOT p1.is_verified) THEN 0.1
            ELSE 0.0
        END INTO verification_bonus
    FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = user1_id AND p2.user_id = user2_id;

    -- Premium bonus
    SELECT 
        CASE 
            WHEN p1.is_premium AND p2.is_premium THEN 0.1
            ELSE 0.0
        END INTO premium_bonus
    FROM public.profiles p1, public.profiles p2
    WHERE p1.user_id = user1_id AND p2.user_id = user2_id;

    -- Activity bonus (recently active users)
    SELECT 
        CASE 
            WHEN EXTRACT(EPOCH FROM (now() - p1.last_online_at)) < 3600 THEN 0.1
            WHEN EXTRACT(EPOCH FROM (now() - p1.last_online_at)) < 86400 THEN 0.05
            ELSE 0.0
        END INTO activity_bonus
    FROM public.profiles p1
    WHERE p1.user_id = user1_id;

    -- Calculate final score
    final_score := LEAST(1.0, base_score + 
        (distance_score * 0.3) + 
        (compatibility_score * 0.4) + 
        (verification_bonus * 0.1) + 
        (premium_bonus * 0.05) + 
        (activity_bonus * 0.05));

    RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic profile completion calculator
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id_param uuid)
RETURNS integer AS $$
DECLARE
    completion_score integer := 0;
    profile_record RECORD;
BEGIN
    -- Get profile data
    SELECT * INTO profile_record FROM public.profiles WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Basic info (30 points)
    completion_score := completion_score + 
        CASE WHEN profile_record.display_name IS NOT NULL AND length(profile_record.display_name) > 0 THEN 10 ELSE 0 END +
        CASE WHEN profile_record.bio IS NOT NULL AND length(profile_record.bio) > 20 THEN 10 ELSE 0 END +
        CASE WHEN profile_record.age IS NOT NULL AND profile_record.age BETWEEN 18 AND 99 THEN 5 ELSE 0 END +
        CASE WHEN profile_record.location IS NOT NULL THEN 5 ELSE 0 END;

    -- Physical attributes (20 points)
    completion_score := completion_score + 
        CASE WHEN profile_record.height IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN profile_record.weight IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN profile_record.body_type IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN profile_record.ethnicity IS NOT NULL THEN 5 ELSE 0 END;

    -- Preferences and interests (20 points)
    completion_score := completion_score + 
        CASE WHEN array_length(profile_record.tribes, 1) > 0 THEN 5 ELSE 0 END +
        CASE WHEN array_length(profile_record.interests, 1) > 0 THEN 5 ELSE 0 END +
        CASE WHEN array_length(profile_record.looking_for, 1) > 0 THEN 5 ELSE 0 END +
        CASE WHEN profile_record.relationship_goals IS NOT NULL THEN 5 ELSE 0 END;

    -- Media (15 points)
    completion_score := completion_score + 
        LEAST(10, (SELECT COUNT(*) FROM public.media_items WHERE user_id = user_id_param AND type = 'image') * 2) +
        CASE WHEN EXISTS (SELECT 1 FROM public.media_items WHERE user_id = user_id_param AND is_primary = true) THEN 5 ELSE 0 END;

    -- Verification (15 points)
    completion_score := completion_score + 
        CASE WHEN profile_record.is_verified THEN 10 ELSE 0 END +
        CASE WHEN profile_record.verification_status = 'approved' THEN 5 ELSE 0 END;

    RETURN LEAST(100, completion_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.media_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles RLS - Fix security issues from previous migration
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_auth" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (
        is_active = true 
        AND is_banned = false 
        AND (expires_at IS NULL OR expires_at > now())
    );

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_auth" ON public.profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Media items RLS
DROP POLICY IF EXISTS "media_items_select_own" ON public.media_items;
DROP POLICY IF EXISTS "media_items_select_public" ON public.media_items;
DROP POLICY IF EXISTS "media_items_insert_own" ON public.media_items;
DROP POLICY IF EXISTS "media_items_update_own" ON public.media_items;
DROP POLICY IF EXISTS "media_items_delete_own" ON public.media_items;

CREATE POLICY "media_items_select_own" ON public.media_items
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "media_items_select_public" ON public.media_items
    FOR SELECT USING (
        NOT is_private 
        AND (NOT is_ephemeral OR expires_at > now())
        AND EXISTS (
            SELECT 1 FROM public.privacy_settings ps
            WHERE ps.user_id = media_items.user_id
            AND ps.gallery_visibility = 'public'
        )
    );

CREATE POLICY "media_items_insert_own" ON public.media_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "media_items_update_own" ON public.media_items
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "media_items_delete_own" ON public.media_items
    FOR DELETE USING (user_id = auth.uid());

-- Messages RLS
DROP POLICY IF EXISTS "messages_select_participants" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_participants" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;

CREATE POLICY "messages_select_participants" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
        )
    );

CREATE POLICY "messages_insert_participants" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
        )
    );

CREATE POLICY "messages_update_own" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Matches RLS
DROP POLICY IF EXISTS "matches_select_participants" ON public.matches;
DROP POLICY IF EXISTS "matches_insert_own" ON public.matches;

CREATE POLICY "matches_select_participants" ON public.matches
    FOR SELECT USING (
        user_one = auth.uid() OR user_two = auth.uid()
    );

CREATE POLICY "matches_insert_own" ON public.matches
    FOR INSERT WITH CHECK (
        initiated_by = auth.uid()
        AND (user_one = auth.uid() OR user_two = auth.uid())
    );

-- Privacy settings RLS
DROP POLICY IF EXISTS "privacy_settings_select_own" ON public.privacy_settings;
DROP POLICY IF EXISTS "privacy_settings_update_own" ON public.privacy_settings;
DROP POLICY IF EXISTS "privacy_settings_insert_own" ON public.privacy_settings;

CREATE POLICY "privacy_settings_select_own" ON public.privacy_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "privacy_settings_update_own" ON public.privacy_settings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "privacy_settings_insert_own" ON public.privacy_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications RLS
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- 20. INSERT DEFAULT SUBSCRIPTION FEATURES
-- =====================================================
INSERT INTO public.subscription_features (tier, feature_name, feature_value, is_enabled) VALUES
    ('free', 'swipe_limit', '100', true),
    ('free', 'message_limit', '50', true),
    ('free', 'profile_views', 'unlimited', true),
    ('free', 'advanced_filters', 'false', false),
    ('free', 'incognito_mode', 'false', false),
    ('free', 'read_receipts', 'false', false),
    ('free', 'media_upload', '10', true),
    ('free', 'ai_enhancement', 'false', false),
    
    ('premium', 'swipe_limit', 'unlimited', true),
    ('premium', 'message_limit', 'unlimited', true),
    ('premium', 'profile_views', 'unlimited', true),
    ('premium', 'advanced_filters', 'true', true),
    ('premium', 'incognito_mode', 'true', true),
    ('premium', 'read_receipts', 'true', true),
    ('premium', 'media_upload', '100', true),
    ('premium', 'ai_enhancement', 'true', true),
    ('premium', 'travel_mode', 'true', true),
    ('premium', 'who_liked_me', 'true', true),
    
    ('vip', 'swipe_limit', 'unlimited', true),
    ('vip', 'message_limit', 'unlimited', true),
    ('vip', 'profile_views', 'unlimited', true),
    ('vip', 'advanced_filters', 'true', true),
    ('vip', 'incognito_mode', 'true', true),
    ('vip', 'read_receipts', 'true', true),
    ('vip', 'media_upload', 'unlimited', true),
    ('vip', 'ai_enhancement', 'true', true),
    ('vip', 'travel_mode', 'true', true),
    ('vip', 'who_liked_me', 'true', true),
    ('vip', 'priority_support', 'true', true),
    ('vip', 'verified_badge', 'true', true),
    ('vip', 'custom_themes', 'true', true),
    
    ('enterprise', 'swipe_limit', 'unlimited', true),
    ('enterprise', 'message_limit', 'unlimited', true),
    ('enterprise', 'profile_views', 'unlimited', true),
    ('enterprise', 'advanced_filters', 'true', true),
    ('enterprise', 'incognito_mode', 'true', true),
    ('enterprise', 'read_receipts', 'true', true),
    ('enterprise', 'media_upload', 'unlimited', true),
    ('enterprise', 'ai_enhancement', 'true', true),
    ('enterprise', 'travel_mode', 'true', true),
    ('enterprise', 'who_liked_me', 'true', true),
    ('enterprise', 'priority_support', 'true', true),
    ('enterprise', 'verified_badge', 'true', true),
    ('enterprise', 'custom_themes', 'true', true),
    ('enterprise', 'api_access', 'true', true),
    ('enterprise', 'white_label', 'true', true),
    ('enterprise', 'dedicated_manager', 'true', true)
ON CONFLICT (tier, feature_name) DO NOTHING;

-- 21. ENABLE REALTIME FOR CRITICAL TABLES (ADD ONLY NEW TABLES)
-- =====================================================
-- Add only tables that aren't already in the publication
DO $$
BEGIN
    -- Check each table before adding to avoid conflicts
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'presence') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.presence;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'matches') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'p2p_rooms') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.p2p_rooms;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'p2p_room_participants') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.p2p_room_participants;
    END IF;
END $$;

-- 22. CREATE HELPER FUNCTION FOR NEW USER SETUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger AS $$
BEGIN
    -- Create privacy settings
    INSERT INTO public.privacy_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create presence record
    INSERT INTO public.presence (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create notification preferences
    INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create match preferences
    INSERT INTO public.match_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create AI profile
    INSERT INTO public.ai_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create user metrics
    INSERT INTO public.user_metrics (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create free subscription
    INSERT INTO public.subscriptions (user_id, tier) VALUES (NEW.id, 'free') ON CONFLICT DO NOTHING;
    
    -- Calculate initial profile completion
    UPDATE public.profiles 
    SET profile_completion_score = public.calculate_profile_completion(NEW.id)
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete();

-- 23. CREATE COMPREHENSIVE USER CLEANUP FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_user_data(user_id_to_cleanup uuid)
RETURNS void AS $$
BEGIN
    -- Soft delete profile
    UPDATE public.profiles 
    SET is_active = false, expires_at = now() + interval '30 days'
    WHERE user_id = user_id_to_cleanup;
    
    -- Leave all P2P rooms
    UPDATE public.p2p_room_participants 
    SET left_at = now() 
    WHERE user_id = user_id_to_cleanup AND left_at IS NULL;
    
    -- Mark messages as deleted but keep for other participants
    UPDATE public.messages 
    SET is_deleted = true, deleted_at = now()
    WHERE sender_id = user_id_to_cleanup AND is_deleted = false;
    
    -- Cancel subscription
    UPDATE public.subscriptions 
    SET status = 'canceled', canceled_at = now()
    WHERE user_id = user_id_to_cleanup AND status = 'active';
    
    -- Anonymize activity logs after 90 days
    UPDATE public.activity_logs 
    SET user_id = null 
    WHERE user_id = user_id_to_cleanup AND created_at < now() - interval '90 days';
    
    -- Keep verification requests for audit but anonymize
    UPDATE public.verification_requests 
    SET user_id = null 
    WHERE user_id = user_id_to_cleanup AND status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 24. LEGACY COMPATIBILITY - FIX EXISTING POLICIES
-- =====================================================

-- Fix profile_photos policies if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_photos' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Anyone can view profile photos" ON public.profile_photos;
        ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "profile_photos_select_own" ON public.profile_photos
            FOR SELECT USING (user_id = auth.uid());
            
        CREATE POLICY "profile_photos_select_public" ON public.profile_photos
            FOR SELECT USING (
                NOT is_private 
                AND EXISTS (
                    SELECT 1 FROM public.privacy_settings ps
                    WHERE ps.user_id = profile_photos.user_id
                    AND ps.gallery_visibility = 'public'
                )
            );
    END IF;
END $$;

-- Fix meet_now policies if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meet_now' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Anyone can view meet now users" ON public.meet_now;
        ALTER TABLE public.meet_now ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "meet_now_select_authenticated" ON public.meet_now
            FOR SELECT TO authenticated USING (true);
            
        CREATE POLICY "meet_now_manage_own" ON public.meet_now
            FOR ALL USING (user_id = auth.uid());
    END IF;
END $$;

-- Add missing UPDATE policy for conversations - Fixed syntax
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        -- Drop existing policy if it exists
        DROP POLICY IF EXISTS "Participants can update conversation" ON public.conversations;
        
        -- Create the policy with correct syntax
        CREATE POLICY "Participants can update conversation"
        ON public.conversations FOR UPDATE
        TO authenticated 
        USING (auth.uid() = participant_one OR auth.uid() = participant_two);
    END IF;
END $$;

-- =====================================================
-- COMPLETE DATING PLATFORM SCHEMA - SUCCESSFULLY APPLIED
-- =====================================================
SELECT 'Complete Dating Platform Schema - Successfully Applied' as status;
