'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App route error:', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <IconAlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle>Page Error</CardTitle>
          <CardDescription>This page encountered an error. Please try again.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={reset} className="gap-2">
            <IconRefresh className="size-4" />
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
