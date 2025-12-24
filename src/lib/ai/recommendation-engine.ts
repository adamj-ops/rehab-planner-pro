import { ScopeItem, RehabProject, PropertyAssessment } from '@/types/rehab'
import { AIRecommendation } from './openai-service'

/**
 * Rule-based Recommendation Engine
 * Provides intelligent suggestions based on project data and best practices
 */

export class RecommendationEngine {
  /**
   * Generate comprehensive recommendations for a project
   */
  generateRecommendations(
    project: Partial<RehabProject>,
    scopeItems: ScopeItem[],
    assessments?: PropertyAssessment[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    // Analyze scope for cost-saving opportunities
    recommendations.push(...this.findCostSavings(scopeItems, project))
    
    // Analyze for missing critical items
    recommendations.push(...this.findMissingItems(scopeItems, assessments, project))
    
    // Analyze for timing optimizations
    recommendations.push(...this.findTimingOptimizations(scopeItems))
    
    // Analyze for material upgrades worth the cost
    recommendations.push(...this.findWorthwhileUpgrades(scopeItems, project))
    
    // Analyze for items that could be removed
    recommendations.push(...this.findRemovableItems(scopeItems, project))
    
    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Find cost-saving opportunities
   */
  private findCostSavings(scopeItems: ScopeItem[], project: Partial<RehabProject>): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    // Find expensive items with low ROI
    scopeItems.forEach(item => {
      if (item.totalCost > 5000 && item.roiImpact < 30) {
        recommendations.push({
          id: `cost-save-${item.id}`,
          type: 'downgrade',
          title: `Consider more cost-effective option for ${item.itemName}`,
          description: `This item has a high cost ($${item.totalCost.toLocaleString()}) but relatively low ROI impact (${item.roiImpact}). Consider a mid-range alternative.`,
          estimatedCostImpact: -item.totalCost * 0.3, // Save 30%
          roiImpact: -5, // Minimal ROI loss
          timeImpactDays: 0,
          confidence: 0.75,
          reasoning: [
            'High cost relative to ROI impact',
            'Budget-friendly alternatives available',
            'Minimal impact on property value'
          ],
          source: 'algorithm'
        })
      }
    })
    
    // Suggest bundling similar contractors
    const contractorGroups = this.groupByContractor(scopeItems)
    Object.entries(contractorGroups).forEach(([contractor, items]) => {
      if (items.length >= 3 && items.length <= 5) {
        const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0)
        recommendations.push({
          id: `bundle-${contractor}`,
          type: 'cost-savings',
          title: `Bundle ${contractor} tasks for better pricing`,
          description: `You have ${items.length} tasks for ${contractor}. Bundling these could reduce costs by 10-15%.`,
          estimatedCostImpact: -totalCost * 0.12,
          roiImpact: 5,
          timeImpactDays: 0,
          confidence: 0.8,
          reasoning: [
            'Multiple tasks from same contractor',
            'Bulk discounts typically available',
            'Reduced mobilization costs'
          ],
          source: 'algorithm'
        })
      }
    })
    
    return recommendations
  }

  /**
   * Find missing critical items based on assessment
   */
  private findMissingItems(
    scopeItems: ScopeItem[],
    assessments: PropertyAssessment[] = [],
    project: Partial<RehabProject>
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    const itemCategories = new Set(scopeItems.map(i => i.category.toLowerCase()))
    
    // Check for critical systems
    if (!itemCategories.has('electrical') && !itemCategories.has('electrical panel')) {
      recommendations.push({
        id: 'missing-electrical',
        type: 'add',
        title: 'Consider electrical system inspection',
        description: 'No electrical work in scope. For properties over 30 years old, electrical panel upgrade is often needed.',
        estimatedCostImpact: 2000,
        roiImpact: 15,
        timeImpactDays: 2,
        confidence: project.yearBuilt && (new Date().getFullYear() - project.yearBuilt) > 30 ? 0.85 : 0.6,
        reasoning: [
          'Critical safety system',
          'Required for financing',
          'Common issue in older homes'
        ],
        source: 'algorithm'
      })
    }
    
    // Check for curb appeal items for flips
    if (project.investmentStrategy === 'flip') {
      const hasCurbAppeal = scopeItems.some(item => 
        item.category.toLowerCase().includes('landscaping') ||
        item.category.toLowerCase().includes('exterior') ||
        item.itemName.toLowerCase().includes('front door')
      )
      
      if (!hasCurbAppeal) {
        recommendations.push({
          id: 'missing-curb-appeal',
          type: 'add',
          title: 'Add curb appeal improvements',
          description: 'For flips, first impressions matter. Consider front door, landscaping, or exterior paint.',
          estimatedCostImpact: 1500,
          roiImpact: 40,
          timeImpactDays: 3,
          confidence: 0.9,
          reasoning: [
            'Critical for buyer appeal',
            'High ROI for low cost',
            'Speeds up sale timeline'
          ],
          source: 'algorithm'
        })
      }
    }
    
    return recommendations
  }

  /**
   * Find timing optimization opportunities
   */
  private findTimingOptimizations(scopeItems: ScopeItem[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    // Find items that could be parallelized
    scopeItems.forEach(item => {
      if (item.dependsOn.length === 0 && item.phase > 1) {
        recommendations.push({
          id: `timing-${item.id}`,
          type: 'timing',
          title: `Move "${item.itemName}" to earlier phase`,
          description: `This task has no dependencies and could be done in Phase 1, reducing overall timeline.`,
          estimatedCostImpact: 0,
          roiImpact: 0,
          timeImpactDays: -Math.floor(item.daysRequired / 2),
          confidence: 0.7,
          reasoning: [
            'No dependencies blocking earlier start',
            'Could be parallelized with other work',
            'Reduces project duration'
          ],
          source: 'algorithm'
        })
      }
    })
    
    return recommendations.slice(0, 3) // Limit to top 3
  }

  /**
   * Find worthwhile upgrades
   */
  private findWorthwhileUpgrades(scopeItems: ScopeItem[], project: Partial<RehabProject>): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    // Kitchen upgrades for high-value neighborhoods
    const hasKitchen = scopeItems.some(item => item.category.toLowerCase().includes('kitchen'))
    if (hasKitchen && project.arv && project.arv > 300000) {
      const kitchenItems = scopeItems.filter(item => item.category.toLowerCase().includes('kitchen'))
      const totalKitchenCost = kitchenItems.reduce((sum, item) => sum + item.totalCost, 0)
      
      if (totalKitchenCost < 15000) {
        recommendations.push({
          id: 'upgrade-kitchen',
          type: 'upgrade',
          title: 'Consider kitchen upgrade to mid-range',
          description: 'For properties in this price range, a mid-range kitchen remodel typically returns 70-80% ROI.',
          estimatedCostImpact: 5000,
          roiImpact: 35,
          timeImpactDays: 5,
          confidence: 0.75,
          reasoning: [
            'High-value property justifies investment',
            'Kitchen is key selling feature',
            'Proven ROI in this price range'
          ],
          source: 'market-data'
        })
      }
    }
    
    return recommendations
  }

  /**
   * Find items that could be removed to save budget
   */
  private findRemovableItems(scopeItems: ScopeItem[], project: Partial<RehabProject>): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []
    
    // Find low-priority, low-ROI items
    scopeItems.forEach(item => {
      if (item.priority === 'nice' && item.roiImpact < 20) {
        recommendations.push({
          id: `remove-${item.id}`,
          type: 'remove',
          title: `Consider removing "${item.itemName}"`,
          description: `This low-priority item has minimal ROI impact and could be cut if over budget.`,
          estimatedCostImpact: -item.totalCost,
          roiImpact: -item.roiImpact,
          timeImpactDays: -item.daysRequired,
          confidence: 0.65,
          reasoning: [
            'Low priority (nice-to-have)',
            'Minimal ROI impact',
            'Could free up budget for higher-ROI items'
          ],
          source: 'algorithm'
        })
      }
    })
    
    return recommendations.slice(0, 5) // Limit to top 5
  }

  /**
   * Helper: Group scope items by contractor type
   */
  private groupByContractor(scopeItems: ScopeItem[]): Record<string, ScopeItem[]> {
    const groups: Record<string, ScopeItem[]> = {}
    
    scopeItems.forEach(item => {
      const contractor = this.determineContractor(item)
      if (!groups[contractor]) {
        groups[contractor] = []
      }
      groups[contractor].push(item)
    })
    
    return groups
  }

  /**
   * Helper: Determine contractor type from scope item
   */
  private determineContractor(item: ScopeItem): string {
    const category = item.category.toLowerCase()
    
    if (category.includes('electrical')) return 'Electrician'
    if (category.includes('plumbing')) return 'Plumber'
    if (category.includes('hvac')) return 'HVAC'
    if (category.includes('roofing')) return 'Roofer'
    if (category.includes('flooring')) return 'Flooring'
    if (category.includes('paint')) return 'Painter'
    
    return 'General Contractor'
  }
}

export const recommendationEngine = new RecommendationEngine()

