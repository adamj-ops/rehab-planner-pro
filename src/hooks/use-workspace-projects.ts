'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WorkspaceProject } from '@/hooks/use-workspace-store'

export function useWorkspaceProjects() {
  const [projects, setProjects] = useState<WorkspaceProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProjects() {
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
          .is('deleted_at', null)
          .order('sort_order', { ascending: true })
          .order('updated_at', { ascending: false })

        if (queryError) {
          throw queryError
        }

        // Map to WorkspaceProject type with defaults
        const workspaceProjects: WorkspaceProject[] = (data || []).map((p) => ({
          id: p.id,
          project_name: p.project_name,
          address_street: p.address_street || '',
          address_city: p.address_city || '',
          address_state: p.address_state || '',
          phase: p.phase || 'planning',
          emoji: p.emoji || '🏠',
          color: p.color,
          sort_order: p.sort_order || 0,
          tasks_total: p.tasks_total || 0,
          tasks_completed: p.tasks_completed || 0,
          days_ahead_behind: p.days_ahead_behind || 0,
          total_estimated_cost: p.total_estimated_cost,
          total_actual_cost: p.total_actual_cost,
          max_budget: p.max_budget,
          planning_started_at: p.planning_started_at,
          construction_started_at: p.construction_started_at,
          completed_at: p.completed_at,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
        }))

        setProjects(workspaceProjects)
      } catch (err) {
        console.error('Error fetching workspace projects:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
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
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false })

    if (!queryError && data) {
      const workspaceProjects: WorkspaceProject[] = data.map((p) => ({
        id: p.id,
        project_name: p.project_name,
        address_street: p.address_street || '',
        address_city: p.address_city || '',
        address_state: p.address_state || '',
        phase: p.phase || 'planning',
        emoji: p.emoji || '🏠',
        color: p.color,
        sort_order: p.sort_order || 0,
        tasks_total: p.tasks_total || 0,
        tasks_completed: p.tasks_completed || 0,
        days_ahead_behind: p.days_ahead_behind || 0,
        total_estimated_cost: p.total_estimated_cost,
        total_actual_cost: p.total_actual_cost,
        max_budget: p.max_budget,
        planning_started_at: p.planning_started_at,
        construction_started_at: p.construction_started_at,
        completed_at: p.completed_at,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      }))
      setProjects(workspaceProjects)
    }
    
    setIsLoading(false)
  }

  return { projects, isLoading, error, refetch }
}
