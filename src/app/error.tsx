'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <IconAlertTriangle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full gap-2">
              <IconRefresh className="size-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link href="/dashboard">
                <IconHome className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 max-h-32 overflow-auto rounded bg-muted p-3 font-mono text-xs">
              {error.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
