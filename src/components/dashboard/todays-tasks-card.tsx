'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  IconArrowRight,
  IconClipboardList,
  IconFlag,
} from '@tabler/icons-react'
import { useTodaysTasks } from '@/hooks/use-project-tasks'
import { useToggleTaskComplete } from '@/hooks/use-task-mutations'
import type { ProjectTask } from '@/types/task'

interface TodaysTasksCardProps {
  projectId: string
  onTaskClick?: (task: ProjectTask) => void
}

export function TodaysTasksCard({ projectId, onTaskClick }: TodaysTasksCardProps) {
  const { data: tasks, isLoading } = useTodaysTasks(projectId)
  const toggleComplete = useToggleTaskComplete()

  if (isLoading) {
    return <TodaysTasksSkeleton />
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          Today&apos;s Tasks
          {tasks && tasks.length > 0 && (
            <Badge variant="secondary" className="h-5">
              {tasks.length}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${projectId}/tasks`}>
            View All
            <IconArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!tasks || tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconClipboardList className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No tasks for today</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks due today or in progress will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleComplete.mutate(task)}
                onClick={() => onTaskClick?.(task)}
              />
            ))}

            {tasks.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{tasks.length - 5} more tasks
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TaskItem({
  task,
  onToggle,
  onClick,
}: {
  task: ProjectTask
  onToggle: () => void
  onClick?: () => void
}) {
  const priorityColors: Record<string, string> = {
    urgent: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-slate-400',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-2 rounded-md transition-colors',
        'hover:bg-accent cursor-pointer',
        task.status === 'done' && 'opacity-60'
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-checkbox]')) return
        onClick?.()
      }}
    >
      <div data-checkbox className="pt-0.5">
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={onToggle}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-tight',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      <IconFlag
        className={cn('h-4 w-4 flex-shrink-0', priorityColors[task.priority])}
      />
    </div>
  )
}

function TodaysTasksSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
