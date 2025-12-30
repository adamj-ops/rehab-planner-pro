'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconDotsVertical,
  IconDownload,
  IconTrash,
  IconMaximize,
} from '@tabler/icons-react'
import type { ProjectPhoto } from '@/hooks/use-project-photos'

interface PhotoCardProps {
  photo: ProjectPhoto
  onClick?: () => void
  onDelete?: () => void
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  before: 'bg-amber-500/80 text-white',
  during: 'bg-blue-500/80 text-white',
  after: 'bg-green-500/80 text-white',
  issue: 'bg-red-500/80 text-white',
  planning: 'bg-purple-500/80 text-white',
}

const CATEGORY_LABELS: Record<string, string> = {
  before: 'Before',
  during: 'During',
  after: 'After',
  issue: 'Issue',
  planning: 'Planning',
}

export function PhotoCard({
  photo,
  onClick,
  onDelete,
  className,
}: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (photo.signedUrl) {
      window.open(photo.signedUrl, '_blank')
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      className={cn(
        'group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer',
        'transition-all duration-200',
        'hover:ring-2 hover:ring-primary hover:ring-offset-2',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      {!imageError && photo.thumbnailUrl ? (
        <img
          src={photo.thumbnailUrl}
          alt={photo.caption || photo.originalFilename}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">No preview</span>
        </div>
      )}

      {/* Category Badge */}
      <Badge
        className={cn(
          'absolute top-2 left-2 text-xs',
          CATEGORY_COLORS[photo.category]
        )}
      >
        {CATEGORY_LABELS[photo.category]}
      </Badge>

      {/* Hover Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 flex items-center justify-center gap-2',
          'transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          <IconMaximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-6 w-6',
              'transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <IconDotsVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownload}>
            <IconDownload className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          {onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Caption Overlay */}
      {photo.caption && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent',
            'transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
        </div>
      )}
    </div>
  )
}

export default PhotoCard
