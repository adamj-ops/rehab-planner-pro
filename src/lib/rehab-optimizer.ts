import { ScopeItem } from '@/types/rehab'

interface OptimizationParams {
  assessments: any
  strategy: string
  targetBuyer: string
  maxBudget: number
  marketComps?: any[]
}

export async function generateSmartScope(params: OptimizationParams): Promise<ScopeItem[]> {
  const { assessments, strategy, targetBuyer, maxBudget, marketComps } = params
  
  // Base scope items based on condition assessments
  const scopeItems: ScopeItem[] = []
  
  // Analyze each room assessment
  Object.entries(assessments).forEach(([roomId, assessment]: [string, any]) => {
    const roomItems = generateRoomScope(roomId, assessment, strategy, targetBuyer)
    scopeItems.push(...roomItems)
  })
  
  // Apply market intelligence
  if (marketComps && marketComps.length > 0) {
    applyMarketIntelligence(scopeItems, marketComps)
  }
  
  // Optimize for budget
  optimizeForBudget(scopeItems, maxBudget)
  
  // Set phases and dependencies
  setProjectPhases(scopeItems)
  
  return scopeItems
}

function generateRoomScope(
  roomId: string, 
  assessment: any, 
  strategy: string, 
  targetBuyer: string
): ScopeItem[] {
  const items: ScopeItem[] = []
  const roomCondition = assessment.condition
  
  // Kitchen-specific logic
  if (roomId === 'kitchen') {
    if (roomCondition === 'poor' || roomCondition === 'terrible') {
      items.push({
        id: `${roomId}_full_remodel`,
        projectId: '',
        category: 'Kitchen',
        itemName: 'Full Kitchen Remodel',
        description: 'Complete kitchen renovation with new cabinets, countertops, and appliances',
        quantity: 1,
        unitOfMeasure: 'each',
        materialCost: 12000,
        laborCost: 8000,
        totalCost: 20000,
        priority: strategy === 'flip' ? 'must' : 'should',
        roiImpact: 15,
        daysRequired: 14,
        dependsOn: [],
        phase: 2,
        included: true,
        completed: false
      })
    } else if (roomCondition === 'fair') {
      items.push({
        id: `${roomId}_refresh`,
        projectId: '',
        category: 'Kitchen',
        itemName: 'Kitchen Refresh',
        description: 'Paint cabinets, new hardware, and countertop replacement',
        quantity: 1,
        unitOfMeasure: 'each',
        materialCost: 3000,
        laborCost: 2000,
        totalCost: 5000,
        priority: 'should',
        roiImpact: 8,
        daysRequired: 5,
        dependsOn: [],
        phase: 2,
        included: true,
        completed: false
      })
    }
    
    // Add appliances if needed
    if (assessment.components?.appliances?.needsWork) {
      items.push({
        id: `${roomId}_appliances`,
        projectId: '',
        category: 'Kitchen',
        itemName: 'Appliance Package',
        description: 'New stainless steel appliances',
        quantity: 1,
        unitOfMeasure: 'set',
        materialCost: 3500,
        laborCost: 500,
        totalCost: 4000,
        priority: targetBuyer === 'first_time' ? 'should' : 'must',
        roiImpact: 5,
        daysRequired: 1,
        dependsOn: [`${roomId}_full_remodel`],
        phase: 2,
        included: true,
        completed: false
      })
    }
  }
  
  // Bathroom logic
  if (roomId.includes('bath')) {
    if (roomCondition === 'poor' || roomCondition === 'terrible') {
      items.push({
        id: `${roomId}_full_remodel`,
        projectId: '',
        category: 'Bathroom',
        itemName: `${roomId.includes('master') ? 'Master' : 'Guest'} Bath Remodel`,
        description: 'Complete bathroom renovation',
        quantity: 1,
        unitOfMeasure: 'each',
        materialCost: roomId.includes('master') ? 8000 : 5000,
        laborCost: roomId.includes('master') ? 7000 : 3000,
        totalCost: roomId.includes('master') ? 15000 : 8000,
        priority: 'must',
        roiImpact: 10,
        daysRequired: 7,
        dependsOn: [],
        phase: 2,
        included: true,
        completed: false
      })
    }
  }
  
  // Flooring for all rooms
  if (assessment.components?.flooring?.needsWork) {
    const sqft = getRoomSquareFootage(roomId)
    items.push({
      id: `${roomId}_flooring`,
      projectId: '',
      category: 'Flooring',
      itemName: `${getRoomName(roomId)} Flooring`,
      description: strategy === 'flip' ? 'LVP installation' : 'Carpet replacement',
      quantity: sqft,
      unitOfMeasure: 'sqft',
      materialCost: sqft * 3,
      laborCost: sqft * 4,
      totalCost: sqft * 7,
      priority: 'should',
      roiImpact: 3,
      daysRequired: 2,
      dependsOn: [],
      phase: 3,
      included: roomCondition !== 'excellent',
      completed: false
    })
  }
  
  // Paint for all rooms
  if (roomCondition !== 'excellent' && roomCondition !== 'good') {
    const sqft = getRoomSquareFootage(roomId) * 3 // walls and ceiling
    items.push({
      id: `${roomId}_paint`,
      projectId: '',
      category: 'Paint',
      itemName: `${getRoomName(roomId)} Paint`,
      description: 'Walls and ceiling paint',
      quantity: sqft,
      unitOfMeasure: 'sqft',
      materialCost: sqft * 0.5,
      laborCost: sqft * 1.5,
      totalCost: sqft * 2,
      priority: 'should',
      roiImpact: 2,
      daysRequired: 1,
      dependsOn: [`${roomId}_flooring`],
      phase: 4,
      included: true,
      completed: false
    })
  }
  
  return items
}

function applyMarketIntelligence(items: ScopeItem[], comps: any[]) {
  // Analyze what features successful comps have
  const compFeatures = analyzeCompFeatures(comps)
  
  // Boost ROI for items that match successful comp features
  items.forEach(item => {
    if (compFeatures.premiumKitchen && item.category === 'Kitchen') {
      item.roiImpact *= 1.2
      item.priority = 'must'
    }
    
    if (compFeatures.luxuryBath && item.category === 'Bathroom' && item.itemName.includes('Master')) {
      item.roiImpact *= 1.3
      item.priority = 'must'
    }
  })
}

function optimizeForBudget(items: ScopeItem[], maxBudget: number) {
  // Sort by ROI efficiency (ROI per dollar)
  items.sort((a, b) => {
    const aEfficiency = a.roiImpact / a.totalCost
    const bEfficiency = b.roiImpact / b.totalCost
    return bEfficiency - aEfficiency
  })
  
  // Greedy algorithm to maximize ROI within budget
  let currentBudget = 0
  items.forEach(item => {
    if (currentBudget + item.totalCost <= maxBudget) {
      item.included = true
      currentBudget += item.totalCost
    } else if (item.priority === 'must') {
      // Force include must-haves
      item.included = true
      currentBudget += item.totalCost
    } else {
      item.included = false
    }
  })
}

function setProjectPhases(items: ScopeItem[]) {
  // Phase 1: Structural and safety
  // Phase 2: Major renovations (kitchen, bath)
  // Phase 3: Flooring
  // Phase 4: Paint and cosmetics
  // Phase 5: Final touches
  
  items.forEach(item => {
    if (item.category === 'Structural' || item.category === 'Safety') {
      item.phase = 1
    } else if (item.category === 'Kitchen' || item.category === 'Bathroom') {
      item.phase = 2
    } else if (item.category === 'Flooring') {
      item.phase = 3
    } else if (item.category === 'Paint') {
      item.phase = 4
    } else {
      item.phase = 5
    }
  })
}

// Helper functions
function getRoomSquareFootage(roomId: string): number {
  const averageSizes: Record<string, number> = {
    'living': 250,
    'kitchen': 200,
    'master_bed': 200,
    'master_bath': 100,
    'bedroom2': 150,
    'bedroom3': 120,
    'bathroom2': 50,
    'basement': 800,
    'garage': 400,
    'exterior': 0
  }
  return averageSizes[roomId] || 150
}

function getRoomName(roomId: string): string {
  const names: Record<string, string> = {
    'living': 'Living Room',
    'kitchen': 'Kitchen',
    'master_bed': 'Master Bedroom',
    'master_bath': 'Master Bath',
    'bedroom2': 'Bedroom 2',
    'bedroom3': 'Bedroom 3',
    'bathroom2': 'Bathroom 2',
    'basement': 'Basement',
    'garage': 'Garage',
    'exterior': 'Exterior'
  }
  return names[roomId] || roomId
}

function analyzeCompFeatures(comps: any[]) {
  // Analyze comparable properties to identify valuable features
  const features = {
    premiumKitchen: false,
    luxuryBath: false,
    hardwoodFloors: false,
    finishedBasement: false
  }
  
  // Simple analysis - in production, use more sophisticated ML
  const avgPrice = comps.reduce((sum, c) => sum + c.salePrice, 0) / comps.length
  const premiumComps = comps.filter(c => c.salePrice > avgPrice * 1.1)
  
  if (premiumComps.length > 0) {
    features.premiumKitchen = premiumComps.some(c => 
      c.features?.kitchen === 'updated' || c.features?.kitchen === 'premium'
    )
    features.luxuryBath = premiumComps.some(c => 
      c.features?.masterBath === 'luxury' || c.features?.masterBath === 'spa'
    )
  }
  
  return features
}
