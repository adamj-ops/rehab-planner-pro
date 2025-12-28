'use client'

import { IconLayoutGrid, IconList } from '@tabler/icons-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useProjectsStore, ViewMode } from '@/hooks/use-projects-store'

export function ViewToggle() {
  const viewMode = useProjectsStore((state) => state.viewMode)
  const setViewMode = useProjectsStore((state) => state.setViewMode)

  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => {
        if (value) setViewMode(value as ViewMode)
      }}
      className="rounded-none"
    >
      <ToggleGroupItem
        value="card"
        aria-label="Card view"
        className="rounded-none"
      >
        <IconLayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="table"
        aria-label="Table view"
        className="rounded-none"
      >
        <IconList className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
