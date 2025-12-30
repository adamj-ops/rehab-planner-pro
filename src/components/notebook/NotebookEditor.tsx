'use client'

import * as React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { Plate, usePlateEditor } from 'platejs/react'
import { normalizeNodeId, type Value } from 'platejs'
import debounce from 'lodash.debounce'

import { EditorKit } from '@/components/editor/editor-kit'
import { Editor, EditorContainer } from '@/components/ui/editor'
import { useNotebookStore } from '@/stores/notebook-store'
import type { NotebookPage } from '@/types/notebook'

interface NotebookEditorProps {
  page: NotebookPage
}

export function NotebookEditor({ page }: NotebookEditorProps) {
  const { updatePageContent } = useNotebookStore()

  // Memoize the initial value
  const initialValue = useMemo(() => {
    if (!page.content || (Array.isArray(page.content) && page.content.length === 0)) {
      return normalizeNodeId([
        { type: 'p', children: [{ text: '' }] },
      ])
    }
    return normalizeNodeId(page.content as Value)
  }, [page.id]) // Only recalculate when page.id changes

  // Create editor instance
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  })

  // Debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce((pageId: string, content: Value) => {
        updatePageContent(pageId, content)
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
    if (page.content && Array.isArray(page.content) && page.content.length > 0) {
      const normalized = normalizeNodeId(page.content as Value)
      editor.tf.setValue(normalized)
    } else {
      editor.tf.setValue([{ type: 'p', children: [{ text: '' }] }])
    }
  }, [page.id]) // Reset when switching pages

  return (
    <div className="flex-1 overflow-auto">
      <Plate editor={editor} onChange={handleChange}>
        <EditorContainer className="border-none shadow-none">
          <Editor
            variant="default"
            className="min-h-[500px] px-6 py-4"
            placeholder="Start writing..."
          />
        </EditorContainer>
      </Plate>
    </div>
  )
}
