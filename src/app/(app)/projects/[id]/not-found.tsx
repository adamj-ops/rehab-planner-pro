import Link from 'next/link'
import { IconFolderOff } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 bg-muted flex items-center justify-center mb-6 rounded-none">
        <IconFolderOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        The project you&apos;re looking for doesn&apos;t exist or has been deleted.
      </p>
      <Button asChild className="rounded-none">
        <Link href="/projects">Back to Projects</Link>
      </Button>
    </div>
  )
}
