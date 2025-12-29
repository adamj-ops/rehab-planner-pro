import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconHome, IconSearch } from '@tabler/icons-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl font-bold text-muted-foreground/50">404</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full gap-2">
              <Link href="/dashboard">
                <IconHome className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link href="/projects">
                <IconSearch className="size-4" />
                Browse Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
