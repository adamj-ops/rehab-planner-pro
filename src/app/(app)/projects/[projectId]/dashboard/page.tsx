'use client'

import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconCamera,
  IconClipboardList,
  IconPlus,
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
} from '@/stores/workspace-store'
import { cn } from '@/lib/utils'

export default function ProjectDashboardPage() {
  const { project, isLoading } = useProject()

  if (isLoading || !project) {
    return <DashboardSkeleton />
  }

  const displayName = getProjectDisplayName(project)
  const taskProgress = getTaskProgressPercent(project)
  const budgetUsage = getBudgetUsagePercent(project)
  const daysSinceStart = getDaysSinceStart(project)

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
              {project.tasks_completed}/{project.tasks_total}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your daily workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <IconCamera className="h-4 w-4" />
              Upload Photos
            </Button>
            <Button variant="outline" className="gap-2">
              <IconClipboardList className="h-4 w-4" />
              Daily Report
            </Button>
            <Button variant="outline" className="gap-2">
              <IconPlus className="h-4 w-4" />
              Add Task
            </Button>
            <Button variant="outline" className="gap-2">
              <IconReceipt className="h-4 w-4" />
              Log Expense
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Tasks scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No tasks for today</p>
              <Button variant="link" size="sm" className="mt-2">
                View all tasks →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Photos</CardTitle>
            <CardDescription>Latest project photos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconCamera className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
              <Button variant="link" size="sm" className="mt-2">
                Upload photos →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear here as you work on the project
            </p>
          </div>
        </CardContent>
      </Card>
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
      <Skeleton className="h-24" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}
