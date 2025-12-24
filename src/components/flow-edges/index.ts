export { DependencyEdge } from './DependencyEdge'
export { TimelineEdge } from './TimelineEdge'

// Edge type mapping for React Flow
import { DependencyEdge } from './DependencyEdge'
import { TimelineEdge } from './TimelineEdge'

export const edgeTypes = {
  dependency: DependencyEdge,
  timeline: TimelineEdge,
}

