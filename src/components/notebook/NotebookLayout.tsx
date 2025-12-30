'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNotebookStore, useCurrentPage, useNotebookLoading } from '@/stores/notebook-store'
import { NotebookSidebar } from './NotebookSidebar'
import { NotebookEditor } from './NotebookEditor'
import { PageHeader } from './PageHeader'

interface NotebookLayoutProps {
  projectId: string
}

export function NotebookLayout({ projectId }: NotebookLayoutProps) {
  const { loadNotebook, error } = useNotebookStore()
  const currentPage = useCurrentPage()
  const isLoading = useNotebookLoading()
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        await loadNotebook(projectId)
      } catch (err) {
        console.error('Failed to load notebook:', err)
      } finally {
        setInitialLoad(false)
      }
    }

    init()
  }, [projectId, loadNotebook])

  if (initialLoad || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading notebook...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading notebook</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <NotebookSidebar projectId={projectId} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage ? (
          <>
            <PageHeader page={currentPage} />
            <NotebookEditor page={currentPage} />
          </>
        ) : (
          <EmptyState projectId={projectId} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ projectId }: { projectId: string }) {
  const { notebook, createPage, setCurrentPage } = useNotebookStore()

  const handleCreateFirstPage = async () => {
    if (!notebook) return

    try {
      const newPage = await createPage({
        notebook_id: notebook.id,
        title: 'Welcome',
        icon: '👋',
      })
      setCurrentPage(newPage)
    } catch (error) {
      console.error('Failed to create page:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">📓</div>
      <h2 className="text-xl font-semibold mb-2">Your Project Notebook</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Document your project journey, track decisions, and capture lessons learned.
        Select a page from the sidebar or create a new one to get started.
      </p>
      <button
        onClick={handleCreateFirstPage}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Create your first page
      </button>
    </div>
  )
}
