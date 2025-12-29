'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RehabProject, ProjectStatus } from '@/types/database'
import { projectService, ProjectFilters } from '@/lib/supabase/database'

// Investment strategy options
export const INVESTMENT_STRATEGIES = [
  { value: 'flip', label: 'Flip' },
  { value: 'rental', label: 'Rental' },
  { value: 'brrrr', label: 'BRRRR' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'wholetail', label: 'Wholetail' },
] as const

// Status options
export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
]

// Filter state interface
export interface FiltersState {
  status: ProjectStatus | 'all'
  strategy: string | 'all'
  dateFrom: string | null
  dateTo: string | null
}

// View mode
export type ViewMode = 'card' | 'table'

// Store state interface
interface ProjectsState {
  // Data
  projects: RehabProject[]

  // UI State
  loading: boolean
  error: string | null
  viewMode: ViewMode

  // Filters
  filters: FiltersState
  searchQuery: string
  showArchived: boolean

  // Actions
  fetchProjects: () => Promise<void>
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<FiltersState>) => void
  clearFilters: () => void
  setViewMode: (mode: ViewMode) => void
  toggleShowArchived: () => void

  // CRUD Actions
  softDeleteProject: (id: string) => Promise<boolean>
  duplicateProject: (id: string) => Promise<RehabProject | null>
  archiveProject: (id: string) => Promise<boolean>
  unarchiveProject: (id: string) => Promise<boolean>
  restoreProject: (id: string) => Promise<boolean>
}

// Initial filter state
const initialFilters: FiltersState = {
  status: 'all',
  strategy: 'all',
  dateFrom: null,
  dateTo: null,
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      loading: false,
      error: null,
      viewMode: 'card',
      filters: initialFilters,
      searchQuery: '',
      showArchived: false,

      // Fetch projects from database
      fetchProjects: async () => {
        set({ loading: true, error: null })

        try {
          const { filters, searchQuery, showArchived } = get()

          const queryFilters: ProjectFilters = {
            status: filters.status,
            strategy: filters.strategy,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            search: searchQuery || undefined,
            includeArchived: showArchived,
          }

          const projects = await projectService.getAll(queryFilters)
          set({ projects, loading: false })
        } catch (error) {
          console.error('Error fetching projects:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch projects',
            loading: false
          })
        }
      },

      // Set search query
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      // Set filters
      setFilters: (newFilters: Partial<FiltersState>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      // Clear all filters
      clearFilters: () => {
        set({ filters: initialFilters, searchQuery: '' })
      },

      // Set view mode
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode })
      },

      // Toggle show archived
      toggleShowArchived: () => {
        set((state) => ({ showArchived: !state.showArchived }))
      },

      // Soft delete a project
      softDeleteProject: async (id: string) => {
        try {
          const success = await projectService.softDelete(id)
          if (success) {
            // Remove from local state
            set((state) => ({
              projects: state.projects.filter((p) => p.id !== id)
            }))
          }
          return success
        } catch (error) {
          console.error('Error deleting project:', error)
          return false
        }
      },

      // Duplicate a project
      duplicateProject: async (id: string) => {
        try {
          const newProject = await projectService.duplicate(id)
          if (newProject) {
            // Add to local state at the beginning
            set((state) => ({
              projects: [newProject, ...state.projects]
            }))
          }
          return newProject
        } catch (error) {
          console.error('Error duplicating project:', error)
          return null
        }
      },

      // Archive a project
      archiveProject: async (id: string) => {
        try {
          const success = await projectService.archive(id)
          if (success) {
            const { showArchived } = get()
            if (!showArchived) {
              // Remove from local state if not showing archived
              set((state) => ({
                projects: state.projects.filter((p) => p.id !== id)
              }))
            } else {
              // Update status in local state
              set((state) => ({
                projects: state.projects.map((p) =>
                  p.id === id ? { ...p, status: 'archived' as ProjectStatus } : p
                )
              }))
            }
          }
          return success
        } catch (error) {
          console.error('Error archiving project:', error)
          return false
        }
      },

      // Unarchive a project
      unarchiveProject: async (id: string) => {
        try {
          const success = await projectService.unarchive(id)
          if (success) {
            // Update status in local state
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? { ...p, status: 'draft' as ProjectStatus } : p
              )
            }))
          }
          return success
        } catch (error) {
          console.error('Error unarchiving project:', error)
          return false
        }
      },

      // Restore a soft-deleted project
      restoreProject: async (id: string) => {
        try {
          const success = await projectService.restore(id)
          if (success) {
            // Refetch to get the restored project
            await get().fetchProjects()
          }
          return success
        } catch (error) {
          console.error('Error restoring project:', error)
          return false
        }
      },
    }),
    {
      name: 'projects-store',
      // Only persist UI preferences
      partialize: (state) => ({
        viewMode: state.viewMode,
        showArchived: state.showArchived,
      }),
    }
  )
)

// Selector hooks for optimized re-renders
export const useProjects = () => useProjectsStore((state) => state.projects)
export const useProjectsLoading = () => useProjectsStore((state) => state.loading)
export const useProjectsError = () => useProjectsStore((state) => state.error)
export const useViewMode = () => useProjectsStore((state) => state.viewMode)
export const useFilters = () => useProjectsStore((state) => state.filters)
export const useSearchQuery = () => useProjectsStore((state) => state.searchQuery)
export const useShowArchived = () => useProjectsStore((state) => state.showArchived)

// Computed selectors
export const useActiveFiltersCount = () => useProjectsStore((state) => {
  let count = 0
  if (state.filters.status !== 'all') count++
  if (state.filters.strategy !== 'all') count++
  if (state.filters.dateFrom) count++
  if (state.filters.dateTo) count++
  if (state.searchQuery) count++
  return count
})

export const useHasFilters = () => useProjectsStore((state) => {
  return (
    state.filters.status !== 'all' ||
    state.filters.strategy !== 'all' ||
    state.filters.dateFrom !== null ||
    state.filters.dateTo !== null ||
    state.searchQuery !== ''
  )
})
