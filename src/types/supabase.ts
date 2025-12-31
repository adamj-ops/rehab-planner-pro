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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      color_library: {
        Row: {
          brand: string
          color_code: string | null
          color_family: string | null
          color_name: string
          created_at: string | null
          design_styles: string[] | null
          finish_options: string[] | null
          hex_code: string
          id: string
          image_url: string | null
          is_active: boolean | null
          lrv: number | null
          popular: boolean | null
          recommended_rooms: string[] | null
          recommended_surfaces: string[] | null
          rgb_values: Json
          undertones: string[] | null
          updated_at: string | null
          year_introduced: number | null
        }
        Insert: {
          brand?: string
          color_code?: string | null
          color_family?: string | null
          color_name: string
          created_at?: string | null
          design_styles?: string[] | null
          finish_options?: string[] | null
          hex_code: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lrv?: number | null
          popular?: boolean | null
          recommended_rooms?: string[] | null
          recommended_surfaces?: string[] | null
          rgb_values: Json
          undertones?: string[] | null
          updated_at?: string | null
          year_introduced?: number | null
        }
        Update: {
          brand?: string
          color_code?: string | null
          color_family?: string | null
          color_name?: string
          created_at?: string | null
          design_styles?: string[] | null
          finish_options?: string[] | null
          hex_code?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lrv?: number | null
          popular?: boolean | null
          recommended_rooms?: string[] | null
          recommended_surfaces?: string[] | null
          rgb_values?: Json
          undertones?: string[] | null
          updated_at?: string | null
          year_introduced?: number | null
        }
        Relationships: []
      }
      color_palettes: {
        Row: {
          accent_color_ids: string[] | null
          created_at: string | null
          created_by_system: boolean | null
          description: string | null
          design_style: string | null
          id: string
          is_trending: boolean | null
          name: string
          price_range: string | null
          primary_color_id: string | null
          recommended_for: string[] | null
          secondary_color_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          accent_color_ids?: string[] | null
          created_at?: string | null
          created_by_system?: boolean | null
          description?: string | null
          design_style?: string | null
          id?: string
          is_trending?: boolean | null
          name: string
          price_range?: string | null
          primary_color_id?: string | null
          recommended_for?: string[] | null
          secondary_color_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          accent_color_ids?: string[] | null
          created_at?: string | null
          created_by_system?: boolean | null
          description?: string | null
          design_style?: string | null
          id?: string
          is_trending?: boolean | null
          name?: string
          price_range?: string | null
          primary_color_id?: string | null
          recommended_for?: string[] | null
          secondary_color_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "color_palettes_primary_color_id_fkey"
            columns: ["primary_color_id"]
            isOneToOne: false
            referencedRelation: "color_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_palettes_secondary_color_id_fkey"
            columns: ["secondary_color_id"]
            isOneToOne: false
            referencedRelation: "color_library"
            referencedColumns: ["id"]
          },
        ]
      }
      comps: {
        Row: {
          address: string
          adjusted_value: number | null
          adjustment_age: number | null
          adjustment_bathrooms: number | null
          adjustment_bedrooms: number | null
          adjustment_condition: number | null
          adjustment_notes: string | null
          adjustment_other: number | null
          adjustment_sqft: number | null
          bathrooms: number | null
          bedrooms: number | null
          condition: string | null
          created_at: string
          distance_miles: number | null
          id: string
          lead_id: string
          market_analysis_id: string | null
          price_per_sqft: number | null
          relevance_score: number | null
          sale_date: string
          sale_price: number
          sqft: number | null
          year_built: number | null
        }
        Insert: {
          address: string
          adjusted_value?: number | null
          adjustment_age?: number | null
          adjustment_bathrooms?: number | null
          adjustment_bedrooms?: number | null
          adjustment_condition?: number | null
          adjustment_notes?: string | null
          adjustment_other?: number | null
          adjustment_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          condition?: string | null
          created_at?: string
          distance_miles?: number | null
          id?: string
          lead_id: string
          market_analysis_id?: string | null
          price_per_sqft?: number | null
          relevance_score?: number | null
          sale_date: string
          sale_price: number
          sqft?: number | null
          year_built?: number | null
        }
        Update: {
          address?: string
          adjusted_value?: number | null
          adjustment_age?: number | null
          adjustment_bathrooms?: number | null
          adjustment_bedrooms?: number | null
          adjustment_condition?: number | null
          adjustment_notes?: string | null
          adjustment_other?: number | null
          adjustment_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          condition?: string | null
          created_at?: string
          distance_miles?: number | null
          id?: string
          lead_id?: string
          market_analysis_id?: string | null
          price_per_sqft?: number | null
          relevance_score?: number | null
          sale_date?: string
          sale_price?: number
          sqft?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comps_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "comps_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comps_market_analysis_id_fkey"
            columns: ["market_analysis_id"]
            isOneToOne: false
            referencedRelation: "market_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          appraisal_deadline: string | null
          closed_at: string | null
          closing_date: string | null
          contract_price: number
          created_at: string
          documents: Json | null
          earnest_money_amount: number | null
          earnest_money_due_date: string | null
          earnest_money_received: boolean | null
          effective_date: string | null
          financing_deadline: string | null
          id: string
          inspection_deadline: string | null
          lead_id: string
          milestones: Json | null
          offer_id: string | null
          preclose_checklist: Json | null
          status: string | null
          termination_reason: string | null
          title_company: string | null
          title_company_contact: string | null
          title_company_phone: string | null
          updated_at: string
        }
        Insert: {
          appraisal_deadline?: string | null
          closed_at?: string | null
          closing_date?: string | null
          contract_price: number
          created_at?: string
          documents?: Json | null
          earnest_money_amount?: number | null
          earnest_money_due_date?: string | null
          earnest_money_received?: boolean | null
          effective_date?: string | null
          financing_deadline?: string | null
          id?: string
          inspection_deadline?: string | null
          lead_id: string
          milestones?: Json | null
          offer_id?: string | null
          preclose_checklist?: Json | null
          status?: string | null
          termination_reason?: string | null
          title_company?: string | null
          title_company_contact?: string | null
          title_company_phone?: string | null
          updated_at?: string
        }
        Update: {
          appraisal_deadline?: string | null
          closed_at?: string | null
          closing_date?: string | null
          contract_price?: number
          created_at?: string
          documents?: Json | null
          earnest_money_amount?: number | null
          earnest_money_due_date?: string | null
          earnest_money_received?: boolean | null
          effective_date?: string | null
          financing_deadline?: string | null
          id?: string
          inspection_deadline?: string | null
          lead_id?: string
          milestones?: Json | null
          offer_id?: string | null
          preclose_checklist?: Json | null
          status?: string | null
          termination_reason?: string | null
          title_company?: string | null
          title_company_contact?: string | null
          title_company_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_site_reports: {
        Row: {
          created_at: string | null
          crew_count: number | null
          delays: string | null
          general_notes: string | null
          id: string
          issues_encountered: string | null
          linked_photos: string[] | null
          linked_tasks: string[] | null
          project_id: string
          report_date: string
          safety_incidents: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          temperature_high: number | null
          temperature_low: number | null
          updated_at: string | null
          vendors_on_site: string[] | null
          weather_conditions: string | null
          weather_notes: string | null
          work_completed: string | null
          work_planned_tomorrow: string | null
        }
        Insert: {
          created_at?: string | null
          crew_count?: number | null
          delays?: string | null
          general_notes?: string | null
          id?: string
          issues_encountered?: string | null
          linked_photos?: string[] | null
          linked_tasks?: string[] | null
          project_id: string
          report_date?: string
          safety_incidents?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string | null
          vendors_on_site?: string[] | null
          weather_conditions?: string | null
          weather_notes?: string | null
          work_completed?: string | null
          work_planned_tomorrow?: string | null
        }
        Update: {
          created_at?: string | null
          crew_count?: number | null
          delays?: string | null
          general_notes?: string | null
          id?: string
          issues_encountered?: string | null
          linked_photos?: string[] | null
          linked_tasks?: string[] | null
          project_id?: string
          report_date?: string
          safety_incidents?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string | null
          vendors_on_site?: string[] | null
          weather_conditions?: string | null
          weather_notes?: string | null
          work_completed?: string | null
          work_planned_tomorrow?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_site_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_analysis: {
        Row: {
          agent_commission_percent: number | null
          arv: number
          calculated_mao: number | null
          cash_on_cash: number | null
          closing_costs_buy: number | null
          closing_costs_sell: number | null
          contingency_percent: number | null
          created_at: string
          desired_profit: number | null
          expected_profit: number | null
          holding_months: number | null
          holding_total: number | null
          id: string
          lead_id: string
          mao_70: number | null
          mao_75: number | null
          monthly_hoa: number | null
          monthly_insurance: number | null
          monthly_loan_payment: number | null
          monthly_taxes: number | null
          monthly_utilities: number | null
          overall_risk_score: number | null
          passes_70_rule: boolean | null
          passes_75_rule: boolean | null
          passes_min_profit: boolean | null
          passes_min_roi: boolean | null
          purchase_price: number | null
          rehab_breakdown: Json | null
          rehab_total: number | null
          risk_factors: Json | null
          risk_level: string | null
          roi_percent: number | null
          scenarios: Json | null
          selling_total: number | null
          total_investment: number | null
          updated_at: string
        }
        Insert: {
          agent_commission_percent?: number | null
          arv: number
          calculated_mao?: number | null
          cash_on_cash?: number | null
          closing_costs_buy?: number | null
          closing_costs_sell?: number | null
          contingency_percent?: number | null
          created_at?: string
          desired_profit?: number | null
          expected_profit?: number | null
          holding_months?: number | null
          holding_total?: number | null
          id?: string
          lead_id: string
          mao_70?: number | null
          mao_75?: number | null
          monthly_hoa?: number | null
          monthly_insurance?: number | null
          monthly_loan_payment?: number | null
          monthly_taxes?: number | null
          monthly_utilities?: number | null
          overall_risk_score?: number | null
          passes_70_rule?: boolean | null
          passes_75_rule?: boolean | null
          passes_min_profit?: boolean | null
          passes_min_roi?: boolean | null
          purchase_price?: number | null
          rehab_breakdown?: Json | null
          rehab_total?: number | null
          risk_factors?: Json | null
          risk_level?: string | null
          roi_percent?: number | null
          scenarios?: Json | null
          selling_total?: number | null
          total_investment?: number | null
          updated_at?: string
        }
        Update: {
          agent_commission_percent?: number | null
          arv?: number
          calculated_mao?: number | null
          cash_on_cash?: number | null
          closing_costs_buy?: number | null
          closing_costs_sell?: number | null
          contingency_percent?: number | null
          created_at?: string
          desired_profit?: number | null
          expected_profit?: number | null
          holding_months?: number | null
          holding_total?: number | null
          id?: string
          lead_id?: string
          mao_70?: number | null
          mao_75?: number | null
          monthly_hoa?: number | null
          monthly_insurance?: number | null
          monthly_loan_payment?: number | null
          monthly_taxes?: number | null
          monthly_utilities?: number | null
          overall_risk_score?: number | null
          passes_70_rule?: boolean | null
          passes_75_rule?: boolean | null
          passes_min_profit?: boolean | null
          passes_min_roi?: boolean | null
          purchase_price?: number | null
          rehab_breakdown?: Json | null
          rehab_total?: number | null
          risk_factors?: Json | null
          risk_level?: string | null
          roi_percent?: number | null
          scenarios?: Json | null
          selling_total?: number | null
          total_investment?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_analysis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "deal_analysis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence: {
        Row: {
          created_at: string
          documents: Json | null
          estimated_rehab_cost: number | null
          hoa_exists: boolean | null
          hoa_monthly: number | null
          hoa_special_assessments: string | null
          id: string
          inspected_at: string | null
          inspected_by: string | null
          inspection_checklist: Json | null
          lead_id: string
          liens_details: string | null
          liens_found: boolean | null
          overall_condition:
            | Database["public"]["Enums"]["condition_rating"]
            | null
          ownership_situation: string | null
          permits_required: string | null
          photos: Json | null
          red_flags: Json | null
          rehab_confidence: number | null
          rehab_scope: string | null
          seller_flexibility: number | null
          seller_timeline: string | null
          title_status: string | null
          updated_at: string
          zoning: string | null
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          estimated_rehab_cost?: number | null
          hoa_exists?: boolean | null
          hoa_monthly?: number | null
          hoa_special_assessments?: string | null
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          inspection_checklist?: Json | null
          lead_id: string
          liens_details?: string | null
          liens_found?: boolean | null
          overall_condition?:
            | Database["public"]["Enums"]["condition_rating"]
            | null
          ownership_situation?: string | null
          permits_required?: string | null
          photos?: Json | null
          red_flags?: Json | null
          rehab_confidence?: number | null
          rehab_scope?: string | null
          seller_flexibility?: number | null
          seller_timeline?: string | null
          title_status?: string | null
          updated_at?: string
          zoning?: string | null
        }
        Update: {
          created_at?: string
          documents?: Json | null
          estimated_rehab_cost?: number | null
          hoa_exists?: boolean | null
          hoa_monthly?: number | null
          hoa_special_assessments?: string | null
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          inspection_checklist?: Json | null
          lead_id?: string
          liens_details?: string | null
          liens_found?: boolean | null
          overall_condition?:
            | Database["public"]["Enums"]["condition_rating"]
            | null
          ownership_situation?: string | null
          permits_required?: string | null
          photos?: Json | null
          red_flags?: Json | null
          rehab_confidence?: number | null
          rehab_scope?: string | null
          seller_flexibility?: number | null
          seller_timeline?: string | null
          title_status?: string | null
          updated_at?: string
          zoning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "due_diligence_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rates: {
        Row: {
          created_at: string | null
          effective_date: string | null
          expiry_date: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          minimum_hours: number | null
          overtime_multiplier: number | null
          region: string
          source: string | null
          trade_description: string | null
          trade_type: string
          travel_fee: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          minimum_hours?: number | null
          overtime_multiplier?: number | null
          region?: string
          source?: string | null
          trade_description?: string | null
          trade_type: string
          travel_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          minimum_hours?: number | null
          overtime_multiplier?: number | null
          region?: string
          source?: string | null
          trade_description?: string | null
          trade_type?: string
          travel_fee?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_activity_log: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          lead_id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          lead_id: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analysis: {
        Row: {
          analyzed_at: string | null
          analyzed_by: string | null
          appreciation_rate: number | null
          arv_confidence: number | null
          arv_estimate: number | null
          arv_method: string | null
          arv_notes: string | null
          avg_dom: number | null
          created_at: string
          crime_index: number | null
          employment_score: number | null
          id: string
          inventory_months: number | null
          lead_id: string
          list_to_sale_ratio: number | null
          market_temp: Database["public"]["Enums"]["market_temperature"] | null
          rental_demand_score: number | null
          school_rating: number | null
          target_buyer: string | null
          target_price_range_high: number | null
          target_price_range_low: number | null
          updated_at: string
          velocity_score: number | null
        }
        Insert: {
          analyzed_at?: string | null
          analyzed_by?: string | null
          appreciation_rate?: number | null
          arv_confidence?: number | null
          arv_estimate?: number | null
          arv_method?: string | null
          arv_notes?: string | null
          avg_dom?: number | null
          created_at?: string
          crime_index?: number | null
          employment_score?: number | null
          id?: string
          inventory_months?: number | null
          lead_id: string
          list_to_sale_ratio?: number | null
          market_temp?: Database["public"]["Enums"]["market_temperature"] | null
          rental_demand_score?: number | null
          school_rating?: number | null
          target_buyer?: string | null
          target_price_range_high?: number | null
          target_price_range_low?: number | null
          updated_at?: string
          velocity_score?: number | null
        }
        Update: {
          analyzed_at?: string | null
          analyzed_by?: string | null
          appreciation_rate?: number | null
          arv_confidence?: number | null
          arv_estimate?: number | null
          arv_method?: string | null
          arv_notes?: string | null
          avg_dom?: number | null
          created_at?: string
          crime_index?: number | null
          employment_score?: number | null
          id?: string
          inventory_months?: number | null
          lead_id?: string
          list_to_sale_ratio?: number | null
          market_temp?: Database["public"]["Enums"]["market_temperature"] | null
          rental_demand_score?: number | null
          school_rating?: number | null
          target_buyer?: string | null
          target_price_range_high?: number | null
          target_price_range_low?: number | null
          updated_at?: string
          velocity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_analysis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "market_analysis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      material_library: {
        Row: {
          additional_images: Json | null
          avg_cost_per_unit: number | null
          brand: string | null
          color_description: string | null
          created_at: string | null
          description: string | null
          design_styles: string[] | null
          dimensions: string | null
          finish: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          material_category: string | null
          material_composition: string | null
          material_type: string
          model_number: string | null
          popular: boolean | null
          product_name: string
          recommended_for: string[] | null
          sku: string | null
          suppliers: Json | null
          swatch_image_url: string | null
          thickness: string | null
          typical_lead_time_days: number | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          additional_images?: Json | null
          avg_cost_per_unit?: number | null
          brand?: string | null
          color_description?: string | null
          created_at?: string | null
          description?: string | null
          design_styles?: string[] | null
          dimensions?: string | null
          finish?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          material_category?: string | null
          material_composition?: string | null
          material_type: string
          model_number?: string | null
          popular?: boolean | null
          product_name: string
          recommended_for?: string[] | null
          sku?: string | null
          suppliers?: Json | null
          swatch_image_url?: string | null
          thickness?: string | null
          typical_lead_time_days?: number | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_images?: Json | null
          avg_cost_per_unit?: number | null
          brand?: string | null
          color_description?: string | null
          created_at?: string | null
          description?: string | null
          design_styles?: string[] | null
          dimensions?: string | null
          finish?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          material_category?: string | null
          material_composition?: string | null
          material_type?: string
          model_number?: string | null
          popular?: boolean | null
          product_name?: string
          recommended_for?: string[] | null
          sku?: string | null
          suppliers?: Json | null
          swatch_image_url?: string | null
          thickness?: string | null
          typical_lead_time_days?: number | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      material_prices: {
        Row: {
          bulk_price: number | null
          bulk_quantity: number | null
          category: string
          created_at: string | null
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          name: string
          quality_tier: string | null
          region: string
          source: string | null
          subcategory: string | null
          supplier_name: string | null
          supplier_sku: string | null
          unit: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          bulk_price?: number | null
          bulk_quantity?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          quality_tier?: string | null
          region?: string
          source?: string | null
          subcategory?: string | null
          supplier_name?: string | null
          supplier_sku?: string | null
          unit?: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          bulk_price?: number | null
          bulk_quantity?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          quality_tier?: string | null
          region?: string
          source?: string | null
          subcategory?: string | null
          supplier_name?: string | null
          supplier_sku?: string | null
          unit?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      moodboard_elements: {
        Row: {
          border_color: string | null
          border_radius: number | null
          border_width: number | null
          color_id: string | null
          created_at: string | null
          crop_config: Json | null
          element_type: string
          fill_color: string | null
          font_family: string | null
          font_size: number | null
          font_style: string | null
          font_weight: string | null
          height: number
          id: string
          image_attribution: string | null
          image_source: string | null
          image_url: string | null
          is_locked: boolean | null
          is_visible: boolean | null
          line_height: number | null
          material_id: string | null
          material_sample_image_url: string | null
          moodboard_id: string
          notes: string | null
          opacity: number | null
          original_image_height: number | null
          original_image_width: number | null
          position_x: number
          position_y: number
          rotation: number | null
          shadow_config: Json | null
          shadow_enabled: boolean | null
          shape_type: string | null
          show_color_code: boolean | null
          show_color_name: boolean | null
          show_material_name: boolean | null
          show_material_specs: boolean | null
          stroke_color: string | null
          stroke_width: number | null
          swatch_shape: string | null
          tags: string[] | null
          text_align: string | null
          text_color: string | null
          text_content: string | null
          updated_at: string | null
          width: number
          z_index: number | null
        }
        Insert: {
          border_color?: string | null
          border_radius?: number | null
          border_width?: number | null
          color_id?: string | null
          created_at?: string | null
          crop_config?: Json | null
          element_type: string
          fill_color?: string | null
          font_family?: string | null
          font_size?: number | null
          font_style?: string | null
          font_weight?: string | null
          height?: number
          id?: string
          image_attribution?: string | null
          image_source?: string | null
          image_url?: string | null
          is_locked?: boolean | null
          is_visible?: boolean | null
          line_height?: number | null
          material_id?: string | null
          material_sample_image_url?: string | null
          moodboard_id: string
          notes?: string | null
          opacity?: number | null
          original_image_height?: number | null
          original_image_width?: number | null
          position_x?: number
          position_y?: number
          rotation?: number | null
          shadow_config?: Json | null
          shadow_enabled?: boolean | null
          shape_type?: string | null
          show_color_code?: boolean | null
          show_color_name?: boolean | null
          show_material_name?: boolean | null
          show_material_specs?: boolean | null
          stroke_color?: string | null
          stroke_width?: number | null
          swatch_shape?: string | null
          tags?: string[] | null
          text_align?: string | null
          text_color?: string | null
          text_content?: string | null
          updated_at?: string | null
          width?: number
          z_index?: number | null
        }
        Update: {
          border_color?: string | null
          border_radius?: number | null
          border_width?: number | null
          color_id?: string | null
          created_at?: string | null
          crop_config?: Json | null
          element_type?: string
          fill_color?: string | null
          font_family?: string | null
          font_size?: number | null
          font_style?: string | null
          font_weight?: string | null
          height?: number
          id?: string
          image_attribution?: string | null
          image_source?: string | null
          image_url?: string | null
          is_locked?: boolean | null
          is_visible?: boolean | null
          line_height?: number | null
          material_id?: string | null
          material_sample_image_url?: string | null
          moodboard_id?: string
          notes?: string | null
          opacity?: number | null
          original_image_height?: number | null
          original_image_width?: number | null
          position_x?: number
          position_y?: number
          rotation?: number | null
          shadow_config?: Json | null
          shadow_enabled?: boolean | null
          shape_type?: string | null
          show_color_code?: boolean | null
          show_color_name?: boolean | null
          show_material_name?: boolean | null
          show_material_specs?: boolean | null
          stroke_color?: string | null
          stroke_width?: number | null
          swatch_shape?: string | null
          tags?: string[] | null
          text_align?: string | null
          text_color?: string | null
          text_content?: string | null
          updated_at?: string | null
          width?: number
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_elements_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "color_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moodboard_elements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moodboard_elements_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboard_shares: {
        Row: {
          created_at: string | null
          expires_at: string | null
          export_dimensions: Json | null
          export_format: string | null
          export_resolution: string | null
          id: string
          last_viewed_at: string | null
          moodboard_id: string
          password_hash: string | null
          password_protected: boolean | null
          platform: string | null
          posted_url: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_type: string | null
          share_type: string
          share_url: string | null
          short_code: string | null
          social_caption: string | null
          social_hashtags: string[] | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          export_dimensions?: Json | null
          export_format?: string | null
          export_resolution?: string | null
          id?: string
          last_viewed_at?: string | null
          moodboard_id: string
          password_hash?: string | null
          password_protected?: boolean | null
          platform?: string | null
          posted_url?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_type?: string | null
          share_type: string
          share_url?: string | null
          short_code?: string | null
          social_caption?: string | null
          social_hashtags?: string[] | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          export_dimensions?: Json | null
          export_format?: string | null
          export_resolution?: string | null
          id?: string
          last_viewed_at?: string | null
          moodboard_id?: string
          password_hash?: string | null
          password_protected?: boolean | null
          platform?: string | null
          posted_url?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_type?: string | null
          share_type?: string
          share_url?: string | null
          short_code?: string | null
          social_caption?: string | null
          social_hashtags?: string[] | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_shares_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboards: {
        Row: {
          background_color: string | null
          background_image_url: string | null
          canvas_height: number | null
          canvas_width: number | null
          created_at: string | null
          description: string | null
          grid_size: number | null
          id: string
          is_primary: boolean | null
          is_public: boolean | null
          layout_type: string | null
          moodboard_type: string | null
          name: string
          password_hash: string | null
          password_protected: boolean | null
          project_id: string
          public_slug: string | null
          share_count: number | null
          show_grid: boolean | null
          snap_to_grid: boolean | null
          template_used: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          background_color?: string | null
          background_image_url?: string | null
          canvas_height?: number | null
          canvas_width?: number | null
          created_at?: string | null
          description?: string | null
          grid_size?: number | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          layout_type?: string | null
          moodboard_type?: string | null
          name: string
          password_hash?: string | null
          password_protected?: boolean | null
          project_id: string
          public_slug?: string | null
          share_count?: number | null
          show_grid?: boolean | null
          snap_to_grid?: boolean | null
          template_used?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          background_color?: string | null
          background_image_url?: string | null
          canvas_height?: number | null
          canvas_width?: number | null
          created_at?: string | null
          description?: string | null
          grid_size?: number | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          layout_type?: string | null
          moodboard_type?: string | null
          name?: string
          password_hash?: string | null
          password_protected?: boolean | null
          project_id?: string
          public_slug?: string | null
          share_count?: number | null
          show_grid?: boolean | null
          snap_to_grid?: boolean | null
          template_used?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moodboards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          mime_type: string | null
          page_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          mime_type?: string | null
          page_id: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          mime_type?: string | null
          page_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_attachments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "notebook_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_links: {
        Row: {
          created_at: string | null
          id: string
          link_id: string
          link_type: string
          page_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_id: string
          link_type: string
          page_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link_id?: string
          link_type?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_links_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "notebook_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_pages: {
        Row: {
          content: Json
          created_at: string | null
          icon: string | null
          id: string
          notebook_id: string
          parent_page_id: string | null
          sort_order: number | null
          template_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          icon?: string | null
          id?: string
          notebook_id: string
          parent_page_id?: string | null
          sort_order?: number | null
          template_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          icon?: string | null
          id?: string
          notebook_id?: string
          parent_page_id?: string | null
          sort_order?: number | null
          template_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notebook_pages_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "project_notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notebook_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "notebook_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_tags: {
        Row: {
          created_at: string | null
          id: string
          page_id: string
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_id: string
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_tags_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "notebook_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          closing_days: number | null
          contingencies: Json | null
          counter_amount: number | null
          counter_terms: string | null
          created_at: string
          deal_analysis_id: string | null
          earnest_money: number | null
          financing_type: string | null
          id: string
          inspection_period_days: number | null
          justification: string | null
          lead_id: string
          offer_amount: number
          offer_document_url: string | null
          offer_round: number | null
          response_at: string | null
          response_notes: string | null
          status: Database["public"]["Enums"]["offer_status"]
          strategy_notes: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          closing_days?: number | null
          contingencies?: Json | null
          counter_amount?: number | null
          counter_terms?: string | null
          created_at?: string
          deal_analysis_id?: string | null
          earnest_money?: number | null
          financing_type?: string | null
          id?: string
          inspection_period_days?: number | null
          justification?: string | null
          lead_id: string
          offer_amount: number
          offer_document_url?: string | null
          offer_round?: number | null
          response_at?: string | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          strategy_notes?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          closing_days?: number | null
          contingencies?: Json | null
          counter_amount?: number | null
          counter_terms?: string | null
          created_at?: string
          deal_analysis_id?: string | null
          earnest_money?: number | null
          financing_type?: string | null
          id?: string
          inspection_period_days?: number | null
          justification?: string | null
          lead_id?: string
          offer_amount?: number
          offer_document_url?: string | null
          offer_round?: number | null
          response_at?: string | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          strategy_notes?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_deal_analysis_id_fkey"
            columns: ["deal_analysis_id"]
            isOneToOne: false
            referencedRelation: "deal_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "deal_metrics"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "offers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_notes: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          project_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          project_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planning_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_activity: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          project_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_color_selections: {
        Row: {
          application_instructions: string | null
          approved_by_client: boolean | null
          coats: number | null
          color_id: string | null
          created_at: string | null
          custom_color_name: string | null
          custom_hex_code: string | null
          finish: string | null
          id: string
          is_approved: boolean | null
          is_primary: boolean | null
          notes: string | null
          primer_needed: boolean | null
          project_id: string
          room_name: string | null
          room_type: string
          surface_type: string
          updated_at: string | null
        }
        Insert: {
          application_instructions?: string | null
          approved_by_client?: boolean | null
          coats?: number | null
          color_id?: string | null
          created_at?: string | null
          custom_color_name?: string | null
          custom_hex_code?: string | null
          finish?: string | null
          id?: string
          is_approved?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          primer_needed?: boolean | null
          project_id: string
          room_name?: string | null
          room_type: string
          surface_type: string
          updated_at?: string | null
        }
        Update: {
          application_instructions?: string | null
          approved_by_client?: boolean | null
          coats?: number | null
          color_id?: string | null
          created_at?: string | null
          custom_color_name?: string | null
          custom_hex_code?: string | null
          finish?: string | null
          id?: string
          is_approved?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          primer_needed?: boolean | null
          project_id?: string
          room_name?: string | null
          room_type?: string
          surface_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_color_selections_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "color_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_color_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_material_selections: {
        Row: {
          application: string
          cost_per_unit: number | null
          created_at: string | null
          custom_description: string | null
          custom_material_name: string | null
          expected_delivery_date: string | null
          id: string
          installation_notes: string | null
          is_approved: boolean | null
          is_ordered: boolean | null
          is_received: boolean | null
          material_id: string | null
          notes: string | null
          order_date: string | null
          project_id: string
          quantity: number | null
          room_name: string | null
          room_type: string | null
          selected_supplier: string | null
          total_cost: number | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          application: string
          cost_per_unit?: number | null
          created_at?: string | null
          custom_description?: string | null
          custom_material_name?: string | null
          expected_delivery_date?: string | null
          id?: string
          installation_notes?: string | null
          is_approved?: boolean | null
          is_ordered?: boolean | null
          is_received?: boolean | null
          material_id?: string | null
          notes?: string | null
          order_date?: string | null
          project_id: string
          quantity?: number | null
          room_name?: string | null
          room_type?: string | null
          selected_supplier?: string | null
          total_cost?: number | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          application?: string
          cost_per_unit?: number | null
          created_at?: string | null
          custom_description?: string | null
          custom_material_name?: string | null
          expected_delivery_date?: string | null
          id?: string
          installation_notes?: string | null
          is_approved?: boolean | null
          is_ordered?: boolean | null
          is_received?: boolean | null
          material_id?: string | null
          notes?: string | null
          order_date?: string | null
          project_id?: string
          quantity?: number | null
          room_name?: string | null
          room_type?: string | null
          selected_supplier?: string | null
          total_cost?: number | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_material_selections_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_material_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notebooks: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notebooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_photos: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string | null
          file_size_bytes: number | null
          height_px: number | null
          id: string
          mime_type: string | null
          original_filename: string | null
          project_id: string
          room_id: string | null
          storage_path: string
          tags: string[] | null
          taken_at: string | null
          uploaded_by: string | null
          width_px: number | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          height_px?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          project_id: string
          room_id?: string | null
          storage_path: string
          tags?: string[] | null
          taken_at?: string | null
          uploaded_by?: string | null
          width_px?: number | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          height_px?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          project_id?: string
          room_id?: string | null
          storage_path?: string
          tags?: string[] | null
          taken_at?: string | null
          uploaded_by?: string | null
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_rooms: {
        Row: {
          condition_notes: string | null
          condition_photos: Json | null
          created_at: string | null
          estimated_room_budget: number | null
          existing_ceiling: string | null
          existing_fixtures: string[] | null
          existing_flooring: string | null
          existing_walls: string | null
          floor_level: string | null
          has_closet: boolean | null
          has_window: boolean | null
          height_ft: number | null
          id: string
          inspiration_photos: Json | null
          length_ft: number | null
          needs_renovation: boolean | null
          notes: string | null
          overall_condition: string | null
          project_id: string
          renovation_priority: string | null
          renovation_scope: string | null
          room_name: string | null
          room_type: string
          square_footage: number | null
          updated_at: string | null
          width_ft: number | null
          window_count: number | null
        }
        Insert: {
          condition_notes?: string | null
          condition_photos?: Json | null
          created_at?: string | null
          estimated_room_budget?: number | null
          existing_ceiling?: string | null
          existing_fixtures?: string[] | null
          existing_flooring?: string | null
          existing_walls?: string | null
          floor_level?: string | null
          has_closet?: boolean | null
          has_window?: boolean | null
          height_ft?: number | null
          id?: string
          inspiration_photos?: Json | null
          length_ft?: number | null
          needs_renovation?: boolean | null
          notes?: string | null
          overall_condition?: string | null
          project_id: string
          renovation_priority?: string | null
          renovation_scope?: string | null
          room_name?: string | null
          room_type: string
          square_footage?: number | null
          updated_at?: string | null
          width_ft?: number | null
          window_count?: number | null
        }
        Update: {
          condition_notes?: string | null
          condition_photos?: Json | null
          created_at?: string | null
          estimated_room_budget?: number | null
          existing_ceiling?: string | null
          existing_fixtures?: string[] | null
          existing_flooring?: string | null
          existing_walls?: string | null
          floor_level?: string | null
          has_closet?: boolean | null
          has_window?: boolean | null
          height_ft?: number | null
          id?: string
          inspiration_photos?: Json | null
          length_ft?: number | null
          needs_renovation?: boolean | null
          notes?: string | null
          overall_condition?: string | null
          project_id?: string
          renovation_priority?: string | null
          renovation_scope?: string | null
          room_name?: string | null
          room_type?: string
          square_footage?: number | null
          updated_at?: string | null
          width_ft?: number | null
          window_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_vendor_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          room_id: string | null
          scope_item_id: string | null
          sort_order: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_vendor_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          room_id?: string | null
          scope_item_id?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_vendor_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          room_id?: string | null
          scope_item_id?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_status: string | null
          project_id: string
          receipt_url: string | null
          scope_item_id: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          project_id: string
          receipt_url?: string | null
          scope_item_id?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          project_id?: string
          receipt_url?: string | null
          scope_item_id?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_transactions_scope_item_id_fkey"
            columns: ["scope_item_id"]
            isOneToOne: false
            referencedRelation: "scope_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          acquisition_cost: number | null
          action_plan_complete: boolean | null
          actual_completion_date: string | null
          actual_roi_percentage: number | null
          actual_total_cost: number | null
          address_city: string | null
          address_full: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          arv: number | null
          bathrooms: number | null
          bedrooms: number | null
          completion_percentage: number | null
          condition_assessment_complete: boolean | null
          condition_notes: string | null
          contingency_amount: number | null
          contingency_percentage: number | null
          created_at: string | null
          current_step: number | null
          design_style: string | null
          duration_days: number | null
          estimated_sale_price: number | null
          final_review_complete: boolean | null
          financing_costs: number | null
          hero_image_url: string | null
          holding_costs: number | null
          id: string
          investment_strategy: string | null
          is_template: boolean | null
          lot_size_sqft: number | null
          max_budget: number | null
          notes: string | null
          overall_condition: string | null
          priority_analysis_complete: boolean | null
          project_name: string
          property_details_complete: boolean | null
          property_images: Json | null
          property_type: string | null
          purchase_price: number | null
          rehab_budget: number | null
          scope_building_complete: boolean | null
          selling_costs: number | null
          square_footage: number | null
          start_date: string | null
          status: string | null
          strategy_goals_complete: boolean | null
          tags: string[] | null
          target_completion_date: string | null
          target_market: string | null
          target_roi_percentage: number | null
          updated_at: string | null
          user_id: string
          year_built: number | null
        }
        Insert: {
          acquisition_cost?: number | null
          action_plan_complete?: boolean | null
          actual_completion_date?: string | null
          actual_roi_percentage?: number | null
          actual_total_cost?: number | null
          address_city?: string | null
          address_full?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          arv?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          completion_percentage?: number | null
          condition_assessment_complete?: boolean | null
          condition_notes?: string | null
          contingency_amount?: number | null
          contingency_percentage?: number | null
          created_at?: string | null
          current_step?: number | null
          design_style?: string | null
          duration_days?: number | null
          estimated_sale_price?: number | null
          final_review_complete?: boolean | null
          financing_costs?: number | null
          hero_image_url?: string | null
          holding_costs?: number | null
          id?: string
          investment_strategy?: string | null
          is_template?: boolean | null
          lot_size_sqft?: number | null
          max_budget?: number | null
          notes?: string | null
          overall_condition?: string | null
          priority_analysis_complete?: boolean | null
          project_name: string
          property_details_complete?: boolean | null
          property_images?: Json | null
          property_type?: string | null
          purchase_price?: number | null
          rehab_budget?: number | null
          scope_building_complete?: boolean | null
          selling_costs?: number | null
          square_footage?: number | null
          start_date?: string | null
          status?: string | null
          strategy_goals_complete?: boolean | null
          tags?: string[] | null
          target_completion_date?: string | null
          target_market?: string | null
          target_roi_percentage?: number | null
          updated_at?: string | null
          user_id: string
          year_built?: number | null
        }
        Update: {
          acquisition_cost?: number | null
          action_plan_complete?: boolean | null
          actual_completion_date?: string | null
          actual_roi_percentage?: number | null
          actual_total_cost?: number | null
          address_city?: string | null
          address_full?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          arv?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          completion_percentage?: number | null
          condition_assessment_complete?: boolean | null
          condition_notes?: string | null
          contingency_amount?: number | null
          contingency_percentage?: number | null
          created_at?: string | null
          current_step?: number | null
          design_style?: string | null
          duration_days?: number | null
          estimated_sale_price?: number | null
          final_review_complete?: boolean | null
          financing_costs?: number | null
          hero_image_url?: string | null
          holding_costs?: number | null
          id?: string
          investment_strategy?: string | null
          is_template?: boolean | null
          lot_size_sqft?: number | null
          max_budget?: number | null
          notes?: string | null
          overall_condition?: string | null
          priority_analysis_complete?: boolean | null
          project_name?: string
          property_details_complete?: boolean | null
          property_images?: Json | null
          property_type?: string | null
          purchase_price?: number | null
          rehab_budget?: number | null
          scope_building_complete?: boolean | null
          selling_costs?: number | null
          square_footage?: number | null
          start_date?: string | null
          status?: string | null
          strategy_goals_complete?: boolean | null
          tags?: string[] | null
          target_completion_date?: string | null
          target_market?: string | null
          target_roi_percentage?: number | null
          updated_at?: string | null
          user_id?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_leads: {
        Row: {
          address: string
          asking_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          county: string | null
          created_at: string
          current_phase: Database["public"]["Enums"]["acquisition_phase"]
          days_on_market: number | null
          id: string
          lot_sqft: number | null
          pass_reason: string | null
          passed_at: string | null
          phase_entered_at: string | null
          property_type: string | null
          screening_notes: string | null
          screening_score: number | null
          seller_email: string | null
          seller_motivation: string | null
          seller_name: string | null
          seller_phone: string | null
          source: Database["public"]["Enums"]["lead_source"]
          source_detail: string | null
          sqft: number | null
          state: string
          updated_at: string
          user_id: string
          year_built: number | null
          zip: string
        }
        Insert: {
          address: string
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          county?: string | null
          created_at?: string
          current_phase?: Database["public"]["Enums"]["acquisition_phase"]
          days_on_market?: number | null
          id?: string
          lot_sqft?: number | null
          pass_reason?: string | null
          passed_at?: string | null
          phase_entered_at?: string | null
          property_type?: string | null
          screening_notes?: string | null
          screening_score?: number | null
          seller_email?: string | null
          seller_motivation?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          source_detail?: string | null
          sqft?: number | null
          state?: string
          updated_at?: string
          user_id: string
          year_built?: number | null
          zip: string
        }
        Update: {
          address?: string
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          county?: string | null
          created_at?: string
          current_phase?: Database["public"]["Enums"]["acquisition_phase"]
          days_on_market?: number | null
          id?: string
          lot_sqft?: number | null
          pass_reason?: string | null
          passed_at?: string | null
          phase_entered_at?: string | null
          property_type?: string | null
          screening_notes?: string | null
          screening_score?: number | null
          seller_email?: string | null
          seller_motivation?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          source_detail?: string | null
          sqft?: number | null
          state?: string
          updated_at?: string
          user_id?: string
          year_built?: number | null
          zip?: string
        }
        Relationships: []
      }
      rehab_projects: {
        Row: {
          address_city: string
          address_state: string
          address_street: string
          address_zip: string
          arv: number | null
          bathrooms: number | null
          bedrooms: number | null
          color: string | null
          completed_at: string | null
          construction_started_at: string | null
          created_at: string | null
          days_ahead_behind: number | null
          deleted_at: string | null
          emoji: string | null
          estimated_days: number | null
          hold_period_months: number | null
          id: string
          investment_strategy: string | null
          max_budget: number | null
          neighborhood_comp_avg: number | null
          phase: string | null
          planning_started_at: string | null
          priority_score: number | null
          project_name: string
          property_id: string | null
          property_type: string | null
          purchase_price: number | null
          roi_score: number | null
          sort_order: number | null
          square_feet: number | null
          status: string | null
          target_buyer: string | null
          target_roi: number | null
          tasks_completed: number | null
          tasks_total: number | null
          total_actual_cost: number | null
          total_estimated_cost: number | null
          updated_at: string | null
          user_id: string
          year_built: number | null
        }
        Insert: {
          address_city?: string
          address_state?: string
          address_street?: string
          address_zip?: string
          arv?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          color?: string | null
          completed_at?: string | null
          construction_started_at?: string | null
          created_at?: string | null
          days_ahead_behind?: number | null
          deleted_at?: string | null
          emoji?: string | null
          estimated_days?: number | null
          hold_period_months?: number | null
          id?: string
          investment_strategy?: string | null
          max_budget?: number | null
          neighborhood_comp_avg?: number | null
          phase?: string | null
          planning_started_at?: string | null
          priority_score?: number | null
          project_name: string
          property_id?: string | null
          property_type?: string | null
          purchase_price?: number | null
          roi_score?: number | null
          sort_order?: number | null
          square_feet?: number | null
          status?: string | null
          target_buyer?: string | null
          target_roi?: number | null
          tasks_completed?: number | null
          tasks_total?: number | null
          total_actual_cost?: number | null
          total_estimated_cost?: number | null
          updated_at?: string | null
          user_id: string
          year_built?: number | null
        }
        Update: {
          address_city?: string
          address_state?: string
          address_street?: string
          address_zip?: string
          arv?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          color?: string | null
          completed_at?: string | null
          construction_started_at?: string | null
          created_at?: string | null
          days_ahead_behind?: number | null
          deleted_at?: string | null
          emoji?: string | null
          estimated_days?: number | null
          hold_period_months?: number | null
          id?: string
          investment_strategy?: string | null
          max_budget?: number | null
          neighborhood_comp_avg?: number | null
          phase?: string | null
          planning_started_at?: string | null
          priority_score?: number | null
          project_name?: string
          property_id?: string | null
          property_type?: string | null
          purchase_price?: number | null
          roi_score?: number | null
          sort_order?: number | null
          square_feet?: number | null
          status?: string | null
          target_buyer?: string | null
          target_roi?: number | null
          tasks_completed?: number | null
          tasks_total?: number | null
          total_actual_cost?: number | null
          total_estimated_cost?: number | null
          updated_at?: string | null
          user_id?: string
          year_built?: number | null
        }
        Relationships: []
      }
      scope_catalog: {
        Row: {
          category: string
          created_at: string | null
          default_days_required: number | null
          default_labor_cost: number | null
          default_material_cost: number | null
          default_phase: number | null
          default_priority: string | null
          default_quantity: number | null
          default_unit_of_measure: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          subcategory: string | null
          typical_dependencies: string[] | null
          typical_roi_impact: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          default_days_required?: number | null
          default_labor_cost?: number | null
          default_material_cost?: number | null
          default_phase?: number | null
          default_priority?: string | null
          default_quantity?: number | null
          default_unit_of_measure?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          subcategory?: string | null
          typical_dependencies?: string[] | null
          typical_roi_impact?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_days_required?: number | null
          default_labor_cost?: number | null
          default_material_cost?: number | null
          default_phase?: number | null
          default_priority?: string | null
          default_quantity?: number | null
          default_unit_of_measure?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          subcategory?: string | null
          typical_dependencies?: string[] | null
          typical_roi_impact?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scope_items: {
        Row: {
          actual_completion_date: string | null
          actual_start_date: string | null
          after_images: Json | null
          approved_by_client: boolean | null
          assigned_vendor_id: string | null
          before_images: Json | null
          blocks_item_ids: string[] | null
          buyer_appeal_score: number | null
          category: string
          completed_date: string | null
          cost_breakdown: Json | null
          cost_notes: string | null
          cost_per_unit: number | null
          created_at: string | null
          depends_on_item_ids: string[] | null
          description: string | null
          documentation_urls: Json | null
          earliest_start_date: string | null
          estimated_duration_days: number | null
          estimated_roi_percentage: number | null
          estimated_value_add: number | null
          id: string
          is_approved: boolean | null
          is_completed: boolean | null
          is_hidden: boolean | null
          is_in_progress: boolean | null
          item_name: string
          labor_cost: number | null
          latest_finish_date: string | null
          material_cost: number | null
          permit_cost: number | null
          priority: string | null
          project_id: string
          quality_tier: string | null
          quantity: number | null
          roi_impact_score: number | null
          room_name: string | null
          room_type: string | null
          sort_order: number | null
          subcategory: string | null
          total_cost: number
          unit_type: string | null
          updated_at: string | null
          urgency_score: number | null
          vendor_bid_amount: number | null
          vendor_notes: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          after_images?: Json | null
          approved_by_client?: boolean | null
          assigned_vendor_id?: string | null
          before_images?: Json | null
          blocks_item_ids?: string[] | null
          buyer_appeal_score?: number | null
          category: string
          completed_date?: string | null
          cost_breakdown?: Json | null
          cost_notes?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          depends_on_item_ids?: string[] | null
          description?: string | null
          documentation_urls?: Json | null
          earliest_start_date?: string | null
          estimated_duration_days?: number | null
          estimated_roi_percentage?: number | null
          estimated_value_add?: number | null
          id?: string
          is_approved?: boolean | null
          is_completed?: boolean | null
          is_hidden?: boolean | null
          is_in_progress?: boolean | null
          item_name: string
          labor_cost?: number | null
          latest_finish_date?: string | null
          material_cost?: number | null
          permit_cost?: number | null
          priority?: string | null
          project_id: string
          quality_tier?: string | null
          quantity?: number | null
          roi_impact_score?: number | null
          room_name?: string | null
          room_type?: string | null
          sort_order?: number | null
          subcategory?: string | null
          total_cost: number
          unit_type?: string | null
          updated_at?: string | null
          urgency_score?: number | null
          vendor_bid_amount?: number | null
          vendor_notes?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          after_images?: Json | null
          approved_by_client?: boolean | null
          assigned_vendor_id?: string | null
          before_images?: Json | null
          blocks_item_ids?: string[] | null
          buyer_appeal_score?: number | null
          category?: string
          completed_date?: string | null
          cost_breakdown?: Json | null
          cost_notes?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          depends_on_item_ids?: string[] | null
          description?: string | null
          documentation_urls?: Json | null
          earliest_start_date?: string | null
          estimated_duration_days?: number | null
          estimated_roi_percentage?: number | null
          estimated_value_add?: number | null
          id?: string
          is_approved?: boolean | null
          is_completed?: boolean | null
          is_hidden?: boolean | null
          is_in_progress?: boolean | null
          item_name?: string
          labor_cost?: number | null
          latest_finish_date?: string | null
          material_cost?: number | null
          permit_cost?: number | null
          priority?: string | null
          project_id?: string
          quality_tier?: string | null
          quantity?: number | null
          roi_impact_score?: number | null
          room_name?: string | null
          room_type?: string | null
          sort_order?: number | null
          subcategory?: string | null
          total_cost?: number
          unit_type?: string | null
          updated_at?: string | null
          urgency_score?: number | null
          vendor_bid_amount?: number | null
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_scope_items_vendor"
            columns: ["assigned_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          active_project_id: string | null
          active_section_expanded: boolean | null
          budget_alert_threshold: number | null
          completed_section_expanded: boolean | null
          created_at: string | null
          daily_report_reminder: boolean | null
          default_task_view: string | null
          photo_grid_size: string | null
          planning_section_expanded: boolean | null
          sidebar_collapsed: boolean | null
          task_deadline_alerts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_project_id?: string | null
          active_section_expanded?: boolean | null
          budget_alert_threshold?: number | null
          completed_section_expanded?: boolean | null
          created_at?: string | null
          daily_report_reminder?: boolean | null
          default_task_view?: string | null
          photo_grid_size?: string | null
          planning_section_expanded?: boolean | null
          sidebar_collapsed?: boolean | null
          task_deadline_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_project_id?: string | null
          active_section_expanded?: boolean | null
          budget_alert_threshold?: number | null
          completed_section_expanded?: boolean | null
          created_at?: string | null
          daily_report_reminder?: boolean | null
          default_task_view?: string | null
          photo_grid_size?: string | null
          planning_section_expanded?: boolean | null
          sidebar_collapsed?: boolean | null
          task_deadline_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_active_project_id_fkey"
            columns: ["active_project_id"]
            isOneToOne: false
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          phone: string | null
          state: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string
          company_name: string | null
          created_at: string | null
          default_location: string | null
          email: string
          full_name: string | null
          id: string
          investment_strategy: string | null
          investor_type: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          projects_per_year: string | null
          property_types: string[] | null
          subscription_status: string | null
          subscription_tier: string | null
          timezone: string | null
          trial_ends_at: string | null
          typical_budget: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id: string
          company_name?: string | null
          created_at?: string | null
          default_location?: string | null
          email: string
          full_name?: string | null
          id?: string
          investment_strategy?: string | null
          investor_type?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          projects_per_year?: string | null
          property_types?: string[] | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          typical_budget?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string
          company_name?: string | null
          created_at?: string | null
          default_location?: string | null
          email?: string
          full_name?: string | null
          id?: string
          investment_strategy?: string | null
          investor_type?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          projects_per_year?: string | null
          property_types?: string[] | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          typical_budget?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          accepts_credit_card: boolean | null
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          availability_notes: string | null
          blacklist_reason: string | null
          bond_amount: number | null
          bonded: boolean | null
          company_name: string | null
          completed_projects: number | null
          contract_expiration: string | null
          created_at: string | null
          documents: Json | null
          email: string | null
          has_contract: boolean | null
          hourly_rate: number | null
          id: string
          insurance_coverage_amount: number | null
          insurance_expiration: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          is_blacklisted: boolean | null
          is_insured: boolean | null
          is_licensed: boolean | null
          is_preferred: boolean | null
          license_expiration: string | null
          license_number: string | null
          license_state: string | null
          markup_percentage: number | null
          name: string
          notes: string | null
          on_budget_percentage: number | null
          on_time_percentage: number | null
          payment_terms: string | null
          phone: string | null
          preferred_contact_method: string | null
          rating: number | null
          referred_by: string | null
          specialties: string[] | null
          tags: string[] | null
          timezone: string | null
          total_savings: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
          vendor_type: string | null
          website: string | null
        }
        Insert: {
          accepts_credit_card?: boolean | null
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          availability_notes?: string | null
          blacklist_reason?: string | null
          bond_amount?: number | null
          bonded?: boolean | null
          company_name?: string | null
          completed_projects?: number | null
          contract_expiration?: string | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          has_contract?: boolean | null
          hourly_rate?: number | null
          id?: string
          insurance_coverage_amount?: number | null
          insurance_expiration?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          is_blacklisted?: boolean | null
          is_insured?: boolean | null
          is_licensed?: boolean | null
          is_preferred?: boolean | null
          license_expiration?: string | null
          license_number?: string | null
          license_state?: string | null
          markup_percentage?: number | null
          name: string
          notes?: string | null
          on_budget_percentage?: number | null
          on_time_percentage?: number | null
          payment_terms?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          rating?: number | null
          referred_by?: string | null
          specialties?: string[] | null
          tags?: string[] | null
          timezone?: string | null
          total_savings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
          vendor_type?: string | null
          website?: string | null
        }
        Update: {
          accepts_credit_card?: boolean | null
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          availability_notes?: string | null
          blacklist_reason?: string | null
          bond_amount?: number | null
          bonded?: boolean | null
          company_name?: string | null
          completed_projects?: number | null
          contract_expiration?: string | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          has_contract?: boolean | null
          hourly_rate?: number | null
          id?: string
          insurance_coverage_amount?: number | null
          insurance_expiration?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          is_blacklisted?: boolean | null
          is_insured?: boolean | null
          is_licensed?: boolean | null
          is_preferred?: boolean | null
          license_expiration?: string | null
          license_number?: string | null
          license_state?: string | null
          markup_percentage?: number | null
          name?: string
          notes?: string | null
          on_budget_percentage?: number | null
          on_time_percentage?: number | null
          payment_terms?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          rating?: number | null
          referred_by?: string | null
          specialties?: string[] | null
          tags?: string[] | null
          timezone?: string | null
          total_savings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
          vendor_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_progress: {
        Row: {
          created_at: string | null
          last_completed_step: number | null
          project_id: string
          step_1_completed: boolean | null
          step_1_completed_at: string | null
          step_2_completed: boolean | null
          step_2_completed_at: string | null
          step_3_completed: boolean | null
          step_3_completed_at: string | null
          step_4_completed: boolean | null
          step_4_completed_at: string | null
          step_5_completed: boolean | null
          step_5_completed_at: string | null
          step_6_completed: boolean | null
          step_6_completed_at: string | null
          step_7_completed: boolean | null
          step_7_completed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          last_completed_step?: number | null
          project_id: string
          step_1_completed?: boolean | null
          step_1_completed_at?: string | null
          step_2_completed?: boolean | null
          step_2_completed_at?: string | null
          step_3_completed?: boolean | null
          step_3_completed_at?: string | null
          step_4_completed?: boolean | null
          step_4_completed_at?: string | null
          step_5_completed?: boolean | null
          step_5_completed_at?: string | null
          step_6_completed?: boolean | null
          step_6_completed_at?: string | null
          step_7_completed?: boolean | null
          step_7_completed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          last_completed_step?: number | null
          project_id?: string
          step_1_completed?: boolean | null
          step_1_completed_at?: string | null
          step_2_completed?: boolean | null
          step_2_completed_at?: string | null
          step_3_completed?: boolean | null
          step_3_completed_at?: string | null
          step_4_completed?: boolean | null
          step_4_completed_at?: string | null
          step_5_completed?: boolean | null
          step_5_completed_at?: string | null
          step_6_completed?: boolean | null
          step_6_completed_at?: string | null
          step_7_completed?: boolean | null
          step_7_completed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wizard_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "rehab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      deal_metrics: {
        Row: {
          address: string | null
          arv_estimate: number | null
          asking_price: number | null
          current_phase: Database["public"]["Enums"]["acquisition_phase"] | null
          estimated_rehab_cost: number | null
          expected_profit: number | null
          lead_id: string | null
          overall_risk_score: number | null
          passes_70_rule: boolean | null
          roi_percent: number | null
          velocity_score: number | null
        }
        Relationships: []
      }
      pipeline_summary: {
        Row: {
          avg_score: number | null
          count: number | null
          current_phase: Database["public"]["Enums"]["acquisition_phase"] | null
          total_value: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      acquisition_phase:
        | "phase_1_screening"
        | "phase_2_market_analysis"
        | "phase_3_due_diligence"
        | "phase_4_deal_analysis"
        | "phase_5_contract"
        | "passed"
        | "closed"
      condition_rating: "excellent" | "good" | "fair" | "poor" | "critical"
      lead_source:
        | "wholesaler"
        | "mls"
        | "direct_mail"
        | "driving_for_dollars"
        | "referral"
        | "cold_call"
        | "online_marketing"
        | "auction"
        | "fsbo"
        | "other"
      market_temperature: "cold" | "cool" | "neutral" | "warm" | "hot"
      milestone_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "blocked"
        | "skipped"
      offer_status:
        | "draft"
        | "submitted"
        | "countered"
        | "accepted"
        | "rejected"
        | "expired"
        | "withdrawn"
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
    Enums: {
      acquisition_phase: [
        "phase_1_screening",
        "phase_2_market_analysis",
        "phase_3_due_diligence",
        "phase_4_deal_analysis",
        "phase_5_contract",
        "passed",
        "closed",
      ],
      condition_rating: ["excellent", "good", "fair", "poor", "critical"],
      lead_source: [
        "wholesaler",
        "mls",
        "direct_mail",
        "driving_for_dollars",
        "referral",
        "cold_call",
        "online_marketing",
        "auction",
        "fsbo",
        "other",
      ],
      market_temperature: ["cold", "cool", "neutral", "warm", "hot"],
      milestone_status: [
        "pending",
        "in_progress",
        "completed",
        "blocked",
        "skipped",
      ],
      offer_status: [
        "draft",
        "submitted",
        "countered",
        "accepted",
        "rejected",
        "expired",
        "withdrawn",
      ],
    },
  },
} as const


// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
