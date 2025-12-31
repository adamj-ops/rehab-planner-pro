'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PhotoCard } from './photo-card'
import { PhotoLightbox } from './photo-lightbox'
import { IconPhoto } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { usePhotoDelete } from '@/hooks/use-photo-upload'
import { toast } from 'sonner'
import type { ProjectPhoto } from '@/hooks/use-project-photos'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PhotoGalleryProps {
  photos: ProjectPhoto[]
  isLoading?: boolean
  emptyMessage?: string
  onUploadClick?: () => void
  className?: string
}

export function PhotoGallery({
  photos,
  isLoading = false,
  emptyMessage = 'No photos yet',
  onUploadClick,
  className,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null)
  const deleteMutation = usePhotoDelete()

  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index)
  }

  const handleLightboxClose = () => {
    setSelectedIndex(null)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (selectedIndex === null) return
    
    if (direction === 'prev') {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : photos.length - 1)
    } else {
      setSelectedIndex(selectedIndex < photos.length - 1 ? selectedIndex + 1 : 0)
    }
  }

  const handleDeleteRequest = (photoId: string) => {
    setDeletePhotoId(photoId)
  }

  const handleDeleteConfirm = async () => {
    const photo = photos.find((p) => p.id === deletePhotoId)
    if (!photo) return

    try {
      await deleteMutation.mutateAsync({
        photoId: photo.id,
        projectId: photo.projectId,
        storagePath: photo.storagePath,
      })
      toast.success('Photo deleted', {
        description: 'The photo has been removed.',
      })
    } catch (error) {
      toast.error('Delete failed', {
        description: error instanceof Error ? error.message : 'Could not delete photo',
      })
    } finally {
      setDeletePhotoId(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', className)}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
        <IconPhoto className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload photos to start documenting your project
        </p>
        {onUploadClick && (
          <Button onClick={onUploadClick}>Upload Photos</Button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Photo Grid */}
      <div
        className={cn(
          'grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          className
        )}
      >
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => handlePhotoClick(index)}
            onDelete={() => handleDeleteRequest(photo.id)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && photos[selectedIndex] && (
        <PhotoLightbox
          photo={photos[selectedIndex]}
          onClose={handleLightboxClose}
          onPrevious={() => handleNavigate('prev')}
          onNext={() => handleNavigate('next')}
          hasPrevious={photos.length > 1}
          hasNext={photos.length > 1}
          currentIndex={selectedIndex}
          totalCount={photos.length}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PhotoGallery
