'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconCamera,
  IconReceipt,
  IconAlertCircle,
  IconCheck,
  IconClock,
} from '@tabler/icons-react'
import {
  getProjectDisplayName,
  getTaskProgressPercent,
  getBudgetUsagePercent,
  getDaysSinceStart,
} from '@/hooks/use-workspace-store'
import { cn } from '@/lib/utils'
import { QuickActionsCard, TodaysTasksCard } from '@/components/dashboard'
import { TaskDetailSheet } from '@/components/tasks'
import { PhotoUploadDialog } from '@/components/photos'
import { useTaskStats } from '@/hooks/use-project-tasks'
import type { ProjectTask } from '@/types/task'

export default function ProjectDashboardPage() {
  const { project, isLoading } = useProject()
  const router = useRouter()
  
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)

  const { data: taskStats } = useTaskStats(project?.id || '')

  if (isLoading || !project) {
    return <DashboardSkeleton />
  }

  const displayName = getProjectDisplayName(project)
  const budgetUsage = getBudgetUsagePercent(project)
  const daysSinceStart = getDaysSinceStart(project)

  // Use real task stats if available, fall back to project cache
  const tasksTotal = taskStats?.total ?? project.tasks_total ?? 0
  const tasksCompleted = taskStats?.done ?? project.tasks_completed ?? 0
  const taskProgress = taskStats?.completionRate ?? getTaskProgressPercent(project)

  const handleTaskClick = (task: ProjectTask) => {
    setSelectedTask(task)
    setIsTaskSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{project.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">
              {project.address_city && project.address_state
                ? `${project.address_city}, ${project.address_state}`
                : 'No address'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {project.phase}
              </Badge>
              {daysSinceStart !== null && (
                <span className="text-sm text-muted-foreground">
                  Day {daysSinceStart}
                  {project.days_ahead_behind !== 0 && (
                    <span
                      className={cn(
                        'ml-1',
                        project.days_ahead_behind > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      ({project.days_ahead_behind > 0 ? '+' : ''}
                      {project.days_ahead_behind}d)
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <IconReceipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetUsage !== null ? `${budgetUsage}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {project.total_actual_cost
                ? `$${project.total_actual_cost.toLocaleString()}`
                : '$0'}{' '}
              of{' '}
              {project.max_budget
                ? `$${project.max_budget.toLocaleString()}`
                : 'No budget set'}
            </p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  budgetUsage !== null && budgetUsage > 90
                    ? 'bg-red-500'
                    : budgetUsage !== null && budgetUsage > 75
                    ? 'bg-amber-500'
                    : 'bg-green-500'
                )}
                style={{ width: `${Math.min(budgetUsage || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                project.days_ahead_behind < -3
                  ? 'text-red-600'
                  : project.days_ahead_behind < 0
                  ? 'text-amber-600'
                  : 'text-green-600'
              )}
            >
              {project.days_ahead_behind === 0
                ? 'On Track'
                : project.days_ahead_behind > 0
                ? `${project.days_ahead_behind}d Ahead`
                : `${Math.abs(project.days_ahead_behind)}d Behind`}
            </div>
            <p className="text-xs text-muted-foreground">
              {daysSinceStart !== null
                ? `Day ${daysSinceStart} of construction`
                : 'Not started'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasksCompleted}/{tasksTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              {taskProgress}% complete
            </p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Open issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Today's Tasks */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickActionsCard
          onUploadPhotos={() => setIsPhotoDialogOpen(true)}
          onDailyReport={() => router.push(`/projects/${project.id}/reports`)}
          onAddTask={() => {
            setSelectedTask(null)
            setIsTaskSheetOpen(true)
          }}
          onLogSiteVisit={() => router.push(`/projects/${project.id}/notebook?template=daily-log`)}
          onRecordVendorMeeting={() => router.push(`/projects/${project.id}/notebook?template=vendor-meeting`)}
          onDocumentDecision={() => router.push(`/projects/${project.id}/notebook?template=design-decision`)}
        />

        <TodaysTasksCard
          projectId={project.id}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Recent Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Photos</CardTitle>
          <CardDescription>Latest project photos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconCamera className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => setIsPhotoDialogOpen(true)}
            >
              Upload photos →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PhotoUploadDialog
        isOpen={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
      />

      <TaskDetailSheet
        isOpen={isTaskSheetOpen}
        onClose={() => {
          setIsTaskSheetOpen(false)
          setSelectedTask(null)
        }}
        projectId={project.id}
        task={selectedTask}
      />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}
