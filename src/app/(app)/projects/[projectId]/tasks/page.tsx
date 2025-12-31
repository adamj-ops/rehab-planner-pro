'use client'

import { useState } from 'react'
import { useProject } from '../layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconPlus } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/hooks/use-workspace-store'
import {
  TaskKanban,
  TaskTable,
  TaskViewToggle,
  TaskDetailSheet,
  type TaskViewMode,
} from '@/components/tasks'
import { useTaskStats } from '@/hooks/use-project-tasks'

export default function ProjectTasksPage() {
  const { project, isLoading } = useProject()
  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: stats } = useTaskStats(project?.id || '')

  if (isLoading || !project) {
    return <TasksSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            {displayName}
            {stats && (
              <span className="ml-2 text-sm">
                • {stats.done}/{stats.total} completed ({stats.completionRate}%)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TaskViewToggle value={viewMode} onChange={setViewMode} />
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'kanban' ? (
          <TaskKanban projectId={project.id} />
        ) : (
          <TaskTable projectId={project.id} groupBy="status" />
        )}
      </div>

      {/* Create Task Sheet */}
      <TaskDetailSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={project.id}
        task={null}
      />
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    </div>
  )
}
