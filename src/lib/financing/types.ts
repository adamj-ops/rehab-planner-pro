/**
 * Financing and Holding Cost Types
 * 
 * Types for the financing calculator and holding cost estimation engine.
 */

import type { LoanType } from '@/lib/schemas/property-details'

// ============================================================================
// Input Types
// ============================================================================

/**
 * Core financing inputs for loan calculations
 */
export interface FinancingInputs {
  purchasePrice: number
  arv: number
  loanType: LoanType
  downPaymentPercent: number
  interestRate: number
  loanTermMonths: number
  points: number
  holdingPeriodMonths: number
  rehabBudget: number
  closingCostsPercent: number
  sellingCostsPercent: number
}

/**
 * Monthly holding cost inputs
 */
export interface MonthlyHoldingCosts {
  propertyTaxes: number
  insurance: number
  utilities: number
  hoaFees: number
  maintenance: number
  loanPayment: number
}

// ============================================================================
// Calculation Results
// ============================================================================

/**
 * Result of monthly payment calculation
 */
export interface MonthlyPaymentResult {
  principalAndInterest: number
  interestOnly: number
  totalMonthly: number
}

/**
 * Breakdown of a single month's costs
 */
export interface MonthlyBreakdown {
  month: number
  loanPayment: number
  propertyTaxes: number
  insurance: number
  utilities: number
  hoaFees: number
  maintenance: number
  totalCost: number
  cumulativeCost: number
  remainingBalance: number
}

/**
 * Complete financing calculation result
 */
export interface FinancingCalculation {
  // Loan details
  loanAmount: number
  downPayment: number
  monthlyPayment: number
  totalInterest: number
  pointsCost: number
  
  // Costs
  closingCosts: number
  sellingCosts: number
  totalHoldingCosts: number
  totalMonthlyHoldingCost: number
  
  // Investment metrics
  cashRequired: number
  allInCost: number
  estimatedProfit: number
  roi: number
  annualizedROI: number
  cashOnCashReturn: number
  
  // Timeline
  monthlyBreakdown: MonthlyBreakdown[]
}

/**
 * Timeline event for visualization
 */
export interface TimelineEvent {
  month: number
  label: string
  type: 'purchase' | 'rehab_start' | 'rehab_end' | 'listing' | 'sale'
  cashFlow: number
  cumulativeCashFlow: number
}

/**
 * Complete timeline with all events
 */
export interface FinancialTimeline {
  events: TimelineEvent[]
  totalMonths: number
  peakCashOutlay: number
  breakEvenMonth: number | null
  finalProfit: number
}

// ============================================================================
// Summary Types
// ============================================================================

/**
 * Summary metrics for display cards
 */
export interface FinancingSummary {
  cashRequired: number
  monthlyHoldingCost: number
  estimatedProfit: number
  roi: number
  annualizedROI: number
  profitability: 'profitable' | 'break_even' | 'unprofitable'
}

/**
 * Deal analysis result
 */
export interface DealAnalysis {
  isViable: boolean
  warnings: string[]
  suggestions: string[]
  metrics: {
    maxAllowableOffer: number
    minimumArv: number
    breakEvenArv: number
    cushionPercent: number
  }
}

// ============================================================================
// Presets and Defaults
// ============================================================================

/**
 * Default values for different loan types
 */
export const LOAN_TYPE_DEFAULTS: Record<LoanType, Partial<FinancingInputs>> = {
  cash: {
    downPaymentPercent: 100,
    interestRate: 0,
    loanTermMonths: 1,
    points: 0
  },
  conventional: {
    downPaymentPercent: 20,
    interestRate: 7,
    loanTermMonths: 360,
    points: 0
  },
  hard_money: {
    downPaymentPercent: 20,
    interestRate: 12,
    loanTermMonths: 12,
    points: 2
  }
}

/**
 * Default monthly costs by property value tier
 */
export const DEFAULT_MONTHLY_COSTS = {
  propertyTaxes: 250,
  insurance: 150,
  utilities: 200,
  hoaFees: 0,
  maintenance: 100
}
