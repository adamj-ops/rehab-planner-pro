// Cost Calculation Types
export interface BaseCostItem {
  id: string
  category: string
  subcategory: string
  itemName: string
  description?: string
  basePrice: number
  unit: string
  laborHours: number
  materialRatio: number // 0.0 to 1.0 (percentage that is materials vs labor)
  difficultyMultiplier: number
  lastUpdated: Date
}

export interface RegionalMultipliers {
  zipCode: string
  metroArea: string
  state: string
  costOfLivingIndex: number
  laborMultiplier: number
  materialMultiplier: number
  permitBaseCost: number
  inspectionBaseCost: number
  lastUpdated: Date
}

export interface MarketConditions {
  region: string
  conditionDate: Date
  materialShortagesFactor: number
  laborAvailabilityFactor: number
  seasonalFactor: number
  inflationFactor: number
  permitDelayFactor: number
}

export interface QualityTier {
  name: 'budget' | 'standard' | 'premium' | 'luxury'
  materials: number
  labor: number
  timeline: number
  roiImpact: number
}

export interface CostCalculationInput {
  item: BaseCostItem
  quantity: number
  qualityTier: QualityTier['name']
  location: {
    zipCode: string
    state: string
  }
  projectConditions?: {
    urgency: 'low' | 'medium' | 'high'
    complexity: 'simple' | 'moderate' | 'complex'
    accessibility: 'easy' | 'moderate' | 'difficult'
  }
}

export interface CostCalculationResult {
  itemId: string
  itemName: string
  quantity: number
  unit: string
  
  // Cost breakdown
  baseCost: number
  materialCost: number
  laborCost: number
  totalCost: number
  
  // Applied factors
  regionalMultiplier: number
  qualityMultiplier: number
  marketAdjustment: number
  
  // Estimates
  timelineEstimate: number // in days
  confidenceLevel: number // 0.0 to 1.0
  costRange: {
    min: number
    max: number
  }
  
  // Metadata
  calculatedAt: Date
  factors: {
    difficulty: number
    regional: number
    market: number
    quality: number
  }
}

export interface CostCategory {
  id: string
  name: string
  description: string
  subcategories: string[]
}

// Predefined cost categories
export const COST_CATEGORIES: CostCategory[] = [
  {
    id: 'exterior',
    name: 'Exterior',
    description: 'External building improvements',
    subcategories: ['roofing', 'siding', 'windows', 'doors', 'landscaping', 'driveway', 'fencing']
  },
  {
    id: 'interior',
    name: 'Interior',
    description: 'Internal space improvements',
    subcategories: ['kitchen', 'bathroom', 'flooring', 'paint', 'lighting', 'trim', 'stairs']
  },
  {
    id: 'systems',
    name: 'Systems',
    description: 'Mechanical and electrical systems',
    subcategories: ['hvac', 'electrical', 'plumbing', 'security', 'smart_home']
  },
  {
    id: 'structural',
    name: 'Structural',
    description: 'Foundation and framing work',
    subcategories: ['foundation', 'framing', 'insulation', 'drywall', 'demo']
  }
]

// Quality tier definitions
export const QUALITY_TIERS: Record<QualityTier['name'], QualityTier> = {
  budget: {
    name: 'budget',
    materials: 0.75,
    labor: 0.85,
    timeline: 0.9,
    roiImpact: 0.6
  },
  standard: {
    name: 'standard',
    materials: 1.0,
    labor: 1.0,
    timeline: 1.0,
    roiImpact: 1.0
  },
  premium: {
    name: 'premium',
    materials: 1.5,
    labor: 1.2,
    timeline: 1.1,
    roiImpact: 1.4
  },
  luxury: {
    name: 'luxury',
    materials: 2.2,
    labor: 1.5,
    timeline: 1.3,
    roiImpact: 1.8
  }
}
