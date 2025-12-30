'use client'

import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconPhoto,
  IconReceipt,
  IconTrendingUp,
  IconDownload,
  IconShare,
  IconCheck,
} from '@tabler/icons-react'
import { getProjectDisplayName } from '@/stores/workspace-store'
import { format } from 'date-fns'

export default function ProjectPortfolioPage() {
  const { project, isLoading } = useProject()

  if (isLoading || !project) {
    return <PortfolioSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">
            <IconCheck className="h-8 w-8 text-green-500" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">
              {project.address_city && project.address_state
                ? `${project.address_city}, ${project.address_state}`
                : 'No address'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completed
              </Badge>
              {project.completed_at && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(project.completed_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <IconShare className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="gap-2">
            <IconDownload className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Final Cost</CardTitle>
            <IconReceipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.total_actual_cost
                ? `$${project.total_actual_cost.toLocaleString()}`
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Budget was{' '}
              {project.max_budget
                ? `$${project.max_budget.toLocaleString()}`
                : 'not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">—%</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.construction_started_at && project.completed_at
                ? `${Math.ceil(
                    (new Date(project.completed_at).getTime() -
                      new Date(project.construction_started_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )} days`
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground">Construction time</p>
          </CardContent>
        </Card>
      </div>

      {/* Before/After Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Before & After</CardTitle>
          <CardDescription>Transformation gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
            <IconPhoto className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No before/after photos</h3>
            <p className="text-sm text-muted-foreground">
              Before and after comparisons will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Learned */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons Learned</CardTitle>
          <CardDescription>Key takeaways from this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No lessons learned documented yet
            </p>
            <Button variant="link" size="sm" className="mt-2">
              Add lessons learned →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Read-Only Notice */}
      <Card className="border-dashed bg-muted/50">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            This project is completed and in read-only mode. You can view all
            data but cannot make changes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
