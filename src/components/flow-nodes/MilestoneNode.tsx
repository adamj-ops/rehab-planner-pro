'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Flag, 
  CheckCircle2, 
  Circle,
  DollarSign,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { MilestoneNodeData } from '@/lib/react-flow/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export const MilestoneNode = memo(({ data, selected }: NodeProps<MilestoneNodeData>) => {
  const { title, date, type, description, completed } = data

  const typeConfig = {
    inspection: {
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: 'Inspection'
    },
    payment: {
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Payment'
    },
    decision: {
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      label: 'Decision Point'
    },
    completion: {
      icon: Flag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      label: 'Completion'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary"
      />
      
      <Card 
        className={cn(
          "w-56 transition-all",
          selected && "ring-2 ring-primary shadow-lg",
          config.bgColor
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with Icon */}
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              config.bgColor
            )}>
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {title}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {config.label}
              </Badge>
            </div>

            {completed && (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            {!completed && (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format(date, 'MMM dd, yyyy')}</span>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
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

MilestoneNode.displayName = 'MilestoneNode'

