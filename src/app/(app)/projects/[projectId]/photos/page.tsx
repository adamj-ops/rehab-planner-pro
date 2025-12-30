'use client'

import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconUpload, IconPhoto, IconGrid3x3 } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/stores/workspace-store'

export default function ProjectPhotosPage() {
  const { project, isLoading } = useProject()

  if (isLoading || !project) {
    return <PhotosSkeleton />
  }

  const displayName = getProjectDisplayName(project)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-muted-foreground">{displayName}</p>
        </div>
        <Button className="gap-2">
          <IconUpload className="h-4 w-4" />
          Upload Photos
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="before">Before</TabsTrigger>
          <TabsTrigger value="during">During</TabsTrigger>
          <TabsTrigger value="after">After</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <PhotoGrid />
        </TabsContent>
        <TabsContent value="before" className="mt-4">
          <PhotoGrid category="before" />
        </TabsContent>
        <TabsContent value="during" className="mt-4">
          <PhotoGrid category="during" />
        </TabsContent>
        <TabsContent value="after" className="mt-4">
          <PhotoGrid category="after" />
        </TabsContent>
        <TabsContent value="issues" className="mt-4">
          <PhotoGrid category="issues" />
        </TabsContent>
      </Tabs>

      {/* Coming Soon Notice */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <h3 className="font-semibold mb-2">Photo Documentation Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Upload, tag, and organize project photos with room assignments and timeline view.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function PhotoGrid({ category }: { category?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
      <IconPhoto className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">No photos yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {category
          ? `Upload ${category} photos to document the project`
          : 'Upload photos to start documenting your project'}
      </p>
      <Button variant="outline" className="gap-2">
        <IconUpload className="h-4 w-4" />
        Upload Photos
      </Button>
    </div>
  )
}

function PhotosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
