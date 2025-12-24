import { RegionalMultipliers } from './types'

// Sample regional multiplier data - in production this would come from Supabase
export const REGIONAL_MULTIPLIERS: RegionalMultipliers[] = [
  // California - High cost areas
  {
    zipCode: '90210',
    metroArea: 'Los Angeles',
    state: 'CA',
    costOfLivingIndex: 1.45,
    laborMultiplier: 1.6,
    materialMultiplier: 1.2,
    permitBaseCost: 850,
    inspectionBaseCost: 200,
    lastUpdated: new Date('2024-12-01')
  },
  {
    zipCode: '94102',
    metroArea: 'San Francisco',
    state: 'CA',
    costOfLivingIndex: 1.65,
    laborMultiplier: 1.8,
    materialMultiplier: 1.3,
    permitBaseCost: 1200,
    inspectionBaseCost: 300,
    lastUpdated: new Date('2024-12-01')
  },

  // New York - High cost areas
  {
    zipCode: '10001',
    metroArea: 'New York City',
    state: 'NY',
    costOfLivingIndex: 1.55,
    laborMultiplier: 1.7,
    materialMultiplier: 1.25,
    permitBaseCost: 950,
    inspectionBaseCost: 250,
    lastUpdated: new Date('2024-12-01')
  },

  // Texas - Moderate cost areas
  {
    zipCode: '75201',
    metroArea: 'Dallas',
    state: 'TX',
    costOfLivingIndex: 1.05,
    laborMultiplier: 1.1,
    materialMultiplier: 1.0,
    permitBaseCost: 350,
    inspectionBaseCost: 100,
    lastUpdated: new Date('2024-12-01')
  },
  {
    zipCode: '78701',
    metroArea: 'Austin',
    state: 'TX',
    costOfLivingIndex: 1.15,
    laborMultiplier: 1.2,
    materialMultiplier: 1.05,
    permitBaseCost: 450,
    inspectionBaseCost: 125,
    lastUpdated: new Date('2024-12-01')
  },
  {
    zipCode: '77001',
    metroArea: 'Houston',
    state: 'TX',
    costOfLivingIndex: 1.0,
    laborMultiplier: 1.05,
    materialMultiplier: 0.98,
    permitBaseCost: 300,
    inspectionBaseCost: 85,
    lastUpdated: new Date('2024-12-01')
  },

  // Florida - Moderate cost areas
  {
    zipCode: '33101',
    metroArea: 'Miami',
    state: 'FL',
    costOfLivingIndex: 1.25,
    laborMultiplier: 1.3,
    materialMultiplier: 1.1,
    permitBaseCost: 500,
    inspectionBaseCost: 150,
    lastUpdated: new Date('2024-12-01')
  },
  {
    zipCode: '32801',
    metroArea: 'Orlando',
    state: 'FL',
    costOfLivingIndex: 1.0,
    laborMultiplier: 1.0,
    materialMultiplier: 1.0,
    permitBaseCost: 250,
    inspectionBaseCost: 75,
    lastUpdated: new Date('2024-12-01')
  },

  // Georgia - Lower cost areas
  {
    zipCode: '30301',
    metroArea: 'Atlanta',
    state: 'GA',
    costOfLivingIndex: 0.95,
    laborMultiplier: 0.95,
    materialMultiplier: 0.98,
    permitBaseCost: 275,
    inspectionBaseCost: 80,
    lastUpdated: new Date('2024-12-01')
  },

  // North Carolina - Lower cost areas
  {
    zipCode: '28201',
    metroArea: 'Charlotte',
    state: 'NC',
    costOfLivingIndex: 0.92,
    laborMultiplier: 0.9,
    materialMultiplier: 0.95,
    permitBaseCost: 225,
    inspectionBaseCost: 65,
    lastUpdated: new Date('2024-12-01')
  },
  {
    zipCode: '27601',
    metroArea: 'Raleigh',
    state: 'NC',
    costOfLivingIndex: 0.98,
    laborMultiplier: 0.95,
    materialMultiplier: 0.97,
    permitBaseCost: 250,
    inspectionBaseCost: 70,
    lastUpdated: new Date('2024-12-01')
  },

  // Ohio - Low cost areas
  {
    zipCode: '43215',
    metroArea: 'Columbus',
    state: 'OH',
    costOfLivingIndex: 0.85,
    laborMultiplier: 0.82,
    materialMultiplier: 0.92,
    permitBaseCost: 180,
    inspectionBaseCost: 50,
    lastUpdated: new Date('2024-12-01')
  },
  {
    zipCode: '44101',
    metroArea: 'Cleveland',
    state: 'OH',
    costOfLivingIndex: 0.78,
    laborMultiplier: 0.75,
    materialMultiplier: 0.88,
    permitBaseCost: 150,
    inspectionBaseCost: 45,
    lastUpdated: new Date('2024-12-01')
  },

  // Michigan - Low cost areas
  {
    zipCode: '48201',
    metroArea: 'Detroit',
    state: 'MI',
    costOfLivingIndex: 0.80,
    laborMultiplier: 0.78,
    materialMultiplier: 0.90,
    permitBaseCost: 160,
    inspectionBaseCost: 50,
    lastUpdated: new Date('2024-12-01')
  },

  // Colorado - Moderate to high cost
  {
    zipCode: '80201',
    metroArea: 'Denver',
    state: 'CO',
    costOfLivingIndex: 1.12,
    laborMultiplier: 1.15,
    materialMultiplier: 1.08,
    permitBaseCost: 400,
    inspectionBaseCost: 120,
    lastUpdated: new Date('2024-12-01')
  },

  // Washington - High cost areas
  {
    zipCode: '98101',
    metroArea: 'Seattle',
    state: 'WA',
    costOfLivingIndex: 1.35,
    laborMultiplier: 1.45,
    materialMultiplier: 1.15,
    permitBaseCost: 650,
    inspectionBaseCost: 180,
    lastUpdated: new Date('2024-12-01')
  }
]

// Default multipliers for areas not in database
export const DEFAULT_REGIONAL_MULTIPLIERS: RegionalMultipliers = {
  zipCode: '00000',
  metroArea: 'Unknown',
  state: 'XX',
  costOfLivingIndex: 1.0,
  laborMultiplier: 1.0,
  materialMultiplier: 1.0,
  permitBaseCost: 250,
  inspectionBaseCost: 75,
  lastUpdated: new Date('2024-12-01')
}

// Helper functions
export function getRegionalMultipliersByZip(zipCode: string): RegionalMultipliers {
  return REGIONAL_MULTIPLIERS.find(rm => rm.zipCode === zipCode) || DEFAULT_REGIONAL_MULTIPLIERS
}

export function getRegionalMultipliersByState(state: string): RegionalMultipliers[] {
  return REGIONAL_MULTIPLIERS.filter(rm => rm.state === state)
}

export function getRegionalMultipliersByMetro(metroArea: string): RegionalMultipliers[] {
  return REGIONAL_MULTIPLIERS.filter(rm => 
    rm.metroArea.toLowerCase().includes(metroArea.toLowerCase())
  )
}

// State-level averages for fallback
export const STATE_AVERAGES: Record<string, Partial<RegionalMultipliers>> = {
  'CA': {
    costOfLivingIndex: 1.35,
    laborMultiplier: 1.4,
    materialMultiplier: 1.15,
    permitBaseCost: 600,
    inspectionBaseCost: 175
  },
  'NY': {
    costOfLivingIndex: 1.25,
    laborMultiplier: 1.35,
    materialMultiplier: 1.12,
    permitBaseCost: 550,
    inspectionBaseCost: 160
  },
  'TX': {
    costOfLivingIndex: 1.0,
    laborMultiplier: 1.05,
    materialMultiplier: 1.0,
    permitBaseCost: 300,
    inspectionBaseCost: 90
  },
  'FL': {
    costOfLivingIndex: 1.05,
    laborMultiplier: 1.1,
    materialMultiplier: 1.02,
    permitBaseCost: 325,
    inspectionBaseCost: 95
  },
  'GA': {
    costOfLivingIndex: 0.92,
    laborMultiplier: 0.9,
    materialMultiplier: 0.96,
    permitBaseCost: 250,
    inspectionBaseCost: 70
  },
  'NC': {
    costOfLivingIndex: 0.90,
    laborMultiplier: 0.88,
    materialMultiplier: 0.94,
    permitBaseCost: 225,
    inspectionBaseCost: 65
  },
  'OH': {
    costOfLivingIndex: 0.82,
    laborMultiplier: 0.78,
    materialMultiplier: 0.90,
    permitBaseCost: 175,
    inspectionBaseCost: 50
  },
  'MI': {
    costOfLivingIndex: 0.85,
    laborMultiplier: 0.80,
    materialMultiplier: 0.92,
    permitBaseCost: 180,
    inspectionBaseCost: 55
  },
  'CO': {
    costOfLivingIndex: 1.08,
    laborMultiplier: 1.12,
    materialMultiplier: 1.05,
    permitBaseCost: 375,
    inspectionBaseCost: 110
  },
  'WA': {
    costOfLivingIndex: 1.25,
    laborMultiplier: 1.3,
    materialMultiplier: 1.1,
    permitBaseCost: 500,
    inspectionBaseCost: 140
  }
}

export function getStateAverage(state: string): Partial<RegionalMultipliers> {
  return STATE_AVERAGES[state] || {
    costOfLivingIndex: 1.0,
    laborMultiplier: 1.0,
    materialMultiplier: 1.0,
    permitBaseCost: 250,
    inspectionBaseCost: 75
  }
}
