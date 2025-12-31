'use client'

import { differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { IconBuildingWarehouse, IconCalendar } from '@tabler/icons-react'
import type { RehabProject } from '@/types/database'
import { getProjectDisplayName } from '@/hooks/use-workspace-store'

interface DashboardHeaderProps {
  project: RehabProject
  stats?: {
    total: number
    done: number
    completionRate: number
    daysAheadBehind?: number
  }
}

export function DashboardHeader({ project, stats }: DashboardHeaderProps) {
  const displayName = getProjectDisplayName(project)
  
  // Calculate days since construction started
  const daysSinceStart = project.construction_started_at
    ? differenceInDays(new Date(), new Date(project.construction_started_at))
    : 0

  // Estimate total days (placeholder - would come from project settings)
  const estimatedDays = 180

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{project.emoji || '🏠'}</span>
        <h1 className="text-2xl font-bold">{displayName}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {/* Phase Badge */}
        <Badge
          variant="secondary"
          className={cn(
            project.phase === 'construction' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            project.phase === 'planning' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            project.phase === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            project.phase === 'paused' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}
        >
          <IconBuildingWarehouse className="h-3 w-3 mr-1" />
          {project.phase === 'construction' ? 'Active Construction' : 
           project.phase?.charAt(0).toUpperCase() + project.phase?.slice(1)}
        </Badge>

        {/* Days counter (only for construction phase) */}
        {project.phase === 'construction' && project.construction_started_at && (
          <span className="flex items-center gap-1">
            <IconCalendar className="h-4 w-4" />
            Day {daysSinceStart} of {estimatedDays}
          </span>
        )}

        {/* Task completion */}
        {stats && (
          <span>
            {stats.done}/{stats.total} tasks ({stats.completionRate}%)
          </span>
        )}

        {/* Ahead/Behind indicator */}
        {stats?.daysAheadBehind !== undefined && stats.daysAheadBehind !== 0 && (
          <Badge
            variant="outline"
            className={cn(
              stats.daysAheadBehind > 0 && 'border-green-500 text-green-600',
              stats.daysAheadBehind < 0 && 'border-red-500 text-red-600'
            )}
          >
            {stats.daysAheadBehind > 0
              ? `${stats.daysAheadBehind}d ahead`
              : `${Math.abs(stats.daysAheadBehind)}d behind`}
          </Badge>
        )}
      </div>
    </div>
  )
}
