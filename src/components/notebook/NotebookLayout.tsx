'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useNotebookStore, useCurrentPage, useNotebookLoading } from '@/hooks/use-notebook-store'
import { NotebookSidebar } from './NotebookSidebar'
import { NotebookEditor } from './NotebookEditor'
import { PageHeader } from './PageHeader'
import { NotebookErrorBoundary } from './NotebookErrorBoundary'
import { Button } from '@/components/ui/button'
import { getTemplateConfig, getTemplateDefaultContent, type NotebookTemplate } from '@/types/notebook'

/**
 * Props for the NotebookLayout component
 */
interface NotebookLayoutProps {
  /** The project ID to load the notebook for */
  projectId: string
  /** Optional template to auto-create a page with when the component mounts */
  initialTemplate?: NotebookTemplate | null
}

/**
 * Main layout component for the project notebook feature.
 * Handles notebook initialization, page management, and renders the sidebar and editor.
 * 
 * @example
 * ```tsx
 * <NotebookLayout 
 *   projectId="123" 
 *   initialTemplate="daily-log" 
 * />
 * ```
 */
export function NotebookLayout({ projectId, initialTemplate }: NotebookLayoutProps) {
  const { loadNotebook, error, notebook, createPage, setCurrentPage } = useNotebookStore()
  const currentPage = useCurrentPage()
  const isLoading = useNotebookLoading()
  const [initialLoad, setInitialLoad] = useState(true)
  const templateProcessedRef = useRef(false)

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

  // Handle initial template - auto-create page with template when provided
  useEffect(() => {
    const createTemplatedPage = async () => {
      if (
        initialTemplate &&
        notebook &&
        !templateProcessedRef.current &&
        !initialLoad
      ) {
        templateProcessedRef.current = true
        const templateConfig = getTemplateConfig(initialTemplate)
        if (templateConfig) {
          try {
            const newPage = await createPage({
              notebook_id: notebook.id,
              title: templateConfig.label,
              icon: templateConfig.icon,
              content: getTemplateDefaultContent(initialTemplate),
              template_type: initialTemplate,
            })
            setCurrentPage(newPage)
          } catch (err) {
            console.error('Failed to create templated page:', err)
          }
        }
      }
    }

    createTemplatedPage()
  }, [initialTemplate, notebook, initialLoad, createPage, setCurrentPage])

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
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium text-lg mb-2">Error loading notebook</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => {
              setInitialLoad(true)
              loadNotebook(projectId)
                .catch(console.error)
                .finally(() => setInitialLoad(false))
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <NotebookErrorBoundary
      onReset={() => {
        setInitialLoad(true)
        loadNotebook(projectId)
          .catch(console.error)
          .finally(() => setInitialLoad(false))
      }}
    >
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
            <EmptyState />
          )}
        </div>
      </div>
    </NotebookErrorBoundary>
  )
}

// Quick start templates for empty state
const QUICK_START_TEMPLATES = [
  { type: 'daily-log' as const, icon: '📅', label: 'Daily Log', description: 'Track daily progress' },
  { type: 'vendor-meeting' as const, icon: '👷', label: 'Vendor Meeting', description: 'Document vendor discussions' },
  { type: 'design-decision' as const, icon: '💡', label: 'Design Decision', description: 'Record design choices' },
  { type: 'walkthrough-notes' as const, icon: '🏠', label: 'Walkthrough Notes', description: 'Property observations' },
]

function EmptyState() {
  const { notebook, createPage, setCurrentPage } = useNotebookStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreatePage = async (templateType?: NotebookTemplate) => {
    if (!notebook || isCreating) return

    setIsCreating(true)
    try {
      if (templateType) {
        const templateConfig = getTemplateConfig(templateType)
        if (templateConfig) {
          const newPage = await createPage({
            notebook_id: notebook.id,
            title: templateConfig.label,
            icon: templateConfig.icon,
            content: getTemplateDefaultContent(templateType),
            template_type: templateType,
          })
          setCurrentPage(newPage)
          toast.success('Page created', {
            description: `Created from ${templateConfig.label} template`,
          })
        }
      } else {
        const newPage = await createPage({
          notebook_id: notebook.id,
          title: 'Untitled',
          icon: '📝',
        })
        setCurrentPage(newPage)
        toast.success('Page created', {
          description: 'Created a new blank page',
        })
      }
    } catch (error) {
      console.error('Failed to create page:', error)
      toast.error('Failed to create page', {
        description: 'Please try again',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">📓</div>
      <h2 className="text-xl font-semibold mb-2">Your Project Notebook</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        Document your project journey, track decisions, and capture lessons learned.
      </p>

      {/* Quick start templates */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Start with a template:</p>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          {QUICK_START_TEMPLATES.map((template) => (
            <Button
              key={template.type}
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-3 text-left"
              onClick={() => handleCreatePage(template.type)}
              disabled={isCreating}
            >
              <div className="flex items-center gap-2">
                <span>{template.icon}</span>
                <span className="font-medium text-sm">{template.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{template.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Blank page option */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Or</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCreatePage()}
          disabled={isCreating}
        >
          Start with a blank page
        </Button>
      </div>

      {/* Helpful tips */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-md">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">💡 Tips:</span> Use <kbd className="px-1 py-0.5 bg-background rounded text-[10px]">@</kbd> to mention rooms, vendors, or scope items.
          Use <kbd className="px-1 py-0.5 bg-background rounded text-[10px]">/</kbd> for AI commands.
        </p>
      </div>
    </div>
  )
}
