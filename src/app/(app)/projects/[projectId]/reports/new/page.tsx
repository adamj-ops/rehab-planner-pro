'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProject } from '../../layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconArrowLeft } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/hooks/use-workspace-store'
import { DailyReportForm } from '@/components/reports'

export default function NewReportPage() {
  const { project, isLoading } = useProject()
  const router = useRouter()

  if (isLoading || !project) {
    return <ReportFormSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  const handleSuccess = () => {
    router.push(`/projects/${project.id}/reports`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/reports`}>
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Daily Report</h1>
          <p className="text-muted-foreground">{displayName}</p>
        </div>
      </div>

      {/* Form */}
      <DailyReportForm projectId={project.id} onSuccess={handleSuccess} />
    </div>
  )
}

function ReportFormSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
