import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Project phase type
export type ProjectPhase = 'planning' | 'construction' | 'paused' | 'completed' | 'archived'

// Workspace project for sidebar display
export interface WorkspaceProject {
  id: string
  project_name: string
  address_street: string
  address_city: string
  address_state: string
  phase: ProjectPhase
  emoji: string
  color: string | null
  sort_order: number
  tasks_total: number
  tasks_completed: number
  days_ahead_behind: number
  total_estimated_cost: number | null
  total_actual_cost: number | null
  max_budget: number | null
  planning_started_at: string | null
  construction_started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Sidebar section state
interface SidebarState {
  activeExpanded: boolean
  planningExpanded: boolean
  completedExpanded: boolean
}

// Workspace store state
interface WorkspaceState {
  // Active project
  activeProjectId: string | null
  
  // Sidebar state
  sidebarState: SidebarState
  
  // Actions
  setActiveProject: (projectId: string | null) => void
  toggleSection: (section: keyof SidebarState) => void
  setSectionExpanded: (section: keyof SidebarState, expanded: boolean) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      // Initial state
      activeProjectId: null,
      
      sidebarState: {
        activeExpanded: true,
        planningExpanded: true,
        completedExpanded: false,
      },
      
      // Actions
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
      
      toggleSection: (section) =>
        set((state) => ({
          sidebarState: {
            ...state.sidebarState,
            [section]: !state.sidebarState[section],
          },
        })),
      
      setSectionExpanded: (section, expanded) =>
        set((state) => ({
          sidebarState: {
            ...state.sidebarState,
            [section]: expanded,
          },
        })),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        sidebarState: state.sidebarState,
      }),
    }
  )
)

// Selectors
export const useActiveProjectId = () => useWorkspaceStore((state) => state.activeProjectId)
export const useSidebarState = () => useWorkspaceStore((state) => state.sidebarState)

// Helper to group projects by phase
export function groupProjectsByPhase(projects: WorkspaceProject[]) {
  const active: WorkspaceProject[] = []
  const planning: WorkspaceProject[] = []
  const completed: WorkspaceProject[] = []
  
  for (const project of projects) {
    switch (project.phase) {
      case 'construction':
      case 'paused':
        active.push(project)
        break
      case 'planning':
        planning.push(project)
        break
      case 'completed':
      case 'archived':
        completed.push(project)
        break
    }
  }
  
  // Sort by sort_order, then by updated_at
  const sortFn = (a: WorkspaceProject, b: WorkspaceProject) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  }
  
  return {
    active: active.sort(sortFn),
    planning: planning.sort(sortFn),
    completed: completed.sort(sortFn),
  }
}

// Helper to get display name for a project
export function getProjectDisplayName(project: WorkspaceProject): string {
  if (project.project_name && project.project_name !== project.address_street) {
    return project.project_name
  }
  return project.address_street || 'Untitled Project'
}

// Helper to get project status indicator
export function getProjectStatusColor(project: WorkspaceProject): 'green' | 'amber' | 'red' {
  if (project.phase === 'planning' || project.phase === 'completed') {
    return 'green'
  }
  
  // For construction projects, check schedule
  if (project.days_ahead_behind < -3) {
    return 'red'
  }
  if (project.days_ahead_behind < 0) {
    return 'amber'
  }
  return 'green'
}

// Helper to calculate task progress percentage
export function getTaskProgressPercent(project: WorkspaceProject): number {
  if (project.tasks_total === 0) return 0
  return Math.round((project.tasks_completed / project.tasks_total) * 100)
}

// Helper to calculate budget usage percentage
export function getBudgetUsagePercent(project: WorkspaceProject): number | null {
  if (!project.max_budget || project.max_budget === 0) return null
  const spent = project.total_actual_cost || 0
  return Math.round((spent / project.max_budget) * 100)
}

// Helper to get days since construction started
export function getDaysSinceStart(project: WorkspaceProject): number | null {
  if (!project.construction_started_at) return null
  const start = new Date(project.construction_started_at)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
