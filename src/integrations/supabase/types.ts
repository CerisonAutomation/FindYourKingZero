export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_typing_responses: {
        Row: {
          context: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          suggested_reply: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          suggested_reply: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          suggested_reply?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_typing_responses_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_typing_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      album_photos: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string | null
          id: string
          photo_url: string
          sort_order: number | null
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          photo_url: string
          sort_order?: number | null
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          cover_url: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          listing_id: string | null
          status: string | null
          total_price: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          listing_id?: string | null
          status?: string | null
          total_price?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          listing_id?: string | null
          status?: string | null
          total_price?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          deleted_a: boolean | null
          deleted_b: boolean | null
          id: string
          last_message_at: string | null
          participant_a: string
          participant_b: string
          unread_a: number | null
          unread_b: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_a?: boolean | null
          deleted_b?: boolean | null
          id?: string
          last_message_at?: string | null
          participant_a: string
          participant_b: string
          unread_a?: number | null
          unread_b?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_a?: boolean | null
          deleted_b?: boolean | null
          id?: string
          last_message_at?: string | null
          participant_a?: string
          participant_b?: string
          unread_a?: number | null
          unread_b?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_a_fkey"
            columns: ["participant_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_b_fkey"
            columns: ["participant_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          joined_at: string | null
          rsvp_status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string | null
          rsvp_status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string | null
          rsvp_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          group_id: string | null
          id: string
          is_online: boolean | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          max_attendees: number | null
          organizer_id: string
          starts_at: string
          tags: string[] | null
          title: string
        }
        Insert: {
          attendee_count?: number | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          group_id?: string | null
          id?: string
          is_online?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_attendees?: number | null
          organizer_id: string
          starts_at: string
          tags?: string[] | null
          title: string
        }
        Update: {
          attendee_count?: number | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          group_id?: string | null
          id?: string
          is_online?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_attendees?: number | null
          organizer_id?: string
          starts_at?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
          owner_id: string
          photo_url: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
          owner_id: string
          photo_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          owner_id?: string
          photo_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_shares: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          lat: number | null
          lng: number | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_shares_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          template_text: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          template_text: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          template_text?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content_encrypted: string | null
          conversation_id: string
          created_at: string | null
          delivered: boolean | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          message_type: string | null
          read_at: string | null
          recalled: boolean | null
          sender_id: string
        }
        Insert: {
          content_encrypted?: string | null
          conversation_id: string
          created_at?: string | null
          delivered?: boolean | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recalled?: boolean | null
          sender_id: string
        }
        Update: {
          content_encrypted?: string | null
          conversation_id?: string
          created_at?: string | null
          delivered?: boolean | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recalled?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_ephemeral: boolean | null
          is_private: boolean | null
          sort_order: number | null
          thumbnail_url: string | null
          url: string
          user_id: string
          view_count: number | null
          view_limit: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_ephemeral?: boolean | null
          is_private?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string | null
          url: string
          user_id: string
          view_count?: number | null
          view_limit?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_ephemeral?: boolean | null
          is_private?: boolean | null
          sort_order?: number | null
          thumbnail_url?: string | null
          url?: string
          user_id?: string
          view_count?: number | null
          view_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_cells: {
        Row: {
          geohash: string
          id: string
          last_heartbeat: string | null
          meet_now: boolean | null
          status: string | null
          user_id: string
        }
        Insert: {
          geohash: string
          id?: string
          last_heartbeat?: string | null
          meet_now?: boolean | null
          status?: string | null
          user_id: string
        }
        Update: {
          geohash?: string
          id?: string
          last_heartbeat?: string | null
          meet_now?: boolean | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_cells_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string | null
          id: string
          viewed_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          viewed_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          viewed_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          available_now: boolean | null
          bio: string | null
          bio_extended: string | null
          body_hair: string | null
          body_type: string | null
          boost_expires_at: string | null
          coarse_lat: number | null
          coarse_lng: number | null
          created_at: string | null
          display_name: string
          ethnicity: string | null
          geohash: string | null
          handle: string
          height_cm: number | null
          hide_distance: boolean | null
          hide_photos_offline: boolean | null
          hide_visits: boolean | null
          hiv_status: string | null
          id: string
          incognito: boolean | null
          is_active: boolean | null
          is_banned: boolean | null
          kinks: string[] | null
          languages: string[] | null
          last_active_at: string | null
          last_seen_at: string | null
          last_tested_at: string | null
          looking_for: string[] | null
          meet_places: string[] | null
          on_prep: boolean | null
          onboarding_completed: boolean | null
          online_status: string | null
          photo_url: string | null
          position: string | null
          practices: string[] | null
          premium: boolean | null
          read_without_receipt: boolean | null
          relationship_status: string | null
          show_age: boolean | null
          social_links: Json | null
          stats: Json | null
          travel_city: string | null
          travel_lat: number | null
          travel_lng: number | null
          travel_mode: boolean | null
          travel_mode_active: boolean | null
          travel_until: string | null
          tribes: string[] | null
          updated_at: string | null
          verified: boolean | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          available_now?: boolean | null
          bio?: string | null
          bio_extended?: string | null
          body_hair?: string | null
          body_type?: string | null
          boost_expires_at?: string | null
          coarse_lat?: number | null
          coarse_lng?: number | null
          created_at?: string | null
          display_name?: string
          ethnicity?: string | null
          geohash?: string | null
          handle: string
          height_cm?: number | null
          hide_distance?: boolean | null
          hide_photos_offline?: boolean | null
          hide_visits?: boolean | null
          hiv_status?: string | null
          id: string
          incognito?: boolean | null
          is_active?: boolean | null
          is_banned?: boolean | null
          kinks?: string[] | null
          languages?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          last_tested_at?: string | null
          looking_for?: string[] | null
          meet_places?: string[] | null
          on_prep?: boolean | null
          onboarding_completed?: boolean | null
          online_status?: string | null
          photo_url?: string | null
          position?: string | null
          practices?: string[] | null
          premium?: boolean | null
          read_without_receipt?: boolean | null
          relationship_status?: string | null
          show_age?: boolean | null
          social_links?: Json | null
          stats?: Json | null
          travel_city?: string | null
          travel_lat?: number | null
          travel_lng?: number | null
          travel_mode?: boolean | null
          travel_mode_active?: boolean | null
          travel_until?: string | null
          tribes?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          available_now?: boolean | null
          bio?: string | null
          bio_extended?: string | null
          body_hair?: string | null
          body_type?: string | null
          boost_expires_at?: string | null
          coarse_lat?: number | null
          coarse_lng?: number | null
          created_at?: string | null
          display_name?: string
          ethnicity?: string | null
          geohash?: string | null
          handle?: string
          height_cm?: number | null
          hide_distance?: boolean | null
          hide_photos_offline?: boolean | null
          hide_visits?: boolean | null
          hiv_status?: string | null
          id?: string
          incognito?: boolean | null
          is_active?: boolean | null
          is_banned?: boolean | null
          kinks?: string[] | null
          languages?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          last_tested_at?: string | null
          looking_for?: string[] | null
          meet_places?: string[] | null
          on_prep?: boolean | null
          onboarding_completed?: boolean | null
          online_status?: string | null
          photo_url?: string | null
          position?: string | null
          practices?: string[] | null
          premium?: boolean | null
          read_without_receipt?: boolean | null
          relationship_status?: string | null
          show_age?: boolean | null
          social_links?: Json | null
          stats?: Json | null
          travel_city?: string | null
          travel_lat?: number | null
          travel_lng?: number | null
          travel_mode?: boolean | null
          travel_mode_active?: boolean | null
          travel_until?: string | null
          tribes?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quickshare_albums: {
        Row: {
          created_at: string | null
          expires_at: string | null
          files: Json
          id: string
          receiver_id: string | null
          room_id: string | null
          sender_id: string | null
          viewed: boolean | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          files?: Json
          id?: string
          receiver_id?: string | null
          room_id?: string | null
          sender_id?: string | null
          viewed?: boolean | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          files?: Json
          id?: string
          receiver_id?: string | null
          room_id?: string | null
          sender_id?: string | null
          viewed?: boolean | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quickshare_albums_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quickshare_albums_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      super_favorites: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          priority: number | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "super_favorites_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      taps: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          mutual: boolean | null
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          mutual?: boolean | null
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          mutual?: boolean | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taps_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taps_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_mode: {
        Row: {
          arrival_date: string | null
          created_at: string | null
          departure_date: string | null
          destination_lat: number | null
          destination_lng: number | null
          destination_name: string | null
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        Insert: {
          arrival_date?: string | null
          created_at?: string | null
          departure_date?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_name?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Update: {
          arrival_date?: string | null
          created_at?: string | null
          departure_date?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_name?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_mode_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_kinks: {
        Row: {
          created_at: string | null
          id: string
          is_limit: boolean | null
          kink: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_limit?: boolean | null
          kink: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_limit?: boolean | null
          kink?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_kinks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string | null
          id: string
          visited_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          visited_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          visited_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_visited_id_fkey"
            columns: ["visited_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_commands: {
        Row: {
          ai_model_used: string | null
          command_text: string
          confidence: number | null
          executed_at: string | null
          id: string
          parameters: Json | null
          parsed_action: string
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          ai_model_used?: string | null
          command_text: string
          confidence?: number | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          parsed_action: string
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          ai_model_used?: string | null
          command_text?: string
          confidence?: number | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          parsed_action?: string
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_nearby_profiles: {
        Args: { p_lat: number; p_lng: number; p_radius_km?: number }
        Returns: {
          age: number
          display_name: string
          distance_km: number
          id: string
          lat: number
          lng: number
          photo_url: string
          premium: boolean
          verified: boolean
        }[]
      }
      get_or_create_conversation: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      get_quickshare_sign: { Args: never; Returns: Json }
      increment_profile_views: {
        Args: { target_id: string }
        Returns: undefined
      }
      increment_taps_received: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      mark_messages_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

