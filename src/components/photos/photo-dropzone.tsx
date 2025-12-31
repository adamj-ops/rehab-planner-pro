'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react'

interface PhotoDropzoneProps {
  onDrop: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  className?: string
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function PhotoDropzone({
  onDrop,
  disabled = false,
  maxFiles = 20,
  className,
}: PhotoDropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles)
      }
    },
    [onDrop]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop: handleDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    disabled,
    multiple: true,
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'min-h-[200px] rounded-lg border-2 border-dashed',
          'transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10',
          isDragAccept && 'border-green-500 bg-green-500/10',
          isDragReject && 'border-destructive bg-destructive/10',
          disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4 p-6 text-center">
          {isDragActive ? (
            <>
              <div className="rounded-full bg-primary/20 p-4">
                <IconUpload className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop photos here</p>
                <p className="text-sm text-muted-foreground">
                  Release to upload
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-4">
                <IconPhoto className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Drag & drop photos here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, GIF • Max 10MB per file • Up to {maxFiles} files
              </p>
            </>
          )}
        </div>
      </div>

      {/* File rejection errors */}
      {fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm"
            >
              <IconX className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">{file.name}</p>
                {errors.map((error) => (
                  <p key={error.code} className="text-destructive/80">
                    {error.code === 'file-too-large'
                      ? 'File is larger than 10MB'
                      : error.code === 'file-invalid-type'
                      ? 'File type not supported'
                      : error.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotoDropzone
