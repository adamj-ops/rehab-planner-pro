'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  IconLayoutDashboard,
  IconChecklist,
  IconPalette,
  IconCalendar,
  IconFiles,
} from '@tabler/icons-react'
import { RehabProject } from '@/types/database'
import { OverviewTab } from './tabs/overview-tab'

interface ProjectTabsProps {
  project: RehabProject
}

export function ProjectTabs({ project }: ProjectTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="rounded-none w-full justify-start border-b bg-transparent p-0">
        <TabsTrigger
          value="overview"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
        >
          <IconLayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="scope"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
        >
          <IconChecklist className="h-4 w-4" />
          Scope
        </TabsTrigger>
        <TabsTrigger
          value="design"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
        >
          <IconPalette className="h-4 w-4" />
          Design
        </TabsTrigger>
        <TabsTrigger
          value="timeline"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
        >
          <IconCalendar className="h-4 w-4" />
          Timeline
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
        >
          <IconFiles className="h-4 w-4" />
          Documents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab project={project} />
      </TabsContent>

      <TabsContent value="scope" className="mt-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconChecklist className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Scope of Work</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Manage your project scope items, costs, and priorities. Coming soon.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="design" className="mt-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconPalette className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Design Intelligence</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Colors, materials, and moodboards for your project. Coming soon.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconCalendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Visual timeline and scheduling for your renovation. Coming soon.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconFiles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Project Documents</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Contracts, photos, and other project files. Coming soon.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
