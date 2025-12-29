'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { 
  IconLoader2, 
  IconAlertCircle,
  IconDeviceFloppy,
  IconCircleCheck
} from '@/lib/icons'
import { 
  type AutoSaveStatus, 
  getStatusText, 
  getStatusColor 
} from '@/hooks/use-auto-save'

// ============================================================================
// Types
// ============================================================================

interface SaveStatusIndicatorProps {
  /** Current save status */
  status: AutoSaveStatus
  /** Last saved timestamp */
  lastSaved: Date | null
  /** Error message (if any) */
  error?: Error | null
  /** Whether there are unsaved changes */
  isDirty?: boolean
  /** Callback to trigger manual save */
  onSave?: () => void
  /** Show the save button */
  showSaveButton?: boolean
  /** Size variant */
  size?: 'sm' | 'default'
  /** Additional class names */
  className?: string
}

// ============================================================================
// Status Icon Component
// ============================================================================

interface StatusIconProps {
  status: AutoSaveStatus
  className?: string
}

function StatusIcon({ status, className }: StatusIconProps) {
  switch (status) {
    case 'idle':
      return null
    case 'saved':
      return (
        <IconCircleCheck 
          className={cn('h-4 w-4 text-green-600 dark:text-green-400', className)} 
          stroke={1.5} 
        />
      )
    case 'pending':
      return (
        <IconDeviceFloppy 
          className={cn('h-4 w-4 text-amber-600 dark:text-amber-400', className)} 
          stroke={1.5} 
        />
      )
    case 'saving':
      return (
        <IconLoader2 
          className={cn('h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin', className)} 
          stroke={1.5} 
        />
      )
    case 'error':
      return (
        <IconAlertCircle 
          className={cn('h-4 w-4 text-red-600 dark:text-red-400', className)} 
          stroke={1.5} 
        />
      )
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatLastSaved(date: Date | null): string {
  if (!date) return ''
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  
  if (diffSeconds < 10) {
    return 'just now'
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s ago`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

// ============================================================================
// Main Component
// ============================================================================

const SaveStatusIndicator = forwardRef<HTMLDivElement, SaveStatusIndicatorProps>(
  ({ 
    status, 
    lastSaved, 
    error, 
    isDirty: _isDirty, // Prefixed with _ to indicate intentionally unused
    onSave,
    showSaveButton = true,
    size = 'default',
    className 
  }, ref) => {
    const statusText = getStatusText(status)
    const statusColor = getStatusColor(status)
    const lastSavedText = formatLastSaved(lastSaved)
    
    const isSmall = size === 'sm'
    
    return (
      <TooltipProvider>
        <div 
          ref={ref}
          className={cn(
            'flex items-center gap-2',
            isSmall ? 'text-xs' : 'text-sm',
            className
          )}
        >
          {/* Status indicator with animation */}
          <div className={cn(
            'flex items-center gap-1.5 transition-all duration-300',
            status === 'saving' && 'opacity-80'
          )}>
            <StatusIcon status={status} />
            
            <span className={cn('font-medium', statusColor)}>
              {statusText}
            </span>
            
            {/* Last saved timestamp */}
            {lastSaved && status !== 'saving' && status !== 'error' && (
              <span className="text-muted-foreground">
                ({lastSavedText})
              </span>
            )}
          </div>
          
          {/* Error tooltip */}
          {status === 'error' && error && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconAlertCircle 
                  className="h-4 w-4 cursor-help text-red-600" 
                  stroke={1.5} 
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs text-sm">{error.message}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Manual save button */}
          {showSaveButton && onSave && (status === 'pending' || status === 'error') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={status === 'saving'}
              className={cn(
                'h-7 px-2',
                isSmall && 'h-6 px-1.5 text-xs'
              )}
            >
              <IconDeviceFloppy className="mr-1 h-3.5 w-3.5" stroke={1.5} />
              Save
            </Button>
          )}
        </div>
      </TooltipProvider>
    )
  }
)

SaveStatusIndicator.displayName = 'SaveStatusIndicator'

// ============================================================================
// Compact Version for Header/Footer
// ============================================================================

interface CompactSaveStatusProps {
  status: AutoSaveStatus
  onSave?: () => void
}

function CompactSaveStatus({ status, onSave }: CompactSaveStatusProps) {
  const canSave = status === 'pending' || status === 'error'
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={canSave ? onSave : undefined}
            disabled={!canSave || status === 'saving'}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
              canSave && 'hover:bg-accent cursor-pointer',
              !canSave && 'cursor-default',
              className
            )}
          >
            <StatusIcon status={status} />
            <span className={getStatusColor(status)}>
              {getStatusText(status)}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {status === 'pending' && 'Click to save now'}
            {status === 'saving' && 'Saving your changes...'}
            {status === 'saved' && 'All changes are saved'}
            {status === 'error' && 'Click to retry'}
            {status === 'idle' && 'No unsaved changes'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { SaveStatusIndicator, CompactSaveStatus, StatusIcon, formatLastSaved }
export type { SaveStatusIndicatorProps, CompactSaveStatusProps, StatusIconProps }
