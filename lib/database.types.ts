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
          email: string
          full_name: string
          date_of_birth: string | null
          phone_number: string | null
          profile_photo: string | null
          savings_goals: string[] | null
          target_amount: number | null
          target_date: string | null
          notifications_tax_year_reminders: boolean
          notifications_contribution_streaks: boolean
          notifications_educational_tips: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          date_of_birth?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          savings_goals?: string[] | null
          target_amount?: number | null
          target_date?: string | null
          notifications_tax_year_reminders?: boolean
          notifications_contribution_streaks?: boolean
          notifications_educational_tips?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          date_of_birth?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          savings_goals?: string[] | null
          target_amount?: number | null
          target_date?: string | null
          notifications_tax_year_reminders?: boolean
          notifications_contribution_streaks?: boolean
          notifications_educational_tips?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contributions: {
        Row: {
          id: string
          user_id: string
          isa_type: 'cash' | 'stocks_shares' | 'lifetime' | 'innovative_finance'
          provider: string
          amount: number
          /** ISO date string in YYYY-MM-DD format (PostgreSQL date column) */
          date: string
          withdrawn: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          isa_type: 'cash' | 'stocks_shares' | 'lifetime' | 'innovative_finance'
          provider: string
          amount: number
          /** YYYY-MM-DD format required */
          date: string
          withdrawn?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          isa_type?: 'cash' | 'stocks_shares' | 'lifetime' | 'innovative_finance'
          provider?: string
          amount?: number
          /** YYYY-MM-DD format required */
          date?: string
          withdrawn?: boolean
          created_at?: string
          updated_at?: string
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
