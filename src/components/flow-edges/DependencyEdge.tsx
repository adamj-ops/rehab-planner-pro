'use client'

import { memo } from 'react'
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  EdgeProps, 
  getBezierPath 
} from '@xyflow/react'
import { Badge } from '@/components/ui/badge'
import { DependencyEdgeData } from '@/lib/react-flow/types'
import { cn } from '@/lib/utils'

export const DependencyEdge = memo(({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd
}: EdgeProps<DependencyEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const { type = 'finish-to-start', lagDays, isCriticalPath } = data || {}

  // Style based on critical path
  const edgeStyle = {
    ...style,
    stroke: isCriticalPath ? '#ef4444' : (style.stroke || '#b1b1b7'),
    strokeWidth: isCriticalPath ? 3 : 2,
    ...(isCriticalPath && {
      filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))',
    })
  }

  // Type abbreviations
  const typeLabels = {
    'finish-to-start': 'FS',
    'start-to-start': 'SS',
    'finish-to-finish': 'FF'
  }

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd}
        style={edgeStyle}
        className={cn(isCriticalPath && "animate-pulse")}
      />
      
      {(lagDays || type !== 'finish-to-start') && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Badge 
              variant={isCriticalPath ? "destructive" : "secondary"}
              className="text-xs px-1.5 py-0.5"
            >
              {typeLabels[type]}
              {lagDays && lagDays !== 0 && ` ${lagDays > 0 ? '+' : ''}${lagDays}d`}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

DependencyEdge.displayName = 'DependencyEdge'

