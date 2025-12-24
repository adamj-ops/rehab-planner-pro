// ROI Calculation Types
export interface ROICalculationInput {
  // Property financials
  purchasePrice: number
  arv: number // After Repair Value
  totalRehabCost: number
  holdingCosts: number
  sellingCosts: number
  
  // Investment strategy
  strategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
  holdPeriodMonths?: number
  
  // Rental-specific data
  monthlyRent?: number
  vacancy?: number // percentage
  propertyManagement?: number // percentage
  
  // Market data
  appreciationRate?: number // annual percentage
  rentGrowthRate?: number // annual percentage
  
  // Financing
  downPayment?: number
  loanAmount?: number
  interestRate?: number
  loanTermYears?: number
}

export interface ROICalculationResult {
  // Basic ROI metrics
  totalInvestment: number
  netProfit: number
  roiPercentage: number
  annualizedROI: number
  
  // Cash flow analysis
  cashFlow: {
    monthly: number
    annual: number
    cumulative: number[]
  }
  
  // Investment metrics
  capRate?: number // for rentals
  cashOnCashReturn?: number
  irr?: number // Internal Rate of Return
  
  // Break-even analysis
  breakEvenMonths?: number
  paybackPeriod?: number
  
  // Scenario analysis
  scenarios: {
    conservative: ROIScenario
    realistic: ROIScenario
    optimistic: ROIScenario
  }
  
  // Risk assessment
  riskFactors: {
    marketRisk: 'low' | 'medium' | 'high'
    liquidityRisk: 'low' | 'medium' | 'high'
    executionRisk: 'low' | 'medium' | 'high'
    overallRisk: 'low' | 'medium' | 'high'
  }
  
  // Recommendations
  recommendations: string[]
  warnings: string[]
}

export interface ROIScenario {
  arv: number
  rehabCost: number
  timeline: number
  holdingCosts: number
  netProfit: number
  roiPercentage: number
  probability: number // 0.0 to 1.0
}

export interface CashFlowProjection {
  month: number
  income: number
  expenses: number
  netCashFlow: number
  cumulativeCashFlow: number
  description: string
}

export interface ROIComparison {
  strategies: Array<{
    strategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
    roi: number
    risk: 'low' | 'medium' | 'high'
    timeline: number
    cashRequired: number
    pros: string[]
    cons: string[]
  }>
  recommendation: string
}

export interface MarketComparison {
  subject: {
    address: string
    estimatedROI: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  comparables: Array<{
    address: string
    salePrice: number
    rehabCost: number
    actualROI: number
    daysOnMarket: number
    lessons: string[]
  }>
  marketInsights: {
    averageROI: number
    medianDaysOnMarket: number
    successRate: number
    riskFactors: string[]
  }
}
