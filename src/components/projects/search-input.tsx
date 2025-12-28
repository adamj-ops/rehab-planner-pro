'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { IconSearch, IconX } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useProjectsStore, useSearchQuery, useProjects } from '@/hooks/use-projects-store'

interface SearchInputProps {
  debounceMs?: number
}

export function SearchInput({ debounceMs = 300 }: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const storeSearchQuery = useSearchQuery()
  const projects = useProjects()
  const setSearchQuery = useProjectsStore((state) => state.setSearchQuery)
  const fetchProjects = useProjectsStore((state) => state.fetchProjects)

  const [localValue, setLocalValue] = useState(storeSearchQuery)

  // Sync URL param to store on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery !== null && urlQuery !== storeSearchQuery) {
      setSearchQuery(urlQuery)
      setLocalValue(urlQuery)
    }
  }, [searchParams, storeSearchQuery, setSearchQuery])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== storeSearchQuery) {
        setSearchQuery(localValue)
        fetchProjects()

        // Update URL
        const params = new URLSearchParams(searchParams.toString())
        if (localValue) {
          params.set('q', localValue)
        } else {
          params.delete('q')
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, storeSearchQuery, debounceMs, setSearchQuery, fetchProjects, router, pathname, searchParams])

  const handleClear = useCallback(() => {
    setLocalValue('')
    setSearchQuery('')
    fetchProjects()

    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [setSearchQuery, fetchProjects, router, pathname, searchParams])

  return (
    <div className="relative flex-1 max-w-md">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search projects..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10 pr-10 rounded-none"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-none"
        >
          <IconX className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
      {storeSearchQuery && projects.length > 0 && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {projects.length} result{projects.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
