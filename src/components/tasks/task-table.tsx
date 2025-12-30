'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconFlag,
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'
import { useProjectTasks } from '@/hooks/use-project-tasks'
import { useUpdateTask, useDeleteTask, useToggleTaskComplete } from '@/hooks/use-task-mutations'
import { TaskDetailSheet } from './task-detail-sheet'
import { TASK_COLUMNS, TASK_PRIORITIES } from '@/types/task'
import type { ProjectTask, TaskStatus } from '@/types/task'

interface TaskTableProps {
  projectId: string
  groupBy?: 'status' | 'priority' | 'none'
}

export function TaskTable({ projectId, groupBy = 'status' }: TaskTableProps) {
  const { data: tasks, isLoading } = useProjectTasks(projectId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const toggleComplete = useToggleTaskComplete()

  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(TASK_COLUMNS.map(c => c.id))
  )

  // Group tasks by selected field
  const groupedTasks = useMemo(() => {
    if (!tasks || groupBy === 'none') {
      return { ungrouped: tasks || [] }
    }

    const groups: Record<string, ProjectTask[]> = {}
    tasks.forEach(task => {
      const key = task[groupBy]
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })
    return groups
  }, [tasks, groupBy])

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask.mutateAsync({ id: taskId, status: newStatus })
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    await deleteTask.mutateAsync({ taskId, projectId })
  }

  if (isLoading) {
    return <TaskTableSkeleton />
  }

  const getGroupLabel = (groupId: string) => {
    if (groupBy === 'status') {
      return TASK_COLUMNS.find(c => c.id === groupId)?.name || groupId
    }
    if (groupBy === 'priority') {
      return TASK_PRIORITIES.find(p => p.id === groupId)?.name || groupId
    }
    return groupId
  }

  const getGroupColor = (groupId: string) => {
    if (groupBy === 'status') {
      return TASK_COLUMNS.find(c => c.id === groupId)?.color || 'bg-slate-500'
    }
    if (groupBy === 'priority') {
      const colors: Record<string, string> = {
        urgent: 'bg-red-500',
        high: 'bg-orange-500',
        medium: 'bg-yellow-500',
        low: 'bg-slate-400',
      }
      return colors[groupId] || 'bg-slate-500'
    }
    return 'bg-slate-500'
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-28">Due Date</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupBy !== 'none' ? (
              Object.entries(groupedTasks).map(([groupId, groupTasks]) => (
                <>
                  {/* Group header row */}
                  <TableRow
                    key={`group-${groupId}`}
                    className="bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => toggleGroup(groupId)}
                  >
                    <TableCell colSpan={6}>
                      <div className="flex items-center gap-2 font-medium">
                        {expandedGroups.has(groupId) ? (
                          <IconChevronDown className="h-4 w-4" />
                        ) : (
                          <IconChevronRight className="h-4 w-4" />
                        )}
                        <div className={cn('h-2 w-2 rounded-full', getGroupColor(groupId))} />
                        <span>{getGroupLabel(groupId)}</span>
                        <Badge variant="secondary" className="ml-2 h-5">
                          {groupTasks.length}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Group tasks */}
                  {expandedGroups.has(groupId) &&
                    groupTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={() => {
                          setSelectedTask(task)
                          setIsSheetOpen(true)
                        }}
                        onDelete={() => handleDelete(task.id)}
                        onToggleComplete={() => toggleComplete.mutate(task)}
                      />
                    ))}
                </>
              ))
            ) : (
              tasks?.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={() => {
                    setSelectedTask(task)
                    setIsSheetOpen(true)
                  }}
                  onDelete={() => handleDelete(task.id)}
                  onToggleComplete={() => toggleComplete.mutate(task)}
                />
              ))
            )}

            {(!tasks || tasks.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tasks yet. Add your first task to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TaskDetailSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false)
          setSelectedTask(null)
        }}
        projectId={projectId}
        task={selectedTask}
      />
    </>
  )
}

interface TaskRowProps {
  task: ProjectTask
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
  onToggleComplete: () => void
}

function TaskRow({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskRowProps) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done'

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }

  return (
    <TableRow className={cn(task.status === 'done' && 'opacity-60')}>
      <TableCell>
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={onToggleComplete}
        />
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span
            className={cn(
              'font-medium cursor-pointer hover:text-primary',
              task.status === 'done' && 'line-through text-muted-foreground'
            )}
            onClick={onEdit}
          >
            {task.title}
          </span>
          {task.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {task.description}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task.id, value as TaskStatus)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_COLUMNS.map(col => (
              <SelectItem key={col.id} value={col.id}>
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', col.color)} />
                  {col.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <Badge
          variant="secondary"
          className={cn('text-xs', priorityColors[task.priority])}
        >
          <IconFlag className="h-3 w-3 mr-1" />
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
      </TableCell>

      <TableCell>
        {task.due_date ? (
          <span
            className={cn(
              'flex items-center gap-1 text-sm',
              isOverdue && 'text-red-500'
            )}
          >
            <IconCalendar className="h-3.5 w-3.5" />
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <IconEdit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function TaskTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-28">Priority</TableHead>
            <TableHead className="w-28">Due Date</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-8 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
