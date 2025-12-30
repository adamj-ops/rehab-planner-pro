'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { NotebookLayout } from '@/components/notebook'
import type { NotebookTemplate } from '@/types/notebook'

function NotebookPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string
  const template = searchParams.get('template') as NotebookTemplate | null

  return <NotebookLayout projectId={projectId} initialTemplate={template} />
}

export default function NotebookPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <NotebookPageContent />
    </Suspense>
  )
}
