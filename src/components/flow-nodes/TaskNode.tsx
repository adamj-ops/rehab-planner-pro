'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  DollarSign, 
  User, 
  Edit, 
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { TaskNodeData } from '@/lib/react-flow/types'
import { cn } from '@/lib/utils'

export const TaskNode = memo(({ data, selected }: NodeProps<TaskNodeData>) => {
  const { task, phase, contractor, status, onEdit, onDelete } = data

  const priorityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  }

  const statusIcons = {
    pending: Circle,
    'in-progress': Clock,
    completed: CheckCircle2,
    blocked: AlertCircle
  }

  const statusColors = {
    pending: 'text-muted-foreground',
    'in-progress': 'text-blue-500',
    completed: 'text-green-500',
    blocked: 'text-red-500'
  }

  const StatusIcon = statusIcons[status]

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary"
      />
      
      <Card 
        className={cn(
          "w-64 transition-all",
          selected && "ring-2 ring-primary shadow-lg"
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {task.name}
              </h4>
              <Badge variant="outline" className="mt-1 text-xs">
                Phase {phase}
              </Badge>
            </div>
            
            <StatusIcon className={cn("w-4 h-4 flex-shrink-0", statusColors[status])} />
          </div>

          {/* Priority Indicator */}
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                "w-2 h-2 rounded-full", 
                priorityColors[task.priority]
              )} 
            />
            <span className="text-xs text-muted-foreground capitalize">
              {task.priority} priority
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>{task.duration} days</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span>${task.cost.toLocaleString()}</span>
            </div>
          </div>

          {/* Contractor */}
          {contractor && (
            <div className="flex items-center gap-1 text-xs">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="truncate">{contractor}</span>
            </div>
          )}

          {/* Progress (if in-progress) */}
          {status === 'in-progress' && (
            <Progress value={50} className="h-1" />
          )}

          {/* Actions */}
          <div className="flex gap-1 pt-2 border-t">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 flex-1"
                onClick={() => onEdit(task.id)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary"
      />
    </div>
  )
})

TaskNode.displayName = 'TaskNode'

