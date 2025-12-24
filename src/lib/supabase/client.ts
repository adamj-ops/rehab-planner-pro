import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a placeholder client for build time or when env vars are missing
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Create a dummy client that will fail gracefully at runtime
  console.warn('Supabase environment variables not set. Database operations will not work.')
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase }

export type Database = {
  public: {
    Tables: {
      rehab_projects: {
        Row: {
          id: string
          user_id: string
          property_id: string | null
          project_name: string
          address_street: string
          address_city: string
          address_state: string
          address_zip: string
          square_feet: number | null
          year_built: number | null
          property_type: string | null
          bedrooms: number | null
          bathrooms: number | null
          investment_strategy: string | null
          target_buyer: string | null
          hold_period_months: number | null
          target_roi: number | null
          max_budget: number | null
          arv: number | null
          purchase_price: number | null
          neighborhood_comp_avg: number | null
          status: string | null
          total_estimated_cost: number | null
          total_actual_cost: number | null
          estimated_days: number | null
          priority_score: number | null
          roi_score: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          property_id?: string | null
          project_name: string
          address_street: string
          address_city: string
          address_state: string
          address_zip: string
          square_feet?: number | null
          year_built?: number | null
          property_type?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          investment_strategy?: string | null
          target_buyer?: string | null
          hold_period_months?: number | null
          target_roi?: number | null
          max_budget?: number | null
          arv?: number | null
          purchase_price?: number | null
          neighborhood_comp_avg?: number | null
          status?: string | null
          total_estimated_cost?: number | null
          total_actual_cost?: number | null
          estimated_days?: number | null
          priority_score?: number | null
          roi_score?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string | null
          project_name?: string
          address_street?: string
          address_city?: string
          address_state?: string
          address_zip?: string
          square_feet?: number | null
          year_built?: number | null
          property_type?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          investment_strategy?: string | null
          target_buyer?: string | null
          hold_period_months?: number | null
          target_roi?: number | null
          max_budget?: number | null
          arv?: number | null
          purchase_price?: number | null
          neighborhood_comp_avg?: number | null
          status?: string | null
          total_estimated_cost?: number | null
          total_actual_cost?: number | null
          estimated_days?: number | null
          priority_score?: number | null
          roi_score?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      property_assessments: {
        Row: {
          id: string
          project_id: string
          room_type: string
          room_name: string | null
          condition: string | null
          components: any | null
          notes: string | null
          photos: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          room_type: string
          room_name?: string | null
          condition?: string | null
          components?: any | null
          notes?: string | null
          photos?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          room_type?: string
          room_name?: string | null
          condition?: string | null
          components?: any | null
          notes?: string | null
          photos?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      rehab_scope_items: {
        Row: {
          id: string
          project_id: string
          category: string
          subcategory: string | null
          item_name: string
          description: string | null
          location: string | null
          quantity: number | null
          unit_of_measure: string | null
          material_cost: number | null
          labor_cost: number | null
          total_cost: number | null
          priority: string | null
          roi_impact: number | null
          days_required: number | null
          depends_on: string[] | null
          phase: number | null
          included: boolean | null
          completed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          category: string
          subcategory?: string | null
          item_name: string
          description?: string | null
          location?: string | null
          quantity?: number | null
          unit_of_measure?: string | null
          material_cost?: number | null
          labor_cost?: number | null
          total_cost?: number | null
          priority?: string | null
          roi_impact?: number | null
          days_required?: number | null
          depends_on?: string[] | null
          phase?: number | null
          included?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          category?: string
          subcategory?: string | null
          item_name?: string
          description?: string | null
          location?: string | null
          quantity?: number | null
          unit_of_measure?: string | null
          material_cost?: number | null
          labor_cost?: number | null
          total_cost?: number | null
          priority?: string | null
          roi_impact?: number | null
          days_required?: number | null
          depends_on?: string[] | null
          phase?: number | null
          included?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      market_comparables: {
        Row: {
          id: string
          project_id: string
          address: string
          sale_price: number
          sale_date: string
          square_feet: number | null
          features: any | null
          distance_miles: number | null
          similarity_score: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          address: string
          sale_price: number
          sale_date: string
          square_feet?: number | null
          features?: any | null
          distance_miles?: number | null
          similarity_score?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          address?: string
          sale_price?: number
          sale_date?: string
          square_feet?: number | null
          features?: any | null
          distance_miles?: number | null
          similarity_score?: number | null
          created_at?: string | null
        }
      }
      rehab_recommendations: {
        Row: {
          id: string
          project_id: string
          type: string | null
          title: string
          description: string
          estimated_cost: number | null
          roi_impact: number | null
          time_impact_days: number | null
          market_data: any | null
          confidence_score: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          type?: string | null
          title: string
          description: string
          estimated_cost?: number | null
          roi_impact?: number | null
          time_impact_days?: number | null
          market_data?: any | null
          confidence_score?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          type?: string | null
          title?: string
          description?: string
          estimated_cost?: number | null
          roi_impact?: number | null
          time_impact_days?: number | null
          market_data?: any | null
          confidence_score?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
