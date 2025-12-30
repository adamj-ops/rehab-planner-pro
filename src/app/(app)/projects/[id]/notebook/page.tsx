'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotebookLayout } from '@/components/notebook'

export default function NotebookPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Project Notebook</h1>
          <p className="text-muted-foreground text-sm">
            Document your project journey and capture insights
          </p>
        </div>
      </div>

      {/* Notebook */}
      <NotebookLayout projectId={projectId} />
    </div>
  )
}
