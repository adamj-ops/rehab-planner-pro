'use client'

import Link from 'next/link'
import { IconFolderOff, IconSearch, IconFilter, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useProjectsStore, useHasFilters, useSearchQuery } from '@/hooks/use-projects-store'

type EmptyStateType = 'no-projects' | 'no-search-results' | 'no-filter-results'

interface EmptyStatesProps {
  type?: EmptyStateType
}

export function EmptyStates({ type }: EmptyStatesProps) {
  const hasFilters = useHasFilters()
  const searchQuery = useSearchQuery()
  const clearFilters = useProjectsStore((state) => state.clearFilters)
  const setSearchQuery = useProjectsStore((state) => state.setSearchQuery)
  const fetchProjects = useProjectsStore((state) => state.fetchProjects)

  // Auto-determine type if not provided
  const resolvedType = type || (searchQuery ? 'no-search-results' : hasFilters ? 'no-filter-results' : 'no-projects')

  const handleClearAll = () => {
    clearFilters()
    setSearchQuery('')
    fetchProjects()
  }

  if (resolvedType === 'no-projects') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-16 w-16 bg-muted flex items-center justify-center mb-6 rounded-none">
          <IconFolderOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Get started by creating your first renovation project. Track your scope, budget, and timeline all in one place.
        </p>
        <Button asChild className="rounded-none gap-2">
          <Link href="/wizard/step-1">
            <IconPlus className="h-4 w-4" />
            Create Your First Project
          </Link>
        </Button>
      </div>
    )
  }

  if (resolvedType === 'no-search-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-16 w-16 bg-muted flex items-center justify-center mb-6 rounded-none">
          <IconSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No projects match your search</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          We couldn&apos;t find any projects matching &quot;{searchQuery}&quot;. Try adjusting your search terms.
        </p>
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="rounded-none"
        >
          Clear Search
        </Button>
      </div>
    )
  }

  if (resolvedType === 'no-filter-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-16 w-16 bg-muted flex items-center justify-center mb-6 rounded-none">
          <IconFilter className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No projects match your filters</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Try adjusting your filters to see more projects.
        </p>
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="rounded-none"
        >
          Clear All Filters
        </Button>
      </div>
    )
  }

  return null
}
