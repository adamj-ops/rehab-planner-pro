'use client'

import { memo } from 'react'
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  EdgeProps, 
  getStraightPath
} from '@xyflow/react'
import { Badge } from '@/components/ui/badge'
import { TimelineEdgeData } from '@/lib/react-flow/types'
import { cn } from '@/lib/utils'

export const TimelineEdge = memo(({ 
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
}: EdgeProps<TimelineEdgeData>) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const { duration, hasConflict } = data || { duration: 0, hasConflict: false }

  // Style based on conflict
  const edgeStyle = {
    ...style,
    stroke: hasConflict ? '#f59e0b' : (style.stroke || '#b1b1b7'),
    strokeWidth: 2,
    strokeDasharray: '5,5',
    ...(hasConflict && {
      filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.5))',
    })
  }

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      
      {duration > 0 && (
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
              variant={hasConflict ? "destructive" : "outline"}
              className={cn(
                "text-xs px-1.5 py-0.5",
                hasConflict && "animate-pulse"
              )}
            >
              {duration} day{duration !== 1 ? 's' : ''}
              {hasConflict && ' ⚠️'}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

TimelineEdge.displayName = 'TimelineEdge'

