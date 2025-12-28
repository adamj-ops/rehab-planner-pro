'use client'

import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconEdit,
  IconCopy,
  IconArchive,
  IconTrash,
  IconDotsVertical,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RehabProject, ProjectStatus } from '@/types/database'

interface ProjectHeaderProps {
  project: RehabProject
  onEdit?: () => void
  onDuplicate?: () => void
  onArchive?: () => void
  onDelete?: () => void
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

export function ProjectHeader({
  project,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProjectHeaderProps) {
  const router = useRouter()
  const status = (project.status || 'draft') as ProjectStatus

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const address = [
    project.address_street,
    project.address_city,
    project.address_state,
    project.address_zip,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/projects')}
          className="rounded-none mt-1"
        >
          <IconArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to projects</span>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.project_name}
            </h1>
            <Badge variant="secondary" className={`rounded-none ${statusColors[status]}`}>
              {statusLabels[status]}
            </Badge>
          </div>
          {address && (
            <p className="text-muted-foreground mt-1">{address}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Last updated {formatDate(project.updated_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onEdit}
          className="rounded-none gap-2"
        >
          <IconEdit className="h-4 w-4" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-none">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none">
            <DropdownMenuItem onClick={onDuplicate} className="rounded-none">
              <IconCopy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive} className="rounded-none">
              <IconArchive className="mr-2 h-4 w-4" />
              {status === 'archived' ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="rounded-none text-destructive focus:text-destructive"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
