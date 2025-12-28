'use client'

import Link from 'next/link'
import { IconHome, IconDotsVertical, IconEdit, IconCopy, IconArchive, IconTrash } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RehabProject, ProjectStatus } from '@/types/database'

interface ProjectCardProps {
  project: RehabProject
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
}

// Status badge color mapping
const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

// Status display labels
const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
  archived: 'Archived',
}

// Strategy display labels
const strategyLabels: Record<string, string> = {
  flip: 'Flip',
  rental: 'Rental',
  brrrr: 'BRRRR',
  airbnb: 'Airbnb',
  wholetail: 'Wholetail',
}

export function ProjectCard({
  project,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const status = (project.status || 'draft') as ProjectStatus
  const address = [project.address_city, project.address_state]
    .filter(Boolean)
    .join(', ')

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow rounded-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-none">
            <IconHome className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`rounded-none ${statusColors[status]}`}>
              {statusLabels[status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                  <IconDotsVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none">
                <DropdownMenuItem
                  onClick={() => onEdit?.(project.id)}
                  className="rounded-none"
                >
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate?.(project.id)}
                  className="rounded-none"
                >
                  <IconCopy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onArchive?.(project.id)}
                  className="rounded-none"
                >
                  <IconArchive className="mr-2 h-4 w-4" />
                  {status === 'archived' ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(project.id)}
                  className="rounded-none text-destructive focus:text-destructive"
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardTitle className="mt-4 line-clamp-1">{project.project_name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {project.address_street || address || 'No address'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Budget</span>
            <p className="font-semibold">{formatCurrency(project.max_budget)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Strategy</span>
            <p className="font-semibold">
              {project.investment_strategy
                ? strategyLabels[project.investment_strategy] || project.investment_strategy
                : '-'}
            </p>
          </div>
        </div>
        {project.arv && (
          <div className="text-sm">
            <span className="text-muted-foreground">ARV</span>
            <p className="font-semibold">{formatCurrency(project.arv)}</p>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Updated {formatDate(project.updated_at)}</span>
        </div>
        <Button variant="outline" className="w-full rounded-none" asChild>
          <Link href={`/projects/${project.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
