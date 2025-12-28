'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { projectService } from '@/lib/supabase/database'
import { useProjectsStore } from '@/hooks/use-projects-store'
import { ProjectHeader } from '@/components/projects/project-header'
import { ProjectTabs } from '@/components/projects/project-tabs'
import { DeleteDialog } from '@/components/projects/delete-dialog'
import { RehabProject } from '@/types/database'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<RehabProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const softDeleteProject = useProjectsStore((state) => state.softDeleteProject)
  const duplicateProject = useProjectsStore((state) => state.duplicateProject)
  const archiveProject = useProjectsStore((state) => state.archiveProject)
  const unarchiveProject = useProjectsStore((state) => state.unarchiveProject)

  useEffect(() => {
    async function loadProject() {
      setLoading(true)
      setError(null)

      try {
        const data = await projectService.getById(projectId)
        if (!data) {
          setError('Project not found')
        } else {
          setProject(data as unknown as RehabProject)
        }
      } catch (err) {
        console.error('Error loading project:', err)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const handleEdit = () => {
    router.push(`/wizard/step-1?edit=${projectId}`)
  }

  const handleDuplicate = async () => {
    const newProject = await duplicateProject(projectId)
    if (newProject) {
      toast.success('Project duplicated', {
        description: `"${newProject.project_name}" has been created.`,
      })
      router.push(`/projects/${newProject.id}`)
    } else {
      toast.error('Failed to duplicate project')
    }
  }

  const handleArchive = async () => {
    if (!project) return

    const isArchived = project.status === 'archived'

    if (isArchived) {
      const success = await unarchiveProject(projectId)
      if (success) {
        setProject({ ...project, status: 'draft' })
        toast.success('Project restored', {
          description: `"${project.project_name}" has been unarchived.`,
        })
      } else {
        toast.error('Failed to unarchive project')
      }
    } else {
      const success = await archiveProject(projectId)
      if (success) {
        setProject({ ...project, status: 'archived' })
        toast.success('Project archived', {
          description: `"${project.project_name}" has been archived.`,
        })
      } else {
        toast.error('Failed to archive project')
      }
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!project) return

    const success = await softDeleteProject(projectId)
    if (success) {
      toast.success('Project deleted', {
        description: `"${project.project_name}" has been moved to trash.`,
      })
      router.push('/projects')
    } else {
      toast.error('Failed to delete project')
    }
  }

  if (loading) {
    return <ProjectDetailSkeleton />
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The project you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/projects')}
          className="text-primary hover:underline"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onArchive={handleArchive}
        onDelete={handleDeleteClick}
      />

      <ProjectTabs project={project} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={project.project_name}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-none" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64 rounded-none" />
              <Skeleton className="h-6 w-20 rounded-none" />
            </div>
            <Skeleton className="h-4 w-48 rounded-none" />
            <Skeleton className="h-3 w-32 rounded-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-none" />
          <Skeleton className="h-10 w-10 rounded-none" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-none" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded-none" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="h-4 w-3/4 rounded-none" />
              <Skeleton className="h-4 w-1/2 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
