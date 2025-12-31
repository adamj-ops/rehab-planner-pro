'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// Types for mentionable entities
export interface MentionableEntity {
  key: string
  text: string
  type: 'room' | 'vendor' | 'scope_item' | 'material'
  icon?: string
  data?: Record<string, unknown>
}

/**
 * Fetch rooms for a project
 */
async function fetchProjectRooms(projectId: string): Promise<MentionableEntity[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('project_rooms')
    .select('id, name, room_type')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('name')
  
  if (error) {
    console.error('Error fetching rooms:', error)
    return []
  }
  
  return (data || []).map((room) => ({
    key: `room-${room.id}`,
    text: room.name || room.room_type,
    type: 'room' as const,
    icon: '🏠',
    data: room,
  }))
}

/**
 * Fetch vendors for a project
 */
async function fetchProjectVendors(projectId: string): Promise<MentionableEntity[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('project_vendors')
    .select('id, vendor_name, trade_type')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('vendor_name')
  
  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }
  
  return (data || []).map((vendor) => ({
    key: `vendor-${vendor.id}`,
    text: vendor.vendor_name,
    type: 'vendor' as const,
    icon: '👷',
    data: vendor,
  }))
}

/**
 * Fetch scope items for a project
 */
async function fetchProjectScopeItems(projectId: string): Promise<MentionableEntity[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('scope_items')
    .select('id, name, category, room_id')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('name')
    .limit(50) // Limit to prevent too many items
  
  if (error) {
    console.error('Error fetching scope items:', error)
    return []
  }
  
  return (data || []).map((item) => ({
    key: `scope-${item.id}`,
    text: item.name,
    type: 'scope_item' as const,
    icon: '🔧',
    data: item,
  }))
}

/**
 * Fetch materials for a project (from material selections)
 */
async function fetchProjectMaterials(projectId: string): Promise<MentionableEntity[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('material_selections')
    .select('id, material_name, category')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('material_name')
    .limit(50)
  
  if (error) {
    console.error('Error fetching materials:', error)
    return []
  }
  
  return (data || []).map((material) => ({
    key: `material-${material.id}`,
    text: material.material_name,
    type: 'material' as const,
    icon: '🪵',
    data: material,
  }))
}

/**
 * Hook to fetch all mentionable entities for a project
 */
export function useProjectEntities(projectId: string | null) {
  return useQuery({
    queryKey: ['project-entities', projectId],
    queryFn: async (): Promise<MentionableEntity[]> => {
      if (!projectId) return []
      
      const [rooms, vendors, scopeItems, materials] = await Promise.all([
        fetchProjectRooms(projectId),
        fetchProjectVendors(projectId),
        fetchProjectScopeItems(projectId),
        fetchProjectMaterials(projectId),
      ])
      
      return [...rooms, ...vendors, ...scopeItems, ...materials]
    },
    enabled: !!projectId,
    staleTime: 30000, // Cache for 30 seconds
  })
}

/**
 * Hook to fetch only rooms
 */
export function useProjectRooms(projectId: string | null) {
  return useQuery({
    queryKey: ['project-rooms', projectId],
    queryFn: () => (projectId ? fetchProjectRooms(projectId) : []),
    enabled: !!projectId,
    staleTime: 30000,
  })
}

/**
 * Hook to fetch only vendors
 */
export function useProjectVendors(projectId: string | null) {
  return useQuery({
    queryKey: ['project-vendors', projectId],
    queryFn: () => (projectId ? fetchProjectVendors(projectId) : []),
    enabled: !!projectId,
    staleTime: 30000,
  })
}

/**
 * Hook to fetch only scope items
 */
export function useProjectScopeItems(projectId: string | null) {
  return useQuery({
    queryKey: ['project-scope-items', projectId],
    queryFn: () => (projectId ? fetchProjectScopeItems(projectId) : []),
    enabled: !!projectId,
    staleTime: 30000,
  })
}

/**
 * Filter entities based on search query
 */
export function filterEntities(
  entities: MentionableEntity[],
  search: string
): MentionableEntity[] {
  if (!search) return entities
  
  const lowerSearch = search.toLowerCase()
  return entities.filter((entity) =>
    entity.text.toLowerCase().includes(lowerSearch)
  )
}

/**
 * Group entities by type
 */
export function groupEntitiesByType(
  entities: MentionableEntity[]
): Record<string, MentionableEntity[]> {
  return entities.reduce(
    (acc, entity) => {
      const key = entity.type
      if (!acc[key]) acc[key] = []
      acc[key].push(entity)
      return acc
    },
    {} as Record<string, MentionableEntity[]>
  )
}

/**
 * Get display label for entity type
 */
export function getEntityTypeLabel(type: string): string {
  switch (type) {
    case 'room':
      return 'Rooms'
    case 'vendor':
      return 'Vendors'
    case 'scope_item':
      return 'Scope Items'
    case 'material':
      return 'Materials'
    default:
      return type
  }
}
