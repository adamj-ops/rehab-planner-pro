'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
} from '@tabler/icons-react'
import type { ProjectPhoto } from '@/hooks/use-project-photos'

interface PhotoLightboxProps {
  photo: ProjectPhoto
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  currentIndex?: number
  totalCount?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  before: 'Before',
  during: 'During',
  after: 'After',
  issue: 'Issue',
  planning: 'Planning',
}

export function PhotoLightbox({
  photo,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  currentIndex,
  totalCount,
}: PhotoLightboxProps) {
  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (hasPrevious) onPrevious?.()
          break
        case 'ArrowRight':
          if (hasNext) onNext?.()
          break
      }
    },
    [onClose, onPrevious, onNext, hasPrevious, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const handleDownload = () => {
    if (photo.signedUrl) {
      window.open(photo.signedUrl, '_blank')
    }
  }

  const formattedDate = new Date(photo.takenAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="capitalize">
            {CATEGORY_LABELS[photo.category]}
          </Badge>
          {currentIndex !== undefined && totalCount !== undefined && (
            <span className="text-sm text-white/60">
              {currentIndex + 1} of {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleDownload}
          >
            <IconDownload className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
          >
            <IconX className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative px-16">
        {/* Previous Button */}
        {hasPrevious && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10 h-12 w-12"
            onClick={onPrevious}
          >
            <IconChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Image */}
        <div className="max-h-full max-w-full flex items-center justify-center">
          <img
            src={photo.signedUrl || photo.thumbnailUrl}
            alt={photo.caption || photo.originalFilename}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>

        {/* Next Button */}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/10 h-12 w-12"
            onClick={onNext}
          >
            <IconChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Footer - Photo Details */}
      <div className="p-4 text-white">
        <div className="max-w-2xl mx-auto space-y-2">
          {photo.caption && (
            <p className="text-lg">{photo.caption}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-white/60">
            <span>{formattedDate}</span>
            <span>{photo.originalFilename}</span>
            {photo.width && photo.height && (
              <span>{photo.width} × {photo.height}</span>
            )}
            <span>{(photo.fileSize / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoLightbox
