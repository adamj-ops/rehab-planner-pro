'use client'

import { useState, useMemo } from 'react'
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from '@/components/kibo-ui/kanban'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { IconFlag, IconCalendar } from '@tabler/icons-react'
import { format } from 'date-fns'
import { useProjectTasks } from '@/hooks/use-project-tasks'
import { useReorderTasks, useToggleTaskComplete } from '@/hooks/use-task-mutations'
import { TaskQuickAdd } from './task-quick-add'
import { TaskDetailSheet } from './task-detail-sheet'
import { TASK_COLUMNS, toKanbanTask } from '@/types/task'
import type { ProjectTask, TaskStatus, KanbanTask, TaskColumn } from '@/types/task'

interface TaskKanbanProps {
  projectId: string
}

export function TaskKanban({ projectId }: TaskKanbanProps) {
  const { data: tasks, isLoading } = useProjectTasks(projectId)
  const reorderTasks = useReorderTasks()
  const toggleComplete = useToggleTaskComplete()

  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [createForColumn, setCreateForColumn] = useState<TaskStatus>('to_do')

  // Convert tasks to kanban format
  const kanbanTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map(toKanbanTask)
  }, [tasks])

  const handleDataChange = (newData: KanbanTask[]) => {
    reorderTasks.mutate({
      projectId,
      tasks: newData,
    })
  }

  const handleCardClick = (task: KanbanTask) => {
    const originalTask = tasks?.find(t => t.id === task.id)
    if (originalTask) {
      setSelectedTask(originalTask)
      setIsSheetOpen(true)
    }
  }

  const handleAddClick = (columnId: TaskStatus) => {
    setSelectedTask(null)
    setCreateForColumn(columnId)
    setIsSheetOpen(true)
  }

  if (isLoading) {
    return <TaskKanbanSkeleton />
  }

  return (
    <>
      <KanbanProvider
        columns={TASK_COLUMNS}
        data={kanbanTasks}
        onDataChange={handleDataChange}
        className="h-full min-h-[500px]"
      >
        {(column: TaskColumn) => (
          <KanbanBoard key={column.id} id={column.id} className="h-full">
            <KanbanHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full', column.color)} />
                <span>{column.name}</span>
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {kanbanTasks.filter(t => t.column === column.id).length}
                </Badge>
              </div>
            </KanbanHeader>

            <KanbanCards<KanbanTask> id={column.id}>
              {(task) => (
                <KanbanCard
                  key={task.id}
                  id={task.id}
                  name={task.name}
                  column={task.column}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div
                    onClick={() => handleCardClick(task)}
                    className="space-y-2"
                  >
                    <p className={cn(
                      'font-medium text-sm',
                      task.status === 'done' && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      {task.due_date && (
                        <DueDateBadge 
                          dueDate={task.due_date} 
                          isDone={task.status === 'done'} 
                        />
                      )}
                    </div>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>

            <div className="p-2 border-t bg-background/50">
              <TaskQuickAdd
                projectId={projectId}
                status={column.id}
              />
            </div>
          </KanbanBoard>
        )}
      </KanbanProvider>

      <TaskDetailSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false)
          setSelectedTask(null)
        }}
        projectId={projectId}
        task={selectedTask}
        defaultStatus={createForColumn}
      />
    </>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }

  return (
    <Badge
      variant="secondary"
      className={cn('h-5 text-[10px] font-medium', colors[priority as keyof typeof colors])}
    >
      <IconFlag className="h-3 w-3 mr-0.5" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

function DueDateBadge({ dueDate, isDone }: { dueDate: string; isDone: boolean }) {
  const date = new Date(dueDate)
  const isOverdue = date < new Date() && !isDone

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 text-[10px]',
        isOverdue && 'border-red-500 text-red-500'
      )}
    >
      <IconCalendar className="h-3 w-3 mr-0.5" />
      {format(date, 'MMM d')}
    </Badge>
  )
}

function TaskKanbanSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full min-h-[500px]">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col rounded-md border bg-secondary">
          <Skeleton className="h-10 m-2" />
          <div className="flex-1 p-2 space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-20" />
            <Skeleton className="h-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
