'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveOptions<T> {
  /** The data to save */
  data: T
  /** Callback function to save data */
  onSave: (data: T) => Promise<void>
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
  /** Callback when save succeeds */
  onSuccess?: () => void
  /** Callback when save fails */
  onError?: (error: Error) => void
  /** Key for comparing data changes */
  getKey?: (data: T) => string
}

export interface UseAutoSaveReturn {
  /** Current save status */
  status: AutoSaveStatus
  /** Last successful save timestamp */
  lastSaved: Date | null
  /** Error from last failed save */
  error: Error | null
  /** Whether there are unsaved changes */
  isDirty: boolean
  /** Manually trigger save immediately */
  saveNow: () => Promise<void>
  /** Reset to idle state */
  reset: () => void
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useAutoSave - Automatically saves data with debouncing
 * 
 * Features:
 * - Debounced save (configurable delay)
 * - Status tracking (idle, pending, saving, saved, error)
 * - Manual save trigger
 * - Error handling with retry
 * - Dirty state tracking
 * 
 * @example
 * ```tsx
 * const { status, isDirty, saveNow } = useAutoSave({
 *   data: formData,
 *   onSave: async (data) => {
 *     await api.saveProject(data)
 *   },
 *   debounceMs: 2000
 * })
 * ```
 */
export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
  onSuccess,
  onError,
  getKey
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  // Refs for managing async operations
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const saveInProgressRef = useRef(false)
  const lastSavedKeyRef = useRef<string | null>(null)
  const dataRef = useRef(data)
  
  // Update data ref
  dataRef.current = data
  
  // Get a key for the current data (for comparison)
  const getCurrentKey = useCallback(() => {
    if (getKey) {
      return getKey(dataRef.current)
    }
    try {
      return JSON.stringify(dataRef.current)
    } catch {
      return String(Date.now())
    }
  }, [getKey])
  
  // Perform the save operation
  const performSave = useCallback(async () => {
    if (saveInProgressRef.current) return
    
    const currentKey = getCurrentKey()
    
    // Skip if nothing has changed
    if (currentKey === lastSavedKeyRef.current) {
      setStatus('saved')
      setIsDirty(false)
      return
    }
    
    saveInProgressRef.current = true
    setStatus('saving')
    setError(null)
    
    try {
      await onSave(dataRef.current)
      
      lastSavedKeyRef.current = currentKey
      setLastSaved(new Date())
      setStatus('saved')
      setIsDirty(false)
      onSuccess?.()
      
      // Reset to idle after a delay
      setTimeout(() => {
        setStatus((current) => current === 'saved' ? 'idle' : current)
      }, 2000)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed')
      setError(error)
      setStatus('error')
      onError?.(error)
    } finally {
      saveInProgressRef.current = false
    }
  }, [onSave, onSuccess, onError, getCurrentKey])
  
  // Debounced save trigger
  const scheduleSave = useCallback(() => {
    if (!enabled) return
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    setStatus('pending')
    setIsDirty(true)
    
    // Schedule new save
    debounceTimerRef.current = setTimeout(() => {
      performSave()
    }, debounceMs)
  }, [enabled, debounceMs, performSave])
  
  // Manual save trigger
  const saveNow = useCallback(async () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    await performSave()
  }, [performSave])
  
  // Reset function
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    setStatus('idle')
    setError(null)
    setIsDirty(false)
  }, [])
  
  // Watch for data changes
  useEffect(() => {
    if (!enabled) return
    
    // Use data directly to compute key (triggers on data change)
    let currentKey: string
    if (getKey) {
      currentKey = getKey(data)
    } else {
      try {
        currentKey = JSON.stringify(data)
      } catch {
        currentKey = String(Date.now())
      }
    }
    
    // Check if data has changed from last saved
    if (currentKey !== lastSavedKeyRef.current) {
      scheduleSave()
    }
  }, [data, enabled, getKey, scheduleSave])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])
  
  // Save on page unload if dirty
  useEffect(() => {
    if (!enabled || !isDirty) return
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, isDirty])
  
  return {
    status,
    lastSaved,
    error,
    isDirty,
    saveNow,
    reset
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get display text for save status
 */
export function getStatusText(status: AutoSaveStatus): string {
  switch (status) {
    case 'idle':
      return 'All changes saved'
    case 'pending':
      return 'Unsaved changes'
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Error saving'
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status: AutoSaveStatus): string {
  switch (status) {
    case 'idle':
    case 'saved':
      return 'text-green-600 dark:text-green-400'
    case 'pending':
      return 'text-amber-600 dark:text-amber-400'
    case 'saving':
      return 'text-blue-600 dark:text-blue-400'
    case 'error':
      return 'text-red-600 dark:text-red-400'
  }
}
