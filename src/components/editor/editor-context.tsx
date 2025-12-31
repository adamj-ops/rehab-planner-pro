'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface EditorContextValue {
  projectId: string | null
}

const EditorContext = createContext<EditorContextValue>({
  projectId: null,
})

interface EditorProviderProps {
  projectId: string | null
  children: ReactNode
}

export function EditorProvider({ projectId, children }: EditorProviderProps) {
  return (
    <EditorContext.Provider value={{ projectId }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditorContext() {
  return useContext(EditorContext)
}
