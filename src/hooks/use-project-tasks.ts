'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectTask, TaskStatus } from '@/types/task'

interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  priority?: string
  dueDateBefore?: string
  dueDateAfter?: string
  includeCompleted?: boolean
}

async function fetchProjectTasks(
  projectId: string,
  filters?: TaskFilters
): Promise<ProjectTask[]> {
  const supabase = createClient()

  let query = supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Filter by status
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  // Filter by priority
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  // Filter by due date
  if (filters?.dueDateBefore) {
    query = query.lte('due_date', filters.dueDateBefore)
  }
  if (filters?.dueDateAfter) {
    query = query.gte('due_date', filters.dueDateAfter)
  }

  // Exclude completed tasks if not explicitly included
  if (filters?.includeCompleted === false) {
    query = query.neq('status', 'done')
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProjectTask[]
}

export function useProjectTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => fetchProjectTasks(projectId, filters),
    enabled: !!projectId,
  })
}

// Convenience hook for today's tasks (used in dashboard)
export function useTodaysTasks(projectId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['tasks', projectId, 'today'],
    queryFn: async () => {
      const supabase = createClient()
      
      // Get tasks that are due today OR in progress
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .or(`due_date.eq.${today},status.eq.in_progress`)
        .neq('status', 'done')
        .order('priority', { ascending: true }) // urgent first
        .order('due_date', { ascending: true })
        .limit(10)

      if (error) throw error
      return data as ProjectTask[]
    },
    enabled: !!projectId,
  })
}

// Hook to get task by ID
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (error) throw error
      return data as ProjectTask
    },
    enabled: !!taskId,
  })
}

// Hook for task statistics
export function useTaskStats(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId, 'stats'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('project_id', projectId)

      if (error) throw error
      
      const stats = {
        total: data.length,
        to_do: data.filter(t => t.status === 'to_do').length,
        in_progress: data.filter(t => t.status === 'in_progress').length,
        blocked: data.filter(t => t.status === 'blocked').length,
        done: data.filter(t => t.status === 'done').length,
        completionRate: 0,
      }
      
      stats.completionRate = stats.total > 0 
        ? Math.round((stats.done / stats.total) * 100) 
        : 0

      return stats
    },
    enabled: !!projectId,
  })
}
