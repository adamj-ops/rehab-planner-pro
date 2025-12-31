'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  IconClipboardList,
  IconCalendar,
  IconUsers,
  IconCloudRain,
  IconSun,
  IconCloud,
  IconSnowflake,
  IconWind,
  IconArrowRight,
} from '@tabler/icons-react'
import { useProjectReports } from '@/hooks/use-daily-reports'
import type { DailySiteReport, WeatherCondition } from '@/types/report'

interface ReportListProps {
  projectId: string
  onReportClick?: (report: DailySiteReport) => void
}

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  sunny: <IconSun className="h-4 w-4 text-yellow-500" />,
  cloudy: <IconCloud className="h-4 w-4 text-gray-500" />,
  rainy: <IconCloudRain className="h-4 w-4 text-blue-500" />,
  snowy: <IconSnowflake className="h-4 w-4 text-cyan-400" />,
  mixed: <IconCloud className="h-4 w-4 text-gray-400" />,
  windy: <IconWind className="h-4 w-4 text-teal-500" />,
}

export function ReportList({ projectId, onReportClick }: ReportListProps) {
  const { data: reports, isLoading } = useProjectReports(projectId)

  if (isLoading) {
    return <ReportListSkeleton />
  }

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <IconClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Reports Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start documenting your daily progress by creating your first report.
          </p>
          <Button asChild>
            <Link href={`/projects/${projectId}/reports/new`}>
              Create First Report
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          projectId={projectId}
          onClick={() => onReportClick?.(report)}
        />
      ))}
    </div>
  )
}

interface ReportCardProps {
  report: DailySiteReport
  projectId: string
  onClick?: () => void
}

function ReportCard({ report, projectId, onClick }: ReportCardProps) {
  const reportDate = new Date(report.report_date)
  const weatherIcon = report.weather_conditions
    ? weatherIcons[report.weather_conditions]
    : null

  return (
    <Card
      className={cn(
        'transition-colors cursor-pointer',
        'hover:border-primary/50 hover:bg-accent/50'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              {format(reportDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <Badge
              variant={report.status === 'submitted' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {report.status === 'submitted' ? 'Submitted' : 'Draft'}
            </Badge>
          </div>

          <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
            <Link href={`/projects/${projectId}/reports/${report.id}`}>
              View
              <IconArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {/* Weather */}
          <div className="flex items-center gap-2">
            {weatherIcon || <IconCloud className="h-4 w-4 text-muted-foreground" />}
            <span>
              {report.weather_conditions
                ? report.weather_conditions.charAt(0).toUpperCase() +
                  report.weather_conditions.slice(1)
                : 'Not recorded'}
              {report.temperature_high && (
                <span className="text-muted-foreground ml-1">
                  {report.temperature_high}°F
                </span>
              )}
            </span>
          </div>

          {/* Crew */}
          <div className="flex items-center gap-2">
            <IconUsers className="h-4 w-4 text-muted-foreground" />
            <span>
              {report.crew_count || 0} crew
            </span>
          </div>

          {/* Work summary preview */}
          {report.work_completed && (
            <div className="col-span-2 text-muted-foreground line-clamp-1">
              {report.work_completed}
            </div>
          )}
        </div>

        {/* Issues indicator */}
        {report.issues_encountered && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Issues Reported
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ReportListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5 col-span-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
