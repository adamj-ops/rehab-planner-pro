'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { CreateTaskInput, UpdateTaskInput, ProjectTask, KanbanTask } from '@/types/task'

export function useCreateTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      // Get max sort_order for the status column
      const { data: existingTasks } = await supabase
        .from('project_tasks')
        .select('sort_order')
        .eq('project_id', input.project_id)
        .eq('status', input.status || 'to_do')
        .order('sort_order', { ascending: false })
        .limit(1)

      const maxSortOrder = existingTasks?.[0]?.sort_order ?? 0

      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          ...input,
          status: input.status || 'to_do',
          priority: input.priority || 'medium',
          sort_order: maxSortOrder + 1,
        })
        .select()
        .single()

      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', newTask.project_id] })
      toast.success('Task created', {
        description: newTask.title,
      })
    },
    onError: (error) => {
      toast.error('Failed to create task', {
        description: error.message,
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input

      // If status changed to 'done', set completed_at
      if (updates.status === 'done') {
        ;(updates as Record<string, unknown>).completed_at = new Date().toISOString()
      } else if (updates.status && updates.status !== 'done') {
        ;(updates as Record<string, unknown>).completed_at = null
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ProjectTask
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', updatedTask.project_id] })
      queryClient.invalidateQueries({ queryKey: ['task', updatedTask.id] })
    },
    onError: (error) => {
      toast.error('Failed to update task', {
        description: error.message,
      })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ taskId, projectId }: { taskId: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      return { taskId, projectId }
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete task', {
        description: error.message,
      })
    },
  })
}

export function useReorderTasks() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      tasks,
    }: {
      projectId: string
      tasks: KanbanTask[]
    }) => {
      // Batch update all tasks with their new sort_order and status (column)
      const updates = tasks.map((task, index) => ({
        id: task.id,
        status: task.column,
        sort_order: index,
      }))

      // Use upsert for batch updates
      const promises = updates.map(({ id, status, sort_order }) =>
        supabase
          .from('project_tasks')
          .update({ status, sort_order })
          .eq('id', id)
      )

      await Promise.all(promises)
      return { projectId, tasks }
    },
    onMutate: async ({ projectId, tasks }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const previousTasks = queryClient.getQueryData(['tasks', projectId])

      // Convert kanban tasks back to project tasks for cache
      const updatedTasks = tasks.map((t, i) => ({
        ...t,
        status: t.column,
        sort_order: i,
      }))

      queryClient.setQueryData(['tasks', projectId], updatedTasks)

      return { previousTasks }
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks)
      }
      toast.error('Failed to reorder tasks', {
        description: error.message,
      })
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })
}

// Quick status update (for checkbox toggles)
export function useToggleTaskComplete() {
  const updateTask = useUpdateTask()

  return useMutation({
    mutationFn: async (task: ProjectTask) => {
      const newStatus = task.status === 'done' ? 'to_do' : 'done'
      return updateTask.mutateAsync({
        id: task.id,
        status: newStatus,
      })
    },
  })
}
