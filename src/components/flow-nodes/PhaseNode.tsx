'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Calendar,
  TrendingUp
} from 'lucide-react'
import { PhaseNodeData } from '@/lib/react-flow/types'
import { cn } from '@/lib/utils'

export const PhaseNode = memo(({ data, selected }: NodeProps<PhaseNodeData>) => {
  const { phase, isExpanded, onToggle } = data

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary"
      />
      
      <Card 
        className={cn(
          "w-80 transition-all",
          selected && "ring-2 ring-primary shadow-lg",
          "bg-accent/5"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {phase.name}
            </CardTitle>
            
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onToggle}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Timeline */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Day {phase.startDay} - {phase.endDay}
            </span>
            <Badge variant="secondary" className="ml-auto">
              {phase.endDay - phase.startDay + 1} days
            </Badge>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              ${phase.cost.toLocaleString()}
            </span>
          </div>

          {/* Task Count */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {phase.tasks.length} tasks
            </span>
          </div>

          {/* Critical Path Indicator */}
          {phase.criticalPath && (
            <Badge variant="destructive" className="w-full justify-center">
              Critical Path
            </Badge>
          )}

          {/* Warnings */}
          {phase.warnings && phase.warnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {phase.warnings.map((warning, idx) => (
                <p key={idx} className="text-xs text-orange-600 dark:text-orange-400">
                  ⚠️ {warning}
                </p>
              ))}
            </div>
          )}

          {/* Expanded Task List */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {phase.tasks.map((task, idx) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between text-xs p-2 rounded bg-background"
                >
                  <span className="truncate flex-1">{task.name}</span>
                  <Badge variant="outline" className="text-xs ml-2">
                    {task.duration}d
                  </Badge>
                </div>
              ))}
            </div>
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

PhaseNode.displayName = 'PhaseNode'

