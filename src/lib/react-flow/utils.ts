import { Node, Edge, Position } from '@xyflow/react'
import { CustomNode, CustomEdge, LayoutConfig } from './types'

/**
 * Auto-layout nodes using a simple hierarchical algorithm
 * For production, consider integrating dagre or elkjs
 */
export function autoLayoutNodes(
  nodes: CustomNode[],
  edges: CustomEdge[],
  config: LayoutConfig = {
    direction: 'horizontal',
    nodeSpacing: 200,
    rankSpacing: 150,
    algorithm: 'manual'
  }
): CustomNode[] {
  // Build adjacency list for dependency graph
  const adjacencyList = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  
  nodes.forEach(node => {
    adjacencyList.set(node.id, [])
    inDegree.set(node.id, 0)
  })
  
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })
  
  // Topological sort to determine levels
  const levels: string[][] = []
  const queue: string[] = []
  const nodeLevel = new Map<string, number>()
  
  // Find all nodes with no dependencies
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId)
      nodeLevel.set(nodeId, 0)
    }
  })
  
  while (queue.length > 0) {
    const levelSize = queue.length
    const currentLevel: string[] = []
    
    for (let i = 0; i < levelSize; i++) {
      const nodeId = queue.shift()!
      currentLevel.push(nodeId)
      
      const neighbors = adjacencyList.get(nodeId) || []
      neighbors.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        
        if (newDegree === 0) {
          queue.push(neighbor)
          nodeLevel.set(neighbor, levels.length + 1)
        }
      })
    }
    
    levels.push(currentLevel)
  }
  
  // Position nodes based on levels
  return nodes.map(node => {
    const level = nodeLevel.get(node.id) || 0
    const levelNodes = levels[level] || []
    const indexInLevel = levelNodes.indexOf(node.id)
    
    const x = config.direction === 'horizontal'
      ? level * config.rankSpacing
      : indexInLevel * config.nodeSpacing
    
    const y = config.direction === 'horizontal'
      ? indexInLevel * config.nodeSpacing
      : level * config.rankSpacing
    
    return {
      ...node,
      position: { x, y },
      sourcePosition: config.direction === 'horizontal' ? Position.Right : Position.Bottom,
      targetPosition: config.direction === 'horizontal' ? Position.Left : Position.Top,
    }
  })
}

/**
 * Calculate critical path through the task network
 */
export function calculateCriticalPath(
  nodes: CustomNode[],
  edges: CustomEdge[]
): Set<string> {
  const criticalPath = new Set<string>()
  
  // Build task duration map
  const durations = new Map<string, number>()
  nodes.forEach(node => {
    if (node.type === 'task' && node.data) {
      durations.set(node.id, (node.data as any).task?.duration || 0)
    }
  })
  
  // Calculate earliest start times (forward pass)
  const earliestStart = new Map<string, number>()
  const adjacencyList = new Map<string, string[]>()
  const reverseAdjacency = new Map<string, string[]>()
  
  nodes.forEach(node => {
    earliestStart.set(node.id, 0)
    adjacencyList.set(node.id, [])
    reverseAdjacency.set(node.id, [])
  })
  
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.push(edge.target)
    reverseAdjacency.get(edge.target)?.push(edge.source)
  })
  
  // Topological sort and calculate earliest start
  const queue = nodes.filter(node => 
    reverseAdjacency.get(node.id)?.length === 0
  ).map(n => n.id)
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const duration = durations.get(nodeId) || 0
    const startTime = earliestStart.get(nodeId) || 0
    const finishTime = startTime + duration
    
    const successors = adjacencyList.get(nodeId) || []
    successors.forEach(successor => {
      const currentEarliest = earliestStart.get(successor) || 0
      earliestStart.set(successor, Math.max(currentEarliest, finishTime))
      queue.push(successor)
    })
  }
  
  // Calculate latest start times (backward pass)
  const latestStart = new Map<string, number>()
  const endNodes = nodes.filter(node => 
    adjacencyList.get(node.id)?.length === 0
  )
  
  // Initialize end nodes
  endNodes.forEach(node => {
    const earliest = earliestStart.get(node.id) || 0
    latestStart.set(node.id, earliest)
  })
  
  // Backward pass
  const reverseQueue = [...endNodes.map(n => n.id)]
  const visited = new Set<string>()
  
  while (reverseQueue.length > 0) {
    const nodeId = reverseQueue.shift()!
    if (visited.has(nodeId)) continue
    visited.add(nodeId)
    
    const predecessors = reverseAdjacency.get(nodeId) || []
    const nodeLatest = latestStart.get(nodeId) || 0
    
    predecessors.forEach(pred => {
      const duration = durations.get(pred) || 0
      const predLatest = latestStart.get(pred)
      const newLatest = nodeLatest - duration
      
      if (predLatest === undefined || newLatest < predLatest) {
        latestStart.set(pred, newLatest)
      }
      
      reverseQueue.push(pred)
    })
  }
  
  // Identify critical path (slack = 0)
  nodes.forEach(node => {
    const earliest = earliestStart.get(node.id) || 0
    const latest = latestStart.get(node.id) || 0
    const slack = latest - earliest
    
    if (Math.abs(slack) < 0.01) {
      criticalPath.add(node.id)
    }
  })
  
  return criticalPath
}

/**
 * Detect scheduling conflicts between tasks
 */
export function detectConflicts(
  nodes: CustomNode[],
  edges: CustomEdge[]
): Array<{ nodeId: string; conflictWith: string; reason: string }> {
  const conflicts: Array<{ nodeId: string; conflictWith: string; reason: string }> = []
  
  // Group tasks by contractor
  const contractorTasks = new Map<string, Array<{ nodeId: string; start: number; end: number }>>()
  
  nodes.forEach(node => {
    if (node.type === 'task' && node.data) {
      const taskData = node.data as any
      const contractor = taskData.contractor || 'unassigned'
      const start = taskData.task?.startDay || 0
      const end = start + (taskData.task?.duration || 0)
      
      if (!contractorTasks.has(contractor)) {
        contractorTasks.set(contractor, [])
      }
      
      contractorTasks.get(contractor)?.push({ nodeId: node.id, start, end })
    }
  })
  
  // Check for overlaps within contractor assignments
  contractorTasks.forEach((tasks, contractor) => {
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i]
        const task2 = tasks[j]
        
        // Check if tasks overlap
        if (task1.start < task2.end && task2.start < task1.end) {
          conflicts.push({
            nodeId: task1.nodeId,
            conflictWith: task2.nodeId,
            reason: `Contractor ${contractor} assigned to overlapping tasks`
          })
        }
      }
    }
  })
  
  return conflicts
}

/**
 * Generate node ID
 */
export function generateNodeId(prefix: string = 'node'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate edge ID
 */
export function generateEdgeId(source: string, target: string): string {
  return `edge-${source}-${target}`
}

/**
 * Fit view helper
 */
export function getFitViewOptions() {
  return {
    padding: 0.2,
    minZoom: 0.5,
    maxZoom: 1.5,
  }
}

