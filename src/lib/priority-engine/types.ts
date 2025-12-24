// Priority Matrix Types
export interface PriorityScore {
  overall: number // 0-100
  components: {
    urgency: number
    roiImpact: number
    riskMitigation: number
    dependencies: number
    marketTiming: number
    complexity: number
  }
  reasoning: string[]
}

export interface DependencyMapping {
  itemId: string
  dependsOn: string[]
  dependents: string[] // items that depend on this one
  criticalPath: boolean
  phase: number
  earliestStart: number // days from project start
  latestFinish: number // days from project start
  slack: number // days of flexibility
}

export interface PriorityMatrixEnhanced extends PriorityMatrixItem {
  priorityScore: PriorityScore
  dependencies: DependencyMapping
  riskFactors: {
    executionRisk: 'low' | 'medium' | 'high'
    timeRisk: 'low' | 'medium' | 'high'
    costRisk: 'low' | 'medium' | 'high'
    marketRisk: 'low' | 'medium' | 'high'
  }
  marketTiming: {
    seasonalFactor: number
    marketConditions: 'favorable' | 'neutral' | 'unfavorable'
    recommendedStartDate: Date
    reasoning: string
  }
}

export interface CriticalPathAnalysis {
  criticalItems: string[]
  totalDuration: number
  phases: Array<{
    id: string
    name: string
    items: string[]
    duration: number
    startDate: Date
    endDate: Date
    dependencies: string[]
  }>
  bottlenecks: Array<{
    itemId: string
    impact: number // days delay if this item is delayed
    mitigation: string[]
  }>
}

export interface PriorityRecommendation {
  action: 'prioritize' | 'delay' | 'remove' | 'modify'
  itemId: string
  reasoning: string
  impact: {
    cost: number
    timeline: number
    roi: number
  }
  alternatives?: Array<{
    description: string
    costImpact: number
    timelineImpact: number
    roiImpact: number
  }>
}

export interface MarketTimingFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  magnitude: number // 0.0 to 1.0
  timeframe: 'immediate' | 'short_term' | 'long_term'
  description: string
}

// Import from existing types
import { PriorityMatrixItem } from '@/types/rehab'
