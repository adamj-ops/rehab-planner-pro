import { BaseCostItem } from './types'

// Sample base cost database - in production this would come from Supabase
export const BASE_COST_DATABASE: BaseCostItem[] = [
  // EXTERIOR - ROOFING
  {
    id: 'roof-001',
    category: 'exterior',
    subcategory: 'roofing',
    itemName: 'Asphalt Shingle Roof Replacement',
    description: 'Complete tear-off and replacement with architectural shingles',
    basePrice: 350,
    unit: 'sq ft',
    laborHours: 0.5,
    materialRatio: 0.65,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'roof-002',
    category: 'exterior',
    subcategory: 'roofing',
    itemName: 'Metal Roof Installation',
    description: 'Standing seam metal roofing system',
    basePrice: 850,
    unit: 'sq ft',
    laborHours: 0.7,
    materialRatio: 0.70,
    difficultyMultiplier: 1.5,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'roof-003',
    category: 'exterior',
    subcategory: 'roofing',
    itemName: 'Roof Repair - Minor',
    description: 'Patch work and minor leak repairs',
    basePrice: 25,
    unit: 'sq ft',
    laborHours: 0.3,
    materialRatio: 0.40,
    difficultyMultiplier: 0.8,
    lastUpdated: new Date('2024-12-01')
  },

  // EXTERIOR - SIDING
  {
    id: 'siding-001',
    category: 'exterior',
    subcategory: 'siding',
    itemName: 'Vinyl Siding Installation',
    description: 'Complete vinyl siding with house wrap',
    basePrice: 450,
    unit: 'sq ft',
    laborHours: 0.4,
    materialRatio: 0.60,
    difficultyMultiplier: 1.0,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'siding-002',
    category: 'exterior',
    subcategory: 'siding',
    itemName: 'Fiber Cement Siding',
    description: 'Hardie board or similar fiber cement siding',
    basePrice: 750,
    unit: 'sq ft',
    laborHours: 0.6,
    materialRatio: 0.65,
    difficultyMultiplier: 1.3,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'siding-003',
    category: 'exterior',
    subcategory: 'siding',
    itemName: 'Wood Siding Installation',
    description: 'Cedar or pine wood siding with stain/paint',
    basePrice: 850,
    unit: 'sq ft',
    laborHours: 0.8,
    materialRatio: 0.55,
    difficultyMultiplier: 1.4,
    lastUpdated: new Date('2024-12-01')
  },

  // EXTERIOR - WINDOWS
  {
    id: 'windows-001',
    category: 'exterior',
    subcategory: 'windows',
    itemName: 'Standard Window Replacement',
    description: 'Double-hung vinyl windows with installation',
    basePrice: 450,
    unit: 'each',
    laborHours: 3.0,
    materialRatio: 0.75,
    difficultyMultiplier: 1.0,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'windows-002',
    category: 'exterior',
    subcategory: 'windows',
    itemName: 'Premium Window Replacement',
    description: 'Energy-efficient double/triple pane windows',
    basePrice: 750,
    unit: 'each',
    laborHours: 3.5,
    materialRatio: 0.80,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },

  // INTERIOR - KITCHEN
  {
    id: 'kitchen-001',
    category: 'interior',
    subcategory: 'kitchen',
    itemName: 'Kitchen Cabinet Installation',
    description: 'Stock cabinets with standard hardware',
    basePrice: 150,
    unit: 'linear ft',
    laborHours: 2.0,
    materialRatio: 0.70,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'kitchen-002',
    category: 'interior',
    subcategory: 'kitchen',
    itemName: 'Granite Countertops',
    description: 'Granite countertops with undermount sink cutout',
    basePrice: 85,
    unit: 'sq ft',
    laborHours: 0.5,
    materialRatio: 0.60,
    difficultyMultiplier: 1.3,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'kitchen-003',
    category: 'interior',
    subcategory: 'kitchen',
    itemName: 'Quartz Countertops',
    description: 'Engineered quartz countertops with installation',
    basePrice: 95,
    unit: 'sq ft',
    laborHours: 0.6,
    materialRatio: 0.65,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'kitchen-004',
    category: 'interior',
    subcategory: 'kitchen',
    itemName: 'Subway Tile Backsplash',
    description: '3x6 ceramic subway tile with grout',
    basePrice: 15,
    unit: 'sq ft',
    laborHours: 0.8,
    materialRatio: 0.40,
    difficultyMultiplier: 1.1,
    lastUpdated: new Date('2024-12-01')
  },

  // INTERIOR - BATHROOM
  {
    id: 'bathroom-001',
    category: 'interior',
    subcategory: 'bathroom',
    itemName: 'Standard Bathroom Vanity',
    description: '36" vanity with top and faucet',
    basePrice: 650,
    unit: 'each',
    laborHours: 4.0,
    materialRatio: 0.75,
    difficultyMultiplier: 1.0,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'bathroom-002',
    category: 'interior',
    subcategory: 'bathroom',
    itemName: 'Shower Tile Installation',
    description: 'Ceramic tile shower surround with waterproofing',
    basePrice: 12,
    unit: 'sq ft',
    laborHours: 1.2,
    materialRatio: 0.45,
    difficultyMultiplier: 1.4,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'bathroom-003',
    category: 'interior',
    subcategory: 'bathroom',
    itemName: 'Standard Toilet Replacement',
    description: 'Standard two-piece toilet with installation',
    basePrice: 350,
    unit: 'each',
    laborHours: 2.0,
    materialRatio: 0.80,
    difficultyMultiplier: 0.8,
    lastUpdated: new Date('2024-12-01')
  },

  // INTERIOR - FLOORING
  {
    id: 'flooring-001',
    category: 'interior',
    subcategory: 'flooring',
    itemName: 'Luxury Vinyl Plank',
    description: 'Click-lock LVP flooring with underlayment',
    basePrice: 6.50,
    unit: 'sq ft',
    laborHours: 0.3,
    materialRatio: 0.70,
    difficultyMultiplier: 0.9,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'flooring-002',
    category: 'interior',
    subcategory: 'flooring',
    itemName: 'Hardwood Flooring',
    description: '3/4" solid oak hardwood with finish',
    basePrice: 12,
    unit: 'sq ft',
    laborHours: 0.5,
    materialRatio: 0.60,
    difficultyMultiplier: 1.3,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'flooring-003',
    category: 'interior',
    subcategory: 'flooring',
    itemName: 'Ceramic Tile Flooring',
    description: '12x12 ceramic tile with grout',
    basePrice: 8,
    unit: 'sq ft',
    laborHours: 0.7,
    materialRatio: 0.50,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },

  // INTERIOR - PAINT
  {
    id: 'paint-001',
    category: 'interior',
    subcategory: 'paint',
    itemName: 'Interior Wall Paint',
    description: 'Two coats premium interior paint',
    basePrice: 2.50,
    unit: 'sq ft',
    laborHours: 0.08,
    materialRatio: 0.35,
    difficultyMultiplier: 0.8,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'paint-002',
    category: 'interior',
    subcategory: 'paint',
    itemName: 'Exterior Paint',
    description: 'Two coats exterior paint with primer',
    basePrice: 3.20,
    unit: 'sq ft',
    laborHours: 0.12,
    materialRatio: 0.40,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },

  // SYSTEMS - HVAC
  {
    id: 'hvac-001',
    category: 'systems',
    subcategory: 'hvac',
    itemName: 'Central Air Unit Replacement',
    description: '3-ton central AC unit with installation',
    basePrice: 4500,
    unit: 'each',
    laborHours: 12.0,
    materialRatio: 0.70,
    difficultyMultiplier: 1.3,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'hvac-002',
    category: 'systems',
    subcategory: 'hvac',
    itemName: 'Furnace Replacement',
    description: 'Gas furnace 80% efficiency with installation',
    basePrice: 3800,
    unit: 'each',
    laborHours: 10.0,
    materialRatio: 0.75,
    difficultyMultiplier: 1.2,
    lastUpdated: new Date('2024-12-01')
  },

  // SYSTEMS - ELECTRICAL
  {
    id: 'electrical-001',
    category: 'systems',
    subcategory: 'electrical',
    itemName: 'Electrical Panel Upgrade',
    description: '200-amp electrical panel with permits',
    basePrice: 2500,
    unit: 'each',
    laborHours: 8.0,
    materialRatio: 0.60,
    difficultyMultiplier: 1.4,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'electrical-002',
    category: 'systems',
    subcategory: 'electrical',
    itemName: 'Outlet Installation',
    description: 'Standard 110V outlet with GFCI if required',
    basePrice: 125,
    unit: 'each',
    laborHours: 1.0,
    materialRatio: 0.30,
    difficultyMultiplier: 0.9,
    lastUpdated: new Date('2024-12-01')
  },

  // SYSTEMS - PLUMBING
  {
    id: 'plumbing-001',
    category: 'systems',
    subcategory: 'plumbing',
    itemName: 'Water Heater Replacement',
    description: '50-gallon gas water heater with installation',
    basePrice: 1200,
    unit: 'each',
    laborHours: 4.0,
    materialRatio: 0.70,
    difficultyMultiplier: 1.1,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'plumbing-002',
    category: 'systems',
    subcategory: 'plumbing',
    itemName: 'Bathroom Fixture Set',
    description: 'Toilet, vanity, and tub/shower combo',
    basePrice: 1800,
    unit: 'set',
    laborHours: 12.0,
    materialRatio: 0.65,
    difficultyMultiplier: 1.3,
    lastUpdated: new Date('2024-12-01')
  },

  // STRUCTURAL - FOUNDATION
  {
    id: 'structural-001',
    category: 'structural',
    subcategory: 'foundation',
    itemName: 'Foundation Crack Repair',
    description: 'Concrete crack injection and waterproofing',
    basePrice: 450,
    unit: 'linear ft',
    laborHours: 2.0,
    materialRatio: 0.40,
    difficultyMultiplier: 1.5,
    lastUpdated: new Date('2024-12-01')
  },

  // STRUCTURAL - DRYWALL
  {
    id: 'drywall-001',
    category: 'structural',
    subcategory: 'drywall',
    itemName: 'Drywall Installation',
    description: '1/2" drywall with tape, mud, and texture',
    basePrice: 2.80,
    unit: 'sq ft',
    laborHours: 0.15,
    materialRatio: 0.35,
    difficultyMultiplier: 1.0,
    lastUpdated: new Date('2024-12-01')
  },
  {
    id: 'drywall-002',
    category: 'structural',
    subcategory: 'drywall',
    itemName: 'Drywall Repair',
    description: 'Patch holes and texture matching',
    basePrice: 150,
    unit: 'each',
    laborHours: 1.5,
    materialRatio: 0.25,
    difficultyMultiplier: 0.8,
    lastUpdated: new Date('2024-12-01')
  }
]

// Helper functions for querying the database
export function getCostItemsByCategory(category: string): BaseCostItem[] {
  return BASE_COST_DATABASE.filter(item => item.category === category)
}

export function getCostItemsBySubcategory(category: string, subcategory: string): BaseCostItem[] {
  return BASE_COST_DATABASE.filter(item => 
    item.category === category && item.subcategory === subcategory
  )
}

export function getCostItemById(id: string): BaseCostItem | undefined {
  return BASE_COST_DATABASE.find(item => item.id === id)
}

export function searchCostItems(searchTerm: string): BaseCostItem[] {
  const term = searchTerm.toLowerCase()
  return BASE_COST_DATABASE.filter(item =>
    item.itemName.toLowerCase().includes(term) ||
    item.description?.toLowerCase().includes(term) ||
    item.category.toLowerCase().includes(term) ||
    item.subcategory.toLowerCase().includes(term)
  )
}

export function getAllCategories(): string[] {
  return [...new Set(BASE_COST_DATABASE.map(item => item.category))]
}

export function getSubcategoriesByCategory(category: string): string[] {
  return [...new Set(
    BASE_COST_DATABASE
      .filter(item => item.category === category)
      .map(item => item.subcategory)
  )]
}
