import { ScopeItem } from '@/types/rehab'
import { 
  CostCalculationEngine, 
  searchCostItems, 
  getCostItemsByCategory, 
  getCostItemsBySubcategory 
} from './index'

/**
 * Assessment to Scope Generation Service
 * Converts property assessment data into actionable scope items with real cost calculations
 */
export class AssessmentScopeGenerator {
  
  /**
   * Generate scope items from property assessment data
   */
  static generateScopeFromAssessments(
    assessments: Record<string, any>,
    location: { zipCode: string; state: string },
    qualityTier: 'budget' | 'standard' | 'premium' | 'luxury' = 'standard'
  ): ScopeItem[] {
    const scopeItems: ScopeItem[] = []
    
    // Process each room assessment
    Object.entries(assessments).forEach(([roomId, assessment]) => {
      if (!assessment.condition) return // Skip unassessed rooms
      
      // Generate items based on overall room condition
      const roomItems = this.generateItemsForRoom(roomId, assessment, location, qualityTier)
      scopeItems.push(...roomItems)
      
      // Generate items based on specific component conditions
      if (assessment.components) {
        const componentItems = this.generateItemsForComponents(
          roomId, 
          assessment.components, 
          assessment.condition,
          location, 
          qualityTier
        )
        scopeItems.push(...componentItems)
      }
    })
    
    // Remove duplicates and prioritize items
    return this.deduplicateAndPrioritize(scopeItems)
  }
  
  /**
   * Generate scope items based on overall room condition
   */
  private static generateItemsForRoom(
    roomId: string,
    assessment: any,
    location: { zipCode: string; state: string },
    qualityTier: 'budget' | 'standard' | 'premium' | 'luxury'
  ): ScopeItem[] {
    const items: ScopeItem[] = []
    const condition = assessment.condition
    const roomName = this.getRoomDisplayName(roomId)
    
    // Define room-based scope generation rules
    const roomRules = this.getRoomScopeRules(roomId, condition)
    
    roomRules.forEach(rule => {
      const costItems = this.findMatchingCostItems(rule.searchTerms)
      
      costItems.forEach(costItem => {
        const quantity = rule.quantity || 1
        const priority = rule.priority
        
        // Calculate costs using our engine
        const costResult = CostCalculationEngine.calculateItemCost({
          item: costItem,
          quantity,
          qualityTier,
          location,
          projectConditions: {
            urgency: this.mapConditionToUrgency(condition),
            complexity: rule.complexity || 'moderate',
            accessibility: 'moderate'
          }
        })
        
        const scopeItem: ScopeItem = {
          id: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: '',
          category: costItem.category,
          subcategory: costItem.subcategory,
          itemName: costItem.itemName,
          description: `${roomName}: ${rule.reason || 'Condition-based recommendation'}`,
          location: roomName,
          quantity,
          unitOfMeasure: costItem.unit,
          materialCost: costResult.materialCost,
          laborCost: costResult.laborCost,
          totalCost: costResult.totalCost,
          priority,
          roiImpact: this.calculateROIImpact(costItem.category, condition, rule.roiMultiplier || 1.0),
          daysRequired: costResult.timelineEstimate,
          dependsOn: rule.dependsOn || [],
          phase: this.assignPhase(costItem.category, priority),
          included: priority === 'must' || (priority === 'should' && condition === 'poor'),
          completed: false
        }
        
        items.push(scopeItem)
      })
    })
    
    return items
  }
  
  /**
   * Generate scope items based on specific component conditions
   */
  private static generateItemsForComponents(
    roomId: string,
    components: Record<string, any>,
    roomCondition: string,
    location: { zipCode: string; state: string },
    qualityTier: 'budget' | 'standard' | 'premium' | 'luxury'
  ): ScopeItem[] {
    const items: ScopeItem[] = []
    const roomName = this.getRoomDisplayName(roomId)
    
    Object.entries(components).forEach(([componentId, componentData]) => {
      if (!componentData.needsWork) return
      
      const action = componentData.action || 'repair'
      const searchTerms = this.getComponentSearchTerms(componentId, roomId, action)
      const costItems = this.findMatchingCostItems(searchTerms)
      
      costItems.forEach(costItem => {
        const priority = this.mapActionToPriority(action, roomCondition)
        const quantity = this.getComponentQuantity(componentId, roomId)
        
        // Calculate costs
        const costResult = CostCalculationEngine.calculateItemCost({
          item: costItem,
          quantity,
          qualityTier,
          location,
          projectConditions: {
            urgency: action === 'replace' ? 'high' : 'medium',
            complexity: this.getComponentComplexity(componentId),
            accessibility: 'moderate'
          }
        })
        
        const scopeItem: ScopeItem = {
          id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: '',
          category: costItem.category,
          subcategory: costItem.subcategory,
          itemName: `${this.getComponentDisplayName(componentId)} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          description: `${roomName}: ${action} ${this.getComponentDisplayName(componentId).toLowerCase()}`,
          location: roomName,
          quantity,
          unitOfMeasure: costItem.unit,
          materialCost: costResult.materialCost,
          laborCost: costResult.laborCost,
          totalCost: costResult.totalCost,
          priority,
          roiImpact: this.calculateComponentROI(componentId, action, roomId),
          daysRequired: costResult.timelineEstimate,
          dependsOn: this.getComponentDependencies(componentId, action),
          phase: this.assignPhase(costItem.category, priority),
          included: priority === 'must',
          completed: false
        }
        
        items.push(scopeItem)
      })
    })
    
    return items
  }
  
  /**
   * Get room-specific scope generation rules
   */
  private static getRoomScopeRules(roomId: string, condition: string): Array<{
    searchTerms: string[]
    quantity?: number
    priority: 'must' | 'should' | 'could' | 'nice'
    reason?: string
    complexity?: 'simple' | 'moderate' | 'complex'
    roiMultiplier?: number
    dependsOn?: string[]
  }> {
    const rules: any[] = []
    
    // Kitchen-specific rules
    if (roomId.includes('kitchen')) {
      if (condition === 'poor' || condition === 'terrible') {
        rules.push(
          {
            searchTerms: ['kitchen cabinet', 'cabinet replacement'],
            quantity: 15, // 15 linear feet average
            priority: 'should',
            reason: 'Poor kitchen condition requires cabinet upgrade',
            complexity: 'complex',
            roiMultiplier: 1.2
          },
          {
            searchTerms: ['countertop', 'granite', 'quartz'],
            quantity: 40, // 40 sq ft average
            priority: 'should',
            reason: 'Countertop replacement for kitchen renovation',
            roiMultiplier: 1.1
          }
        )
      }
      
      if (condition === 'fair' || condition === 'poor') {
        rules.push({
          searchTerms: ['paint interior'],
          quantity: 200, // sq ft
          priority: 'could',
          reason: 'Kitchen walls need refreshing'
        })
      }
    }
    
    // Bathroom-specific rules
    if (roomId.includes('bath')) {
      if (condition === 'poor' || condition === 'terrible') {
        rules.push(
          {
            searchTerms: ['bathroom vanity', 'vanity replacement'],
            quantity: 1,
            priority: 'should',
            reason: 'Poor bathroom condition requires vanity upgrade',
            roiMultiplier: 1.1
          },
          {
            searchTerms: ['tile installation', 'shower tile'],
            quantity: 50, // sq ft
            priority: 'could',
            reason: 'Bathroom tile refresh'
          }
        )
      }
    }
    
    // Living areas
    if (roomId.includes('living') || roomId.includes('bedroom')) {
      if (condition === 'poor' || condition === 'fair') {
        rules.push(
          {
            searchTerms: ['paint interior'],
            quantity: 300, // sq ft
            priority: condition === 'poor' ? 'should' : 'could',
            reason: 'Room needs paint refresh'
          },
          {
            searchTerms: ['flooring', 'luxury vinyl plank'],
            quantity: 200, // sq ft
            priority: condition === 'poor' ? 'should' : 'nice',
            reason: 'Flooring upgrade needed',
            roiMultiplier: 0.9
          }
        )
      }
    }
    
    return rules
  }
  
  /**
   * Get search terms for component-specific items
   */
  private static getComponentSearchTerms(componentId: string, roomId: string, action: string): string[] {
    const componentMap: Record<string, string[]> = {
      'cabinets': ['cabinet', 'kitchen cabinet'],
      'countertops': ['countertop', 'granite', 'quartz'],
      'appliances': ['appliance'], // Note: our database doesn't have appliances yet
      'flooring': ['flooring', 'luxury vinyl plank', 'hardwood'],
      'lighting': ['lighting', 'electrical'],
      'paint': ['paint interior'],
      'plumbing': ['plumbing', 'water heater'],
      'electrical': ['electrical', 'outlet'],
      'hvac': ['hvac', 'air unit'],
      'windows': ['window replacement'],
      'doors': ['door'],
      'tile': ['tile installation', 'ceramic tile'],
      'vanity': ['bathroom vanity'],
      'shower': ['shower tile', 'tile installation'],
      'toilet': ['toilet replacement']
    }
    
    return componentMap[componentId] || [componentId]
  }
  
  /**
   * Find matching cost items from database
   */
  private static findMatchingCostItems(searchTerms: string[]) {
    const allMatches = searchTerms.flatMap(term => searchCostItems(term))
    
    // Remove duplicates and return top matches
    const uniqueMatches = allMatches.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    )
    
    return uniqueMatches.slice(0, 2) // Return top 2 matches per search
  }
  
  /**
   * Remove duplicate items and prioritize
   */
  private static deduplicateAndPrioritize(items: ScopeItem[]): ScopeItem[] {
    const uniqueItems = new Map<string, ScopeItem>()
    
    items.forEach(item => {
      const key = `${item.category}-${item.itemName}-${item.location}`
      const existing = uniqueItems.get(key)
      
      if (!existing || this.getPriorityWeight(item.priority) > this.getPriorityWeight(existing.priority)) {
        uniqueItems.set(key, item)
      }
    })
    
    return Array.from(uniqueItems.values()).sort((a, b) => 
      this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
    )
  }
  
  /**
   * Helper functions
   */
  private static getRoomDisplayName(roomId: string): string {
    const roomNames: Record<string, string> = {
      'kitchen-main': 'Kitchen',
      'bathroom-master': 'Master Bathroom',
      'bathroom-guest': 'Guest Bathroom',
      'bedroom-master': 'Master Bedroom',
      'bedroom-2': 'Bedroom 2',
      'bedroom-3': 'Bedroom 3',
      'living-room': 'Living Room',
      'dining-room': 'Dining Room',
      'garage': 'Garage',
      'basement': 'Basement'
    }
    
    return roomNames[roomId] || roomId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  private static getComponentDisplayName(componentId: string): string {
    return componentId.charAt(0).toUpperCase() + componentId.slice(1).replace(/([A-Z])/g, ' $1')
  }
  
  private static mapConditionToUrgency(condition: string): 'low' | 'medium' | 'high' {
    if (condition === 'terrible') return 'high'
    if (condition === 'poor') return 'medium'
    return 'low'
  }
  
  private static mapActionToPriority(action: string, roomCondition: string): 'must' | 'should' | 'could' | 'nice' {
    if (action === 'replace' && (roomCondition === 'poor' || roomCondition === 'terrible')) return 'must'
    if (action === 'replace') return 'should'
    if (action === 'upgrade') return 'could'
    return 'nice'
  }
  
  private static getComponentQuantity(componentId: string, roomId: string): number {
    const quantities: Record<string, number> = {
      'cabinets': 15, // linear feet
      'countertops': 40, // sq ft
      'flooring': 200, // sq ft
      'paint': 300, // sq ft
      'tile': 50, // sq ft
      'lighting': 3, // fixtures
      'outlets': 4, // outlets
      'windows': 2, // windows
      'doors': 1 // door
    }
    
    return quantities[componentId] || 1
  }
  
  private static getComponentComplexity(componentId: string): 'simple' | 'moderate' | 'complex' {
    const complexity: Record<string, 'simple' | 'moderate' | 'complex'> = {
      'paint': 'simple',
      'lighting': 'simple',
      'flooring': 'moderate',
      'tile': 'moderate',
      'cabinets': 'complex',
      'countertops': 'moderate',
      'plumbing': 'complex',
      'electrical': 'complex',
      'hvac': 'complex'
    }
    
    return complexity[componentId] || 'moderate'
  }
  
  private static calculateROIImpact(category: string, condition: string, multiplier: number = 1.0): number {
    const baseROI: Record<string, number> = {
      'interior': 8,
      'exterior': 12,
      'systems': 6,
      'structural': 10
    }
    
    const conditionMultiplier = condition === 'poor' ? 1.2 : condition === 'terrible' ? 1.4 : 1.0
    return (baseROI[category] || 8) * conditionMultiplier * multiplier
  }
  
  private static calculateComponentROI(componentId: string, action: string, roomId: string): number {
    const componentROI: Record<string, number> = {
      'cabinets': 15,
      'countertops': 12,
      'flooring': 10,
      'paint': 8,
      'lighting': 6,
      'tile': 9,
      'vanity': 11,
      'appliances': 8
    }
    
    const actionMultiplier = action === 'replace' ? 1.2 : action === 'upgrade' ? 1.4 : 0.8
    const kitchenBonus = roomId.includes('kitchen') ? 1.1 : 1.0
    
    return (componentROI[componentId] || 7) * actionMultiplier * kitchenBonus
  }
  
  private static getComponentDependencies(componentId: string, action: string): string[] {
    const dependencies: Record<string, string[]> = {
      'countertops': ['cabinets'],
      'tile': ['plumbing'],
      'flooring': ['paint'],
      'lighting': ['electrical']
    }
    
    return dependencies[componentId] || []
  }
  
  private static assignPhase(category: string, priority: string): number {
    if (priority === 'must') return 1
    
    const phaseMap: Record<string, number> = {
      'structural': 1,
      'systems': 2,
      'interior': 3,
      'exterior': 4
    }
    
    return phaseMap[category] || 3
  }
  
  private static getPriorityWeight(priority: string): number {
    const weights = { 'must': 4, 'should': 3, 'could': 2, 'nice': 1 }
    return weights[priority as keyof typeof weights] || 1
  }
}
