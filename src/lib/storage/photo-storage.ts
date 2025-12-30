/**
 * Photo Storage Service
 * 
 * Handles photo uploads and retrieval from Supabase Storage.
 * Uses the 'project-photos' bucket with project-scoped folders.
 * 
 * Storage Structure:
 *   project-photos/
 *     {projectId}/
 *       {nanoid}.{ext}
 */

import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'

const BUCKET_NAME = 'project-photos'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface UploadOptions {
  category?: 'planning' | 'before' | 'during' | 'after' | 'issue'
  roomId?: string
  caption?: string
  tags?: string[]
  onProgress?: (percent: number) => void
}

export interface UploadResult {
  storagePath: string
  signedUrl: string
  thumbnailUrl: string
  fileSize: number
  width?: number
  height?: number
  mimeType: string
  originalFilename: string
}

export interface PhotoStorageError extends Error {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NOT_FOUND' | 'PERMISSION_DENIED'
}

function createStorageError(code: PhotoStorageError['code'], message: string): PhotoStorageError {
  const error = new Error(message) as PhotoStorageError
  error.code = code
  return error
}

/**
 * Validate file before upload
 */
function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw createStorageError(
      'FILE_TOO_LARGE',
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of 10MB`
    )
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw createStorageError(
      'INVALID_TYPE',
      `File type ${file.type} is not supported. Allowed types: JPEG, PNG, WebP, GIF`
    )
  }
}

/**
 * Get file extension from file object
 */
function getFileExtension(file: File): string {
  const nameParts = file.name.split('.')
  if (nameParts.length > 1) {
    return nameParts.pop()?.toLowerCase() || 'jpg'
  }
  // Fallback based on MIME type
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return mimeToExt[file.type] || 'jpg'
}

/**
 * Get image dimensions from file
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export const photoStorage = {
  /**
   * Upload a photo to Supabase Storage
   */
  async upload(projectId: string, file: File, options?: UploadOptions): Promise<UploadResult> {
    // Validate the file
    validateFile(file)

    const supabase = createClient()
    if (!supabase) {
      throw createStorageError('UPLOAD_FAILED', 'Supabase client not available')
    }

    // Generate unique filename
    const ext = getFileExtension(file)
    const filename = `${nanoid()}.${ext}`
    const storagePath = `${projectId}/${filename}`

    // Get image dimensions before upload
    let dimensions: { width: number; height: number } | undefined
    try {
      dimensions = await getImageDimensions(file)
    } catch {
      // Continue without dimensions if we can't read them
      console.warn('Could not read image dimensions')
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw createStorageError('UPLOAD_FAILED', error.message)
    }

    // Get signed URLs
    const signedUrl = await this.getSignedUrl(storagePath)
    const thumbnailUrl = await this.getThumbnailUrl(storagePath)

    return {
      storagePath,
      signedUrl,
      thumbnailUrl,
      fileSize: file.size,
      width: dimensions?.width,
      height: dimensions?.height,
      mimeType: file.type,
      originalFilename: file.name,
    }
  },

  /**
   * Get a signed URL for viewing a photo (expires in 1 hour by default)
   */
  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const supabase = createClient()
    if (!supabase) {
      throw createStorageError('NOT_FOUND', 'Supabase client not available')
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      throw createStorageError('NOT_FOUND', error.message)
    }

    return data.signedUrl
  },

  /**
   * Get a thumbnail URL with image transformation
   */
  async getThumbnailUrl(
    path: string, 
    options?: { width?: number; height?: number }
  ): Promise<string> {
    const supabase = createClient()
    if (!supabase) {
      throw createStorageError('NOT_FOUND', 'Supabase client not available')
    }

    const width = options?.width || 300
    const height = options?.height || 300

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 3600, {
        transform: {
          width,
          height,
          resize: 'cover',
        },
      })

    if (error) {
      console.error('Thumbnail URL error:', error)
      // Fallback to regular signed URL if transforms not available
      return this.getSignedUrl(path)
    }

    return data.signedUrl
  },

  /**
   * Delete a photo from storage
   */
  async delete(path: string): Promise<void> {
    const supabase = createClient()
    if (!supabase) {
      throw createStorageError('NOT_FOUND', 'Supabase client not available')
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      throw createStorageError('PERMISSION_DENIED', error.message)
    }
  },

  /**
   * Delete multiple photos from storage
   */
  async deleteMany(paths: string[]): Promise<void> {
    const supabase = createClient()
    if (!supabase) {
      throw createStorageError('NOT_FOUND', 'Supabase client not available')
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths)

    if (error) {
      console.error('Delete many error:', error)
      throw createStorageError('PERMISSION_DENIED', error.message)
    }
  },

  /**
   * List all photos in a project folder
   */
  async list(projectId: string): Promise<{ name: string; path: string }[]> {
    const supabase = createClient()
    if (!supabase) {
      throw createStorageError('NOT_FOUND', 'Supabase client not available')
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(projectId, {
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('List error:', error)
      throw createStorageError('PERMISSION_DENIED', error.message)
    }

    return (data || []).map((file) => ({
      name: file.name,
      path: `${projectId}/${file.name}`,
    }))
  },
}

export default photoStorage
