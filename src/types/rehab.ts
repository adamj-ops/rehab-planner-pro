export interface RehabProject {
  id: string
  userId: string
  propertyId?: string
  
  // Property Details
  projectName: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  squareFeet: number
  lotSize: number
  yearBuilt: number
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse'
  bedrooms: number
  bathrooms: number
  
  // Strategy
  investmentStrategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
  targetBuyer: 'first_time' | 'move_up' | 'investor' | 'luxury'
  holdPeriodMonths: number
  targetROI: number
  maxBudget: number
  
  // Market Context
  arv: number
  purchasePrice: number
  neighborhoodCompAvg: number
  
  // Financing
  financingDetails?: FinancingDetails
  holdingCosts?: HoldingCosts
  holdingCostEstimate?: HoldingCostEstimate
  
  // Status
  status: 'draft' | 'active' | 'completed' | 'archived'
  
  // Calculated Fields
  totalEstimatedCost: number
  totalActualCost?: number
  estimatedDays: number
  priorityScore: number
  roiScore: number
  
  // Relationships
  assessments?: PropertyAssessment[]
  scopeItems?: ScopeItem[]
  comparables?: MarketComparable[]
  recommendations?: Recommendation[]
  
  createdAt: Date
  updatedAt: Date
}

export interface PropertyAssessment {
  id: string
  projectId: string
  roomType: string
  roomName?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible'
  components: {
    [key: string]: {
      condition: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible'
      needsWork: boolean
      action?: 'repair' | 'replace' | 'upgrade'
    }
  }
  notes?: string
  photos?: string[]
}

export interface ScopeItem {
  id: string
  projectId: string
  
  // Item Details
  category: string
  subcategory?: string
  itemName: string
  description?: string
  location?: string
  
  // Costs
  quantity: number
  unitOfMeasure: string
  materialCost: number
  laborCost: number
  totalCost: number
  
  // Strategic Fields
  priority: 'must' | 'should' | 'could' | 'nice'
  roiImpact: number
  daysRequired: number
  
  // Dependencies
  dependsOn: string[]
  phase: number
  
  // Status
  included: boolean
  completed: boolean
}

export interface MarketComparable {
  id: string
  projectId: string
  address: string
  salePrice: number
  saleDate: Date
  squareFeet: number
  features: Record<string, any>
  distanceMiles: number
  similarityScore: number
}

export interface Recommendation {
  id: string
  projectId: string
  type: 'add' | 'remove' | 'upgrade' | 'downgrade' | 'timing'
  title: string
  description: string
  estimatedCost: number
  roiImpact: number
  timeImpactDays: number
  marketData?: any
  confidenceScore: number
  status: 'pending' | 'accepted' | 'rejected' | 'implemented'
}

export interface ActionPlanPhase {
  id: string
  name: string
  startDay: number
  endDay: number
  cost: number
  tasks: ActionTask[]
  dependencies: string[]
  criticalPath: boolean
  warnings: string[]
}

export interface ActionTask {
  id: string
  name: string
  contractor: string
  duration: number
  cost: number
  dependencies: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface EstimateSummary {
  totalCost: number
  materialCost: number
  laborCost: number
  contingency: number
  timeline: number
  roiImpact: number
  budgetUsage: number
  categoryBreakdown: {
    [category: string]: number
  }
}

export interface RoomComponent {
  id: string
  name: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible'
  needsWork: boolean
  action?: 'repair' | 'replace' | 'upgrade'
  estimatedCost?: number
  priority?: 'must' | 'should' | 'could' | 'nice'
}

export interface RoomAssessment {
  roomType: string
  roomName: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible' | undefined
  components: Record<string, { needsWork: boolean; action: string }>
  notes: string
  photos: string[]
}

export interface StrategyConfig {
  investmentStrategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
  targetBuyer: 'first_time' | 'move_up' | 'investor' | 'luxury'
  holdPeriodMonths: number
  targetROI: number
  maxBudget: number
  contingencyPercentage: number
}

export interface MarketInsights {
  medianPrice: number
  medianPricePerSqft: number
  avgDaysOnMarket: number
  priceGrowth1Yr: number
  priceGrowth3Yr: number
  mostValuableImprovements: string[]
  recommendedQualityLevel: 'budget' | 'standard' | 'premium' | 'luxury'
}

export interface PriorityMatrixItem {
  id: string
  name: string
  category: 'safety' | 'structural' | 'systems' | 'cosmetic' | 'optional'
  roiImpact: number // 0-100
  urgency: number // 0-100
  cost: number
  priority: 'must' | 'should' | 'could' | 'nice'
  included: boolean
}

export interface ProjectTimeline {
  totalDays: number
  phases: ActionPlanPhase[]
  criticalPath: string[]
  cashFlowSchedule: {
    day: number
    amount: number
    description: string
  }[]
  contractorSchedule: {
    contractor: string
    startDay: number
    endDay: number
    tasks: string[]
  }[]
}

export interface CostDatabaseItem {
  id: string
  category: string
  itemName: string
  unitOfMeasure: string
  budgetCost: number
  standardCost: number
  premiumCost: number
  luxuryCost: number
  laborPercentage: number
  materialPercentage: number
  regionalMultipliers: Record<string, number>
  lastUpdated: Date
}

export interface Contractor {
  id: string
  name: string
  company: string
  specialties: string[]
  rating: number
  completedProjects: number
  averageCost: number
  averageTimeline: number
  contactInfo: {
    email: string
    phone: string
    website?: string
  }
}

export interface ContractorBid {
  id: string
  projectId: string
  contractorId: string
  bidAmount: number
  timeline: number
  breakdown: {
    labor: number
    materials: number
    other: number
  }
  notes: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: Date
}

// ============================================================================
// Financing Types
// ============================================================================

export type LoanType = 'cash' | 'conventional' | 'hard_money'

export interface FinancingDetails {
  loanType: LoanType
  downPaymentPercent: number
  interestRate: number
  loanTermMonths: number
  points: number
  holdingPeriodMonths: number
}

export interface HoldingCosts {
  propertyTaxesMonthly: number
  insuranceMonthly: number
  utilitiesMonthly: number
  hoaMonthly: number
  maintenanceMonthly: number
}

export interface HoldingCostEstimate {
  loanAmount: number
  downPayment: number
  monthlyPayment: number
  totalInterest: number
  pointsCost: number
  closingCosts: number
  sellingCosts: number
  totalHoldingCosts: number
  totalMonthlyHoldingCost: number
  cashRequired: number
  allInCost: number
  estimatedProfit: number
  roi: number
  annualizedROI: number
  cashOnCashReturn: number
}

// ============================================================================
// Form Schemas for Validation
// ============================================================================

export interface PropertyDetailsFormData {
  // Project identification
  projectName: string
  projectType: 'flip' | 'rental' | 'wholesale'
  
  // Address
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  
  // Property specs
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse'
  yearBuilt: number
  squareFeet: number
  lotSize: number
  bedrooms: number
  bathrooms: number
  garageSpaces?: number
  stories?: number
  
  // Financial inputs
  purchasePrice: number
  arv?: number
  closingCostsPercent?: number
  sellingCostsPercent?: number
  
  // Financing (optional, for calculator)
  financing?: FinancingDetails
  holdingCosts?: HoldingCosts
}

export interface StrategyFormData {
  investmentStrategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
  targetBuyer: 'first_time' | 'move_up' | 'investor' | 'luxury'
  holdPeriodMonths: number
  targetROI: number
  maxBudget: number
  contingencyPercentage: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// UI State types
export interface EstimatorStep {
  id: number
  name: string
  component: string
  completed: boolean
  data?: any
}

export interface EstimatorState {
  currentStep: number
  steps: EstimatorStep[]
  project: Partial<RehabProject>
  loading: boolean
  error?: string
}

// Chart and visualization types
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimelineData {
  phase: string
  start: number
  end: number
  tasks: string[]
  cost: number
}

export interface MatrixData {
  x: number // ROI Impact
  y: number // Urgency
  item: PriorityMatrixItem
}
