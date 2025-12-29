'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useProjectsStore,
  useProjects,
  useProjectsLoading,
  useViewMode,
} from '@/hooks/use-projects-store'
import { useRehabStore } from '@/hooks/use-rehab-store'
import { ViewToggle } from '@/components/projects/view-toggle'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectTable } from '@/components/projects/project-table'
import { FilterBar } from '@/components/projects/filter-bar'
import { SearchInput } from '@/components/projects/search-input'
import { EmptyStates } from '@/components/projects/empty-states'
import { DeleteDialog } from '@/components/projects/delete-dialog'
import { RehabProject } from '@/types/database'

function ProjectsPageContent() {
  const router = useRouter()
  const projects = useProjects()
  const loading = useProjectsLoading()
  const viewMode = useViewMode()

  const fetchProjects = useProjectsStore((state) => state.fetchProjects)
  const softDeleteProject = useProjectsStore((state) => state.softDeleteProject)
  const duplicateProject = useProjectsStore((state) => state.duplicateProject)
  const archiveProject = useProjectsStore((state) => state.archiveProject)
  const unarchiveProject = useProjectsStore((state) => state.unarchiveProject)
  const resetProject = useRehabStore((state) => state.resetProject)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<RehabProject | null>(null)

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleNewProject = () => {
    resetProject()
    router.push('/wizard/step-1')
  }

  const handleEdit = (id: string) => {
    router.push(`/wizard/step-1?edit=${id}`)
  }

  const handleDuplicate = async (id: string) => {
    const newProject = await duplicateProject(id)
    if (newProject) {
      toast.success('Project duplicated', {
        description: `"${newProject.project_name}" has been created.`,
      })
    } else {
      toast.error('Failed to duplicate project')
    }
  }

  const handleArchive = async (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (!project) return

    const isArchived = project.status === 'archived'

    if (isArchived) {
      const success = await unarchiveProject(id)
      if (success) {
        toast.success('Project restored', {
          description: `"${project.project_name}" has been unarchived.`,
        })
      } else {
        toast.error('Failed to unarchive project')
      }
    } else {
      const success = await archiveProject(id)
      if (success) {
        toast.success('Project archived', {
          description: `"${project.project_name}" has been archived.`,
        })
      } else {
        toast.error('Failed to archive project')
      }
    }
  }

  const handleDeleteClick = (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (project) {
      setProjectToDelete(project)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return

    const success = await softDeleteProject(projectToDelete.id)
    if (success) {
      toast.success('Project deleted', {
        description: `"${projectToDelete.project_name}" has been moved to trash.`,
      })
    } else {
      toast.error('Failed to delete project')
    }
    setProjectToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage all your fix &amp; flip projects
          </p>
        </div>
        <Button onClick={handleNewProject} className="rounded-none gap-2">
          <IconPlus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search, Filters, and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <SearchInput />
        <div className="flex items-center gap-4 flex-wrap">
          <FilterBar />
          <ViewToggle />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <ProjectsLoadingSkeleton viewMode={viewMode} />
      ) : projects.length === 0 ? (
        <EmptyStates />
      ) : viewMode === 'card' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <ProjectTable
          projects={projects}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={projectToDelete?.project_name || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

function ProjectsLoadingSkeleton({ viewMode }: { viewMode: 'card' | 'table' }) {
  if (viewMode === 'card') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-none" />
              <Skeleton className="h-6 w-20 rounded-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 rounded-none" />
              <Skeleton className="h-4 w-1/2 rounded-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12 rounded-none" />
                <Skeleton className="h-5 w-20 rounded-none" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12 rounded-none" />
                <Skeleton className="h-5 w-16 rounded-none" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border rounded-none">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-5 w-[200px] rounded-none" />
            <Skeleton className="h-5 w-[150px] rounded-none" />
            <Skeleton className="h-6 w-[80px] rounded-none" />
            <Skeleton className="h-5 w-[60px] rounded-none" />
            <Skeleton className="h-5 w-[80px] rounded-none" />
            <Skeleton className="h-5 w-[100px] rounded-none" />
            <Skeleton className="h-8 w-8 rounded-none" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsLoadingSkeleton viewMode="card" />}>
      <ProjectsPageContent />
    </Suspense>
  )
}
