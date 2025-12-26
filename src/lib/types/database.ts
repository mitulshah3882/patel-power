export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_emoji: string
          has_completed_onboarding: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_emoji?: string
          has_completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_emoji?: string
          has_completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          note: string | null
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_date: string
          note?: string | null
          logged_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          note?: string | null
          logged_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: string
          earned_at?: string
        }
      }
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
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Workout = Database['public']['Tables']['workouts']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
