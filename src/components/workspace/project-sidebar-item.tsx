"use client"

import * as React from "react"
import { format } from "date-fns"
import { IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import {
  type WorkspaceProject,
  getProjectDisplayName,
  getProjectStatusColor,
  getTaskProgressPercent,
  getBudgetUsagePercent,
  getDaysSinceStart,
} from "@/hooks/use-workspace-store"

interface ProjectSidebarItemProps {
  project: WorkspaceProject
  isActive?: boolean
  isPlanning?: boolean
  isCompleted?: boolean
  onClick: () => void
}

export function ProjectSidebarItem({
  project,
  isActive,
  isPlanning,
  isCompleted,
  onClick,
}: ProjectSidebarItemProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  
  const displayName = getProjectDisplayName(project)
  const statusColor = getProjectStatusColor(project)
  const taskProgress = getTaskProgressPercent(project)
  const budgetUsage = getBudgetUsagePercent(project)
  const daysSinceStart = getDaysSinceStart(project)
  
  // Status indicator styles
  const statusStyles = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        isActive={isActive}
        className={cn(
          "w-full justify-start px-2 py-2 h-auto min-h-[40px]",
          isActive && "bg-accent"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-2 w-full">
          {/* Project Emoji/Icon */}
          <span className="text-base shrink-0 mt-0.5">
            {isCompleted ? (
              <IconCheck className="h-4 w-4 text-green-500" />
            ) : (
              project.emoji || "🏠"
            )}
          </span>

          <div className="flex-1 min-w-0">
            {/* Project Name */}
            <p className="text-sm font-medium truncate">{displayName}</p>

            {/* Status Indicators */}
            {!isPlanning && !isCompleted && (
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    statusStyles[statusColor]
                  )}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {project.tasks_completed}/{project.tasks_total} tasks
                </span>
              </div>
            )}

            {isPlanning && (
              <p className="text-xs text-muted-foreground mt-1">
                Planning phase
              </p>
            )}

            {isCompleted && project.completed_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Completed {format(new Date(project.completed_at), "MMM yyyy")}
              </p>
            )}

            {/* Expanded view on hover (for active/construction projects) */}
            {isHovered && !isPlanning && !isCompleted && (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-top-1 duration-150">
                {budgetUsage !== null && (
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>Budget: {budgetUsage}% used</span>
                  </div>
                )}
                {daysSinceStart !== null && (
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>Day {daysSinceStart}</span>
                    {project.days_ahead_behind !== 0 && (
                      <span
                        className={cn(
                          project.days_ahead_behind > 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        ({project.days_ahead_behind > 0 ? "+" : ""}
                        {project.days_ahead_behind}d)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
