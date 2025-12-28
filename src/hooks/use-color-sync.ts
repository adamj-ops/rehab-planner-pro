/**
 * @file use-color-sync.ts
 * @description Hook to synchronize color selections between Zustand store and Supabase
 * 
 * This hook provides:
 * - Loading project color selections from Supabase
 * - Saving/updating/deleting selections to Supabase
 * - Type conversions between database and application types
 */

import { useCallback, useState } from 'react';
import { useDesignStore } from '@/stores/design-store';
import { ColorService } from '@/lib/design';
import type { ProjectColorSelection, RoomType, SurfaceType, PaintFinish } from '@/types/design';
import type { ProjectColorSelectionInsert, ProjectColorSelectionUpdate } from '@/types/database';

// ============================================================================
// TYPE CONVERTERS
// ============================================================================

/**
 * Convert database row to application type
 */
function dbToAppSelection(dbRow: Record<string, unknown>): ProjectColorSelection {
  return {
    id: dbRow.id as string,
    projectId: dbRow.project_id as string,
    roomType: dbRow.room_type as RoomType,
    roomName: dbRow.room_name as string | null,
    surfaceType: dbRow.surface_type as SurfaceType,
    colorId: dbRow.color_id as string | null,
    customColorName: dbRow.custom_color_name as string | null,
    customHexCode: dbRow.custom_hex_code as string | null,
    finish: dbRow.finish as PaintFinish | null,
    coats: (dbRow.coats as number) || 2,
    primerNeeded: (dbRow.primer_needed as boolean) || false,
    linkedScopeItemId: dbRow.linked_scope_item_id as string | null,
    notes: dbRow.notes as string | null,
    applicationInstructions: dbRow.application_instructions as string | null,
    isPrimary: (dbRow.is_primary as boolean) || false,
    isApproved: (dbRow.is_approved as boolean) || false,
    approvedByClient: (dbRow.approved_by_client as boolean) || false,
    createdAt: new Date(dbRow.created_at as string),
    updatedAt: new Date(dbRow.updated_at as string),
    // Handle nested color data if present
    color: dbRow.color_library ? convertColorLibraryRow(dbRow.color_library as Record<string, unknown>) : undefined,
  };
}

/**
 * Convert color library row to ColorLibraryItem
 */
function convertColorLibraryRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    brand: row.brand as string,
    colorCode: row.color_code as string | null,
    colorName: row.color_name as string,
    hexCode: row.hex_code as string,
    rgbValues: row.rgb_values as { r: number; g: number; b: number },
    lrv: row.lrv as number | null,
    undertones: row.undertones as ('warm' | 'cool' | 'neutral')[],
    colorFamily: row.color_family as string | null,
    finishOptions: row.finish_options as PaintFinish[],
    recommendedRooms: row.recommended_rooms as RoomType[],
    recommendedSurfaces: row.recommended_surfaces as SurfaceType[],
    imageUrl: row.image_url as string | null,
    popular: (row.popular as boolean) || false,
    yearIntroduced: row.year_introduced as number | null,
    isActive: (row.is_active as boolean) ?? true,
    designStyles: row.design_styles as string[],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/**
 * Convert application type to database insert format
 */
function appToDbInsert(
  selection: Omit<ProjectColorSelection, 'id' | 'createdAt' | 'updatedAt' | 'isApproved' | 'approvedByClient' | 'color'>
): ProjectColorSelectionInsert {
  return {
    project_id: selection.projectId,
    room_type: selection.roomType,
    room_name: selection.roomName || null,
    surface_type: selection.surfaceType,
    color_id: selection.colorId || null,
    custom_color_name: selection.customColorName || null,
    custom_hex_code: selection.customHexCode || null,
    finish: selection.finish || null,
    coats: selection.coats || 2,
    primer_needed: selection.primerNeeded || false,
    linked_scope_item_id: selection.linkedScopeItemId || null,
    notes: selection.notes || null,
    application_instructions: selection.applicationInstructions || null,
    is_primary: selection.isPrimary || false,
  };
}

/**
 * Convert partial application updates to database update format
 */
function appToDbUpdate(updates: Partial<ProjectColorSelection>): ProjectColorSelectionUpdate {
  const dbUpdates: ProjectColorSelectionUpdate = {};
  
  if (updates.roomType !== undefined) dbUpdates.room_type = updates.roomType;
  if (updates.roomName !== undefined) dbUpdates.room_name = updates.roomName;
  if (updates.surfaceType !== undefined) dbUpdates.surface_type = updates.surfaceType;
  if (updates.colorId !== undefined) dbUpdates.color_id = updates.colorId;
  if (updates.customColorName !== undefined) dbUpdates.custom_color_name = updates.customColorName;
  if (updates.customHexCode !== undefined) dbUpdates.custom_hex_code = updates.customHexCode;
  if (updates.finish !== undefined) dbUpdates.finish = updates.finish;
  if (updates.coats !== undefined) dbUpdates.coats = updates.coats;
  if (updates.primerNeeded !== undefined) dbUpdates.primer_needed = updates.primerNeeded;
  if (updates.linkedScopeItemId !== undefined) dbUpdates.linked_scope_item_id = updates.linkedScopeItemId;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.applicationInstructions !== undefined) dbUpdates.application_instructions = updates.applicationInstructions;
  if (updates.isPrimary !== undefined) dbUpdates.is_primary = updates.isPrimary;
  if (updates.isApproved !== undefined) dbUpdates.is_approved = updates.isApproved;
  if (updates.approvedByClient !== undefined) dbUpdates.approved_by_client = updates.approvedByClient;
  
  return dbUpdates;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export interface UseColorSyncOptions {
  /** Project ID to sync colors for */
  projectId: string;
  /** Whether to auto-load on mount */
  autoLoad?: boolean;
}

export interface UseColorSyncResult {
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether changes are being synced */
  syncing: boolean;
  
  /** Load color selections from Supabase into the store */
  loadFromSupabase: () => Promise<void>;
  
  /** Save a new selection to Supabase (also updates store) */
  saveToSupabase: (selection: Omit<ProjectColorSelection, 'id' | 'createdAt' | 'updatedAt' | 'isApproved' | 'approvedByClient' | 'color'>) => Promise<ProjectColorSelection>;
  
  /** Update a selection in Supabase (also updates store) */
  updateInSupabase: (id: string, updates: Partial<ProjectColorSelection>) => Promise<void>;
  
  /** Delete a selection from Supabase (also updates store) */
  deleteFromSupabase: (id: string) => Promise<void>;
  
  /** Sync all local changes to Supabase (for offline-first pattern) */
  syncAllToSupabase: () => Promise<void>;
}

/**
 * Hook to synchronize color selections between the local store and Supabase
 * 
 * @example
 * ```tsx
 * const { loadFromSupabase, saveToSupabase, loading } = useColorSync({ projectId });
 * 
 * // Load on mount
 * useEffect(() => {
 *   loadFromSupabase();
 * }, [loadFromSupabase]);
 * 
 * // Save a new selection
 * await saveToSupabase(selectionData);
 * ```
 */
export function useColorSync({ projectId }: UseColorSyncOptions): UseColorSyncResult {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const {
    setProjectColorSelections,
    setColorSelectionsLoading,
    addColorSelection,
    updateColorSelection,
    removeColorSelection,
    projectColorSelections,
  } = useDesignStore();

  /**
   * Load color selections from Supabase into the store
   */
  const loadFromSupabase = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setColorSelectionsLoading(true);
    setError(null);
    
    try {
      const dbSelections = await ColorService.getProjectColorSelections(projectId);
      const appSelections = dbSelections.map(row => dbToAppSelection(row as unknown as Record<string, unknown>));
      setProjectColorSelections(appSelections);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load color selections');
      setError(error);
      console.error('Failed to load color selections:', error);
    } finally {
      setLoading(false);
      setColorSelectionsLoading(false);
    }
  }, [projectId, setProjectColorSelections, setColorSelectionsLoading]);

  /**
   * Save a new color selection to Supabase
   */
  const saveToSupabase = useCallback(async (
    selection: Omit<ProjectColorSelection, 'id' | 'createdAt' | 'updatedAt' | 'isApproved' | 'approvedByClient' | 'color'>
  ): Promise<ProjectColorSelection> => {
    setSyncing(true);
    setError(null);
    
    try {
      const dbInsert = appToDbInsert(selection);
      const dbResult = await ColorService.createProjectColorSelection(dbInsert);
      const appResult = dbToAppSelection(dbResult as unknown as Record<string, unknown>);
      
      // Update local store
      addColorSelection(appResult);
      
      return appResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save color selection');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [addColorSelection]);

  /**
   * Update a color selection in Supabase
   */
  const updateInSupabase = useCallback(async (
    id: string,
    updates: Partial<ProjectColorSelection>
  ): Promise<void> => {
    setSyncing(true);
    setError(null);
    
    try {
      const dbUpdates = appToDbUpdate(updates);
      await ColorService.updateProjectColorSelection(id, dbUpdates);
      
      // Update local store
      updateColorSelection(id, updates);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update color selection');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [updateColorSelection]);

  /**
   * Delete a color selection from Supabase
   */
  const deleteFromSupabase = useCallback(async (id: string): Promise<void> => {
    setSyncing(true);
    setError(null);
    
    try {
      await ColorService.deleteProjectColorSelection(id);
      
      // Update local store
      removeColorSelection(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete color selection');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [removeColorSelection]);

  /**
   * Sync all local selections to Supabase
   * This is useful for offline-first patterns where you want to batch sync
   */
  const syncAllToSupabase = useCallback(async (): Promise<void> => {
    if (!projectId) return;
    
    setSyncing(true);
    setError(null);
    
    try {
      // Get existing selections from Supabase
      const existingDb = await ColorService.getProjectColorSelections(projectId);
      const existingIds = new Set(existingDb.map(s => s.id));
      
      // Find new selections (local only, not in Supabase)
      const newSelections = projectColorSelections.filter(s => !existingIds.has(s.id));
      
      // Create new selections in Supabase
      for (const selection of newSelections) {
        const dbInsert = appToDbInsert(selection);
        await ColorService.createProjectColorSelection(dbInsert);
      }
      
      // Update existing selections
      const existingSelections = projectColorSelections.filter(s => existingIds.has(s.id));
      for (const selection of existingSelections) {
        const dbUpdate = appToDbUpdate(selection);
        await ColorService.updateProjectColorSelection(selection.id, dbUpdate);
      }
      
      // Find deleted selections (in Supabase but not local)
      const localIds = new Set(projectColorSelections.map(s => s.id));
      const deletedIds = Array.from(existingIds).filter(id => !localIds.has(id));
      
      for (const id of deletedIds) {
        await ColorService.deleteProjectColorSelection(id);
      }
      
      console.log(`Synced ${newSelections.length} new, ${existingSelections.length} updated, ${deletedIds.length} deleted`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync color selections');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [projectId, projectColorSelections]);

  return {
    loading,
    error,
    syncing,
    loadFromSupabase,
    saveToSupabase,
    updateInSupabase,
    deleteFromSupabase,
    syncAllToSupabase,
  };
}

export default useColorSync;
