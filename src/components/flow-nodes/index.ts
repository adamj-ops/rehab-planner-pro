export { TaskNode } from './TaskNode'
export { PhaseNode } from './PhaseNode'
export { MilestoneNode } from './MilestoneNode'
export { ContractorNode } from './ContractorNode'

// Node type mapping for React Flow
import { TaskNode } from './TaskNode'
import { PhaseNode } from './PhaseNode'
import { MilestoneNode } from './MilestoneNode'
import { ContractorNode } from './ContractorNode'

export const nodeTypes = {
  task: TaskNode,
  phase: PhaseNode,
  milestone: MilestoneNode,
  contractor: ContractorNode,
}

