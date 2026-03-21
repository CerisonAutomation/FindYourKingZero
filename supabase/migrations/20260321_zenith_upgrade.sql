-- =====================================================
-- ZENITH UPGRADE v∞.Ω — Find Your King + Leaflet + Voice + QuickShare
-- 12 new/expanded tables + 3 functions + RLS + indexes
-- =====================================================

-- ── 1. Voice Commands ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voice_commands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  command_text text NOT NULL,
  parsed_action text NOT NULL,
  parameters jsonb DEFAULT '{}',
  success boolean DEFAULT true,
  executed_at timestamptz DEFAULT now(),
  ai_model_used text DEFAULT 'mlc-web-llm',
  confidence float DEFAULT 0.0
);
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voice_commands_owner" ON public.voice_commands
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_voice_commands_user ON public.voice_commands(user_id, executed_at DESC);

-- ── 2. QuickShare Ephemeral Albums ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quickshare_albums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  room_id text,
  files jsonb NOT NULL DEFAULT '[]',
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  viewed boolean DEFAULT false,
  viewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.quickshare_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quickshare_sender_receiver" ON public.quickshare_albums
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "quickshare_sender_insert" ON public.quickshare_albums
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "quickshare_sender_update" ON public.quickshare_albums
  FOR UPDATE USING (auth.uid() = sender_id);
CREATE INDEX idx_quickshare_sender ON public.quickshare_albums(sender_id);
CREATE INDEX idx_quickshare_receiver ON public.quickshare_albums(receiver_id);
CREATE INDEX idx_quickshare_expires ON public.quickshare_albums(expires_at) WHERE viewed = false;

-- ── 3. Message Templates (Quick Replies) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  template_text text NOT NULL,
  category text DEFAULT 'quick_reply',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_owner" ON public.message_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_templates_user ON public.message_templates(user_id, category);

-- ── 4. User Kinks & Limits (Find Your King) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_kinks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  kink text NOT NULL,
  is_limit boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, kink)
);
ALTER TABLE public.user_kinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kinks_owner_write" ON public.user_kinks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kinks_public_read" ON public.user_kinks
  FOR SELECT USING (true);
CREATE INDEX idx_kinks_user ON public.user_kinks(user_id);

-- ── 5. Super Favorites ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.super_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  target_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  notes text,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_id)
);
ALTER TABLE public.super_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "superfav_owner" ON public.super_favorites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_superfav_user ON public.super_favorites(user_id, priority DESC);

-- ── 6. Travel Mode ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_mode (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  destination_lat double precision,
  destination_lng double precision,
  destination_name text,
  arrival_date date,
  departure_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.travel_mode ENABLE ROW LEVEL SECURITY;
CREATE POLICY "travel_owner" ON public.travel_mode
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_travel_active ON public.travel_mode(user_id) WHERE is_active = true;

-- ── 7. AI Typing Responses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_typing_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  suggested_reply text NOT NULL,
  context text,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ai_typing_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_typing_owner" ON public.ai_typing_responses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ai_typing_conv ON public.ai_typing_responses(conversation_id, created_at DESC);

-- ── 8. Read Receipts (expand messages) ──────────────────────────────────────
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- ── 9. Profile Enhancements ─────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loro_doc_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_mode_active boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS party_friendly boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chemsex_friendly boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS super_like_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS loro_sync_hash text;

-- ── 10. PostGIS: Find Nearby Profiles Function ──────────────────────────────
CREATE OR REPLACE FUNCTION public.find_nearby_profiles(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  age integer,
  lat double precision,
  lng double precision,
  distance_km double precision,
  verification_status text,
  is_premium boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    p.age,
    ST_Y(p.location::geometry) as lat,
    ST_X(p.location::geometry) as lng,
    ROUND(
      ST_Distance(
        p.location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      )::float / 1000, 2
    ) as distance_km,
    p.verification_status,
    COALESCE(p.is_premium, false) as is_premium
  FROM public.profiles p
  WHERE p.location IS NOT NULL
    AND p.is_active = true
    AND p.is_banned = false
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY p.location <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  LIMIT 200;
END;
$$;

-- ── 11. QuickShare Sign Function ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_quickshare_sign()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'expires', now() + interval '1 hour',
    'room_id', gen_random_uuid()::text
  );
END;
$$;

-- ── 12. Mark Messages Read Function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET read_at = now()
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;
