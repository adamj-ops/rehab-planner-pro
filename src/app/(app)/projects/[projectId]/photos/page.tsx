'use client'

import { useState } from 'react'
import { useProject } from '../layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconUpload } from '@tabler/icons-react'
import { getProjectDisplayName } from '@/hooks/use-workspace-store'
import { PhotoGallery } from '@/components/photos/photo-gallery'
import { PhotoUploadDialog } from '@/components/photos/photo-upload-dialog'
import { useProjectPhotos, type PhotoFilters } from '@/hooks/use-project-photos'

export default function ProjectPhotosPage() {
  const { project, isLoading: projectLoading } = useProject()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  // Determine filter based on active tab
  const filters: PhotoFilters | undefined = 
    activeTab === 'all' ? undefined : { category: activeTab as PhotoFilters['category'] }
  
  const { data: photos, isLoading: photosLoading } = useProjectPhotos(
    project?.id || '',
    filters
  )

  if (projectLoading || !project) {
    return <PhotosSkeleton />
  }

  const displayName = getProjectDisplayName(project)
  const isLoading = photosLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-muted-foreground">{displayName}</p>
        </div>
        <Button className="gap-2" onClick={() => setUploadOpen(true)}>
          <IconUpload className="h-4 w-4" />
          Upload Photos
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="before">Before</TabsTrigger>
          <TabsTrigger value="during">During</TabsTrigger>
          <TabsTrigger value="after">After</TabsTrigger>
          <TabsTrigger value="issue">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <PhotoGallery
            photos={photos || []}
            isLoading={isLoading}
            emptyMessage={
              activeTab === 'all'
                ? 'No photos yet'
                : `No ${activeTab} photos yet`
            }
            onUploadClick={() => setUploadOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <PhotoUploadDialog
        projectId={project.id}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultCategory={
          activeTab === 'all' || activeTab === 'issue' 
            ? 'during' 
            : (activeTab as 'before' | 'during' | 'after' | 'planning')
        }
      />
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
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}
