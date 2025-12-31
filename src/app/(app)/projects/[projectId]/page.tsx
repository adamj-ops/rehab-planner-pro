'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Default project page - redirects to the appropriate dashboard based on project phase
 * This page handles the legacy /projects/[id] route pattern
 */
export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  useEffect(() => {
    // Redirect to the project dashboard
    // The dashboard layout will handle determining the correct view based on phase
    router.replace(`/projects/${projectId}/dashboard`)
  }, [projectId, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-muted-foreground">Loading project...</span>
      </div>
    </div>
  )
}
