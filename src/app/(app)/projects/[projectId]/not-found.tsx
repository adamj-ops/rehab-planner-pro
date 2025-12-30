import Link from 'next/link'
import { IconArrowLeft, IconHome, IconSearch } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="space-y-4">
        <div className="text-8xl font-bold text-muted-foreground/20">404</div>
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The project you're looking for doesn't exist or has been deleted.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button asChild variant="default">
          <Link href="/dashboard">
            <IconHome className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">
            <IconSearch className="mr-2 h-4 w-4" />
            Browse Projects
          </Link>
        </Button>
      </div>
    </div>
  )
}
