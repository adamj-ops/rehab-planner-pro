'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProject } from '../layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconPlus } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/stores/workspace-store'
import { ReportList } from '@/components/reports'
import type { DailySiteReport } from '@/types/report'

export default function ProjectReportsPage() {
  const { project, isLoading } = useProject()
  const router = useRouter()

  if (isLoading || !project) {
    return <ReportsSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  const handleReportClick = (report: DailySiteReport) => {
    router.push(`/projects/${project.id}/reports/${report.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Reports</h1>
          <p className="text-muted-foreground">{displayName}</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href={`/projects/${project.id}/reports/new`}>
            <IconPlus className="h-4 w-4" />
            New Daily Report
          </Link>
        </Button>
      </div>

      {/* Reports List */}
      <ReportList projectId={project.id} onReportClick={handleReportClick} />
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
