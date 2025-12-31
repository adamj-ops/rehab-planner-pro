'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { IconLayoutKanban, IconTable } from '@tabler/icons-react'

export type TaskViewMode = 'kanban' | 'table'

interface TaskViewToggleProps {
  value: TaskViewMode
  onChange: (value: TaskViewMode) => void
}

export function TaskViewToggle({ value, onChange }: TaskViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(newValue) => {
        if (newValue) onChange(newValue as TaskViewMode)
      }}
      className="bg-muted rounded-lg p-1"
    >
      <ToggleGroupItem
        value="kanban"
        aria-label="Kanban view"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3"
      >
        <IconLayoutKanban className="h-4 w-4 mr-2" />
        Board
      </ToggleGroupItem>
      <ToggleGroupItem
        value="table"
        aria-label="Table view"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3"
      >
        <IconTable className="h-4 w-4 mr-2" />
        Table
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
