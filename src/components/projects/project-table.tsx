'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconEdit, IconCopy, IconArchive, IconTrash, IconDotsVertical, IconArrowUp, IconArrowDown } from '@tabler/icons-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface ProjectTableProps {
  projects: RehabProject[]
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
}

type SortField = 'project_name' | 'status' | 'investment_strategy' | 'max_budget' | 'updated_at'
type SortDirection = 'asc' | 'desc'

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

export function ProjectTable({
  projects,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    let aValue: string | number | null = null
    let bValue: string | number | null = null

    switch (sortField) {
      case 'project_name':
        aValue = a.project_name?.toLowerCase() || ''
        bValue = b.project_name?.toLowerCase() || ''
        break
      case 'status':
        aValue = a.status || ''
        bValue = b.status || ''
        break
      case 'investment_strategy':
        aValue = a.investment_strategy || ''
        bValue = b.investment_strategy || ''
        break
      case 'max_budget':
        aValue = a.max_budget || 0
        bValue = b.max_budget || 0
        break
      case 'updated_at':
        aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0
        bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0
        break
    }

    if (aValue === null || bValue === null) return 0
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <IconArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <IconArrowDown className="ml-1 h-4 w-4 inline" />
    )
  }

  return (
    <div className="border rounded-none">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('project_name')}
            >
              Project Name
              <SortIcon field="project_name" />
            </TableHead>
            <TableHead>Address</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              Status
              <SortIcon field="status" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('investment_strategy')}
            >
              Strategy
              <SortIcon field="investment_strategy" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort('max_budget')}
            >
              Budget
              <SortIcon field="max_budget" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('updated_at')}
            >
              Updated
              <SortIcon field="updated_at" />
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.map((project) => {
            const status = (project.status || 'draft') as ProjectStatus
            const address = [project.address_street, project.address_city, project.address_state]
              .filter(Boolean)
              .join(', ')

            return (
              <TableRow key={project.id}>
                <TableCell>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium hover:underline"
                  >
                    {project.project_name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {address || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`rounded-none ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.investment_strategy
                    ? strategyLabels[project.investment_strategy] || project.investment_strategy
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(project.max_budget)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(project.updated_at)}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
