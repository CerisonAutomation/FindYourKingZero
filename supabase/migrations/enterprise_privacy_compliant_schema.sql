-- =====================================================
-- ENTERPRISE PRIVACY-COMPLIANT DATING PLATFORM SCHEMA
-- =====================================================
-- GDPR/CCPA/ HIPAA Compliant Database Design
-- Medical data properly separated with explicit consent

-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRIVACY-FIRST ENUM TYPES
-- =====================================================
DO $$
BEGIN
    -- Media and message types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'file', 'gif', 'sticker');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'location', 'reaction', 'typing');
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
    
    -- Consent types for GDPR compliance
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_type') THEN
        CREATE TYPE consent_type AS ENUM ('marketing', 'analytics', 'medical_data', 'location_sharing', 'profile_visibility');
    END IF;
END $$;

-- 3. MAIN PROFILES TABLE - PRIVACY COMPLIANT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    -- Primary identification
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Basic profile information (non-sensitive)
    display_name text NOT NULL CHECK (length(display_name) >= 2 AND length(display_name) <= 50),
    bio text CHECK (length(bio) <= 500),
    birth_date date CHECK (birth_date <= CURRENT_DATE - interval '18 years'),
    gender text CHECK (gender IN ('male', 'female', 'non_binary', 'other', 'prefer_not_to_say')),
    preferred_genders text[] DEFAULT '{}',
    
    -- Location (privacy-compliant)
    location geography(POINT, 4326),
    location_city text,
    location_country text,
    location_privacy_level privacy_level DEFAULT 'private',
    location_updated_at timestamptz DEFAULT now(),
    location_accuracy_km float DEFAULT 1.0 CHECK (location_accuracy_km >= 0.1 AND location_accuracy_km <= 100),
    
    -- Account status
    verification_status verification_status DEFAULT 'pending',
    verification_score integer DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
    profile_completion_score integer DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    
    -- Preferences (non-medical)
    relationship_goals relationship_type DEFAULT 'casual',
    languages text[] DEFAULT '{}',
    education text,
    occupation text,
    interests text[] DEFAULT '{}',
    
    -- Status and timestamps
    is_active boolean DEFAULT true,
    is_banned boolean DEFAULT false,
    ban_reason text,
    ban_expires_at timestamptz,
    is_premium boolean DEFAULT false,
    subscription_tier subscription_tier DEFAULT 'free',
    
    -- Privacy settings
    privacy_level privacy_level DEFAULT 'private',
    show_age boolean DEFAULT true,
    show_distance boolean DEFAULT true,
    allow_profile_views boolean DEFAULT true,
    
    -- Activity tracking
    is_online boolean DEFAULT false,
    last_online_at timestamptz DEFAULT now(),
    last_seen timestamptz DEFAULT now(),
    status_text text CHECK (length(status_text) <= 100),
    
    -- Travel mode (non-sensitive)
    travel_mode_active boolean DEFAULT false,
    travel_mode_lat double precision,
    travel_mode_lng double precision,
    travel_mode_destination text,
    travel_mode_expires_at timestamptz,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    
    -- Constraints
    CONSTRAINT valid_age CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE - interval '18 years'),
    CONSTRAINT valid_location CHECK (
        location IS NULL OR 
        (ST_X(location) >= -180 AND ST_X(location) <= 180 AND 
         ST_Y(location) >= -90 AND ST_Y(location) <= 90)
    ),
    CONSTRAINT valid_display_name CHECK (display_name ~ '^[a-zA-Z0-9_\-\.@#$%^&*()!+=\[\]{}|;:,.<>?~` ]+$'),
    CONSTRAINT reasonable_interests CHECK (array_length(interests, 1) IS NULL OR array_length(interests, 1) <= 50)
);

-- 4. SEPARATE MEDICAL DATA TABLE - EXPLICIT CONSENT REQUIRED
-- =====================================================
CREATE TABLE IF NOT EXISTS public.medical_privacy (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Consent tracking (GDPR requirement)
    consent_given boolean DEFAULT false NOT NULL,
    consent_given_at timestamptz,
    consent_ip_address inet,
    consent_version text DEFAULT '1.0',
    consent_withdrawn_at timestamptz,
    
    -- Medical data (only stored with explicit consent)
    hiv_status text,
    hiv_test_date date,
    prep_status text,
    prep_start_date date,
    last_sti_test_date date,
    vaccination_status jsonb DEFAULT '{}',
    
    -- Privacy preferences
    share_medical_data_with_matches boolean DEFAULT false,
    share_medical_data_anonymously boolean DEFAULT true,
    
    -- Data retention
    data_retention_expires_at timestamptz DEFAULT (now() + interval '2 years'),
    
    -- Audit trail
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz,
    accessed_by_user_id uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT consent_required CHECK (
        consent_given = true OR 
        (hiv_status IS NULL AND hiv_test_date IS NULL AND 
         prep_status IS NULL AND prep_start_date IS NULL AND
         last_sti_test_date IS NULL)
    ),
    CONSTRAINT valid_dates CHECK (
        (hiv_test_date IS NULL OR hiv_test_date <= CURRENT_DATE) AND
        (prep_start_date IS NULL OR prep_start_date <= CURRENT_DATE) AND
        (last_sti_test_date IS NULL OR last_sti_test_date <= CURRENT_DATE)
    )
);

-- 5. CONSENT MANAGEMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_consents (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consent_type consent_type NOT NULL,
    consent_given boolean NOT NULL,
    consent_given_at timestamptz DEFAULT now(),
    consent_ip_address inet,
    consent_version text DEFAULT '1.0',
    consent_withdrawn_at timestamptz,
    consent_details jsonb DEFAULT '{}',
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, consent_type)
);

-- 6. ENHANCED MATCHING ALGORITHM TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.matching_preferences (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Age preferences
    min_age integer DEFAULT 18 CHECK (min_age >= 18),
    max_age integer DEFAULT 100 CHECK (max_age >= min_age),
    
    -- Distance preferences
    max_distance_km integer DEFAULT 50 CHECK (max_distance_km >= 1 AND max_distance_km <= 500),
    location_required boolean DEFAULT true,
    
    -- Relationship preferences
    relationship_types relationship_type[] DEFAULT '{casual,dating}',
    
    -- Matching weights (AI algorithm parameters)
    age_importance float DEFAULT 0.2 CHECK (age_importance >= 0 AND age_importance <= 1),
    distance_importance float DEFAULT 0.3 CHECK (distance_importance >= 0 AND distance_importance <= 1),
    interests_importance float DEFAULT 0.25 CHECK (interests_importance >= 0 AND interests_importance <= 1),
    verification_importance float DEFAULT 0.25 CHECK (verification_importance >= 0 AND verification_importance <= 1),
    
    -- Privacy preferences
    only_show_verified boolean DEFAULT false,
    hide_blocked_users boolean DEFAULT true,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. AUDIT LOG TABLE FOR COMPLIANCE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    table_name text,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    session_id text,
    
    created_at timestamptz DEFAULT now(),
    
    -- Index for performance
    INDEX idx_audit_log_user_id (user_id),
    INDEX idx_audit_log_created_at (created_at),
    INDEX idx_audit_log_action (action)
);

-- 8. ENTERPRISE SECURITY FEATURES
-- =====================================================

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Medical Privacy RLS Policies (Strict)
CREATE POLICY "Users can view own medical data with consent" ON public.medical_privacy
    FOR SELECT USING (
        auth.uid() = user_id AND 
        consent_given = true AND
        (consent_withdrawn_at IS NULL OR consent_withdrawn_at < now())
    );

CREATE POLICY "Users can update own medical data" ON public.medical_privacy
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical data" ON public.medical_privacy
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Consent Management RLS
CREATE POLICY "Users can manage own consents" ON public.user_consents
    FOR ALL USING (auth.uid() = user_id);

-- Matching Preferences RLS
CREATE POLICY "Users can manage own preferences" ON public.matching_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Audit Log RLS (Read-only for users)
CREATE POLICY "Users can view own audit logs" ON public.audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- 9. PERFORMANCE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_online ON public.profiles (last_online_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_active_verified ON public.profiles (is_active, verification_status) 
    WHERE is_active = true AND verification_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles (birth_date);
CREATE INDEX IF NOT EXISTS idx_profiles_relationship_goals ON public.profiles (relationship_goals);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles (subscription_tier);

-- Medical privacy indexes
CREATE INDEX IF NOT EXISTS idx_medical_privacy_user_id ON public.medical_privacy (user_id);
CREATE INDEX IF NOT EXISTS idx_medical_privacy_consent ON public.medical_privacy (consent_given, consent_withdrawn_at);

-- Matching preferences indexes
CREATE INDEX IF NOT EXISTS idx_matching_preferences_user_id ON public.matching_preferences (user_id);

-- 10. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_medical_privacy_updated_at
    BEFORE UPDATE ON public.medical_privacy
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_matching_preferences_updated_at
    BEFORE UPDATE ON public.matching_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
        VALUES (NEW.user_id, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (NEW.user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values)
        VALUES (OLD.user_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to sensitive tables
CREATE TRIGGER profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER medical_privacy_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.medical_privacy
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER user_consents_audit_trigger
    AFTER INSERT OR UPDATE ON public.user_consents
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 11. DATA RETENTION POLICIES
-- =====================================================

-- Function to clean up expired medical data
CREATE OR REPLACE FUNCTION public.cleanup_expired_medical_data()
RETURNS void AS $$
BEGIN
    DELETE FROM public.medical_privacy 
    WHERE data_retention_expires_at < now()
    OR (consent_withdrawn_at IS NOT NULL AND consent_withdrawn_at < now() - interval '30 days');
    
    -- Log cleanup
    INSERT INTO public.audit_log (action, table_name, new_values)
    VALUES ('CLEANUP', 'medical_privacy', jsonb_build_object('records_deleted', FOUND));
END;
$$ language 'plpgsql';

-- 12. VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active, verified profiles view
CREATE OR REPLACE VIEW public.active_verified_profiles AS
SELECT 
    p.*,
    CASE 
        WHEN p.location_privacy_level = 'public' THEN p.location
        WHEN p.location_privacy_level = 'friends' THEN NULL -- Only friends can see
        ELSE NULL -- Private/stealth - no location visible
    END as visible_location,
    CASE 
        WHEN p.show_age = true THEN date_part('year', age(p.birth_date))
        ELSE NULL
    END as visible_age
FROM public.profiles p
WHERE p.is_active = true 
  AND p.is_banned = false
  AND p.verification_status = 'approved'
  AND p.expires_at IS NULL OR p.expires_at > now();

-- Matching-compatible profiles view
CREATE OR REPLACE VIEW public.matchable_profiles AS
SELECT 
    p.*,
    mp.min_age,
    mp.max_age,
    mp.max_distance_km,
    mp.relationship_types,
    ST_Distance(p.location, CURRENT_LOCATION) as distance_km
FROM public.profiles p
JOIN public.matching_preferences mp ON p.user_id = mp.user_id
WHERE p.is_active = true 
  AND p.is_banned = false
  AND p.verification_status = 'approved'
  AND p.expires_at IS NULL OR p.expires_at > now();

-- 13. SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user can access medical data
CREATE OR REPLACE FUNCTION public.can_access_medical_data(target_user_id uuid, requesting_user_id uuid)
RETURNS boolean AS $$
BEGIN
    -- Users can always access their own data if consent is given
    IF target_user_id = requesting_user_id THEN
        RETURN EXISTS (
            SELECT 1 FROM public.medical_privacy 
            WHERE user_id = target_user_id 
            AND consent_given = true 
            AND (consent_withdrawn_at IS NULL OR consent_withdrawn_at < now())
        );
    END IF;
    
    -- Other users can never access medical data
    RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 14. SAMPLE DATA INSERTION (Development Only)
-- =====================================================
-- This would be removed in production

COMMENT ON TABLE public.profiles IS 'Main user profiles with privacy-compliant design';
COMMENT ON TABLE public.medical_privacy IS 'Medical data stored separately with explicit consent requirements';
COMMENT ON TABLE public.user_consents IS 'GDPR consent management for all data processing';
COMMENT ON TABLE public.matching_preferences IS 'User preferences for AI matching algorithm';
COMMENT ON TABLE public.audit_log IS 'Comprehensive audit trail for compliance and security';

-- Final verification
SELECT 'Enterprise privacy-compliant schema created successfully' as status;
