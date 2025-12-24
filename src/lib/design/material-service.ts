/**
 * @file material-service.ts
 * @description Service layer for material-related operations
 * 
 * Provides CRUD operations for:
 * - material_library (read-only, seeded data)
 * - project_material_selections (full CRUD)
 */

import { createClient } from '@supabase/supabase-js';
import type {
  Database,
  MaterialLibrary,
  MaterialType,
  ProjectMaterialSelection,
  ProjectMaterialSelectionInsert,
  ProjectMaterialSelectionUpdate,
  ProjectMaterialSelectionWithMaterial,
} from '@/types/database';

// Create typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const MaterialService = {
  // ============================================================================
  // MATERIAL LIBRARY (Read-Only)
  // ============================================================================

  /**
   * Get all materials from the library
   */
  async getAllMaterials(): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('is_active', true)
      .order('product_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single material by ID
   */
  async getMaterialById(id: string): Promise<MaterialLibrary | null> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Get materials by type (e.g., 'countertop', 'flooring', 'tile')
   */
  async getMaterialsByType(type: string): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('material_type', type)
      .eq('is_active', true)
      .order('avg_cost_per_unit', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get popular materials
   */
  async getPopularMaterials(): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('popular', true)
      .eq('is_active', true)
      .order('material_type', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get materials by category (e.g., 'quartz', 'lvp', 'ceramic_subway')
   */
  async getMaterialsByCategory(category: string): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('material_category', category)
      .eq('is_active', true)
      .order('avg_cost_per_unit', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Search materials by name, brand, or description
   */
  async searchMaterials(query: string): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('is_active', true)
      .or(`product_name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
      .order('product_name', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get materials within a price range
   */
  async getMaterialsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('is_active', true)
      .gte('avg_cost_per_unit', minPrice)
      .lte('avg_cost_per_unit', maxPrice)
      .order('avg_cost_per_unit', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get materials recommended for a specific room
   */
  async getMaterialsForRoom(roomType: string): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('is_active', true)
      .contains('recommended_for', [roomType])
      .order('popular', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get materials by design style
   */
  async getMaterialsByStyle(style: string): Promise<MaterialLibrary[]> {
    const { data, error } = await supabase
      .from('material_library')
      .select('*')
      .eq('is_active', true)
      .contains('design_styles', [style])
      .order('material_type', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // ============================================================================
  // PROJECT MATERIAL SELECTIONS (Full CRUD)
  // ============================================================================

  /**
   * Get all material selections for a project
   */
  async getProjectMaterialSelections(
    projectId: string
  ): Promise<ProjectMaterialSelectionWithMaterial[]> {
    const { data, error } = await supabase
      .from('project_material_selections')
      .select(`
        *,
        material_library (*)
      `)
      .eq('project_id', projectId)
      .order('room_type', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectMaterialSelectionWithMaterial[];
  },

  /**
   * Get material selections for a specific room
   */
  async getRoomMaterialSelections(
    projectId: string,
    roomType: string
  ): Promise<ProjectMaterialSelectionWithMaterial[]> {
    const { data, error } = await supabase
      .from('project_material_selections')
      .select(`
        *,
        material_library (*)
      `)
      .eq('project_id', projectId)
      .eq('room_type', roomType)
      .order('application', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectMaterialSelectionWithMaterial[];
  },

  /**
   * Get material selections by application (e.g., 'countertop', 'flooring')
   */
  async getProjectMaterialsByApplication(
    projectId: string,
    application: string
  ): Promise<ProjectMaterialSelectionWithMaterial[]> {
    const { data, error } = await supabase
      .from('project_material_selections')
      .select(`
        *,
        material_library (*)
      `)
      .eq('project_id', projectId)
      .eq('application', application)
      .order('room_type', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectMaterialSelectionWithMaterial[];
  },

  /**
   * Create a new material selection for a project
   */
  async createProjectMaterialSelection(
    selection: ProjectMaterialSelectionInsert
  ): Promise<ProjectMaterialSelection> {
    const { data, error } = await supabase
      .from('project_material_selections')
      .insert(selection)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing material selection
   */
  async updateProjectMaterialSelection(
    id: string,
    updates: ProjectMaterialSelectionUpdate
  ): Promise<ProjectMaterialSelection> {
    const { data, error } = await supabase
      .from('project_material_selections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a material selection
   */
  async deleteProjectMaterialSelection(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_material_selections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Approve a material selection
   */
  async approveMaterialSelection(id: string): Promise<ProjectMaterialSelection> {
    return this.updateProjectMaterialSelection(id, { is_approved: true });
  },

  /**
   * Mark material as ordered
   */
  async markMaterialOrdered(
    id: string,
    orderDate: string,
    expectedDeliveryDate?: string
  ): Promise<ProjectMaterialSelection> {
    return this.updateProjectMaterialSelection(id, {
      is_ordered: true,
      order_date: orderDate,
      expected_delivery_date: expectedDeliveryDate || null,
    });
  },

  /**
   * Mark material as received
   */
  async markMaterialReceived(id: string): Promise<ProjectMaterialSelection> {
    return this.updateProjectMaterialSelection(id, { is_received: true });
  },

  /**
   * Calculate total materials cost for a project
   */
  async calculateProjectMaterialsCost(projectId: string): Promise<number> {
    const { data, error } = await supabase
      .from('project_material_selections')
      .select('total_cost')
      .eq('project_id', projectId);

    if (error) throw error;

    return (data || []).reduce((sum, sel) => sum + (sel.total_cost || 0), 0);
  },

  /**
   * Copy material selections from one project to another
   */
  async copyMaterialSelections(
    fromProjectId: string,
    toProjectId: string
  ): Promise<ProjectMaterialSelection[]> {
    const { data: existing, error: fetchError } = await supabase
      .from('project_material_selections')
      .select('*')
      .eq('project_id', fromProjectId);

    if (fetchError) throw fetchError;
    if (!existing || existing.length === 0) return [];

    const copies = existing.map(sel => ({
      ...sel,
      id: undefined,
      project_id: toProjectId,
      is_approved: false,
      is_ordered: false,
      is_received: false,
      order_date: null,
      expected_delivery_date: null,
      created_at: undefined,
      updated_at: undefined,
    }));

    const { data, error: insertError } = await supabase
      .from('project_material_selections')
      .insert(copies as ProjectMaterialSelectionInsert[])
      .select();

    if (insertError) throw insertError;
    return data || [];
  },
};

export default MaterialService;
