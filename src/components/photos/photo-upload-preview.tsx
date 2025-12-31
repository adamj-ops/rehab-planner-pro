'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconX,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
} from '@tabler/icons-react'

export interface PhotoPreviewItem {
  id: string
  file: File
  preview: string
  category: 'planning' | 'before' | 'during' | 'after' | 'issue'
  caption: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface PhotoUploadPreviewProps {
  photos: PhotoPreviewItem[]
  onRemove: (id: string) => void
  onUpdateCategory: (id: string, category: PhotoPreviewItem['category']) => void
  onUpdateCaption: (id: string, caption: string) => void
  disabled?: boolean
  className?: string
}

const CATEGORY_OPTIONS = [
  { value: 'before', label: 'Before' },
  { value: 'during', label: 'During' },
  { value: 'after', label: 'After' },
  { value: 'issue', label: 'Issue' },
  { value: 'planning', label: 'Planning' },
] as const

export function PhotoUploadPreview({
  photos,
  onRemove,
  onUpdateCategory,
  onUpdateCaption,
  disabled = false,
  className,
}: PhotoUploadPreviewProps) {
  if (photos.length === 0) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <PhotoPreviewCard
            key={photo.id}
            photo={photo}
            onRemove={onRemove}
            onUpdateCategory={onUpdateCategory}
            onUpdateCaption={onUpdateCaption}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

interface PhotoPreviewCardProps {
  photo: PhotoPreviewItem
  onRemove: (id: string) => void
  onUpdateCategory: (id: string, category: PhotoPreviewItem['category']) => void
  onUpdateCaption: (id: string, caption: string) => void
  disabled?: boolean
}

function PhotoPreviewCard({
  photo,
  onRemove,
  onUpdateCategory,
  onUpdateCaption,
  disabled,
}: PhotoPreviewCardProps) {
  const isUploading = photo.status === 'uploading'
  const isSuccess = photo.status === 'success'
  const isError = photo.status === 'error'
  const isPending = photo.status === 'pending'

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card overflow-hidden',
        isSuccess && 'border-green-500/50',
        isError && 'border-destructive/50'
      )}
    >
      {/* Image Preview */}
      <div className="relative aspect-video bg-muted">
        <img
          src={photo.preview}
          alt={photo.file.name}
          className="h-full w-full object-cover"
        />

        {/* Status Overlay */}
        {(isUploading || isSuccess || isError) && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              isUploading && 'bg-background/80',
              isSuccess && 'bg-green-500/20',
              isError && 'bg-destructive/20'
            )}
          >
            {isUploading && (
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {isSuccess && (
              <div className="rounded-full bg-green-500 p-2">
                <IconCheck className="h-6 w-6 text-white" />
              </div>
            )}
            {isError && (
              <div className="rounded-full bg-destructive p-2">
                <IconAlertCircle className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Remove Button */}
        {isPending && !disabled && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => onRemove(photo.id)}
          >
            <IconX className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <Progress value={photo.progress} className="h-1 rounded-none" />
      )}

      {/* Photo Details */}
      <div className="p-3 space-y-3">
        {/* Filename */}
        <p className="text-xs text-muted-foreground truncate">
          {photo.file.name}
        </p>

        {/* Category Select */}
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select
            value={photo.category}
            onValueChange={(value) =>
              onUpdateCategory(photo.id, value as PhotoPreviewItem['category'])
            }
            disabled={disabled || !isPending}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Caption Input */}
        <div className="space-y-1">
          <Label className="text-xs">Caption (optional)</Label>
          <Input
            value={photo.caption}
            onChange={(e) => onUpdateCaption(photo.id, e.target.value)}
            placeholder="Add a caption..."
            className="h-8 text-xs"
            disabled={disabled || !isPending}
          />
        </div>

        {/* Error Message */}
        {isError && photo.error && (
          <p className="text-xs text-destructive">{photo.error}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Create preview items from files
 */
export function createPhotoPreviewItems(
  files: File[],
  defaultCategory: PhotoPreviewItem['category'] = 'during'
): PhotoPreviewItem[] {
  return files.map((file) => ({
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    file,
    preview: URL.createObjectURL(file),
    category: defaultCategory,
    caption: '',
    status: 'pending' as const,
    progress: 0,
  }))
}

/**
 * Clean up preview URLs to prevent memory leaks
 */
export function revokePhotoPreviewUrls(photos: PhotoPreviewItem[]): void {
  photos.forEach((photo) => {
    URL.revokeObjectURL(photo.preview)
  })
}

export default PhotoUploadPreview
