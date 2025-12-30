'use client'

import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconCalendar,
  IconFlag,
  IconGripVertical,
  IconUser,
} from '@tabler/icons-react'
import type { ProjectTask, TaskPriority } from '@/types/task'
import { TASK_PRIORITIES } from '@/types/task'

interface TaskCardProps {
  task: ProjectTask
  onToggleComplete?: () => void
  onClick?: () => void
  showDragHandle?: boolean
  compact?: boolean
}

function getPriorityInfo(priority: TaskPriority) {
  return TASK_PRIORITIES.find(p => p.id === priority) || TASK_PRIORITIES[1]
}

export function TaskCard({
  task,
  onToggleComplete,
  onClick,
  showDragHandle = true,
  compact = false,
}: TaskCardProps) {
  const priorityInfo = getPriorityInfo(task.priority)
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done'

  return (
    <div
      className={cn(
        'group flex items-start gap-2 rounded-lg border bg-card p-3 transition-colors',
        'hover:border-primary/50 hover:bg-accent/50',
        task.status === 'done' && 'opacity-60',
        onClick && 'cursor-pointer'
      )}
      onClick={(e) => {
        // Don't trigger onClick when clicking checkbox
        if ((e.target as HTMLElement).closest('[data-checkbox]')) return
        onClick?.()
      }}
    >
      {showDragHandle && (
        <div className="flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-50 transition-opacity">
          <IconGripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div data-checkbox>
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={() => onToggleComplete?.()}
          className="mt-0.5"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={cn(
            'text-sm font-medium leading-tight',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>

        {!compact && task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          <Badge
            variant="secondary"
            className={cn(
              'h-5 text-[10px] font-medium',
              task.priority === 'urgent' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              task.priority === 'high' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
              task.priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              task.priority === 'low' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            <IconFlag className="h-3 w-3 mr-1" />
            {priorityInfo.name}
          </Badge>

          {/* Due date */}
          {task.due_date && (
            <Badge
              variant="outline"
              className={cn(
                'h-5 text-[10px]',
                isOverdue && 'border-red-500 text-red-500'
              )}
            >
              <IconCalendar className="h-3 w-3 mr-1" />
              {format(new Date(task.due_date), 'MMM d')}
            </Badge>
          )}

          {/* Vendor assignment placeholder */}
          {task.assigned_vendor_id && (
            <Badge variant="outline" className="h-5 text-[10px]">
              <IconUser className="h-3 w-3 mr-1" />
              Assigned
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact version for dashboard lists
export function TaskCardCompact({
  task,
  onToggleComplete,
  onClick,
}: Omit<TaskCardProps, 'compact' | 'showDragHandle'>) {
  return (
    <TaskCard
      task={task}
      onToggleComplete={onToggleComplete}
      onClick={onClick}
      showDragHandle={false}
      compact
    />
  )
}
