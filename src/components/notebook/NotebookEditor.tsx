'use client'

import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plate, usePlateEditor } from 'platejs/react'
import { normalizeNodeId, type Value } from 'platejs'
import debounce from 'lodash.debounce'
import { Check, Loader2 } from 'lucide-react'

import { EditorKit } from '@/components/editor/editor-kit'
import { Editor, EditorContainer } from '@/components/ui/editor'
import { EditorProvider } from '@/components/editor/editor-context'
import { useNotebookStore } from '@/stores/notebook-store'
import type { NotebookPage } from '@/types/notebook'

/**
 * Props for the NotebookEditor component
 */
interface NotebookEditorProps {
  /** The notebook page to render in the editor */
  page: NotebookPage
}

/** Save status for auto-save indicator */
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Rich text editor component for notebook pages.
 * Wraps Plate.js editor with auto-save functionality and project context for @-mentions.
 * 
 * Features:
 * - Debounced auto-save (1 second)
 * - Save status indicator
 * - Project entity mentions (@-mentions)
 * - AI commands via / menu
 */
export function NotebookEditor({ page }: NotebookEditorProps) {
  const { updatePageContent, projectId } = useNotebookStore()
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Memoize the initial value
  const initialValue = useMemo(() => {
    if (!page.content || (Array.isArray(page.content) && page.content.length === 0)) {
      return normalizeNodeId([
        { type: 'p', children: [{ text: '' }] },
      ])
    }
    return normalizeNodeId(page.content as Value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]) // Only recalculate when page.id changes, not on every content update

  // Create editor instance
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  })

  // Debounced save function with status tracking
  const debouncedSave = useMemo(
    () =>
      debounce(async (pageId: string, content: Value) => {
        setSaveStatus('saving')
        try {
          await updatePageContent(pageId, content)
          setSaveStatus('saved')
          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch {
          setSaveStatus('error')
          setTimeout(() => setSaveStatus('idle'), 3000)
        }
      }, 1000),
    [updatePageContent]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // Handle content change
  const handleChange = useCallback(
    ({ value }: { value: Value }) => {
      debouncedSave(page.id, value)
    },
    [page.id, debouncedSave]
  )

  // Update editor content when page changes
  useEffect(() => {
    setSaveStatus('idle')
    if (page.content && Array.isArray(page.content) && page.content.length > 0) {
      const normalized = normalizeNodeId(page.content as Value)
      editor.tf.setValue(normalized)
    } else {
      editor.tf.setValue([{ type: 'p', children: [{ text: '' }] }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]) // Reset when switching pages, intentionally not triggering on content changes

  return (
    <div className="flex-1 overflow-auto relative">
      {/* Save status indicator */}
      <div className="absolute top-2 right-4 z-10">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-background/80 px-2 py-1 rounded">
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-1.5 text-xs text-destructive bg-background/80 px-2 py-1 rounded">
            <span>Save failed</span>
          </div>
        )}
      </div>

      <EditorProvider projectId={projectId}>
        <Plate editor={editor} onChange={handleChange}>
          <EditorContainer className="border-none shadow-none">
            <Editor
              variant="default"
              className="min-h-[500px] px-6 py-4"
              placeholder="Start writing..."
            />
          </EditorContainer>
        </Plate>
      </EditorProvider>
    </div>
  )
}
