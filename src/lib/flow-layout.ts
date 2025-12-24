import dagre from 'dagre'
import { Node, Edge } from '@xyflow/react'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL'
  nodeWidth?: number
  nodeHeight?: number
  rankSep?: number
  nodeSep?: number
}

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
) {
  const {
    direction = 'TB',
    nodeWidth = 280,
    nodeHeight = 140,
    rankSep = 80,
    nodeSep = 60,
  } = options

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width || nodeWidth,
      height: node.height || nodeHeight,
    })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// Calculate critical path (longest path through the graph)
export function calculateCriticalPath(
  nodes: Node[],
  edges: Edge[]
): string[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const adjacency = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  // Build adjacency list and in-degree map
  nodes.forEach(node => {
    adjacency.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  edges.forEach(edge => {
    adjacency.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  // Find start nodes (no dependencies)
  const queue: Array<{ id: string; duration: number; path: string[] }> = []
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      const duration = (node.data as any).duration || 0
      queue.push({ id: node.id, duration, path: [node.id] })
    }
  })

  let longestPath: string[] = []
  let maxDuration = 0

  // Process nodes in topological order
  while (queue.length > 0) {
    const current = queue.shift()!

    if (current.duration > maxDuration) {
      maxDuration = current.duration
      longestPath = current.path
    }

    const neighbors = adjacency.get(current.id) || []

    neighbors.forEach(neighborId => {
      const newInDegree = (inDegree.get(neighborId) || 1) - 1
      inDegree.set(neighborId, newInDegree)

      if (newInDegree === 0) {
        const neighbor = nodeMap.get(neighborId)
        const neighborDuration = (neighbor?.data as any)?.duration || 0
        queue.push({
          id: neighborId,
          duration: current.duration + neighborDuration,
          path: [...current.path, neighborId]
        })
      }
    })
  }

  return longestPath
}

// Calculate total project duration considering parallel work
export function calculateProjectDuration(
  nodes: Node[],
  edges: Edge[]
): number {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const adjacency = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  const earliestStart = new Map<string, number>()

  // Build adjacency list
  nodes.forEach(node => {
    adjacency.set(node.id, [])
    inDegree.set(node.id, 0)
    earliestStart.set(node.id, 0)
  })

  edges.forEach(edge => {
    adjacency.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  // Topological sort with duration calculation
  const queue: string[] = []
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id)
    }
  })

  let processed = 0
  let maxFinishTime = 0

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const node = nodeMap.get(nodeId)
    const duration = (node?.data as any)?.duration || 0
    const start = earliestStart.get(nodeId) || 0
    const finish = start + duration

    maxFinishTime = Math.max(maxFinishTime, finish)
    processed++

    const neighbors = adjacency.get(nodeId) || []
    neighbors.forEach(neighborId => {
      // Update earliest start time for dependent task
      earliestStart.set(
        neighborId,
        Math.max(earliestStart.get(neighborId) || 0, finish)
      )

      const newInDegree = (inDegree.get(neighborId) || 1) - 1
      inDegree.set(neighborId, newInDegree)

      if (newInDegree === 0) {
        queue.push(neighborId)
      }
    })
  }

  return maxFinishTime
}
