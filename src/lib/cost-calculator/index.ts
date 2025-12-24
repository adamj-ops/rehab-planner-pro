// Cost Calculator Module - Main Export
export * from './types'
export * from './base-cost-database'
export * from './regional-data'
export * from './cost-engine'
export * from './scope-integration'

// Re-export commonly used functions for easy access
export { 
  CostCalculationEngine,
  CostUtils 
} from './cost-engine'

export {
  ScopeIntegration
} from './scope-integration'

export {
  getCostItemById,
  getCostItemsByCategory,
  getCostItemsBySubcategory,
  searchCostItems,
  getAllCategories,
  getSubcategoriesByCategory
} from './base-cost-database'

export {
  getRegionalMultipliersByZip,
  getRegionalMultipliersByState,
  getStateAverage
} from './regional-data'

export {
  COST_CATEGORIES,
  QUALITY_TIERS
} from './types'
