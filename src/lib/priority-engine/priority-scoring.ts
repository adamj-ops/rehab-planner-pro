import { ScopeItem } from '@/types/rehab'
import { 
  PriorityScore, 
  DependencyMapping, 
  PriorityMatrixEnhanced,
  MarketTimingFactor 
} from './types'

/**
 * Advanced Priority Scoring Engine
 * Calculates intelligent priority scores based on multiple factors
 */
export class PriorityScoringEngine {
  
  /**
   * Calculate comprehensive priority score for a scope item
   */
  static calculatePriorityScore(
    item: ScopeItem,
    allItems: ScopeItem[],
    projectContext: {
      strategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
      timeline: number // months
      budget: number
      season: 'spring' | 'summer' | 'fall' | 'winter'
      marketConditions: 'hot' | 'balanced' | 'cold'
    }
  ): PriorityScore {
    
    // Calculate individual components
    const urgency = this.calculateUrgencyScore(item, allItems, projectContext)
    const roiImpact = this.calculateROIImpactScore(item, projectContext)
    const riskMitigation = this.calculateRiskMitigationScore(item, projectContext)
    const dependencies = this.calculateDependencyScore(item, allItems)
    const marketTiming = this.calculateMarketTimingScore(item, projectContext)
    const complexity = this.calculateComplexityScore(item, projectContext)
    
    // Weighted overall score based on strategy
    const weights = this.getStrategyWeights(projectContext.strategy)
    
    const overall = Math.round(
      urgency * weights.urgency +
      roiImpact * weights.roiImpact +
      riskMitigation * weights.riskMitigation +
      dependencies * weights.dependencies +
      marketTiming * weights.marketTiming +
      complexity * weights.complexity
    )
    
    const reasoning = this.generateScoreReasoning(
      item, 
      { urgency, roiImpact, riskMitigation, dependencies, marketTiming, complexity },
      projectContext
    )
    
    return {
      overall: Math.max(0, Math.min(100, overall)),
      components: {
        urgency,
        roiImpact,
        riskMitigation,
        dependencies,
        marketTiming,
        complexity
      },
      reasoning
    }
  }
  
  /**
   * Calculate urgency score (0-100)
   */
  private static calculateUrgencyScore(
    item: ScopeItem, 
    allItems: ScopeItem[], 
    context: any
  ): number {
    let urgency = 50 // Base score
    
    // Priority-based urgency
    const priorityScores = { 'must': 40, 'should': 20, 'could': 0, 'nice': -20 }
    urgency += priorityScores[item.priority] || 0
    
    // Category-based urgency
    const categoryUrgency = {
      'structural': 30,
      'systems': 25,
      'safety': 35,
      'exterior': 20,
      'interior': 10
    }
    urgency += categoryUrgency[item.category.toLowerCase()] || 0
    
    // Dependency urgency (items that block others)
    const dependents = allItems.filter(otherItem => 
      otherItem.dependsOn.includes(item.id)
    ).length
    urgency += dependents * 5
    
    // Timeline pressure
    if (context.timeline <= 3) urgency += 15 // Short timeline = higher urgency
    else if (context.timeline >= 12) urgency -= 10 // Long timeline = lower urgency
    
    // Seasonal urgency
    const seasonalUrgency = this.getSeasonalUrgency(item, context.season)
    urgency += seasonalUrgency
    
    return Math.max(0, Math.min(100, urgency))
  }
  
  /**
   * Calculate ROI impact score (0-100)
   */
  private static calculateROIImpactScore(item: ScopeItem, context: any): number {
    let roiScore = item.roiImpact * 5 // Base ROI impact
    
    // Strategy-specific ROI multipliers
    const strategyMultipliers = {
      flip: {
        kitchen: 1.3,
        bathroom: 1.2,
        exterior: 1.4,
        systems: 0.8,
        cosmetic: 1.1
      },
      rental: {
        kitchen: 0.9,
        bathroom: 1.0,
        systems: 1.3,
        safety: 1.2,
        cosmetic: 0.7
      },
      wholetail: {
        exterior: 1.5,
        safety: 1.3,
        systems: 1.1,
        cosmetic: 0.6
      },
      airbnb: {
        kitchen: 1.4,
        bathroom: 1.3,
        cosmetic: 1.2,
        systems: 1.0
      }
    }
    
    const category = this.getCategoryFromItem(item)
    const multiplier = strategyMultipliers[context.strategy]?.[category] || 1.0
    roiScore *= multiplier
    
    // Cost efficiency bonus
    const efficiency = item.roiImpact / (item.totalCost / 1000) // ROI per $1000
    if (efficiency > 2) roiScore += 10
    else if (efficiency < 0.5) roiScore -= 10
    
    return Math.max(0, Math.min(100, roiScore))
  }
  
  /**
   * Calculate risk mitigation score (0-100)
   */
  private static calculateRiskMitigationScore(item: ScopeItem, context: any): number {
    let riskScore = 50
    
    // Safety and structural items mitigate risk
    const category = this.getCategoryFromItem(item)
    if (category === 'safety') riskScore += 25
    else if (category === 'structural') riskScore += 20
    else if (category === 'systems') riskScore += 15
    
    // Code compliance reduces risk
    if (item.description?.toLowerCase().includes('code') || 
        item.description?.toLowerCase().includes('permit')) {
      riskScore += 15
    }
    
    // High-cost items carry more risk if delayed
    const costRiskFactor = Math.min(item.totalCost / 10000, 1) * 10
    riskScore += costRiskFactor
    
    return Math.max(0, Math.min(100, riskScore))
  }
  
  /**
   * Calculate dependency score (0-100)
   */
  private static calculateDependencyScore(item: ScopeItem, allItems: ScopeItem[]): number {
    let dependencyScore = 50
    
    // Items that block others get higher priority
    const dependents = allItems.filter(otherItem => 
      otherItem.dependsOn.includes(item.id)
    ).length
    dependencyScore += dependents * 15
    
    // Items with many dependencies get lower priority (do them later)
    dependencyScore -= item.dependsOn.length * 5
    
    // Phase-based scoring (earlier phases = higher priority)
    dependencyScore += (5 - item.phase) * 5
    
    return Math.max(0, Math.min(100, dependencyScore))
  }
  
  /**
   * Calculate market timing score (0-100)
   */
  private static calculateMarketTimingScore(item: ScopeItem, context: any): number {
    let timingScore = 50
    
    // Seasonal factors
    const seasonalBonus = this.getSeasonalBonus(item, context.season)
    timingScore += seasonalBonus
    
    // Market condition factors
    if (context.marketConditions === 'hot') {
      // Hot market - prioritize quick, high-impact items
      if (item.daysRequired <= 5 && item.roiImpact > 10) timingScore += 15
    } else if (context.marketConditions === 'cold') {
      // Cold market - focus on fundamental improvements
      const category = this.getCategoryFromItem(item)
      if (category === 'structural' || category === 'systems') timingScore += 10
    }
    
    return Math.max(0, Math.min(100, timingScore))
  }
  
  /**
   * Calculate complexity score (0-100) - lower complexity = higher priority
   */
  private static calculateComplexityScore(item: ScopeItem, context: any): number {
    let complexityScore = 50
    
    // Timeline-based complexity
    if (item.daysRequired <= 2) complexityScore += 20
    else if (item.daysRequired <= 5) complexityScore += 10
    else if (item.daysRequired > 10) complexityScore -= 15
    
    // Cost-based complexity
    if (item.totalCost < 1000) complexityScore += 15
    else if (item.totalCost > 10000) complexityScore -= 10
    
    // Category-based complexity
    const categoryComplexity = {
      'paint': 20,
      'flooring': 10,
      'kitchen': -15,
      'bathroom': -10,
      'structural': -20,
      'electrical': -15,
      'plumbing': -15
    }
    
    const category = item.category.toLowerCase()
    Object.keys(categoryComplexity).forEach(key => {
      if (category.includes(key)) {
        complexityScore += categoryComplexity[key as keyof typeof categoryComplexity]
      }
    })
    
    // Dependency complexity
    complexityScore -= item.dependsOn.length * 5
    
    return Math.max(0, Math.min(100, complexityScore))
  }
  
  /**
   * Get strategy-specific scoring weights
   */
  private static getStrategyWeights(strategy: string) {
    const weights = {
      flip: {
        urgency: 0.15,
        roiImpact: 0.35,
        riskMitigation: 0.15,
        dependencies: 0.20,
        marketTiming: 0.10,
        complexity: 0.05
      },
      rental: {
        urgency: 0.20,
        roiImpact: 0.25,
        riskMitigation: 0.25,
        dependencies: 0.15,
        marketTiming: 0.05,
        complexity: 0.10
      },
      wholetail: {
        urgency: 0.25,
        roiImpact: 0.30,
        riskMitigation: 0.20,
        dependencies: 0.15,
        marketTiming: 0.05,
        complexity: 0.05
      },
      airbnb: {
        urgency: 0.10,
        roiImpact: 0.30,
        riskMitigation: 0.15,
        dependencies: 0.20,
        marketTiming: 0.15,
        complexity: 0.10
      }
    }
    
    return weights[strategy as keyof typeof weights] || weights.flip
  }
  
  /**
   * Generate human-readable reasoning for the score
   */
  private static generateScoreReasoning(
    item: ScopeItem,
    scores: any,
    context: any
  ): string[] {
    const reasoning: string[] = []
    
    // High urgency reasons
    if (scores.urgency > 70) {
      if (item.priority === 'must') reasoning.push("Critical priority item")
      const category = this.getCategoryFromItem(item)
      if (category === 'safety') reasoning.push("Safety-critical work")
      if (category === 'structural') reasoning.push("Structural integrity important")
    }
    
    // High ROI reasons
    if (scores.roiImpact > 70) {
      reasoning.push(`High ROI impact (${item.roiImpact.toFixed(1)}%)`)
      if (context.strategy === 'flip') reasoning.push("Excellent for resale value")
    }
    
    // Dependency reasons
    if (scores.dependencies > 70) {
      reasoning.push("Blocks other work - do early")
    } else if (scores.dependencies < 30) {
      reasoning.push("Can be done later in project")
    }
    
    // Market timing reasons
    if (scores.marketTiming > 60) {
      reasoning.push("Favorable market timing")
    }
    
    // Complexity reasons
    if (scores.complexity > 70) {
      reasoning.push("Simple execution - quick win")
    } else if (scores.complexity < 30) {
      reasoning.push("Complex work - plan carefully")
    }
    
    return reasoning
  }
  
  /**
   * Helper functions
   */
  private static getCategoryFromItem(item: ScopeItem): string {
    const category = item.category.toLowerCase()
    
    if (category.includes('electrical') || category.includes('plumbing') || category.includes('hvac')) {
      return 'systems'
    }
    
    if (category.includes('foundation') || category.includes('roof') || category.includes('structural')) {
      return 'structural'
    }
    
    if (category.includes('safety') || category.includes('code')) {
      return 'safety'
    }
    
    if (category.includes('paint') || category.includes('flooring') || category.includes('cosmetic')) {
      return 'cosmetic'
    }
    
    return 'optional'
  }
  
  private static getSeasonalUrgency(item: ScopeItem, season: string): number {
    const category = item.category.toLowerCase()
    
    // Exterior work seasonal factors
    if (category.includes('roof') || category.includes('siding') || category.includes('exterior')) {
      if (season === 'spring' || season === 'summer') return 10
      if (season === 'fall') return 5
      if (season === 'winter') return -15
    }
    
    // HVAC seasonal factors
    if (category.includes('hvac')) {
      if (season === 'spring' || season === 'fall') return 15 // Best time for HVAC work
      if (season === 'summer' || season === 'winter') return -5 // Peak usage seasons
    }
    
    return 0
  }
  
  private static getSeasonalBonus(item: ScopeItem, season: string): number {
    return this.getSeasonalUrgency(item, season) // Same logic for now
  }
}

/**
 * Dependency Mapping Engine
 * Analyzes dependencies and creates critical path
 */
export class DependencyMappingEngine {
  
  /**
   * Create dependency mapping for all scope items
   */
  static createDependencyMapping(items: ScopeItem[]): DependencyMapping[] {
    return items.map(item => {
      const dependents = items.filter(otherItem => 
        otherItem.dependsOn.includes(item.id)
      ).map(dep => dep.id)
      
      const criticalPath = this.isOnCriticalPath(item, items)
      const { earliestStart, latestFinish, slack } = this.calculateScheduling(item, items)
      
      return {
        itemId: item.id,
        dependsOn: item.dependsOn,
        dependents,
        criticalPath,
        phase: item.phase,
        earliestStart,
        latestFinish,
        slack
      }
    })
  }
  
  /**
   * Determine if item is on critical path
   */
  private static isOnCriticalPath(item: ScopeItem, allItems: ScopeItem[]): boolean {
    // Simplified critical path logic
    // In a full implementation, this would use CPM (Critical Path Method)
    
    // Items with no slack are on critical path
    const { slack } = this.calculateScheduling(item, allItems)
    return slack === 0
  }
  
  /**
   * Calculate scheduling parameters
   */
  private static calculateScheduling(item: ScopeItem, allItems: ScopeItem[]): {
    earliestStart: number
    latestFinish: number
    slack: number
  } {
    // Simplified scheduling calculation
    // In production, this would implement full CPM algorithm
    
    let earliestStart = 0
    
    // Find latest dependency completion
    item.dependsOn.forEach(depId => {
      const dependency = allItems.find(i => i.id === depId)
      if (dependency) {
        const depCompletion = this.calculateScheduling(dependency, allItems).earliestStart + dependency.daysRequired
        earliestStart = Math.max(earliestStart, depCompletion)
      }
    })
    
    // Calculate latest finish (working backwards from project end)
    const projectDuration = Math.max(...allItems.map(i => i.phase * 30)) // Assume 30 days per phase
    let latestFinish = projectDuration
    
    // Find earliest dependent start
    const dependents = allItems.filter(otherItem => otherItem.dependsOn.includes(item.id))
    dependents.forEach(dependent => {
      const depScheduling = this.calculateScheduling(dependent, allItems)
      latestFinish = Math.min(latestFinish, depScheduling.latestFinish - item.daysRequired)
    })
    
    const slack = latestFinish - earliestStart - item.daysRequired
    
    return {
      earliestStart,
      latestFinish,
      slack: Math.max(0, slack)
    }
  }
  
  /**
   * Generate critical path analysis
   */
  static generateCriticalPath(items: ScopeItem[]): {
    criticalItems: string[]
    totalDuration: number
    phases: Array<{
      id: string
      name: string
      items: string[]
      duration: number
    }>
  } {
    const dependencyMap = this.createDependencyMapping(items)
    const criticalItems = dependencyMap.filter(dep => dep.criticalPath).map(dep => dep.itemId)
    
    // Group by phases
    const phases = this.groupItemsByPhase(items)
    
    // Calculate total duration (longest path)
    const totalDuration = Math.max(...phases.map(phase => 
      phase.items.reduce((max, itemId) => {
        const item = items.find(i => i.id === itemId)
        return Math.max(max, item?.daysRequired || 0)
      }, 0)
    ))
    
    return {
      criticalItems,
      totalDuration,
      phases
    }
  }
  
  /**
   * Group items by phase for scheduling
   */
  private static groupItemsByPhase(items: ScopeItem[]) {
    const phases: Record<number, ScopeItem[]> = {}
    
    items.forEach(item => {
      if (!phases[item.phase]) phases[item.phase] = []
      phases[item.phase].push(item)
    })
    
    return Object.entries(phases).map(([phaseNum, phaseItems]) => ({
      id: `phase-${phaseNum}`,
      name: `Phase ${phaseNum}`,
      items: phaseItems.map(item => item.id),
      duration: Math.max(...phaseItems.map(item => item.daysRequired))
    }))
  }
}

/**
 * Market Timing Analysis Engine
 */
export class MarketTimingEngine {
  
  /**
   * Analyze market timing factors for renovation items
   */
  static analyzeMarketTiming(
    item: ScopeItem,
    context: {
      season: 'spring' | 'summer' | 'fall' | 'winter'
      marketConditions: 'hot' | 'balanced' | 'cold'
      strategy: string
    }
  ): MarketTimingFactor[] {
    const factors: MarketTimingFactor[] = []
    
    // Seasonal factors
    const seasonalFactor = this.getSeasonalFactor(item, context.season)
    if (seasonalFactor) factors.push(seasonalFactor)
    
    // Market condition factors
    const marketFactor = this.getMarketConditionFactor(item, context.marketConditions, context.strategy)
    if (marketFactor) factors.push(marketFactor)
    
    // Material availability factors
    const materialFactor = this.getMaterialAvailabilityFactor(item)
    if (materialFactor) factors.push(materialFactor)
    
    return factors
  }
  
  private static getSeasonalFactor(item: ScopeItem, season: string): MarketTimingFactor | null {
    const category = item.category.toLowerCase()
    
    if (category.includes('roof') || category.includes('exterior')) {
      if (season === 'spring' || season === 'summer') {
        return {
          factor: 'favorable_weather',
          impact: 'positive',
          magnitude: 0.8,
          timeframe: 'immediate',
          description: 'Ideal weather conditions for exterior work'
        }
      } else if (season === 'winter') {
        return {
          factor: 'weather_constraints',
          impact: 'negative',
          magnitude: 0.6,
          timeframe: 'immediate',
          description: 'Weather may delay exterior work'
        }
      }
    }
    
    return null
  }
  
  private static getMarketConditionFactor(
    item: ScopeItem, 
    conditions: string, 
    strategy: string
  ): MarketTimingFactor | null {
    if (strategy === 'flip' && conditions === 'hot') {
      if (item.roiImpact > 15) {
        return {
          factor: 'hot_market_premium',
          impact: 'positive',
          magnitude: 0.7,
          timeframe: 'short_term',
          description: 'Hot market rewards high-impact improvements'
        }
      }
    }
    
    return null
  }
  
  private static getMaterialAvailabilityFactor(item: ScopeItem): MarketTimingFactor | null {
    // This would integrate with real-time material availability data
    // For now, return mock data
    
    if (item.category.toLowerCase().includes('lumber')) {
      return {
        factor: 'material_shortage',
        impact: 'negative',
        magnitude: 0.4,
        timeframe: 'short_term',
        description: 'Lumber prices elevated due to supply constraints'
      }
    }
    
    return null
  }
}
