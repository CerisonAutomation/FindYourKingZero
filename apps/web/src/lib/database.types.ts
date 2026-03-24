// ═══════════════════════════════════════════════════════════════
// Database types — auto-generated from Supabase schema
// Run: npx supabase gen types types-only --local > src/lib/database.types.ts
// ═══════════════════════════════════════════════════════════════

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          bio: string | null;
          age: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          body_type: string | null;
          position: string | null;
          hiv_status: string | null;
          last_tested_at: string | null;
          on_prep: boolean | null;
          practices: string[] | null;
          tribes: string[] | null;
          looking_for: string[] | null;
          kinks: string[] | null;
          meet_places: string[] | null;
          body_hair: string | null;
          ethnicity: string | null;
          relationship_status: string | null;
          languages: string[] | null;
          photo_url: string | null;
          verified: boolean | null;
          premium: boolean | null;
          online_status: string | null;
          last_seen_at: string | null;
          available_now: boolean | null;
          incognito: boolean | null;
          coarse_lat: number | null;
          coarse_lng: number | null;
          geohash: string | null;
          onboarding_completed: boolean | null;
          is_active: boolean | null;
          is_banned: boolean | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          thumbnail_url: string | null;
          is_private: boolean | null;
          is_ephemeral: boolean | null;
          view_limit: number | null;
          view_count: number | null;
          caption: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['photos']['Row']>;
        Update: Partial<Database['public']['Tables']['photos']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content_encrypted: string | null;
          message_type: string | null;
          delivered: boolean | null;
          read_at: string | null;
          recalled: boolean | null;
          created_at: string | null;
          edited_at: string | null;
          is_deleted: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      conversations: {
        Row: {
          id: string;
          participant_a: string;
          participant_b: string;
          last_message_at: string | null;
          unread_a: number | null;
          unread_b: number | null;
          deleted_a: boolean | null;
          deleted_b: boolean | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['conversations']['Row']>;
        Update: Partial<Database['public']['Tables']['conversations']['Row']>;
      };
      albums: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          cover_url: string | null;
          is_private: boolean | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['albums']['Row']>;
        Update: Partial<Database['public']['Tables']['albums']['Row']>;
      };
      album_photos: {
        Row: {
          id: string;
          album_id: string | null;
          photo_url: string;
          caption: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['album_photos']['Row']>;
        Update: Partial<Database['public']['Tables']['album_photos']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
