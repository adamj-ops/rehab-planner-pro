'use client'

import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconPlus, IconClipboardList } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/stores/workspace-store'

export default function ProjectTasksPage() {
  const { project, isLoading } = useProject()

  if (isLoading || !project) {
    return <TasksSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">{displayName}</p>
        </div>
        <Button className="gap-2">
          <IconPlus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Kanban Board Placeholder */}
      <div className="grid gap-4 md:grid-cols-4">
        {['To Do', 'In Progress', 'Blocked', 'Done'].map((column) => (
          <Card key={column}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {column}
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  0
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center min-h-[200px] border-2 border-dashed rounded-lg">
                <IconClipboardList className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No tasks</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <IconPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <h3 className="font-semibold mb-2">Kanban Board Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Full drag-and-drop task management with dependencies, assignments, and due dates.
          </p>
        </CardContent>
      </Card>
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
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}
