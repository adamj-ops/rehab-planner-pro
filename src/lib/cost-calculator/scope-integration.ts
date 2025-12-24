import { ScopeItem } from '@/types/rehab'
import { CostCalculationEngine, CostUtils } from './cost-engine'
import { getCostItemById, searchCostItems } from './base-cost-database'
import { CostCalculationInput, CostCalculationResult } from './types'

/**
 * Integration layer between the cost calculation engine and existing scope builder
 */
export class ScopeIntegration {
  
  /**
   * Calculate costs for existing scope items
   */
  static calculateScopeItemCosts(
    scopeItems: ScopeItem[],
    location: { zipCode: string; state: string },
    qualityTier: 'budget' | 'standard' | 'premium' | 'luxury' = 'standard'
  ): ScopeItem[] {
    
    return scopeItems.map(scopeItem => {
      // Try to find matching cost item in database
      const costItem = this.findMatchingCostItem(scopeItem)
      
      if (!costItem) {
        // Return original item if no cost data found
        return scopeItem
      }
      
      // Calculate cost using the cost engine
      const input: CostCalculationInput = {
        item: costItem,
        quantity: scopeItem.quantity,
        qualityTier,
        location,
        projectConditions: {
          urgency: scopeItem.priority === 'must' ? 'high' : 'medium',
          complexity: this.mapComplexity(scopeItem.category),
          accessibility: 'moderate' // Default, could be enhanced
        }
      }
      
      const costResult = CostCalculationEngine.calculateItemCost(input)
      
      // Update scope item with calculated costs
      return {
        ...scopeItem,
        materialCost: costResult.materialCost,
        laborCost: costResult.laborCost,
        totalCost: costResult.totalCost,
        daysRequired: costResult.timelineEstimate,
        // Add cost calculation metadata
        costCalculation: {
          baseCostItemId: costItem.id,
          calculatedAt: costResult.calculatedAt,
          confidenceLevel: costResult.confidenceLevel,
          factors: costResult.factors,
          costRange: costResult.costRange
        }
      }
    })
  }
  
  /**
   * Generate scope items from cost database categories
   */
  static generateScopeFromAssessment(
    assessmentData: any, // PropertyAssessment data
    location: { zipCode: string; state: string },
    qualityTier: 'budget' | 'standard' | 'premium' | 'luxury' = 'standard'
  ): ScopeItem[] {
    const scopeItems: ScopeItem[] = []
    
    // Example: Generate scope items based on assessment conditions
    if (assessmentData.components) {
      Object.entries(assessmentData.components).forEach(([componentName, componentData]: [string, any]) => {
        if (componentData.needsWork) {
          // Search for matching cost items
          const matchingCostItems = searchCostItems(componentName)
          
          if (matchingCostItems.length > 0) {
            const costItem = matchingCostItems[0] // Take first match
            
            // Create scope item
            const scopeItem: ScopeItem = {
              id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              projectId: '', // Will be set when added to project
              category: costItem.category,
              subcategory: costItem.subcategory,
              itemName: costItem.itemName,
              description: costItem.description,
              location: assessmentData.roomName || '',
              quantity: 1, // Default quantity
              unitOfMeasure: costItem.unit,
              materialCost: 0, // Will be calculated
              laborCost: 0, // Will be calculated
              totalCost: 0, // Will be calculated
              priority: componentData.action === 'replace' ? 'must' : 'should',
              roiImpact: this.estimateROIImpact(costItem.category, componentData.action),
              daysRequired: 0, // Will be calculated
              dependsOn: [],
              phase: this.assignPhase(costItem.category),
              included: true,
              completed: false
            }
            
            scopeItems.push(scopeItem)
          }
        }
      })
    }
    
    // Calculate costs for generated items
    return this.calculateScopeItemCosts(scopeItems, location, qualityTier)
  }
  
  /**
   * Find matching cost item for a scope item
   */
  private static findMatchingCostItem(scopeItem: ScopeItem) {
    // Try exact match by name first
    let costItems = searchCostItems(scopeItem.itemName)
    
    if (costItems.length === 0) {
      // Try category + subcategory search
      costItems = searchCostItems(`${scopeItem.category} ${scopeItem.subcategory}`)
    }
    
    if (costItems.length === 0) {
      // Try just category search
      costItems = searchCostItems(scopeItem.category)
    }
    
    // Return first match or null
    return costItems.length > 0 ? costItems[0] : null
  }
  
  /**
   * Map scope item category to complexity level
   */
  private static mapComplexity(category: string): 'simple' | 'moderate' | 'complex' {
    const complexityMap: Record<string, 'simple' | 'moderate' | 'complex'> = {
      'paint': 'simple',
      'flooring': 'moderate',
      'kitchen': 'complex',
      'bathroom': 'complex',
      'roofing': 'complex',
      'electrical': 'complex',
      'plumbing': 'complex',
      'hvac': 'complex',
      'structural': 'complex',
      'windows': 'moderate',
      'doors': 'simple',
      'siding': 'moderate'
    }
    
    return complexityMap[category.toLowerCase()] || 'moderate'
  }
  
  /**
   * Estimate ROI impact based on category and action
   */
  private static estimateROIImpact(category: string, action: string): number {
    const baseROI: Record<string, number> = {
      'kitchen': 0.75,
      'bathroom': 0.65,
      'flooring': 0.60,
      'paint': 0.80,
      'roofing': 0.70,
      'windows': 0.65,
      'hvac': 0.50,
      'electrical': 0.45,
      'plumbing': 0.50
    }
    
    const actionMultiplier: Record<string, number> = {
      'repair': 0.8,
      'replace': 1.0,
      'upgrade': 1.2
    }
    
    const base = baseROI[category.toLowerCase()] || 0.55
    const multiplier = actionMultiplier[action.toLowerCase()] || 1.0
    
    return Math.round(base * multiplier * 100) / 100
  }
  
  /**
   * Assign phase based on category
   */
  private static assignPhase(category: string): number {
    const phaseMap: Record<string, number> = {
      'structural': 1,
      'electrical': 2,
      'plumbing': 2,
      'hvac': 2,
      'insulation': 3,
      'drywall': 3,
      'flooring': 4,
      'kitchen': 4,
      'bathroom': 4,
      'paint': 5,
      'trim': 5,
      'exterior': 6
    }
    
    return phaseMap[category.toLowerCase()] || 4
  }
  
  /**
   * Get cost summary for a project
   */
  static getProjectCostSummary(scopeItems: ScopeItem[]) {
    const includedItems = scopeItems.filter(item => item.included)
    
    const totalMaterialCost = includedItems.reduce((sum, item) => sum + item.materialCost, 0)
    const totalLaborCost = includedItems.reduce((sum, item) => sum + item.laborCost, 0)
    const totalCost = includedItems.reduce((sum, item) => sum + item.totalCost, 0)
    const totalDays = Math.max(...includedItems.map(item => item.daysRequired), 0)
    
    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    includedItems.forEach(item => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.totalCost
    })
    
    // Calculate contingency (10% of total cost)
    const contingency = totalCost * 0.1
    
    // Calculate project total with contingency
    const projectTotal = totalCost + contingency
    
    return {
      materialCost: totalMaterialCost,
      laborCost: totalLaborCost,
      subtotal: totalCost,
      contingency,
      total: projectTotal,
      timeline: totalDays,
      categoryBreakdown,
      itemCount: includedItems.length,
      costPerItem: includedItems.length > 0 ? totalCost / includedItems.length : 0,
      formattedTotal: CostUtils.formatCurrency(projectTotal),
      formattedSubtotal: CostUtils.formatCurrency(totalCost),
      formattedContingency: CostUtils.formatCurrency(contingency)
    }
  }
  
  /**
   * Compare cost scenarios
   */
  static compareScenarios(
    scenarios: Array<{
      name: string
      scopeItems: ScopeItem[]
      qualityTier: 'budget' | 'standard' | 'premium' | 'luxury'
    }>,
    location: { zipCode: string; state: string }
  ) {
    return scenarios.map(scenario => {
      const calculatedItems = this.calculateScopeItemCosts(
        scenario.scopeItems,
        location,
        scenario.qualityTier
      )
      
      const summary = this.getProjectCostSummary(calculatedItems)
      
      return {
        ...scenario,
        scopeItems: calculatedItems,
        summary,
        costPerSqFt: 0, // Would need square footage to calculate
        roiEstimate: calculatedItems.reduce((sum, item) => sum + item.roiImpact, 0) / calculatedItems.length
      }
    })
  }
}
