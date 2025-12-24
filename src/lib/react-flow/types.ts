import { Node, Edge } from '@xyflow/react'
import { ScopeItem, ActionTask, ActionPlanPhase } from '@/types/rehab'

// Custom Node Data Types
export interface TaskNodeData {
  task: ActionTask
  phase: number
  contractor?: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
}

export interface PhaseNodeData {
  phase: ActionPlanPhase
  isExpanded: boolean
  onToggle?: () => void
}

export interface MilestoneNodeData {
  title: string
  date: Date
  type: 'inspection' | 'payment' | 'decision' | 'completion'
  description?: string
  completed: boolean
}

export interface ContractorNodeData {
  name: string
  company: string
  specialty: string
  tasksAssigned: string[]
  hourlyRate?: number
  availability: 'available' | 'busy' | 'unavailable'
  contact?: {
    phone: string
    email: string
  }
}

// Custom Node Types
export type TaskNode = Node<TaskNodeData, 'task'>
export type PhaseNode = Node<PhaseNodeData, 'phase'>
export type MilestoneNode = Node<MilestoneNodeData, 'milestone'>
export type ContractorNode = Node<ContractorNodeData, 'contractor'>

export type CustomNode = TaskNode | PhaseNode | MilestoneNode | ContractorNode

// Custom Edge Data Types
export interface DependencyEdgeData {
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish'
  lagDays?: number
  isCriticalPath: boolean
}

export interface TimelineEdgeData {
  duration: number
  hasConflict: boolean
}

export type CustomEdge = Edge<DependencyEdgeData | TimelineEdgeData>

// Layout Configuration
export interface LayoutConfig {
  direction: 'horizontal' | 'vertical'
  nodeSpacing: number
  rankSpacing: number
  algorithm: 'dagre' | 'elk' | 'manual'
}

// Flow State
export interface FlowState {
  nodes: CustomNode[]
  edges: CustomEdge[]
  selectedNodes: string[]
  selectedEdges: string[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

