'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { IconFilter, IconX, IconArchive } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import {
  useProjectsStore,
  useFilters,
  useActiveFiltersCount,
  useHasFilters,
  PROJECT_STATUSES,
  INVESTMENT_STRATEGIES,
} from '@/hooks/use-projects-store'
import { ProjectStatus } from '@/types/database'

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useFilters()
  const activeFiltersCount = useActiveFiltersCount()
  const hasFilters = useHasFilters()
  const showArchived = useProjectsStore((state) => state.showArchived)
  const setFilters = useProjectsStore((state) => state.setFilters)
  const clearFilters = useProjectsStore((state) => state.clearFilters)
  const toggleShowArchived = useProjectsStore((state) => state.toggleShowArchived)
  const fetchProjects = useProjectsStore((state) => state.fetchProjects)

  // Sync URL params to store on mount
  useEffect(() => {
    const status = searchParams.get('status') as ProjectStatus | 'all' | null
    const strategy = searchParams.get('strategy')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (status || strategy || dateFrom || dateTo) {
      setFilters({
        status: status || 'all',
        strategy: strategy || 'all',
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      })
    }
  }, [searchParams, setFilters])

  // Update URL when filters change
  const updateURL = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString())

    const updatedFilters = { ...filters, ...newFilters }

    if (updatedFilters.status && updatedFilters.status !== 'all') {
      params.set('status', updatedFilters.status)
    } else {
      params.delete('status')
    }

    if (updatedFilters.strategy && updatedFilters.strategy !== 'all') {
      params.set('strategy', updatedFilters.strategy)
    } else {
      params.delete('strategy')
    }

    if (updatedFilters.dateFrom) {
      params.set('dateFrom', updatedFilters.dateFrom)
    } else {
      params.delete('dateFrom')
    }

    if (updatedFilters.dateTo) {
      params.set('dateTo', updatedFilters.dateTo)
    } else {
      params.delete('dateTo')
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleStatusChange = (value: string) => {
    const newStatus = value as ProjectStatus | 'all'
    setFilters({ status: newStatus })
    updateURL({ status: newStatus })
    fetchProjects()
  }

  const handleStrategyChange = (value: string) => {
    setFilters({ strategy: value })
    updateURL({ strategy: value })
    fetchProjects()
  }

  const handleDateFromChange = (date: Date | undefined) => {
    const dateStr = date ? format(date, 'yyyy-MM-dd') : null
    setFilters({ dateFrom: dateStr })
    updateURL({ dateFrom: dateStr })
    fetchProjects()
  }

  const handleDateToChange = (date: Date | undefined) => {
    const dateStr = date ? format(date, 'yyyy-MM-dd') : null
    setFilters({ dateTo: dateStr })
    updateURL({ dateTo: dateStr })
    fetchProjects()
  }

  const handleClearFilters = () => {
    clearFilters()
    router.push(pathname, { scroll: false })
    fetchProjects()
  }

  const handleToggleArchived = () => {
    toggleShowArchived()
    fetchProjects()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px] rounded-none">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value="all" className="rounded-none">All Statuses</SelectItem>
          {PROJECT_STATUSES.filter(s => s.value !== 'archived').map((status) => (
            <SelectItem key={status.value} value={status.value} className="rounded-none">
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Strategy Filter */}
      <Select value={filters.strategy} onValueChange={handleStrategyChange}>
        <SelectTrigger className="w-[130px] rounded-none">
          <SelectValue placeholder="Strategy" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value="all" className="rounded-none">All Strategies</SelectItem>
          {INVESTMENT_STRATEGIES.map((strategy) => (
            <SelectItem key={strategy.value} value={strategy.value} className="rounded-none">
              {strategy.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[130px] rounded-none justify-start text-left font-normal"
          >
            {filters.dateFrom ? (
              format(new Date(filters.dateFrom), 'MMM d, yyyy')
            ) : (
              <span className="text-muted-foreground">From date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-none" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onSelect={handleDateFromChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[130px] rounded-none justify-start text-left font-normal"
          >
            {filters.dateTo ? (
              format(new Date(filters.dateTo), 'MMM d, yyyy')
            ) : (
              <span className="text-muted-foreground">To date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-none" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
            onSelect={handleDateToChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Show Archived Toggle */}
      <Button
        variant={showArchived ? 'secondary' : 'outline'}
        size="sm"
        onClick={handleToggleArchived}
        className="rounded-none gap-2"
      >
        <IconArchive className="h-4 w-4" />
        Archived
      </Button>

      {/* Active Filters Count & Clear */}
      {hasFilters && (
        <>
          <Badge variant="secondary" className="rounded-none">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="rounded-none gap-1 text-muted-foreground hover:text-foreground"
          >
            <IconX className="h-4 w-4" />
            Clear
          </Button>
        </>
      )}
    </div>
  )
}
