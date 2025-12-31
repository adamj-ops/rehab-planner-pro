'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { IconPhoto, IconX, IconUpload, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// =============================================================================
// TYPES
// =============================================================================

interface RoomPhoto {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
}

interface RoomPhotoUploadProps {
  roomId: string;
  photos: RoomPhoto[];
  onPhotosChange: (photos: RoomPhoto[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RoomPhotoUpload({
  roomId,
  photos,
  onPhotosChange,
  maxPhotos = 10,
  disabled = false,
}: RoomPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Handle file drop/selection
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || photos.length >= maxPhotos) return;

      // Limit to remaining slots
      const availableSlots = maxPhotos - photos.length;
      const filesToAdd = acceptedFiles.slice(0, availableSlots);

      // Create preview photos with temporary URLs
      const newPhotos: RoomPhoto[] = filesToAdd.map((file) => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        url: URL.createObjectURL(file),
        file,
        isUploading: true,
      }));

      // Add to list immediately for preview
      const updatedPhotos = [...photos, ...newPhotos];
      onPhotosChange(updatedPhotos);

      // Simulate upload (in real implementation, upload to Supabase Storage)
      setIsUploading(true);
      
      // Mark as uploaded after delay (mock)
      setTimeout(() => {
        const finalPhotos = updatedPhotos.map((p) => ({
          ...p,
          isUploading: false,
        }));
        onPhotosChange(finalPhotos);
        setIsUploading(false);
      }, 1000);
    },
    [photos, maxPhotos, disabled, onPhotosChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'],
    },
    maxFiles: maxPhotos - photos.length,
    disabled: disabled || photos.length >= maxPhotos,
  });

  // Remove photo
  const removePhoto = useCallback(
    (photoId: string) => {
      const photo = photos.find((p) => p.id === photoId);
      if (photo?.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
      onPhotosChange(photos.filter((p) => p.id !== photoId));
    },
    [photos, onPhotosChange]
  );

  return (
    <div className="space-y-3">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square border bg-muted overflow-hidden group"
            >
              <Image
                src={photo.url}
                alt="Room photo"
                fill
                className={cn(
                  'object-cover',
                  photo.isUploading && 'opacity-50'
                )}
              />
              {photo.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {!photo.isUploading && !disabled && (
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconX className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      {photos.length < maxPhotos && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-none p-4 text-center cursor-pointer transition-colors',
            isDragActive && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            !isDragActive && !disabled && 'hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <IconUpload className="h-5 w-5" />
            <span className="text-xs">
              {isDragActive
                ? 'Drop photos here'
                : `Add photos (${photos.length}/${maxPhotos})`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export type { RoomPhoto, RoomPhotoUploadProps };
