'use client'

import { useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useNotebookStore } from '@/stores/notebook-store'

interface KeyboardShortcutsProps {
  onNewPage: () => void
  onSearch: () => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

/**
 * Hook for handling notebook keyboard shortcuts
 * - Cmd/Ctrl + N: New page
 * - Cmd/Ctrl + K: Focus search
 * - Cmd/Ctrl + S: Manual save (with feedback)
 * - Cmd/Ctrl + E: Export menu (future)
 */
export function useNotebookKeyboardShortcuts({
  onNewPage,
  onSearch,
  searchInputRef,
}: KeyboardShortcutsProps) {
  const { currentPage } = useNotebookStore()
  const lastSaveTime = useRef<number>(0)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      
      if (!isMod) return

      switch (e.key.toLowerCase()) {
        case 'n':
          // Cmd/Ctrl + N: New page
          e.preventDefault()
          onNewPage()
          break

        case 'k':
          // Cmd/Ctrl + K: Focus search
          e.preventDefault()
          onSearch()
          searchInputRef?.current?.focus()
          break

        case 's':
          // Cmd/Ctrl + S: Manual save feedback
          e.preventDefault()
          // Prevent rapid save spam
          if (Date.now() - lastSaveTime.current < 1000) {
            return
          }
          lastSaveTime.current = Date.now()
          
          if (currentPage) {
            // Trigger a dummy update to force save
            // The auto-save should have already saved, so just show feedback
            toast.success('Saved', {
              description: 'Your changes are automatically saved',
              duration: 2000,
            })
          }
          break

        case 'e':
          // Cmd/Ctrl + E: Export (show hint for now)
          if (e.shiftKey) {
            e.preventDefault()
            toast.info('Export options', {
              description: 'Click the menu button (···) to export',
              duration: 3000,
            })
          }
          break
      }
    },
    [onNewPage, onSearch, searchInputRef, currentPage]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Component to display keyboard shortcuts help
 */
export function KeyboardShortcutsHelp() {
  return (
    <div className="text-xs text-muted-foreground space-y-1.5">
      <p className="font-medium mb-2">Keyboard shortcuts:</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘N</kbd>
          <span className="ml-2">New page</span>
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘K</kbd>
          <span className="ml-2">Search</span>
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘S</kbd>
          <span className="ml-2">Save</span>
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">@</kbd>
          <span className="ml-2">Mention</span>
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">/</kbd>
          <span className="ml-2">Commands</span>
        </div>
      </div>
    </div>
  )
}
