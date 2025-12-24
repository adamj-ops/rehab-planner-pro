/**
 * @file moodboard-service.ts
 * @description Service layer for moodboard-related operations
 * 
 * Provides CRUD operations for:
 * - moodboards
 * - moodboard_elements
 * - moodboard_shares
 */

import { createClient } from '@supabase/supabase-js';
import type {
  Database,
  Moodboard,
  MoodboardInsert,
  MoodboardUpdate,
  MoodboardWithElements,
  MoodboardElement,
  MoodboardElementInsert,
  MoodboardElementUpdate,
  MoodboardElementWithRefs,
  MoodboardShare,
  MoodboardShareInsert,
  MoodboardShareUpdate,
} from '@/types/database';

// Create typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const MoodboardService = {
  // ============================================================================
  // MOODBOARDS
  // ============================================================================

  /**
   * Get all moodboards for a project
   */
  async getProjectMoodboards(projectId: string): Promise<Moodboard[]> {
    const { data, error } = await supabase
      .from('moodboards')
      .select('*')
      .eq('project_id', projectId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single moodboard by ID
   */
  async getMoodboardById(id: string): Promise<Moodboard | null> {
    const { data, error } = await supabase
      .from('moodboards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * Get a moodboard with all its elements
   */
  async getMoodboardWithElements(id: string): Promise<MoodboardWithElements | null> {
    const { data, error } = await supabase
      .from('moodboards')
      .select(`
        *,
        moodboard_elements (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as MoodboardWithElements;
  },

  /**
   * Get a public moodboard by slug
   */
  async getPublicMoodboard(slug: string): Promise<MoodboardWithElements | null> {
    const { data, error } = await supabase
      .from('moodboards')
      .select(`
        *,
        moodboard_elements (*)
      `)
      .eq('public_slug', slug)
      .eq('is_public', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Increment view count
    if (data) {
      await supabase
        .from('moodboards')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
    }

    return data as MoodboardWithElements;
  },

  /**
   * Create a new moodboard
   */
  async createMoodboard(moodboard: MoodboardInsert): Promise<Moodboard> {
    const { data, error } = await supabase
      .from('moodboards')
      .insert(moodboard)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a moodboard
   */
  async updateMoodboard(id: string, updates: MoodboardUpdate): Promise<Moodboard> {
    const { data, error } = await supabase
      .from('moodboards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a moodboard (cascades to elements)
   */
  async deleteMoodboard(id: string): Promise<void> {
    const { error } = await supabase
      .from('moodboards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Make a moodboard public with a unique slug
   */
  async publishMoodboard(id: string, slug: string): Promise<Moodboard> {
    return this.updateMoodboard(id, {
      is_public: true,
      public_slug: slug,
    });
  },

  /**
   * Unpublish a moodboard
   */
  async unpublishMoodboard(id: string): Promise<Moodboard> {
    return this.updateMoodboard(id, {
      is_public: false,
      public_slug: null,
    });
  },

  /**
   * Duplicate a moodboard
   */
  async duplicateMoodboard(
    id: string,
    newName: string
  ): Promise<MoodboardWithElements> {
    // Get original with elements
    const original = await this.getMoodboardWithElements(id);
    if (!original) throw new Error('Moodboard not found');

    // Create new moodboard
    const { moodboard_elements, ...moodboardData } = original;
    const newMoodboard = await this.createMoodboard({
      ...moodboardData,
      id: undefined,
      name: newName,
      is_primary: false,
      is_public: false,
      public_slug: null,
      view_count: 0,
      share_count: 0,
    } as MoodboardInsert);

    // Copy elements
    if (moodboard_elements && moodboard_elements.length > 0) {
      const newElements = moodboard_elements.map(el => ({
        ...el,
        id: undefined,
        moodboard_id: newMoodboard.id,
        created_at: undefined,
        updated_at: undefined,
      }));

      await supabase
        .from('moodboard_elements')
        .insert(newElements as MoodboardElementInsert[]);
    }

    return this.getMoodboardWithElements(newMoodboard.id) as Promise<MoodboardWithElements>;
  },

  // ============================================================================
  // MOODBOARD ELEMENTS
  // ============================================================================

  /**
   * Get all elements for a moodboard
   */
  async getMoodboardElements(moodboardId: string): Promise<MoodboardElement[]> {
    const { data, error } = await supabase
      .from('moodboard_elements')
      .select('*')
      .eq('moodboard_id', moodboardId)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get elements with referenced color/material data
   */
  async getMoodboardElementsWithRefs(
    moodboardId: string
  ): Promise<MoodboardElementWithRefs[]> {
    const { data, error } = await supabase
      .from('moodboard_elements')
      .select(`
        *,
        color_library (*),
        material_library (*)
      `)
      .eq('moodboard_id', moodboardId)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return (data || []) as MoodboardElementWithRefs[];
  },

  /**
   * Create a new element
   */
  async createElement(element: MoodboardElementInsert): Promise<MoodboardElement> {
    const { data, error } = await supabase
      .from('moodboard_elements')
      .insert(element)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an element
   */
  async updateElement(
    id: string,
    updates: MoodboardElementUpdate
  ): Promise<MoodboardElement> {
    const { data, error } = await supabase
      .from('moodboard_elements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update element position
   */
  async updateElementPosition(
    id: string,
    x: number,
    y: number
  ): Promise<MoodboardElement> {
    return this.updateElement(id, { position_x: x, position_y: y });
  },

  /**
   * Update element size
   */
  async updateElementSize(
    id: string,
    width: number,
    height: number
  ): Promise<MoodboardElement> {
    return this.updateElement(id, { width, height });
  },

  /**
   * Update element z-index
   */
  async updateElementZIndex(id: string, zIndex: number): Promise<MoodboardElement> {
    return this.updateElement(id, { z_index: zIndex });
  },

  /**
   * Delete an element
   */
  async deleteElement(id: string): Promise<void> {
    const { error } = await supabase
      .from('moodboard_elements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Batch update multiple elements (for undo/redo)
   */
  async batchUpdateElements(
    updates: Array<{ id: string; updates: MoodboardElementUpdate }>
  ): Promise<void> {
    for (const { id, updates: elementUpdates } of updates) {
      await this.updateElement(id, elementUpdates);
    }
  },

  /**
   * Lock/unlock an element
   */
  async toggleElementLock(id: string, locked: boolean): Promise<MoodboardElement> {
    return this.updateElement(id, { is_locked: locked });
  },

  /**
   * Show/hide an element
   */
  async toggleElementVisibility(
    id: string,
    visible: boolean
  ): Promise<MoodboardElement> {
    return this.updateElement(id, { is_visible: visible });
  },

  // ============================================================================
  // MOODBOARD SHARES
  // ============================================================================

  /**
   * Get all shares for a moodboard
   */
  async getMoodboardShares(moodboardId: string): Promise<MoodboardShare[]> {
    const { data, error } = await supabase
      .from('moodboard_shares')
      .select('*')
      .eq('moodboard_id', moodboardId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a share by short code
   */
  async getShareByShortCode(shortCode: string): Promise<MoodboardShare | null> {
    const { data, error } = await supabase
      .from('moodboard_shares')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Increment view count
    await supabase
      .from('moodboard_shares')
      .update({
        view_count: (data.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    return data;
  },

  /**
   * Create a share link
   */
  async createShare(share: MoodboardShareInsert): Promise<MoodboardShare> {
    const { data, error } = await supabase
      .from('moodboard_shares')
      .insert(share)
      .select()
      .single();

    if (error) throw error;

    // Increment share count on moodboard
    await supabase.rpc('increment_moodboard_share_count', {
      moodboard_id: share.moodboard_id,
    }).catch(() => {
      // Ignore if RPC doesn't exist
    });

    return data;
  },

  /**
   * Update a share
   */
  async updateShare(
    id: string,
    updates: MoodboardShareUpdate
  ): Promise<MoodboardShare> {
    const { data, error } = await supabase
      .from('moodboard_shares')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a share
   */
  async deleteShare(id: string): Promise<void> {
    const { error } = await supabase
      .from('moodboard_shares')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Generate a unique short code for sharing
   */
  generateShortCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },
};

export default MoodboardService;
