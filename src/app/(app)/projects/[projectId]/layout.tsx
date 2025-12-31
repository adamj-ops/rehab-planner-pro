'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore, type WorkspaceProject } from '@/hooks/use-workspace-store'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectTabs } from '@/components/project'

interface ProjectLayoutProps {
  children: React.ReactNode
}

// Context for the current project
import { createContext, useContext } from 'react'

interface ProjectContextValue {
  project: WorkspaceProject | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue>({
  project: null,
  isLoading: true,
  refetch: async () => {},
})

export const useProject = () => useContext(ProjectContext)

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<WorkspaceProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const setActiveProject = useWorkspaceStore((state) => state.setActiveProject)

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      const { data, error: queryError } = await supabase
        .from('rehab_projects')
        .select(`
          id,
          project_name,
          address_street,
          address_city,
          address_state,
          phase,
          emoji,
          color,
          sort_order,
          tasks_total,
          tasks_completed,
          days_ahead_behind,
          total_estimated_cost,
          total_actual_cost,
          max_budget,
          planning_started_at,
          construction_started_at,
          completed_at,
          created_at,
          updated_at
        `)
        .eq('id', projectId)
        .is('deleted_at', null)
        .single()
      
      if (queryError) {
        if (queryError.code === 'PGRST116') {
          setError('not_found')
        } else {
          throw queryError
        }
        return
      }
      
      // Handle case where data is null even without an error
      if (!data) {
        setError('not_found')
        return
      }
      
      const workspaceProject: WorkspaceProject = {
        id: data.id,
        project_name: data.project_name,
        address_street: data.address_street || '',
        address_city: data.address_city || '',
        address_state: data.address_state || '',
        phase: data.phase || 'planning',
        emoji: data.emoji || '🏠',
        color: data.color,
        sort_order: data.sort_order || 0,
        tasks_total: data.tasks_total || 0,
        tasks_completed: data.tasks_completed || 0,
        days_ahead_behind: data.days_ahead_behind || 0,
        total_estimated_cost: data.total_estimated_cost,
        total_actual_cost: data.total_actual_cost,
        max_budget: data.max_budget,
        planning_started_at: data.planning_started_at,
        construction_started_at: data.construction_started_at,
        completed_at: data.completed_at,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      }
      
      setProject(workspaceProject)
      setActiveProject(projectId)
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, setActiveProject])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (error === 'not_found') {
    notFound()
  }

  if (isLoading) {
    return <ProjectLayoutSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive mb-2">Error loading project</p>
        <button
          type="button"
          onClick={fetchProject}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <ProjectContext.Provider value={{ project, isLoading, refetch: fetchProject }}>
      <div className="flex flex-col">
        <ProjectTabs projectId={projectId} />
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </ProjectContext.Provider>
  )
}

function ProjectLayoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
