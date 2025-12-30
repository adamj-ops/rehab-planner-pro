'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  IconCamera,
  IconClipboardList,
  IconPlus,
  IconReceipt,
} from '@tabler/icons-react'

interface QuickActionsCardProps {
  onUploadPhotos: () => void
  onDailyReport: () => void
  onAddTask: () => void
  onLogExpense?: () => void
}

export function QuickActionsCard({
  onUploadPhotos,
  onDailyReport,
  onAddTask,
  onLogExpense,
}: QuickActionsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={onUploadPhotos}
          >
            <IconCamera className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium">Upload Photos</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={onDailyReport}
          >
            <IconClipboardList className="h-5 w-5 text-green-500" />
            <span className="text-xs font-medium">Daily Report</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={onAddTask}
          >
            <IconPlus className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-medium">Add Task</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={onLogExpense}
            disabled={!onLogExpense}
          >
            <IconReceipt className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-medium">Log Expense</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
