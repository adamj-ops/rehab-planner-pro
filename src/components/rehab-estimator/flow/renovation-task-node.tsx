'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RenovationTaskData {
  label: string
  category: 'demo' | 'structural' | 'mechanical' | 'finish' | 'exterior'
  duration: number // in days
  cost: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  roi?: number
  description?: string
}

const categoryColors = {
  demo: 'from-red-500/20 to-red-600/20 border-red-500/50',
  structural: 'from-orange-500/20 to-orange-600/20 border-orange-500/50',
  mechanical: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
  finish: 'from-purple-500/20 to-purple-600/20 border-purple-500/50',
  exterior: 'from-green-500/20 to-green-600/20 border-green-500/50',
}

const priorityIndicators = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-500',
}

const statusIcons = {
  'not-started': AlertCircle,
  'in-progress': Clock,
  completed: CheckCircle2,
  blocked: AlertCircle,
}

export const RenovationTaskNode = memo(({ data, selected }: NodeProps<RenovationTaskData>) => {
  const StatusIcon = statusIcons[data.status]

  return (
    <div
      className={cn(
        'min-w-[280px] rounded-lg border bg-gradient-to-br backdrop-blur-sm',
        'transition-all duration-200',
        categoryColors[data.category],
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl scale-105',
        'hover:shadow-lg'
      )}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />

      {/* Header */}
      <div className="flex items-start justify-between p-3 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('w-2 h-2 rounded-full', priorityIndicators[data.priority])} />
            <h3 className="font-semibold text-sm text-foreground leading-tight">
              {data.label}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground capitalize">{data.category}</p>
        </div>
        <StatusIcon
          className={cn(
            'w-4 h-4 flex-shrink-0',
            data.status === 'completed' && 'text-green-500',
            data.status === 'in-progress' && 'text-blue-500',
            data.status === 'blocked' && 'text-red-500',
            data.status === 'not-started' && 'text-muted-foreground'
          )}
        />
      </div>

      {/* Stats */}
      <div className="px-3 pb-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{data.duration} days</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span>${data.cost.toLocaleString()}</span>
          </div>
        </div>

        {data.roi !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">ROI Impact</span>
            <span className={cn(
              'text-xs font-semibold',
              data.roi > 100 ? 'text-green-500' : 'text-yellow-500'
            )}>
              {data.roi}%
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  )
})

RenovationTaskNode.displayName = 'RenovationTaskNode'
