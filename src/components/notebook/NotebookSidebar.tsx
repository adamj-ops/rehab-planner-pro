'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutTemplate,
  Filter,
  X,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// cn is available for future styling if needed
import { useNotebookStore, usePageTree } from '@/hooks/use-notebook-store'
import { PageTree } from './PageTree'
import { TemplateSelector } from './TemplateSelector'
import { NOTEBOOK_TEMPLATES, type NotebookTemplate } from '@/types/notebook'
import { toast } from 'sonner'
import { useNotebookKeyboardShortcuts } from './NotebookKeyboardShortcuts'

interface NotebookSidebarProps {
  projectId: string
}

type DateFilter = 'all' | 'today' | 'week' | 'month'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function NotebookSidebar(_props: NotebookSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [, setPendingNewPage] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<NotebookTemplate[]>([])
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const {
    notebook,
    isSidebarCollapsed,
    createPage,
    setCurrentPage,
    searchPages,
  } = useNotebookStore()

  const pageTree = usePageTree()

  // Keyboard shortcuts
  useNotebookKeyboardShortcuts({
    onNewPage: () => {
      setPendingNewPage(true)
      setIsTemplateSelectorOpen(true)
    },
    onSearch: () => {
      searchInputRef.current?.focus()
    },
    searchInputRef,
  })

  // Filter pages by template type and date
  const filteredPages = useMemo(() => {
    let result = searchQuery ? searchPages(searchQuery) : pageTree
    
    // Filter by template type
    if (selectedTemplates.length > 0) {
      result = result.filter(
        (page) => page.template_type && selectedTemplates.includes(page.template_type)
      )
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date()
      let cutoff: Date
      
      switch (dateFilter) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoff = new Date(0)
      }
      
      result = result.filter((page) => new Date(page.updated_at) >= cutoff)
    }
    
    return result
  }, [searchQuery, pageTree, searchPages, selectedTemplates, dateFilter])

  const hasActiveFilters = selectedTemplates.length > 0 || dateFilter !== 'all'

  const clearFilters = () => {
    setSelectedTemplates([])
    setDateFilter('all')
  }

  const toggleTemplate = (template: NotebookTemplate) => {
    setSelectedTemplates((prev) =>
      prev.includes(template)
        ? prev.filter((t) => t !== template)
        : [...prev, template]
    )
  }

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
      toast.success('Page created', {
        description: template ? `Created from ${template.replace(/-/g, ' ')} template` : 'Created a new blank page',
      })
    } catch (error) {
      console.error('Failed to create page:', error)
      toast.error('Failed to create page', {
        description: 'Please try again',
      })
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

        {/* Search and Filter */}
        <div className="p-3 border-b space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages... (⌘K)"
                className="pl-8 pr-8 h-8 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={hasActiveFilters ? 'secondary' : 'outline'}
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Template</DropdownMenuLabel>
                {NOTEBOOK_TEMPLATES.map((template) => (
                  <DropdownMenuCheckboxItem
                    key={template.type}
                    checked={selectedTemplates.includes(template.type)}
                    onCheckedChange={() => toggleTemplate(template.type)}
                  >
                    <span className="mr-2">{template.icon}</span>
                    {template.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'all'}
                  onCheckedChange={() => setDateFilter('all')}
                >
                  All time
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'today'}
                  onCheckedChange={() => setDateFilter('today')}
                >
                  Today
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'week'}
                  onCheckedChange={() => setDateFilter('week')}
                >
                  Last 7 days
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'month'}
                  onCheckedChange={() => setDateFilter('month')}
                >
                  Last 30 days
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1">
              {selectedTemplates.map((template) => {
                const config = NOTEBOOK_TEMPLATES.find((t) => t.type === template)
                return (
                  <Badge
                    key={template}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => toggleTemplate(template)}
                  >
                    {config?.icon} {config?.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )
              })}
              {dateFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/20"
                  onClick={() => setDateFilter('all')}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? '7 days' : '30 days'}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Search results count */}
        {(searchQuery || hasActiveFilters) && (
          <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/30">
            {filteredPages.length === 0
              ? 'No results'
              : `${filteredPages.length} ${filteredPages.length === 1 ? 'result' : 'results'}`}
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        )}

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
