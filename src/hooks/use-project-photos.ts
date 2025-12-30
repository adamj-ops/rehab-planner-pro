/**
 * Project Photos Hook
 * 
 * React Query hook for fetching and managing project photos.
 */

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { photoStorage } from '@/lib/storage/photo-storage'

export interface ProjectPhoto {
  id: string
  projectId: string
  storagePath: string
  category: 'planning' | 'before' | 'during' | 'after' | 'issue'
  roomId: string | null
  caption: string | null
  tags: string[]
  fileSize: number
  width: number | null
  height: number | null
  mimeType: string
  originalFilename: string
  takenAt: string
  createdAt: string
  signedUrl?: string
  thumbnailUrl?: string
}

export interface PhotoFilters {
  category?: 'planning' | 'before' | 'during' | 'after' | 'issue'
  roomId?: string
  search?: string
}

async function fetchProjectPhotos(
  projectId: string,
  filters?: PhotoFilters
): Promise<ProjectPhoto[]> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  let query = supabase
    .from('project_photos')
    .select('*')
    .eq('project_id', projectId)
    .order('taken_at', { ascending: false })

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.roomId) {
    query = query.eq('room_id', filters.roomId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`)
  }

  // Get signed URLs for each photo
  const photosWithUrls = await Promise.all(
    (data || []).map(async (photo) => {
      let signedUrl: string | undefined
      let thumbnailUrl: string | undefined

      try {
        signedUrl = await photoStorage.getSignedUrl(photo.storage_path)
        thumbnailUrl = await photoStorage.getThumbnailUrl(photo.storage_path)
      } catch (err) {
        console.error(`Failed to get URLs for photo ${photo.id}:`, err)
      }

      return {
        id: photo.id,
        projectId: photo.project_id,
        storagePath: photo.storage_path,
        category: photo.category,
        roomId: photo.room_id,
        caption: photo.caption,
        tags: photo.tags || [],
        fileSize: photo.file_size_bytes,
        width: photo.width_px,
        height: photo.height_px,
        mimeType: photo.mime_type,
        originalFilename: photo.original_filename,
        takenAt: photo.taken_at,
        createdAt: photo.created_at,
        signedUrl,
        thumbnailUrl,
      }
    })
  )

  return photosWithUrls
}

export function useProjectPhotos(projectId: string, filters?: PhotoFilters) {
  return useQuery({
    queryKey: ['photos', projectId, filters],
    queryFn: () => fetchProjectPhotos(projectId, filters),
    enabled: !!projectId,
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    refetchOnWindowFocus: false,
  })
}

export function usePhoto(photoId: string) {
  return useQuery({
    queryKey: ['photo', photoId],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .eq('id', photoId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch photo: ${error.message}`)
      }

      const signedUrl = await photoStorage.getSignedUrl(data.storage_path)

      return {
        id: data.id,
        projectId: data.project_id,
        storagePath: data.storage_path,
        category: data.category,
        roomId: data.room_id,
        caption: data.caption,
        tags: data.tags || [],
        fileSize: data.file_size_bytes,
        width: data.width_px,
        height: data.height_px,
        mimeType: data.mime_type,
        originalFilename: data.original_filename,
        takenAt: data.taken_at,
        createdAt: data.created_at,
        signedUrl,
      }
    },
    enabled: !!photoId,
  })
}
