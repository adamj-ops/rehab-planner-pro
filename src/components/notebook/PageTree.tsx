'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, FileText, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNotebookStore } from '@/stores/notebook-store'
import type { NotebookPage } from '@/types/notebook'

interface PageTreeProps {
  pages: NotebookPage[]
  level?: number
}

interface PageTreeItemProps {
  page: NotebookPage
  level: number
}

function PageTreeItem({ page, level }: PageTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { currentPage, setCurrentPage, createPage, notebook } = useNotebookStore()

  const hasChildren = page.children && page.children.length > 0
  const isSelected = currentPage?.id === page.id

  const handleClick = () => {
    setCurrentPage(page)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleAddSubpage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notebook) return

    try {
      const newPage = await createPage({
        notebook_id: notebook.id,
        title: 'Untitled',
        parent_page_id: page.id,
      })
      setCurrentPage(newPage)
      setIsExpanded(true)
    } catch (error) {
      console.error('Failed to create subpage:', error)
    }
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-muted/50 transition-colors',
          isSelected && 'bg-muted'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/collapse toggle */}
        <button
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-sm hover:bg-muted',
            !hasChildren && 'invisible'
          )}
          onClick={handleToggle}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ))}
        </button>

        {/* Page icon */}
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-sm">
          {page.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
        </span>

        {/* Page title */}
        <span
          className={cn(
            'flex-1 truncate text-sm',
            isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}
        >
          {page.title || 'Untitled'}
        </span>

        {/* Add subpage button (visible on hover) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleAddSubpage}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {page.children!.map((child) => (
            <PageTreeItem key={child.id} page={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PageTree({ pages, level = 0 }: PageTreeProps) {
  if (!pages || pages.length === 0) {
    return null
  }

  return (
    <div className="py-1">
      {pages.map((page) => (
        <PageTreeItem key={page.id} page={page} level={level} />
      ))}
    </div>
  )
}
