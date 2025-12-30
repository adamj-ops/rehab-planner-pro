'use client'

import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconPlus, IconClipboardList, IconCalendar } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/stores/workspace-store'

export default function ProjectReportsPage() {
  const { project, isLoading } = useProject()

  if (isLoading || !project) {
    return <ReportsSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Reports</h1>
          <p className="text-muted-foreground">{displayName}</p>
        </div>
        <Button className="gap-2">
          <IconPlus className="h-4 w-4" />
          New Daily Report
        </Button>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Daily site reports and progress updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <IconClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No reports yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create daily site reports to track progress, issues, and crew activity
            </p>
            <Button variant="outline" className="gap-2">
              <IconPlus className="h-4 w-4" />
              Create First Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <h3 className="font-semibold mb-2">Daily Reports Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Structured daily reports with weather, crew on site, work completed, blockers, and linked photos/tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
