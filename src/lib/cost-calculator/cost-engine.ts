import { 
  CostCalculationInput, 
  CostCalculationResult, 
  QUALITY_TIERS,
  MarketConditions 
} from './types'
import { getCostItemById } from './base-cost-database'
import { getRegionalMultipliersByZip, getStateAverage } from './regional-data'

/**
 * Main cost calculation engine
 * This is the core algorithm that combines all factors to produce accurate cost estimates
 */
export class CostCalculationEngine {
  
  /**
   * Calculate cost for a single item with all applicable factors
   */
  static calculateItemCost(input: CostCalculationInput): CostCalculationResult {
    const { item, quantity, qualityTier, location, projectConditions } = input
    
    // Get base cost breakdown
    const baseCost = item.basePrice * quantity
    const materialCost = baseCost * item.materialRatio
    const laborCost = baseCost * (1 - item.materialRatio)
    
    // Apply regional multipliers
    const regionalData = getRegionalMultipliersByZip(location.zipCode)
    if (regionalData.zipCode === '00000') {
      // Fallback to state average if zip not found
      const stateAverage = getStateAverage(location.state)
      regionalData.laborMultiplier = stateAverage.laborMultiplier || 1.0
      regionalData.materialMultiplier = stateAverage.materialMultiplier || 1.0
    }
    
    // Apply quality tier multipliers
    const qualityMultipliers = QUALITY_TIERS[qualityTier]
    
    // Apply difficulty multiplier
    const difficultyFactor = item.difficultyMultiplier
    
    // Apply project condition multipliers
    const conditionMultipliers = this.calculateConditionMultipliers(projectConditions)
    
    // Calculate final costs
    const adjustedMaterialCost = materialCost * 
      regionalData.materialMultiplier * 
      qualityMultipliers.materials
      
    const adjustedLaborCost = laborCost * 
      regionalData.laborMultiplier * 
      qualityMultipliers.labor * 
      difficultyFactor * 
      conditionMultipliers.complexity * 
      conditionMultipliers.accessibility * 
      conditionMultipliers.urgency
    
    const totalCost = adjustedMaterialCost + adjustedLaborCost
    
    // Calculate timeline estimate
    const baseTimelineHours = item.laborHours * quantity
    const timelineMultiplier = qualityMultipliers.timeline * 
      conditionMultipliers.complexity * 
      conditionMultipliers.accessibility
    const timelineEstimate = Math.ceil((baseTimelineHours * timelineMultiplier) / 8) // Convert to days
    
    // Calculate confidence level based on data quality
    const confidenceLevel = this.calculateConfidenceLevel(item, regionalData, qualityTier)
    
    // Calculate cost range (±15% for standard confidence)
    const variance = 0.15 * (1 - confidenceLevel) + 0.05 // Min 5% variance
    const costRange = {
      min: Math.round(totalCost * (1 - variance)),
      max: Math.round(totalCost * (1 + variance))
    }
    
    return {
      itemId: item.id,
      itemName: item.itemName,
      quantity,
      unit: item.unit,
      baseCost,
      materialCost: Math.round(adjustedMaterialCost),
      laborCost: Math.round(adjustedLaborCost),
      totalCost: Math.round(totalCost),
      regionalMultiplier: regionalData.laborMultiplier,
      qualityMultiplier: qualityMultipliers.materials,
      marketAdjustment: 1.0, // TODO: Implement market conditions
      timelineEstimate,
      confidenceLevel,
      costRange,
      calculatedAt: new Date(),
      factors: {
        difficulty: difficultyFactor,
        regional: regionalData.laborMultiplier,
        market: 1.0, // TODO: Implement market conditions
        quality: qualityMultipliers.materials
      }
    }
  }
  
  /**
   * Calculate multiple items and provide project-level summary
   */
  static calculateProjectCosts(inputs: CostCalculationInput[]): {
    items: CostCalculationResult[]
    summary: {
      totalMaterialCost: number
      totalLaborCost: number
      totalCost: number
      totalTimeline: number
      averageConfidence: number
      costRange: { min: number; max: number }
    }
  } {
    const items = inputs.map(input => this.calculateItemCost(input))
    
    const summary = {
      totalMaterialCost: items.reduce((sum, item) => sum + item.materialCost, 0),
      totalLaborCost: items.reduce((sum, item) => sum + item.laborCost, 0),
      totalCost: items.reduce((sum, item) => sum + item.totalCost, 0),
      totalTimeline: Math.max(...items.map(item => item.timelineEstimate)),
      averageConfidence: items.reduce((sum, item) => sum + item.confidenceLevel, 0) / items.length,
      costRange: {
        min: items.reduce((sum, item) => sum + item.costRange.min, 0),
        max: items.reduce((sum, item) => sum + item.costRange.max, 0)
      }
    }
    
    return { items, summary }
  }
  
  /**
   * Calculate condition-based multipliers
   */
  private static calculateConditionMultipliers(conditions?: CostCalculationInput['projectConditions']) {
    if (!conditions) {
      return {
        urgency: 1.0,
        complexity: 1.0,
        accessibility: 1.0
      }
    }
    
    const urgencyMultipliers = {
      low: 0.95,
      medium: 1.0,
      high: 1.25
    }
    
    const complexityMultipliers = {
      simple: 0.9,
      moderate: 1.0,
      complex: 1.3
    }
    
    const accessibilityMultipliers = {
      easy: 1.0,
      moderate: 1.1,
      difficult: 1.4
    }
    
    return {
      urgency: urgencyMultipliers[conditions.urgency],
      complexity: complexityMultipliers[conditions.complexity],
      accessibility: accessibilityMultipliers[conditions.accessibility]
    }
  }
  
  /**
   * Calculate confidence level based on data quality and factors
   */
  private static calculateConfidenceLevel(item: any, regionalData: any, qualityTier: string): number {
    let confidence = 0.8 // Base confidence
    
    // Adjust based on data freshness
    const daysSinceUpdate = Math.floor((Date.now() - item.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceUpdate < 30) confidence += 0.1
    else if (daysSinceUpdate > 90) confidence -= 0.1
    
    // Adjust based on regional data availability
    if (regionalData.zipCode !== '00000') confidence += 0.05
    else confidence -= 0.1
    
    // Adjust based on quality tier (standard has highest confidence)
    if (qualityTier === 'standard') confidence += 0.05
    else if (qualityTier === 'luxury' || qualityTier === 'budget') confidence -= 0.05
    
    // Clamp between 0.5 and 0.95
    return Math.max(0.5, Math.min(0.95, confidence))
  }
  
  /**
   * Apply market conditions to cost calculation
   * TODO: Implement when market conditions data is available
   */
  static applyMarketConditions(baseCost: number, conditions: MarketConditions): number {
    let adjustedCost = baseCost
    
    // Apply market factors
    adjustedCost *= conditions.materialShortagesFactor
    adjustedCost *= conditions.laborAvailabilityFactor
    adjustedCost *= conditions.seasonalFactor
    adjustedCost *= conditions.inflationFactor
    adjustedCost *= conditions.permitDelayFactor
    
    return adjustedCost
  }
  
  /**
   * Get cost estimate for common renovation packages
   */
  static getPackageEstimate(packageType: 'kitchen' | 'bathroom' | 'full_house', 
                           squareFeet: number, 
                           qualityTier: keyof typeof QUALITY_TIERS,
                           location: { zipCode: string; state: string }): CostCalculationResult {
    
    const packages = {
      kitchen: {
        basePrice: 150, // per sq ft
        laborHours: 2.0,
        materialRatio: 0.65,
        difficultyMultiplier: 1.2
      },
      bathroom: {
        basePrice: 200, // per sq ft
        laborHours: 2.5,
        materialRatio: 0.60,
        difficultyMultiplier: 1.3
      },
      full_house: {
        basePrice: 75, // per sq ft
        laborHours: 1.0,
        materialRatio: 0.55,
        difficultyMultiplier: 1.1
      }
    }
    
    const packageData = packages[packageType]
    const mockItem = {
      id: `package-${packageType}`,
      category: 'package',
      subcategory: packageType,
      itemName: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Renovation Package`,
      basePrice: packageData.basePrice,
      unit: 'sq ft',
      laborHours: packageData.laborHours,
      materialRatio: packageData.materialRatio,
      difficultyMultiplier: packageData.difficultyMultiplier,
      lastUpdated: new Date()
    }
    
    return this.calculateItemCost({
      item: mockItem,
      quantity: squareFeet,
      qualityTier,
      location
    })
  }
}

/**
 * Utility functions for cost calculations
 */
export class CostUtils {
  
  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  /**
   * Calculate cost per square foot
   */
  static calculateCostPerSqFt(totalCost: number, squareFeet: number): number {
    return Math.round((totalCost / squareFeet) * 100) / 100
  }
  
  /**
   * Calculate ROI impact
   */
  static calculateROIImpact(cost: number, addedValue: number): number {
    return Math.round(((addedValue - cost) / cost) * 100)
  }
  
  /**
   * Get cost category for budgeting
   */
  static getCostCategory(costPerSqFt: number): 'budget' | 'moderate' | 'high' | 'luxury' {
    if (costPerSqFt < 50) return 'budget'
    if (costPerSqFt < 100) return 'moderate'
    if (costPerSqFt < 200) return 'high'
    return 'luxury'
  }
  
  /**
   * Calculate financing costs
   */
  static calculateFinancingCost(principal: number, rate: number, termMonths: number): {
    monthlyPayment: number
    totalInterest: number
    totalCost: number
  } {
    const monthlyRate = rate / 12 / 100
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1)
    const totalCost = monthlyPayment * termMonths
    const totalInterest = totalCost - principal
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost)
    }
  }
}
