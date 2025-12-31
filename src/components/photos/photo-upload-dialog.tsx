'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { IconUpload, IconLoader2 } from '@tabler/icons-react'
import { PhotoDropzone } from './photo-dropzone'
import {
  PhotoUploadPreview,
  PhotoPreviewItem,
  createPhotoPreviewItems,
  revokePhotoPreviewUrls,
} from './photo-upload-preview'
import { usePhotoUpload } from '@/hooks/use-photo-upload'

interface PhotoUploadDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: PhotoPreviewItem['category']
}

export function PhotoUploadDialog({
  projectId,
  open,
  onOpenChange,
  defaultCategory = 'during',
}: PhotoUploadDialogProps) {
  const [photos, setPhotos] = useState<PhotoPreviewItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const uploadMutation = usePhotoUpload()

  // Clean up preview URLs when dialog closes
  useEffect(() => {
    if (!open && photos.length > 0) {
      revokePhotoPreviewUrls(photos)
      setPhotos([])
    }
  }, [open])

  // Handle files dropped
  const handleDrop = useCallback(
    (files: File[]) => {
      const newPhotos = createPhotoPreviewItems(files, defaultCategory)
      setPhotos((prev) => [...prev, ...newPhotos])
    },
    [defaultCategory]
  )

  // Remove a photo from the list
  const handleRemove = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  // Update category for a photo
  const handleUpdateCategory = useCallback(
    (id: string, category: PhotoPreviewItem['category']) => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, category } : p))
      )
    },
    []
  )

  // Update caption for a photo
  const handleUpdateCaption = useCallback((id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    )
  }, [])

  // Upload all photos
  const handleUpload = async () => {
    if (photos.length === 0) return

    setIsUploading(true)
    let successCount = 0
    let errorCount = 0

    // Upload photos sequentially
    for (const photo of photos) {
      // Update status to uploading
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, status: 'uploading' as const, progress: 50 } : p
        )
      )

      try {
        await uploadMutation.mutateAsync({
          projectId,
          file: photo.file,
          category: photo.category,
          caption: photo.caption || undefined,
        })

        // Update status to success
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, status: 'success' as const, progress: 100 }
              : p
          )
        )
        successCount++
      } catch (error) {
        // Update status to error
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? {
                  ...p,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : p
          )
        )
        errorCount++
      }
    }

    setIsUploading(false)

    // Show toast with results
    if (successCount > 0 && errorCount === 0) {
      toast.success('Photos uploaded', {
        description: `Successfully uploaded ${successCount} photo${successCount !== 1 ? 's' : ''}.`,
      })
      // Close dialog and reset after short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 1000)
    } else if (errorCount > 0) {
      toast.error('Some uploads failed', {
        description: `${successCount} succeeded, ${errorCount} failed.`,
      })
    }
  }

  // Cancel and close
  const handleCancel = () => {
    if (isUploading) return
    revokePhotoPreviewUrls(photos)
    setPhotos([])
    onOpenChange(false)
  }

  const pendingCount = photos.filter((p) => p.status === 'pending').length
  const canUpload = pendingCount > 0 && !isUploading

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Add photos to document your project. You can upload multiple files at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dropzone */}
          <PhotoDropzone
            onDrop={handleDrop}
            disabled={isUploading}
            maxFiles={20}
          />

          {/* Photo Previews */}
          <PhotoUploadPreview
            photos={photos}
            onRemove={handleRemove}
            onUpdateCategory={handleUpdateCategory}
            onUpdateCaption={handleUpdateCaption}
            disabled={isUploading}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!canUpload}
          >
            {isUploading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <IconUpload className="mr-2 h-4 w-4" />
                Upload {pendingCount > 0 ? `${pendingCount} Photo${pendingCount !== 1 ? 's' : ''}` : 'Photos'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PhotoUploadDialog
