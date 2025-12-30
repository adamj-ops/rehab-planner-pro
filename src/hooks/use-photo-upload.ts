/**
 * Photo Upload Hook
 * 
 * React Query mutation hook for uploading photos with progress tracking.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { photoStorage, UploadResult } from '@/lib/storage/photo-storage'

export interface PhotoUploadData {
  projectId: string
  file: File
  category: 'planning' | 'before' | 'during' | 'after' | 'issue'
  roomId?: string
  caption?: string
  tags?: string[]
}

export interface UploadedPhoto {
  id: string
  projectId: string
  storagePath: string
  category: string
  roomId?: string
  caption?: string
  tags?: string[]
  fileSize: number
  width?: number
  height?: number
  mimeType: string
  originalFilename: string
  signedUrl: string
  thumbnailUrl: string
  createdAt: string
}

interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

/**
 * Upload a single photo and save metadata to database
 */
async function uploadPhoto(data: PhotoUploadData): Promise<UploadedPhoto> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  // 1. Upload to storage
  const uploadResult = await photoStorage.upload(data.projectId, data.file)

  // 2. Save metadata to database
  const { data: photoRecord, error } = await supabase
    .from('project_photos')
    .insert({
      project_id: data.projectId,
      storage_path: uploadResult.storagePath,
      category: data.category,
      room_id: data.roomId || null,
      caption: data.caption || null,
      tags: data.tags || [],
      file_size_bytes: uploadResult.fileSize,
      width_px: uploadResult.width,
      height_px: uploadResult.height,
      mime_type: uploadResult.mimeType,
      original_filename: uploadResult.originalFilename,
    })
    .select()
    .single()

  if (error) {
    // Rollback: delete the uploaded file
    try {
      await photoStorage.delete(uploadResult.storagePath)
    } catch (deleteError) {
      console.error('Failed to rollback uploaded file:', deleteError)
    }
    throw new Error(`Failed to save photo: ${error.message}`)
  }

  // 3. Log activity
  await supabase.from('project_activity').insert({
    project_id: data.projectId,
    action: 'photo_uploaded',
    entity_type: 'photo',
    entity_id: photoRecord.id,
    metadata: {
      category: data.category,
      filename: uploadResult.originalFilename,
    },
  })

  return {
    id: photoRecord.id,
    projectId: photoRecord.project_id,
    storagePath: photoRecord.storage_path,
    category: photoRecord.category,
    roomId: photoRecord.room_id,
    caption: photoRecord.caption,
    tags: photoRecord.tags,
    fileSize: photoRecord.file_size_bytes,
    width: photoRecord.width_px,
    height: photoRecord.height_px,
    mimeType: photoRecord.mime_type,
    originalFilename: photoRecord.original_filename,
    signedUrl: uploadResult.signedUrl,
    thumbnailUrl: uploadResult.thumbnailUrl,
    createdAt: photoRecord.created_at,
  }
}

/**
 * Hook for uploading a single photo
 */
export function usePhotoUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (data) => {
      // Invalidate photos query to refetch
      queryClient.invalidateQueries({ queryKey: ['photos', data.projectId] })
      // Also invalidate project activity
      queryClient.invalidateQueries({ queryKey: ['activity', data.projectId] })
    },
  })
}

/**
 * Hook for uploading multiple photos
 */
export function useMultiPhotoUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      uploads: Array<Omit<PhotoUploadData, 'file'> & { files: File[] }>
    ): Promise<UploadedPhoto[]> => {
      const results: UploadedPhoto[] = []
      const errors: Array<{ file: string; error: string }> = []

      for (const upload of uploads) {
        for (const file of upload.files) {
          try {
            const result = await uploadPhoto({
              ...upload,
              file,
            })
            results.push(result)
          } catch (error) {
            errors.push({
              file: file.name,
              error: error instanceof Error ? error.message : 'Upload failed',
            })
          }
        }
      }

      if (errors.length > 0 && results.length === 0) {
        throw new Error(`All uploads failed: ${errors.map(e => e.file).join(', ')}`)
      }

      return results
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        const projectId = data[0].projectId
        queryClient.invalidateQueries({ queryKey: ['photos', projectId] })
        queryClient.invalidateQueries({ queryKey: ['activity', projectId] })
      }
    },
  })
}

/**
 * Hook for deleting a photo
 */
export function usePhotoDelete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photoId, projectId, storagePath }: { 
      photoId: string
      projectId: string
      storagePath: string 
    }) => {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Delete from database
      const { error } = await supabase
        .from('project_photos')
        .delete()
        .eq('id', photoId)

      if (error) {
        throw new Error(`Failed to delete photo: ${error.message}`)
      }

      // Delete from storage
      await photoStorage.delete(storagePath)

      // Log activity
      await supabase.from('project_activity').insert({
        project_id: projectId,
        action: 'photo_deleted',
        entity_type: 'photo',
        entity_id: photoId,
      })

      return { photoId, projectId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['photos', data.projectId] })
    },
  })
}
