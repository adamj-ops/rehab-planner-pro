'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useProject } from '../../layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IconArrowLeft, IconDownload, IconLoader2 } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/stores/workspace-store'
import { DailyReportForm } from '@/components/reports'
import { useReport } from '@/hooks/use-daily-reports'

// Dynamically import PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

const ReportPDFDocument = dynamic(
  () =>
    import('@/components/reports/report-pdf-document').then(
      (mod) => mod.ReportPDFDocument
    ),
  { ssr: false }
)

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.reportId as string

  const { project, isLoading: projectLoading } = useProject()
  const { data: report, isLoading: reportLoading } = useReport(reportId)

  const isLoading = projectLoading || reportLoading

  if (isLoading || !project) {
    return <ReportDetailSkeleton />
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${project.id}/reports`}>
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Report Not Found</h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          The report you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
      </div>
    )
  }

  const displayName = getProjectDisplayName(project)

  const handleSuccess = () => {
    router.push(`/projects/${project.id}/reports`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${project.id}/reports`}>
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {report.status === 'submitted' ? 'View Report' : 'Edit Report'}
            </h1>
            <p className="text-muted-foreground">{displayName}</p>
          </div>
        </div>

        {/* PDF Export Button */}
        {report.status === 'submitted' && (
          <PDFDownloadLink
            document={<ReportPDFDocument report={report} project={project} />}
            fileName={`daily-report-${report.report_date}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading}>
                {loading ? (
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconDownload className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {/* Form */}
      <DailyReportForm
        projectId={project.id}
        report={report}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

function ReportDetailSkeleton() {
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
