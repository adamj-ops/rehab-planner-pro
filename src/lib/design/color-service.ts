/**
 * @file color-service.ts
 * @description Service layer for color-related operations
 * 
 * Provides CRUD operations for:
 * - color_library (read-only, seeded data)
 * - project_color_selections (full CRUD)
 */

import { createClient } from '@supabase/supabase-js';
import type {
  Database,
  ColorLibrary,
  ProjectColorSelection,
  ProjectColorSelectionInsert,
  ProjectColorSelectionUpdate,
  ProjectColorSelectionWithColor,
} from '@/types/database';

// Create typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const ColorService = {
  // ============================================================================
  // COLOR LIBRARY (Read-Only)
  // ============================================================================

  /**
   * Get all colors from the library
   */
  async getAllColors(): Promise<ColorLibrary[]> {
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('is_active', true)
      .order('color_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single color by ID
   */
  async getColorById(id: string): Promise<ColorLibrary | null> {
    const { data, error } = await supabase
      .from('color_library')
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
   * Get popular/trending colors
   */
  async getPopularColors(): Promise<ColorLibrary[]> {
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('popular', true)
      .eq('is_active', true)
      .order('color_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get colors by color family (e.g., 'gray', 'white', 'blue')
   */
  async getColorsByFamily(family: string): Promise<ColorLibrary[]> {
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('color_family', family)
      .eq('is_active', true)
      .order('lrv', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Search colors by name or code
   */
  async searchColors(query: string): Promise<ColorLibrary[]> {
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('is_active', true)
      .or(`color_name.ilike.%${query}%,color_code.ilike.%${query}%`)
      .order('color_name', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get colors by LRV range (Light Reflectance Value)
   * Higher LRV = lighter color
   */
  async getColorsByLRV(minLRV: number, maxLRV: number): Promise<ColorLibrary[]> {
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('is_active', true)
      .gte('lrv', minLRV)
      .lte('lrv', maxLRV)
      .order('lrv', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get colors recommended for a specific room type
   */
  async getColorsForRoom(roomType: string): Promise<ColorLibrary[]> {
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('is_active', true)
      .contains('recommended_rooms', [roomType])
      .order('popular', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ============================================================================
  // PROJECT COLOR SELECTIONS (Full CRUD)
  // ============================================================================

  /**
   * Get all color selections for a project
   */
  async getProjectColorSelections(projectId: string): Promise<ProjectColorSelectionWithColor[]> {
    const { data, error } = await supabase
      .from('project_color_selections')
      .select(`
        *,
        color_library (*)
      `)
      .eq('project_id', projectId)
      .order('room_type', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectColorSelectionWithColor[];
  },

  /**
   * Get color selections for a specific room
   */
  async getRoomColorSelections(
    projectId: string,
    roomType: string
  ): Promise<ProjectColorSelectionWithColor[]> {
    const { data, error } = await supabase
      .from('project_color_selections')
      .select(`
        *,
        color_library (*)
      `)
      .eq('project_id', projectId)
      .eq('room_type', roomType)
      .order('surface_type', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectColorSelectionWithColor[];
  },

  /**
   * Create a new color selection for a project
   */
  async createProjectColorSelection(
    selection: ProjectColorSelectionInsert
  ): Promise<ProjectColorSelection> {
    const { data, error } = await supabase
      .from('project_color_selections')
      .insert(selection)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing color selection
   */
  async updateProjectColorSelection(
    id: string,
    updates: ProjectColorSelectionUpdate
  ): Promise<ProjectColorSelection> {
    const { data, error } = await supabase
      .from('project_color_selections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a color selection
   */
  async deleteProjectColorSelection(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_color_selections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Approve a color selection
   */
  async approveColorSelection(id: string): Promise<ProjectColorSelection> {
    return this.updateProjectColorSelection(id, { is_approved: true });
  },

  /**
   * Mark color selection as client-approved
   */
  async clientApproveColorSelection(id: string): Promise<ProjectColorSelection> {
    return this.updateProjectColorSelection(id, { approved_by_client: true });
  },

  /**
   * Copy color selections from one project to another
   */
  async copyColorSelections(
    fromProjectId: string,
    toProjectId: string
  ): Promise<ProjectColorSelection[]> {
    const { data: existing, error: fetchError } = await supabase
      .from('project_color_selections')
      .select('*')
      .eq('project_id', fromProjectId);

    if (fetchError) throw fetchError;
    if (!existing || existing.length === 0) return [];

    const copies = existing.map(sel => ({
      ...sel,
      id: undefined,
      project_id: toProjectId,
      is_approved: false,
      approved_by_client: false,
      created_at: undefined,
      updated_at: undefined,
    }));

    const { data, error: insertError } = await supabase
      .from('project_color_selections')
      .insert(copies as ProjectColorSelectionInsert[])
      .select();

    if (insertError) throw insertError;
    return data || [];
  },
};

export default ColorService;
