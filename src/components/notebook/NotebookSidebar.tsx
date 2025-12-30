'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutTemplate,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useNotebookStore, usePageTree } from '@/stores/notebook-store'
import { PageTree } from './PageTree'
import { TemplateSelector } from './TemplateSelector'
import type { NotebookTemplate } from '@/types/notebook'

interface NotebookSidebarProps {
  projectId: string
}

export function NotebookSidebar({ projectId }: NotebookSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [pendingNewPage, setPendingNewPage] = useState(false)

  const {
    notebook,
    isSidebarCollapsed,
    createPage,
    setCurrentPage,
    searchPages,
  } = useNotebookStore()

  const pageTree = usePageTree()

  const filteredPages = searchQuery ? searchPages(searchQuery) : pageTree

  const handleNewPage = () => {
    setPendingNewPage(true)
    setIsTemplateSelectorOpen(true)
  }

  const handleTemplateSelect = async (template: NotebookTemplate | null) => {
    if (!notebook) return

    try {
      const newPage = await createPage({
        notebook_id: notebook.id,
        title: 'Untitled',
        template_type: template || undefined,
      })
      setCurrentPage(newPage)
    } catch (error) {
      console.error('Failed to create page:', error)
    } finally {
      setPendingNewPage(false)
    }
  }

  const toggleSidebar = () => {
    useNotebookStore.setState((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    }))
  }

  if (isSidebarCollapsed) {
    return (
      <div className="w-12 border-r bg-muted/30 flex flex-col items-center py-2 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNewPage}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Notebook</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* New page button */}
        <div className="p-3 border-b">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleNewPage}
          >
            <Plus className="h-4 w-4" />
            New page
          </Button>
        </div>

        {/* Page tree */}
        <ScrollArea className="flex-1">
          {filteredPages.length > 0 ? (
            <PageTree pages={filteredPages} />
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? (
                <>No pages found for &quot;{searchQuery}&quot;</>
              ) : (
                <>
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pages yet</p>
                  <p className="text-xs mt-1">Click &quot;New page&quot; to get started</p>
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick templates */}
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setIsTemplateSelectorOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
        </div>
      </div>

      <TemplateSelector
        open={isTemplateSelectorOpen}
        onOpenChange={setIsTemplateSelectorOpen}
        onSelect={handleTemplateSelect}
      />
    </>
  )
}
