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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      body_stats: {
        Row: {
          body_fat_pct: number | null
          id: string
          logged_at: string
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          body_fat_pct?: number | null
          id?: string
          logged_at?: string
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          body_fat_pct?: number | null
          id?: string
          logged_at?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      completed_workouts: {
        Row: {
          completed_at: string
          duration_mins: number
          id: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          completed_at?: string
          duration_mins?: number
          id?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          completed_at?: string
          duration_mins?: number
          id?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_workouts_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_extractions_count: number
          auto_advance_rest: boolean
          best_streak: number
          created_at: string
          default_difficulty: string
          email: string
          fitness_goal: string | null
          id: string
          last_workout_date: string | null
          name: string
          notifications_enabled: boolean
          referred_by: string | null
          reminder_time: string | null
          rest_timer_seconds: number
          streak_count: number
          total_workouts: number
          unlocked_achievements: Json
          updated_at: string
        }
        Insert: {
          ai_extractions_count?: number
          auto_advance_rest?: boolean
          best_streak?: number
          created_at?: string
          default_difficulty?: string
          email?: string
          fitness_goal?: string | null
          id: string
          last_workout_date?: string | null
          name?: string
          notifications_enabled?: boolean
          referred_by?: string | null
          reminder_time?: string | null
          rest_timer_seconds?: number
          streak_count?: number
          total_workouts?: number
          unlocked_achievements?: Json
          updated_at?: string
        }
        Update: {
          ai_extractions_count?: number
          auto_advance_rest?: boolean
          best_streak?: number
          created_at?: string
          default_difficulty?: string
          email?: string
          fitness_goal?: string | null
          id?: string
          last_workout_date?: string | null
          name?: string
          notifications_enabled?: boolean
          referred_by?: string | null
          reminder_time?: string | null
          rest_timer_seconds?: number
          streak_count?: number
          total_workouts?: number
          unlocked_achievements?: Json
          updated_at?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          rest_type: string | null
          user_id: string
          week_start_date: string
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          rest_type?: string | null
          user_id: string
          week_start_date: string
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          rest_type?: string | null
          user_id?: string
          week_start_date?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plans_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          difficulty: string
          duration_mins: number
          exercises: Json
          id: string
          muscle_group: string
          platform: string | null
          thumbnail_url: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          duration_mins?: number
          exercises?: Json
          id?: string
          muscle_group?: string
          platform?: string | null
          thumbnail_url?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          duration_mins?: number
          exercises?: Json
          id?: string
          muscle_group?: string
          platform?: string | null
          thumbnail_url?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
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
