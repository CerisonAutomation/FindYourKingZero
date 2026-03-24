-- ═══════════════════════════════════════════════════════════════
-- Enterprise hardening: indexes, constraints, RLS, functions
-- Run: supabase db push
-- ═══════════════════════════════════════════════════════════════

-- ── Unique constraints on junction tables ────────────────────
ALTER TABLE taps
  ADD CONSTRAINT taps_from_to_unique UNIQUE (from_user_id, to_user_id);

ALTER TABLE favorites
  ADD CONSTRAINT favorites_user_target_unique UNIQUE (user_id, target_id);

ALTER TABLE blocks
  ADD CONSTRAINT blocks_blocker_blocked_unique UNIQUE (blocker_id, blocked_id);

ALTER TABLE message_reactions
  ADD CONSTRAINT message_reactions_unique UNIQUE (message_id, user_id, emoji);

ALTER TABLE event_attendees
  ADD CONSTRAINT event_attendees_event_user_unique UNIQUE (event_id, user_id);

ALTER TABLE group_members
  ADD CONSTRAINT group_members_group_user_unique UNIQUE (group_id, user_id);

-- ── Performance indexes (most critical read paths) ───────────
CREATE INDEX IF NOT EXISTS idx_profiles_geohash ON profiles (geohash);
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON profiles (online_status) WHERE online_status = 'online';
CREATE INDEX IF NOT EXISTS idx_profiles_available_now ON profiles (available_now) WHERE available_now = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles (last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages (conversation_id, read_at) WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_participant_a
  ON conversations (participant_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_b
  ON conversations (participant_b, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications (user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events (starts_at ASC);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events (organizer_id);

CREATE INDEX IF NOT EXISTS idx_visits_visited_created ON visits (visited_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views (viewed_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_taps_to_user ON taps (to_user_id);

CREATE INDEX IF NOT EXISTS idx_presence_cells_geohash
  ON presence_cells (geohash, last_heartbeat DESC);

-- ── Enable pgvector for AI matching ──────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_profiles_embedding
  ON profiles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── Full-text search on profiles ────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(array_to_string(tribes, ' '), ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_profiles_fts ON profiles USING GIN (search_vector);

-- ── Row Level Security (RLS) ────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE taps ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE quickshare_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ─────────────────────────────────────────────

-- Profiles: users can read all active profiles, update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Photos: public photos visible to all, private only to owner
CREATE POLICY "photos_select" ON photos FOR SELECT USING (is_private = FALSE OR user_id = auth.uid());
CREATE POLICY "photos_insert" ON photos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "photos_update" ON photos FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "photos_delete" ON photos FOR DELETE USING (user_id = auth.uid());

-- Albums: same logic
CREATE POLICY "albums_select" ON albums FOR SELECT USING (is_private = FALSE OR user_id = auth.uid());
CREATE POLICY "albums_insert" ON albums FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "albums_update" ON albums FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "albums_delete" ON albums FOR DELETE USING (user_id = auth.uid());

-- Album photos: owner only
CREATE POLICY "album_photos_all" ON album_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM albums WHERE albums.id = album_photos.album_id AND albums.user_id = auth.uid())
);

-- Conversations: only participants
CREATE POLICY "conversations_select" ON conversations FOR SELECT
  USING (participant_a = auth.uid() OR participant_b = auth.uid());
CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (participant_a = auth.uid() OR participant_b = auth.uid());
CREATE POLICY "conversations_update" ON conversations FOR UPDATE
  USING (participant_a = auth.uid() OR participant_b = auth.uid());

-- Messages: only conversation participants
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.participant_a = auth.uid() OR conversations.participant_b = auth.uid())));
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.participant_a = auth.uid() OR conversations.participant_b = auth.uid())));
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (sender_id = auth.uid());

-- Taps: owner can insert, both parties can read
CREATE POLICY "taps_select" ON taps FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "taps_insert" ON taps FOR INSERT WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "taps_delete" ON taps FOR DELETE USING (from_user_id = auth.uid());

-- Favorites: same pattern
CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (user_id = auth.uid());

-- Super favorites
CREATE POLICY "super_favorites_owner" ON super_favorites FOR ALL USING (user_id = auth.uid());

-- Blocks
CREATE POLICY "blocks_owner" ON blocks FOR ALL USING (blocker_id = auth.uid());

-- Reports: reporter can insert, select own
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_select" ON reports FOR SELECT USING (reporter_id = auth.uid());

-- Notifications: user sees own
CREATE POLICY "notifications_owner" ON notifications FOR ALL USING (user_id = auth.uid());

-- Subscriptions: owner only
CREATE POLICY "subscriptions_owner" ON subscriptions FOR ALL USING (user_id = auth.uid());

-- Presence: all can read (for discover grid), owner writes
CREATE POLICY "presence_select" ON presence_cells FOR SELECT USING (TRUE);
CREATE POLICY "presence_insert" ON presence_cells FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "presence_update" ON presence_cells FOR UPDATE USING (user_id = auth.uid());

-- Location shares: sender/receiver only
CREATE POLICY "location_shares_select" ON location_shares FOR SELECT
  USING (user_id = auth.uid() OR target_id = auth.uid());
CREATE POLICY "location_shares_insert" ON location_shares FOR INSERT WITH CHECK (user_id = auth.uid());

-- Quickshare: sender/receiver only
CREATE POLICY "quickshare_select" ON quickshare_albums FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "quickshare_insert" ON quickshare_albums FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Visits: both parties can read
CREATE POLICY "visits_select" ON visits FOR SELECT
  USING (visitor_id = auth.uid() OR visited_id = auth.uid());
CREATE POLICY "visits_insert" ON visits FOR INSERT WITH CHECK (visitor_id = auth.uid());

-- Profile views: both parties can read
CREATE POLICY "profile_views_select" ON profile_views FOR SELECT
  USING (viewer_id = auth.uid() OR viewed_id = auth.uid());
CREATE POLICY "profile_views_insert" ON profile_views FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Message reactions: owner can CRUD
CREATE POLICY "message_reactions_owner" ON message_reactions FOR ALL USING (user_id = auth.uid());

-- ── Helper functions ─────────────────────────────────────────

-- Update online status and last_active_at on heartbeat
CREATE OR REPLACE FUNCTION update_user_heartbeat(user_lat float, user_lng float)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET
    online_status = 'online',
    last_active_at = now(),
    coarse_lat = user_lat,
    coarse_lng = user_lng
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark user offline
CREATE OR REPLACE FUNCTION mark_user_offline()
RETURNS void AS $$
BEGIN
  UPDATE profiles SET online_status = 'offline', available_now = FALSE
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
