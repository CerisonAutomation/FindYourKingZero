-- Fix critical security issues: Restrict public access to sensitive data

-- 1. Drop overly permissive policies on profiles
DROP
POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- Create new policy that requires authentication
CREATE
POLICY "Authenticated users can view profiles"
ON profiles FOR
SELECT
    TO authenticated
    USING (true);

-- 2. Drop overly permissive policy on profile_photos
DROP
POLICY IF EXISTS "Anyone can view profile photos" ON profile_photos;

-- Create new policy that requires authentication
CREATE
POLICY "Authenticated users can view profile photos"
ON profile_photos FOR
SELECT
    TO authenticated
    USING (true);

-- 3. Drop overly permissive policy on meet_now
DROP
POLICY IF EXISTS "Anyone can view meet now users" ON meet_now;

-- Create new policy that requires authentication
CREATE
POLICY "Authenticated users can view meet now"
ON meet_now FOR
SELECT
    TO authenticated
    USING (true);

-- 4. Add missing UPDATE policy for conversations (needed for last_message_at updates)
CREATE
POLICY "Participants can update conversation"
ON conversations FOR
UPDATE
    TO authenticated
    USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- 5. Enable realtime for messages table for live chat
ALTER
PUBLICATION supabase_realtime ADD TABLE messages;