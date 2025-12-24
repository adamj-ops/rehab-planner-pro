import { CostCalculationEngine, getCostItemById, CostUtils } from './index'

/**
 * Demo function showing how to use the cost calculation framework
 */
export function runCostCalculationDemo() {
  console.log('🏗️ Cost Calculation Framework Demo')
  console.log('=====================================')
  
  // Example 1: Kitchen cabinet cost in San Francisco vs Cleveland
  const kitchenCabinet = getCostItemById('kitchen-001')!
  
  const sfCost = CostCalculationEngine.calculateItemCost({
    item: kitchenCabinet,
    quantity: 20, // 20 linear feet
    qualityTier: 'premium',
    location: { zipCode: '94102', state: 'CA' }
  })
  
  const clevelandCost = CostCalculationEngine.calculateItemCost({
    item: kitchenCabinet,
    quantity: 20, // 20 linear feet
    qualityTier: 'premium',
    location: { zipCode: '44101', state: 'OH' }
  })
  
  console.log('\n📊 Kitchen Cabinet Comparison (20 linear feet, Premium quality):')
  console.log(`San Francisco: ${CostUtils.formatCurrency(sfCost.totalCost)}`)
  console.log(`Cleveland: ${CostUtils.formatCurrency(clevelandCost.totalCost)}`)
  console.log(`Difference: ${CostUtils.formatCurrency(sfCost.totalCost - clevelandCost.totalCost)} (${Math.round((sfCost.totalCost / clevelandCost.totalCost - 1) * 100)}% higher)`)
  
  // Example 2: Quality tier comparison for bathroom renovation
  const bathroomVanity = getCostItemById('bathroom-001')!
  
  const budgetBathroom = CostCalculationEngine.calculateItemCost({
    item: bathroomVanity,
    quantity: 1,
    qualityTier: 'budget',
    location: { zipCode: '75201', state: 'TX' }
  })
  
  const luxuryBathroom = CostCalculationEngine.calculateItemCost({
    item: bathroomVanity,
    quantity: 1,
    qualityTier: 'luxury',
    location: { zipCode: '75201', state: 'TX' }
  })
  
  console.log('\n🛁 Bathroom Vanity Quality Comparison (Dallas, TX):')
  console.log(`Budget: ${CostUtils.formatCurrency(budgetBathroom.totalCost)}`)
  console.log(`Luxury: ${CostUtils.formatCurrency(luxuryBathroom.totalCost)}`)
  console.log(`Luxury Premium: ${CostUtils.formatCurrency(luxuryBathroom.totalCost - budgetBathroom.totalCost)}`)
  
  // Example 3: Full project calculation
  const projectItems = [
    { itemId: 'kitchen-001', quantity: 15 }, // Kitchen cabinets
    { itemId: 'kitchen-002', quantity: 40 }, // Granite countertops
    { itemId: 'flooring-001', quantity: 300 }, // LVP flooring
    { itemId: 'paint-001', quantity: 800 }, // Interior paint
    { itemId: 'bathroom-001', quantity: 2 } // Bathroom vanities
  ]
  
  const projectInputs = projectItems.map(item => ({
    item: getCostItemById(item.itemId)!,
    quantity: item.quantity,
    qualityTier: 'standard' as const,
    location: { zipCode: '30301', state: 'GA' }
  }))
  
  const projectResult = CostCalculationEngine.calculateProjectCosts(projectInputs)
  
  console.log('\n🏠 Sample Project Cost (Atlanta, GA - Standard Quality):')
  console.log(`Material Cost: ${CostUtils.formatCurrency(projectResult.summary.totalMaterialCost)}`)
  console.log(`Labor Cost: ${CostUtils.formatCurrency(projectResult.summary.totalLaborCost)}`)
  console.log(`Total Cost: ${CostUtils.formatCurrency(projectResult.summary.totalCost)}`)
  console.log(`Timeline: ${projectResult.summary.totalTimeline} days`)
  console.log(`Confidence: ${Math.round(projectResult.summary.averageConfidence * 100)}%`)
  console.log(`Cost Range: ${CostUtils.formatCurrency(projectResult.summary.costRange.min)} - ${CostUtils.formatCurrency(projectResult.summary.costRange.max)}`)
  
  // Example 4: Package estimates
  console.log('\n📦 Package Estimates (1,500 sq ft house):')
  
  const kitchenPackage = CostCalculationEngine.getPackageEstimate(
    'kitchen', 200, 'standard', { zipCode: '78701', state: 'TX' }
  )
  
  const fullHousePackage = CostCalculationEngine.getPackageEstimate(
    'full_house', 1500, 'standard', { zipCode: '78701', state: 'TX' }
  )
  
  console.log(`Kitchen Renovation (200 sq ft): ${CostUtils.formatCurrency(kitchenPackage.totalCost)}`)
  console.log(`Full House Renovation (1,500 sq ft): ${CostUtils.formatCurrency(fullHousePackage.totalCost)}`)
  console.log(`Cost per sq ft: ${CostUtils.formatCurrency(fullHousePackage.totalCost / 1500)}`)
  
  return {
    sfCost,
    clevelandCost,
    budgetBathroom,
    luxuryBathroom,
    projectResult,
    kitchenPackage,
    fullHousePackage
  }
}

// Export for testing
export { runCostCalculationDemo }
