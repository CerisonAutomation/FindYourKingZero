CREATE
EXTENSION IF NOT EXISTS "pg_graphql";
CREATE
EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE
EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE
EXTENSION IF NOT EXISTS "plpgsql";
CREATE
EXTENSION IF NOT EXISTS "supabase_vault";
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET
statement_timeout = 0;
SET
lock_timeout = 0;
SET
idle_in_transaction_session_timeout = 0;
SET
transaction_timeout = 0;
SET
client_encoding = 'UTF8';
SET
standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET
check_function_bodies = false;
SET
xmloption = content;
SET
client_min_messages = warning;
SET
row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'seeker',
    'provider',
    'admin'
);


--
-- Name: check_mutual_match(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_mutual_match() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Check if the other person also favorited this user
    IF
EXISTS (
        SELECT 1 FROM public.favorites
        WHERE user_id = NEW.favorited_user_id
        AND favorited_user_id = NEW.user_id
    ) THEN
        -- Create a match (order users consistently)
        INSERT INTO public.matches (user_one, user_two)
        VALUES (
            LEAST(NEW.user_id, NEW.favorited_user_id),
            GREATEST(NEW.user_id, NEW.favorited_user_id)
        )
        ON CONFLICT DO NOTHING;
        
        -- Create notification for both users
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (NEW.user_id, 'match', 'New Match! 👑', 'You matched with someone!',
        jsonb_build_object('matched_user_id', NEW.favorited_user_id)),
       (NEW.favorited_user_id, 'match', 'New Match! 👑', 'You matched with someone!',
        jsonb_build_object('matched_user_id', NEW.user_id));
END IF;

RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Create profile
INSERT INTO public.profiles (user_id, display_name)
VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->>'display_name', split_part(NEW.email, '@', 1)));

-- Assign default seeker role
INSERT INTO public.user_roles (user_id, role)
VALUES (NEW.id, 'seeker');

RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
SELECT EXISTS (SELECT 1
               FROM public.user_roles
               WHERE user_id = _user_id
                 AND role = _role)
           $$;


--
-- Name: increment_profile_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_profile_views() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
UPDATE public.profiles
SET views_count = views_count + 1
WHERE user_id = NEW.viewed_id;
RETURN NEW;
END;
$$;


--
-- Name: update_conversation_last_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_last_message() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
UPDATE public.conversations
SET last_message_at = NOW()
WHERE id = NEW.conversation_id;
RETURN NEW;
END;
$$;


--
-- Name: update_favorites_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_favorites_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF
TG_OP = 'INSERT' THEN
UPDATE public.profiles
SET favorites_count = favorites_count + 1
WHERE user_id = NEW.favorited_user_id;
ELSIF
TG_OP = 'DELETE' THEN
UPDATE public.profiles
SET favorites_count = favorites_count - 1
WHERE user_id = OLD.favorited_user_id;
END IF;
RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at
= NOW();
RETURN NEW;
END;
$$;


SET
default_table_access_method = heap;

--
-- Name: album_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.album_photos
(
    id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
    album_id    uuid                                               NOT NULL,
    user_id     uuid                                               NOT NULL,
    url         text                                               NOT NULL,
    caption     text,
    order_index integer                  DEFAULT 0,
    created_at  timestamp with time zone DEFAULT now()
);


--
-- Name: albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.albums
(
    id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id     uuid                                               NOT NULL,
    name        text                                               NOT NULL,
    description text,
    cover_url   text,
    is_private  boolean                  DEFAULT false,
    created_at  timestamp with time zone DEFAULT now(),
    updated_at  timestamp with time zone DEFAULT now()
);


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocks
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    blocker_id uuid                                               NOT NULL,
    blocked_id uuid                                               NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings
(
    id                uuid                     DEFAULT gen_random_uuid() NOT NULL,
    seeker_id         uuid                                               NOT NULL,
    provider_id       uuid                                               NOT NULL,
    booking_date      date                                               NOT NULL,
    start_time        time without time zone NOT NULL,
    duration_hours    integer                  DEFAULT 1                 NOT NULL,
    location          text,
    notes             text,
    status            text                     DEFAULT 'pending'::text,
    total_amount      numeric(10, 2),
    payment_status    text                     DEFAULT 'unpaid'::text,
    stripe_payment_id text,
    created_at        timestamp with time zone DEFAULT now(),
    updated_at        timestamp with time zone DEFAULT now(),
    CONSTRAINT bookings_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'refunded'::text]))),
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text,
                                                           'completed'::text, 'cancelled'::text])))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations
(
    id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
    participant_one uuid                                               NOT NULL,
    participant_two uuid                                               NOT NULL,
    last_message_at timestamp with time zone DEFAULT now(),
    created_at      timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.conversations REPLICA IDENTITY FULL;


--
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_attendees
(
    id        uuid                     DEFAULT gen_random_uuid() NOT NULL,
    event_id  uuid                                               NOT NULL,
    user_id   uuid                                               NOT NULL,
    status    text                     DEFAULT 'pending'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events
(
    id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
    host_id         uuid                                               NOT NULL,
    title           text                                               NOT NULL,
    description     text,
    event_type      text                     DEFAULT 'meetup'::text NOT NULL,
    location        text                                               NOT NULL,
    latitude        double precision,
    longitude       double precision,
    event_date      date                                               NOT NULL,
    start_time      time without time zone NOT NULL,
    end_time        time without time zone,
    max_attendees   integer                  DEFAULT 10,
    is_public       boolean                  DEFAULT true,
    is_premium_only boolean                  DEFAULT false,
    cover_image     text,
    created_at      timestamp with time zone DEFAULT now(),
    updated_at      timestamp with time zone DEFAULT now()
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites
(
    id                uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id           uuid                                               NOT NULL,
    favorited_user_id uuid                                               NOT NULL,
    created_at        timestamp with time zone DEFAULT now()
);


--
-- Name: gdpr_consent_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gdpr_consent_records
(
    id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id         uuid                                               NOT NULL,
    consent_type    text                                               NOT NULL,
    consent_given   boolean                                            NOT NULL,
    ip_address      inet,
    user_agent      text,
    consent_version text                     DEFAULT '1.0'::text,
    given_at        timestamp with time zone DEFAULT now(),
    withdrawn_at    timestamp with time zone,
    CONSTRAINT gdpr_consent_records_consent_type_check CHECK ((consent_type = ANY (ARRAY['essential_cookies'::text,
                                                                                   'analytics_cookies'::text,
                                                                                   'marketing_cookies'::text,
                                                                                   'personalization_cookies'::text,
                                                                                   'data_processing'::text,
                                                                                   'age_verification'::text,
                                                                                   'terms_of_service'::text,
                                                                                   'privacy_policy'::text])))
);


--
-- Name: gdpr_data_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gdpr_data_requests
(
    id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id               uuid                                               NOT NULL,
    request_type          text                                               NOT NULL,
    status                text                     DEFAULT 'pending'::text,
    requested_at          timestamp with time zone DEFAULT now(),
    processed_at          timestamp with time zone,
    processed_by          uuid,
    notes                 text,
    download_url          text,
    download_expires_at   timestamp with time zone,
    scheduled_deletion_at timestamp with time zone,
    CONSTRAINT gdpr_data_requests_request_type_check CHECK ((request_type = ANY (ARRAY['export'::text, 'deletion'::text,
                                                                                 'rectification'::text,
                                                                                 'restriction'::text]))),
    CONSTRAINT gdpr_data_requests_status_check CHECK ((status = ANY
                                                       (ARRAY['pending'::text, 'processing'::text, 'completed'::text,
                                                        'rejected'::text, 'cancelled'::text])))
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_one   uuid                                               NOT NULL,
    user_two   uuid                                               NOT NULL,
    matched_at timestamp with time zone DEFAULT now()
);


--
-- Name: meet_now; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meet_now
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid                                               NOT NULL,
    latitude   double precision                                   NOT NULL,
    longitude  double precision                                   NOT NULL,
    status     text                     DEFAULT 'available'::text NOT NULL,
    message    text,
    expires_at timestamp with time zone                           NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reactions
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid                                               NOT NULL,
    user_id    uuid                                               NOT NULL,
    emoji      text                                               NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages
(
    id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid                                               NOT NULL,
    sender_id       uuid                                               NOT NULL,
    content         text                                               NOT NULL,
    message_type    text                     DEFAULT 'text'::text,
    media_url       text,
    is_read         boolean                  DEFAULT false,
    read_at         timestamp with time zone,
    created_at      timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'voice'::text,
                                                                       'booking_request'::text])))
);

ALTER TABLE ONLY public.messages REPLICA IDENTITY FULL;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid                                               NOT NULL,
    type       text                                               NOT NULL,
    title      text                                               NOT NULL,
    body       text,
    is_read    boolean                  DEFAULT false,
    data       jsonb                    DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK ((type = ANY
                                                (ARRAY['message'::text, 'booking'::text, 'favorite'::text, 'view'::text,
                                                 'system'::text])))
);

ALTER TABLE ONLY public.notifications REPLICA IDENTITY FULL;


--
-- Name: parties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parties
(
    id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
    host_id     uuid                                               NOT NULL,
    title       text                                               NOT NULL,
    description text,
    party_type  text                     DEFAULT 'private'::text NOT NULL,
    location    text                                               NOT NULL,
    latitude    double precision                                   NOT NULL,
    longitude   double precision                                   NOT NULL,
    start_time  timestamp with time zone                           NOT NULL,
    end_time    timestamp with time zone,
    max_guests  integer                  DEFAULT 20,
    dress_code  text,
    is_active   boolean                  DEFAULT true,
    cover_image text,
    created_at  timestamp with time zone DEFAULT now(),
    updated_at  timestamp with time zone DEFAULT now()
);


--
-- Name: party_rsvps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.party_rsvps
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    party_id   uuid                                               NOT NULL,
    user_id    uuid                                               NOT NULL,
    status     text                     DEFAULT 'pending'::text NOT NULL,
    message    text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profile_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_photos
(
    id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id     uuid                                               NOT NULL,
    url         text                                               NOT NULL,
    is_primary  boolean                  DEFAULT false,
    order_index integer                  DEFAULT 0,
    created_at  timestamp with time zone DEFAULT now()
);


--
-- Name: profile_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_views
(
    id        uuid                     DEFAULT gen_random_uuid() NOT NULL,
    viewer_id uuid                                               NOT NULL,
    viewed_id uuid                                               NOT NULL,
    viewed_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles
(
    id                            uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id                       uuid                                               NOT NULL,
    display_name                  text,
    bio                           text,
    avatar_url                    text,
    age                           integer,
    height                        integer,
    weight                        integer,
    city                          text,
    country                       text,
    latitude                      double precision,
    longitude                     double precision,
    tribes                        text[] DEFAULT '{}'::text[],
    interests                     text[] DEFAULT '{}'::text[],
    looking_for                   text[] DEFAULT '{}'::text[],
    is_verified                   boolean                  DEFAULT false,
    is_online                     boolean                  DEFAULT false,
    last_seen                     timestamp with time zone DEFAULT now(),
    hourly_rate                   numeric(10, 2),
    is_available_now              boolean                  DEFAULT false,
    views_count                   integer                  DEFAULT 0,
    favorites_count               integer                  DEFAULT 0,
    rating                        numeric(2, 1)            DEFAULT 0.0,
    created_at                    timestamp with time zone DEFAULT now(),
    updated_at                    timestamp with time zone DEFAULT now(),
    date_of_birth                 date,
    age_verified                  boolean                  DEFAULT false,
    age_verified_at               timestamp with time zone,
    id_verified                   boolean                  DEFAULT false,
    id_verified_at                timestamp with time zone,
    photo_verified                boolean                  DEFAULT false,
    photo_verified_at             timestamp with time zone,
    phone_verified                boolean                  DEFAULT false,
    phone_verified_at             timestamp with time zone,
    gdpr_consent_date             timestamp with time zone,
    marketing_consent             boolean                  DEFAULT false,
    data_processing_consent       boolean                  DEFAULT false,
    account_deletion_requested_at timestamp with time zone,
    CONSTRAINT profiles_age_check CHECK (((age >= 18) AND (age <= 99)))
);

ALTER TABLE ONLY public.profiles REPLICA IDENTITY FULL;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid                                               NOT NULL,
    endpoint   text                                               NOT NULL,
    p256dh     text                                               NOT NULL,
    auth_key   text                                               NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports
(
    id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid                                               NOT NULL,
    reported_id uuid                                               NOT NULL,
    reason      text                                               NOT NULL,
    details     text,
    status      text                     DEFAULT 'pending'::text,
    created_at  timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles
(
    id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid                                               NOT NULL,
    role public.app_role DEFAULT 'seeker'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions
(
    id                     uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id                uuid                                               NOT NULL,
    stripe_customer_id     text,
    stripe_subscription_id text,
    plan_id                text                     DEFAULT 'free'::text NOT NULL,
    status                 text                     DEFAULT 'active'::text NOT NULL,
    current_period_start   timestamp with time zone,
    current_period_end     timestamp with time zone,
    created_at             timestamp with time zone DEFAULT now(),
    updated_at             timestamp with time zone DEFAULT now()
);


--
-- Name: verification_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_documents
(
    id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
    request_id    uuid                                               NOT NULL,
    document_type text                                               NOT NULL,
    storage_path  text                                               NOT NULL,
    uploaded_at   timestamp with time zone DEFAULT now(),
    deleted_at    timestamp with time zone,
    CONSTRAINT verification_documents_document_type_check CHECK ((document_type = ANY
                                                                  (ARRAY['selfie'::text, 'id_front'::text,
                                                                   'id_back'::text, 'video'::text, 'pose_photo'::text])))
);


--
-- Name: verification_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_requests
(
    id                uuid                     DEFAULT gen_random_uuid() NOT NULL,
    user_id           uuid                                               NOT NULL,
    verification_type text                                               NOT NULL,
    status            text                     DEFAULT 'pending'::text,
    submitted_at      timestamp with time zone DEFAULT now(),
    reviewed_at       timestamp with time zone,
    reviewer_id       uuid,
    reviewer_notes    text,
    expires_at        timestamp with time zone,
    metadata          jsonb                    DEFAULT '{}'::jsonb,
    created_at        timestamp with time zone DEFAULT now(),
    CONSTRAINT verification_requests_status_check CHECK ((status = ANY
                                                          (ARRAY['pending'::text, 'approved'::text, 'rejected'::text,
                                                           'expired'::text]))),
    CONSTRAINT verification_requests_verification_type_check CHECK ((verification_type = ANY
                                                                     (ARRAY['age'::text, 'photo'::text, 'id'::text,
                                                                      'video'::text, 'phone'::text])))
);


--
-- Name: album_photos album_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.album_photos
    ADD CONSTRAINT album_photos_pkey PRIMARY KEY (id);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_blocker_id_blocked_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_participant_one_participant_two_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant_one_participant_two_key UNIQUE (participant_one, participant_two);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: event_attendees event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_favorited_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_favorited_user_id_key UNIQUE (user_id, favorited_user_id);


--
-- Name: gdpr_consent_records gdpr_consent_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gdpr_consent_records
    ADD CONSTRAINT gdpr_consent_records_pkey PRIMARY KEY (id);


--
-- Name: gdpr_data_requests gdpr_data_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gdpr_data_requests
    ADD CONSTRAINT gdpr_data_requests_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: matches matches_user_one_user_two_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_user_one_user_two_key UNIQUE (user_one, user_two);


--
-- Name: meet_now meet_now_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meet_now
    ADD CONSTRAINT meet_now_pkey PRIMARY KEY (id);


--
-- Name: meet_now meet_now_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meet_now
    ADD CONSTRAINT meet_now_user_id_key UNIQUE (user_id);


--
-- Name: message_reactions message_reactions_message_id_user_id_emoji_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_user_id_emoji_key UNIQUE (message_id, user_id, emoji);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parties parties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_pkey PRIMARY KEY (id);


--
-- Name: party_rsvps party_rsvps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party_rsvps
    ADD CONSTRAINT party_rsvps_pkey PRIMARY KEY (id);


--
-- Name: profile_photos profile_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_photos
    ADD CONSTRAINT profile_photos_pkey PRIMARY KEY (id);


--
-- Name: profile_views profile_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_user_id_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: verification_documents verification_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_documents
    ADD CONSTRAINT verification_documents_pkey PRIMARY KEY (id);


--
-- Name: verification_requests verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_pkey PRIMARY KEY (id);


--
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- Name: idx_events_host; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_host ON public.events USING btree (host_id);


--
-- Name: idx_events_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_location ON public.events USING btree (latitude, longitude);


--
-- Name: idx_meet_now_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meet_now_expires ON public.meet_now USING btree (expires_at);


--
-- Name: idx_meet_now_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meet_now_location ON public.meet_now USING btree (latitude, longitude);


--
-- Name: idx_parties_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parties_active ON public.parties USING btree (is_active);


--
-- Name: idx_parties_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parties_location ON public.parties USING btree (latitude, longitude);


--
-- Name: favorites on_favorite_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_favorite_change
    AFTER INSERT OR DELETE ON public.favorites FOR EACH ROW
EXECUTE FUNCTION public.update_favorites_count();


--
-- Name: favorites on_favorite_check_match; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_favorite_check_match
    AFTER INSERT
    ON public.favorites
    FOR EACH ROW EXECUTE FUNCTION public.check_mutual_match();


--
-- Name: messages on_new_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_new_message
    AFTER INSERT
    ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();


--
-- Name: profile_views on_profile_view; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_view
    AFTER INSERT
    ON public.profile_views
    FOR EACH ROW EXECUTE FUNCTION public.increment_profile_views();


--
-- Name: albums update_albums_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE
    ON public.albums
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE
    ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE
    ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: user_subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE
    ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: album_photos album_photos_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.album_photos
    ADD CONSTRAINT album_photos_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON
DELETE
CASCADE;


--
-- Name: bookings bookings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: bookings bookings_seeker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_seeker_id_fkey FOREIGN KEY (seeker_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: conversations conversations_participant_one_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant_one_fkey FOREIGN KEY (participant_one) REFERENCES public.profiles(user_id) ON
DELETE
CASCADE;


--
-- Name: conversations conversations_participant_two_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant_two_fkey FOREIGN KEY (participant_two) REFERENCES public.profiles(user_id) ON
DELETE
CASCADE;


--
-- Name: event_attendees event_attendees_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON
DELETE
CASCADE;


--
-- Name: favorites favorites_favorited_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_favorited_user_id_fkey FOREIGN KEY (favorited_user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: gdpr_consent_records gdpr_consent_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gdpr_consent_records
    ADD CONSTRAINT gdpr_consent_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: gdpr_data_requests gdpr_data_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gdpr_data_requests
    ADD CONSTRAINT gdpr_data_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: message_reactions message_reactions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON
DELETE
CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON
DELETE
CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: party_rsvps party_rsvps_party_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party_rsvps
    ADD CONSTRAINT party_rsvps_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id) ON
DELETE
CASCADE;


--
-- Name: profile_views profile_views_viewed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewed_id_fkey FOREIGN KEY (viewed_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: profile_views profile_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: verification_documents verification_documents_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_documents
    ADD CONSTRAINT verification_documents_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.verification_requests(id) ON
DELETE
CASCADE;


--
-- Name: verification_requests verification_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON
DELETE
CASCADE;


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: meet_now Anyone can view meet now users; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Anyone can view meet now users" ON public.meet_now FOR
SELECT USING (true);


--
-- Name: profile_photos Anyone can view profile photos; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Anyone can view profile photos" ON public.profile_photos FOR
SELECT USING (true);


--
-- Name: events Anyone can view public events; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Anyone can view public events" ON public.events FOR
SELECT USING (((is_public = true) OR (host_id = auth.uid())));


--
-- Name: events Authenticated users can create events; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK ((auth.uid() = host_id));


--
-- Name: bookings Booking participants can update; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Booking participants can update" ON public.bookings FOR
UPDATE TO authenticated USING (((auth.uid() = seeker_id) OR (auth.uid() = provider_id)));


--
-- Name: events Hosts can delete their events; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Hosts can delete their events" ON public.events FOR DELETE
USING ((auth.uid() = host_id));


--
-- Name: parties Hosts can delete their parties; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Hosts can delete their parties" ON public.parties FOR DELETE
USING ((auth.uid() = host_id));


--
-- Name: events Hosts can update their events; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Hosts can update their events" ON public.events FOR
UPDATE USING ((auth.uid() = host_id));


--
-- Name: parties Hosts can update their parties; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Hosts can update their parties" ON public.parties FOR
UPDATE USING ((auth.uid() = host_id));


--
-- Name: party_rsvps Hosts can view RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Hosts can view RSVPs" ON public.party_rsvps FOR
SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
    FROM public.parties p
    WHERE ((p.id = party_rsvps.party_id) AND (p.host_id = auth.uid()))))));


--
-- Name: profiles Profiles are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR
SELECT TO authenticated USING (true);


--
-- Name: bookings Seekers can create bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Seekers can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK ((auth.uid() = seeker_id));


--
-- Name: party_rsvps Users can RSVP to parties; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can RSVP to parties" ON public.party_rsvps FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: favorites Users can add favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can add favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: message_reactions Users can add reactions to messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can add reactions to messages in their conversations" ON public.message_reactions FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (public.messages m
     JOIN public.conversations c ON ((m.conversation_id = c.id)))
  WHERE ((m.id = message_reactions.message_id) AND ((c.participant_one = auth.uid()) OR (c.participant_two = auth.uid())))))));


--
-- Name: gdpr_data_requests Users can cancel their pending requests; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can cancel their pending requests" ON public.gdpr_data_requests FOR
UPDATE USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: conversations Users can create conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (((auth.uid() = participant_one) OR (auth.uid() = participant_two)));


--
-- Name: reports Users can create reports; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK ((auth.uid() = reporter_id));


--
-- Name: gdpr_consent_records Users can create their own consent records; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can create their own consent records" ON public.gdpr_consent_records FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: gdpr_data_requests Users can create their own data requests; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can create their own data requests" ON public.gdpr_data_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: verification_requests Users can create their own verification requests; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can create their own verification requests" ON public.verification_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: parties Users can host parties; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can host parties" ON public.parties FOR INSERT WITH CHECK ((auth.uid() = host_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: event_attendees Users can join events; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can join events" ON public.event_attendees FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: event_attendees Users can leave events; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can leave events" ON public.event_attendees FOR DELETE
USING ((auth.uid() = user_id));


--
-- Name: album_photos Users can manage photos in their albums; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can manage photos in their albums" ON public.album_photos USING ((auth.uid() = user_id));


--
-- Name: blocks Users can manage their blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can manage their blocks" ON public.blocks USING ((auth.uid() = blocker_id));


--
-- Name: albums Users can manage their own albums; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can manage their own albums" ON public.albums USING ((auth.uid() = user_id));


--
-- Name: profile_photos Users can manage their own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can manage their own photos" ON public.profile_photos USING ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can manage their own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions USING ((auth.uid() = user_id));


--
-- Name: profile_views Users can record views; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can record views" ON public.profile_views FOR INSERT TO authenticated WITH CHECK ((auth.uid() = viewer_id));


--
-- Name: favorites Users can remove their favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can remove their favorites" ON public.favorites FOR DELETE
TO authenticated USING ((auth.uid() = user_id));


--
-- Name: meet_now Users can remove their location; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can remove their location" ON public.meet_now FOR DELETE
USING ((auth.uid() = user_id));


--
-- Name: message_reactions Users can remove their own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can remove their own reactions" ON public.message_reactions FOR DELETE
USING ((auth.uid() = user_id));


--
-- Name: messages Users can send messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can send messages in their conversations" ON public.messages FOR INSERT TO authenticated WITH CHECK (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.participant_one = auth.uid()) OR (c.participant_two = auth.uid())))))));


--
-- Name: meet_now Users can share their location; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can share their location" ON public.meet_now FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: event_attendees Users can update their attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their attendance" ON public.event_attendees FOR
UPDATE USING ((auth.uid() = user_id));


--
-- Name: meet_now Users can update their location; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their location" ON public.meet_now FOR
UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their notifications" ON public.notifications FOR
UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: gdpr_consent_records Users can update their own consent records; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their own consent records" ON public.gdpr_consent_records FOR
UPDATE USING ((auth.uid() = user_id));


--
-- Name: messages Users can update their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their own messages" ON public.messages FOR
UPDATE TO authenticated USING ((sender_id = auth.uid()));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: verification_requests Users can update their pending requests; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can update their pending requests" ON public.verification_requests FOR
UPDATE USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: verification_documents Users can upload their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can upload their own documents" ON public.verification_documents FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.verification_requests vr
  WHERE ((vr.id = verification_documents.request_id) AND (vr.user_id = auth.uid())))));


--
-- Name: parties Users can view active parties; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view active parties" ON public.parties FOR
SELECT USING (((is_active = true) OR (host_id = auth.uid())));


--
-- Name: event_attendees Users can view attendees of events they're part of; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view attendees of events they're part of" ON public.event_attendees FOR
SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
    FROM public.events e
    WHERE ((e.id = event_attendees.event_id) AND (e.host_id = auth.uid()))))));


--
-- Name: messages Users can view messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view messages in their conversations" ON public.messages FOR
SELECT TO authenticated USING ((EXISTS ( SELECT 1
    FROM public.conversations c
    WHERE ((c.id = messages.conversation_id) AND ((c.participant_one = auth.uid()) OR (c.participant_two = auth.uid()))))));


--
-- Name: album_photos Users can view photos in accessible albums; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view photos in accessible albums" ON public.album_photos FOR
SELECT USING ((EXISTS ( SELECT 1
    FROM public.albums a
    WHERE ((a.id = album_photos.album_id) AND ((a.is_private = false) OR (a.user_id = auth.uid()))))));


--
-- Name: albums Users can view public albums; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view public albums" ON public.albums FOR
SELECT USING (((is_private = false) OR (auth.uid() = user_id)));


--
-- Name: message_reactions Users can view reactions in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view reactions in their conversations" ON public.message_reactions FOR
SELECT USING ((EXISTS ( SELECT 1
    FROM (public.messages m
    JOIN public.conversations c ON ((m.conversation_id = c.id)))
    WHERE ((m.id = message_reactions.message_id) AND ((c.participant_one = auth.uid()) OR (c.participant_two = auth.uid()))))));


--
-- Name: bookings Users can view their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their bookings" ON public.bookings FOR
SELECT TO authenticated USING (((auth.uid() = seeker_id) OR (auth.uid() = provider_id)));


--
-- Name: conversations Users can view their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their conversations" ON public.conversations FOR
SELECT TO authenticated USING (((auth.uid() = participant_one) OR (auth.uid() = participant_two)));


--
-- Name: favorites Users can view their favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their favorites" ON public.favorites FOR
SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: matches Users can view their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their matches" ON public.matches FOR
SELECT USING (((auth.uid() = user_one) OR (auth.uid() = user_two)));


--
-- Name: notifications Users can view their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their notifications" ON public.notifications FOR
SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: gdpr_consent_records Users can view their own consent records; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own consent records" ON public.gdpr_consent_records FOR
SELECT USING ((auth.uid() = user_id));


--
-- Name: gdpr_data_requests Users can view their own data requests; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own data requests" ON public.gdpr_data_requests FOR
SELECT USING ((auth.uid() = user_id));


--
-- Name: verification_documents Users can view their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own documents" ON public.verification_documents FOR
SELECT USING ((EXISTS ( SELECT 1
    FROM public.verification_requests vr
    WHERE ((vr.id = verification_documents.request_id) AND (vr.user_id = auth.uid())))));


--
-- Name: reports Users can view their own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own reports" ON public.reports FOR
SELECT USING ((auth.uid() = reporter_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own roles" ON public.user_roles FOR
SELECT USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can view their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own subscription" ON public.user_subscriptions FOR
SELECT USING ((auth.uid() = user_id));


--
-- Name: verification_requests Users can view their own verification requests; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view their own verification requests" ON public.verification_requests FOR
SELECT USING ((auth.uid() = user_id));


--
-- Name: profile_views Users can view who viewed them; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users can view who viewed them" ON public.profile_views FOR
SELECT TO authenticated USING ((auth.uid() = viewed_id));


--
-- Name: party_rsvps Users or hosts can update RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE
POLICY "Users or hosts can update RSVPs" ON public.party_rsvps FOR
UPDATE USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
    FROM public.parties p
    WHERE ((p.id = party_rsvps.party_id) AND (p.host_id = auth.uid()))))));


--
-- Name: album_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: albums; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

--
-- Name: blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: event_attendees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: gdpr_consent_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gdpr_consent_records ENABLE ROW LEVEL SECURITY;

--
-- Name: gdpr_data_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gdpr_data_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

--
-- Name: meet_now; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meet_now ENABLE ROW LEVEL SECURITY;

--
-- Name: message_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: parties; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

--
-- Name: party_rsvps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.party_rsvps ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


COMMIT;