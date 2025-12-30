/**
 * Task Management Types
 * Aligned with project_tasks table in Supabase
 */

export type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_vendor_id: string | null
  room_id: string | null
  scope_item_id: string | null
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TaskColumn {
  id: TaskStatus
  name: string
  color: string
}

export const TASK_COLUMNS: TaskColumn[] = [
  { id: 'to_do', name: 'To Do', color: 'bg-slate-500' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-blue-500' },
  { id: 'blocked', name: 'Blocked', color: 'bg-red-500' },
  { id: 'done', name: 'Done', color: 'bg-green-500' },
]

export const TASK_PRIORITIES: { id: TaskPriority; name: string; color: string }[] = [
  { id: 'low', name: 'Low', color: 'bg-slate-400' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-500' },
  { id: 'high', name: 'High', color: 'bg-orange-500' },
  { id: 'urgent', name: 'Urgent', color: 'bg-red-500' },
]

export interface CreateTaskInput {
  project_id: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigned_vendor_id?: string
  room_id?: string
  due_date?: string
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assigned_vendor_id?: string | null
  room_id?: string | null
  due_date?: string | null
  sort_order?: number
}

// Kanban-compatible task format
export interface KanbanTask extends ProjectTask {
  column: TaskStatus
  name: string
}

export function toKanbanTask(task: ProjectTask): KanbanTask {
  return {
    ...task,
    column: task.status,
    name: task.title,
  }
}

export function fromKanbanTask(kanbanTask: KanbanTask): Partial<ProjectTask> {
  return {
    id: kanbanTask.id,
    status: kanbanTask.column,
    title: kanbanTask.name,
  }
}
