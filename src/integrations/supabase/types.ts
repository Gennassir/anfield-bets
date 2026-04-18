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
      bet_selections: {
        Row: {
          bet_id: string
          created_at: string
          id: string
          market: string
          match_id: number
          odds: number
          pick: string
          status: string
        }
        Insert: {
          bet_id: string
          created_at?: string
          id?: string
          market: string
          match_id: number
          odds: number
          pick: string
          status?: string
        }
        Update: {
          bet_id?: string
          created_at?: string
          id?: string
          market?: string
          match_id?: number
          odds?: number
          pick?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_selections_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_selections_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          bet_type: string
          created_at: string
          id: string
          odds: number | null
          potential_payout: number
          predicted_points: number | null
          settled_at: string | null
          stake: number
          status: string
          team: string | null
          total_odds: number | null
          user_id: string
        }
        Insert: {
          bet_type?: string
          created_at?: string
          id?: string
          odds?: number | null
          potential_payout: number
          predicted_points?: number | null
          settled_at?: string | null
          stake: number
          status?: string
          team?: string | null
          total_odds?: number | null
          user_id: string
        }
        Update: {
          bet_type?: string
          created_at?: string
          id?: string
          odds?: number | null
          potential_payout?: number
          predicted_points?: number | null
          settled_at?: string | null
          stake?: number
          status?: string
          team?: string | null
          total_odds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      bonuses: {
        Row: {
          active: boolean
          amount: number
          bonus_type: string
          code: string
          created_at: string
          description: string | null
          id: string
          max_claims_per_user: number
          min_deposit: number
          percentage: number | null
          title: string
        }
        Insert: {
          active?: boolean
          amount?: number
          bonus_type: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          max_claims_per_user?: number
          min_deposit?: number
          percentage?: number | null
          title: string
        }
        Update: {
          active?: boolean
          amount?: number
          bonus_type?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          max_claims_per_user?: number
          min_deposit?: number
          percentage?: number | null
          title?: string
        }
        Relationships: []
      }
      jackpot_tickets: {
        Row: {
          created_at: string
          id: string
          source: string
          ticket_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source?: string
          ticket_number: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source?: string
          ticket_number?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          points: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          points?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          points?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_crest: string | null
          away_score: number | null
          away_team: string
          home_crest: string | null
          home_score: number | null
          home_team: string
          id: number
          kickoff: string
          odds_away: number
          odds_btts_no: number
          odds_btts_yes: number
          odds_draw: number
          odds_home: number
          odds_over25: number
          odds_under25: number
          status: string
          updated_at: string
        }
        Insert: {
          away_crest?: string | null
          away_score?: number | null
          away_team: string
          home_crest?: string | null
          home_score?: number | null
          home_team: string
          id: number
          kickoff: string
          odds_away?: number
          odds_btts_no?: number
          odds_btts_yes?: number
          odds_draw?: number
          odds_home?: number
          odds_over25?: number
          odds_under25?: number
          status?: string
          updated_at?: string
        }
        Update: {
          away_crest?: string | null
          away_score?: number | null
          away_team?: string
          home_crest?: string | null
          home_score?: number | null
          home_team?: string
          id?: number
          kickoff?: string
          odds_away?: number
          odds_btts_no?: number
          odds_btts_yes?: number
          odds_draw?: number
          odds_home?: number
          odds_over25?: number
          odds_under25?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      stk_requests: {
        Row: {
          amount: number
          checkout_request_id: string | null
          created_at: string
          external_reference: string
          id: string
          mpesa_receipt: string | null
          payhero_reference: string | null
          phone: string
          raw_callback: Json | null
          result_desc: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          checkout_request_id?: string | null
          created_at?: string
          external_reference: string
          id?: string
          mpesa_receipt?: string | null
          payhero_reference?: string | null
          phone: string
          raw_callback?: Json | null
          result_desc?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          checkout_request_id?: string | null
          created_at?: string
          external_reference?: string
          id?: string
          mpesa_receipt?: string | null
          payhero_reference?: string | null
          phone?: string
          raw_callback?: Json | null
          result_desc?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bonuses: {
        Row: {
          amount_credited: number
          bonus_id: string
          claimed_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount_credited?: number
          bonus_id: string
          claimed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_credited?: number
          bonus_id?: string
          claimed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bonuses_bonus_id_fkey"
            columns: ["bonus_id"]
            isOneToOne: false
            referencedRelation: "bonuses"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
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
