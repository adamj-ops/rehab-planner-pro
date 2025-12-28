/**
 * @file supabase.ts
 * @description Auto-generated TypeScript types from Supabase schema
 * Generated: 2024-12-26
 * 
 * Tables:
 * - Phase 1 Foundation: users, projects, scope_items, vendors, project_rooms, project_transactions
 * - Phase 2A Design: color_library, material_library, moodboards, etc.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      users: {
        Row: {
          auth_id: string
          company_name: string | null
          created_at: string | null
          default_location: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          subscription_status: string | null
          subscription_tier: string | null
          timezone: string | null
          trial_ends_at: string | null
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
          phone?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
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
          phone?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
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

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
