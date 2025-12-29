/**
 * Holding Cost Calculator
 * 
 * Comprehensive financing and holding cost calculation engine for
 * real estate investment analysis.
 */

import type {
  FinancingInputs,
  MonthlyHoldingCosts,
  FinancingCalculation,
  MonthlyBreakdown,
  FinancingSummary,
  DealAnalysis,
  FinancialTimeline,
  TimelineEvent
} from './types'

// ============================================================================
// Core Calculations
// ============================================================================

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * 
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 *   M = Monthly payment
 *   P = Principal (loan amount)
 *   r = Monthly interest rate (annual rate / 12)
 *   n = Total number of payments
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (principal <= 0) return 0
  if (annualInterestRate <= 0) return principal / termMonths
  
  const monthlyRate = annualInterestRate / 100 / 12
  const factor = Math.pow(1 + monthlyRate, termMonths)
  
  return principal * (monthlyRate * factor) / (factor - 1)
}

/**
 * Calculate interest-only payment
 */
export function calculateInterestOnlyPayment(
  principal: number,
  annualInterestRate: number
): number {
  if (principal <= 0 || annualInterestRate <= 0) return 0
  return principal * (annualInterestRate / 100 / 12)
}

/**
 * Calculate loan points cost
 */
export function calculatePointsCost(
  loanAmount: number,
  pointsPercent: number
): number {
  return loanAmount * (pointsPercent / 100)
}

// ============================================================================
// Main Calculator
// ============================================================================

/**
 * Calculate complete financing details including all costs and ROI metrics
 */
export function calculateFinancing(
  inputs: FinancingInputs,
  holdingCosts: MonthlyHoldingCosts
): FinancingCalculation {
  const {
    purchasePrice,
    arv,
    loanType,
    downPaymentPercent,
    interestRate,
    loanTermMonths,
    points,
    holdingPeriodMonths,
    rehabBudget,
    closingCostsPercent,
    sellingCostsPercent
  } = inputs
  
  // Loan calculations
  const downPayment = purchasePrice * (downPaymentPercent / 100)
  const loanAmount = purchasePrice - downPayment
  
  // Monthly payment (interest-only for hard money, amortized for conventional)
  const monthlyPayment = loanType === 'hard_money'
    ? calculateInterestOnlyPayment(loanAmount, interestRate)
    : loanType === 'cash'
      ? 0
      : calculateMonthlyPayment(loanAmount, interestRate, loanTermMonths)
  
  // Points cost
  const pointsCost = calculatePointsCost(loanAmount, points)
  
  // Total interest over holding period
  const totalInterest = monthlyPayment * holdingPeriodMonths - 
    (loanType === 'hard_money' ? 0 : calculatePrincipalPaid(loanAmount, interestRate, loanTermMonths, holdingPeriodMonths))
  
  // Closing and selling costs
  const closingCosts = purchasePrice * (closingCostsPercent / 100)
  const sellingCosts = arv * (sellingCostsPercent / 100)
  
  // Monthly holding costs (excluding loan payment)
  const monthlyHoldingExclLoan = 
    holdingCosts.propertyTaxes +
    holdingCosts.insurance +
    holdingCosts.utilities +
    holdingCosts.hoaFees +
    holdingCosts.maintenance
  
  // Total monthly holding cost including loan payment
  const totalMonthlyHoldingCost = monthlyHoldingExclLoan + monthlyPayment
  
  // Total holding costs over entire period
  const totalHoldingCosts = totalMonthlyHoldingCost * holdingPeriodMonths
  
  // Cash required at closing
  const cashRequired = downPayment + closingCosts + pointsCost + rehabBudget
  
  // All-in cost (total investment)
  const allInCost = purchasePrice + closingCosts + rehabBudget + totalHoldingCosts + sellingCosts
  
  // Estimated profit
  const estimatedProfit = arv - allInCost
  
  // ROI calculations
  const roi = cashRequired > 0 ? (estimatedProfit / cashRequired) * 100 : 0
  const annualizedROI = holdingPeriodMonths > 0 
    ? roi * (12 / holdingPeriodMonths) 
    : 0
  const cashOnCashReturn = cashRequired > 0 
    ? (estimatedProfit / cashRequired) * 100 
    : 0
  
  // Generate monthly breakdown
  const monthlyBreakdown = generateMonthlyBreakdown(
    holdingPeriodMonths,
    monthlyPayment,
    holdingCosts,
    loanAmount,
    interestRate,
    loanType
  )
  
  return {
    loanAmount,
    downPayment,
    monthlyPayment,
    totalInterest: Math.max(0, totalInterest),
    pointsCost,
    closingCosts,
    sellingCosts,
    totalHoldingCosts,
    totalMonthlyHoldingCost,
    cashRequired,
    allInCost,
    estimatedProfit,
    roi,
    annualizedROI,
    cashOnCashReturn,
    monthlyBreakdown
  }
}

/**
 * Calculate principal paid over a given period
 */
function calculatePrincipalPaid(
  principal: number,
  annualInterestRate: number,
  termMonths: number,
  periodMonths: number
): number {
  if (principal <= 0 || annualInterestRate <= 0) return 0
  
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termMonths)
  const monthlyRate = annualInterestRate / 100 / 12
  
  let balance = principal
  let totalPrincipalPaid = 0
  
  for (let month = 0; month < Math.min(periodMonths, termMonths); month++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    totalPrincipalPaid += principalPayment
    balance -= principalPayment
  }
  
  return totalPrincipalPaid
}

/**
 * Generate month-by-month breakdown of costs
 */
function generateMonthlyBreakdown(
  holdingPeriodMonths: number,
  monthlyPayment: number,
  holdingCosts: MonthlyHoldingCosts,
  loanAmount: number,
  interestRate: number,
  loanType: string
): MonthlyBreakdown[] {
  const breakdown: MonthlyBreakdown[] = []
  let cumulativeCost = 0
  let remainingBalance = loanAmount
  const monthlyRate = interestRate / 100 / 12
  
  for (let month = 1; month <= holdingPeriodMonths; month++) {
    // Calculate this month's costs
    const loanPayment = monthlyPayment
    const { propertyTaxes, insurance, utilities, hoaFees, maintenance } = holdingCosts
    
    const totalCost = loanPayment + propertyTaxes + insurance + utilities + hoaFees + maintenance
    cumulativeCost += totalCost
    
    // Update remaining balance (for amortized loans)
    if (loanType !== 'hard_money' && loanType !== 'cash' && remainingBalance > 0) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance = Math.max(0, remainingBalance - principalPayment)
    }
    
    breakdown.push({
      month,
      loanPayment,
      propertyTaxes,
      insurance,
      utilities,
      hoaFees,
      maintenance,
      totalCost,
      cumulativeCost,
      remainingBalance
    })
  }
  
  return breakdown
}

// ============================================================================
// Summary and Analysis
// ============================================================================

/**
 * Generate summary metrics for display
 */
export function calculateSummary(calculation: FinancingCalculation): FinancingSummary {
  const { cashRequired, totalMonthlyHoldingCost, estimatedProfit, roi, annualizedROI } = calculation
  
  let profitability: 'profitable' | 'break_even' | 'unprofitable'
  if (estimatedProfit > 1000) {
    profitability = 'profitable'
  } else if (estimatedProfit >= -1000) {
    profitability = 'break_even'
  } else {
    profitability = 'unprofitable'
  }
  
  return {
    cashRequired,
    monthlyHoldingCost: totalMonthlyHoldingCost,
    estimatedProfit,
    roi,
    annualizedROI,
    profitability
  }
}

/**
 * Analyze deal viability and provide recommendations
 */
export function analyzeDeal(
  inputs: FinancingInputs,
  calculation: FinancingCalculation
): DealAnalysis {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  const { purchasePrice, arv, rehabBudget } = inputs
  const { estimatedProfit, roi, cashRequired } = calculation
  
  // Check profitability
  if (estimatedProfit < 0) {
    warnings.push('This deal shows a negative profit. Review your numbers.')
  } else if (estimatedProfit < 10000) {
    warnings.push('Profit margin is thin. Consider negotiating a lower purchase price.')
  }
  
  // Check ROI
  if (roi < 15) {
    warnings.push('ROI is below 15%. This may not be worth the risk and effort.')
  }
  
  // Check ARV
  if (arv < purchasePrice) {
    warnings.push('ARV is lower than purchase price. This is typically unprofitable.')
  }
  
  // Check 70% rule
  const maxAllowableOffer = (arv * 0.7) - rehabBudget
  if (purchasePrice > maxAllowableOffer) {
    warnings.push(`Purchase price exceeds the 70% rule (max: $${maxAllowableOffer.toLocaleString()})`)
  }
  
  // Suggestions
  if (purchasePrice > maxAllowableOffer * 0.9) {
    const reduction = purchasePrice - maxAllowableOffer
    suggestions.push(`Negotiate $${reduction.toLocaleString()} off the purchase price.`)
  }
  
  if (rehabBudget > arv * 0.2) {
    suggestions.push('Rehab budget is high relative to ARV. Look for scope reduction opportunities.')
  }
  
  // Calculate break-even ARV
  const breakEvenArv = calculation.allInCost
  const minimumArv = breakEvenArv * 1.1 // 10% margin
  const cushionPercent = arv > 0 ? ((arv - breakEvenArv) / arv) * 100 : 0
  
  return {
    isViable: estimatedProfit > 0 && roi >= 10,
    warnings,
    suggestions,
    metrics: {
      maxAllowableOffer,
      minimumArv,
      breakEvenArv,
      cushionPercent
    }
  }
}

// ============================================================================
// Timeline Generation
// ============================================================================

/**
 * Generate financial timeline for visualization
 */
export function generateTimeline(
  inputs: FinancingInputs,
  calculation: FinancingCalculation,
  rehabDurationMonths: number = 3
): FinancialTimeline {
  const events: TimelineEvent[] = []
  const { purchasePrice, arv, holdingPeriodMonths, rehabBudget } = inputs
  const { cashRequired, sellingCosts, totalMonthlyHoldingCost } = calculation
  
  let cumulativeCashFlow = 0
  let peakCashOutlay = 0
  
  // Month 0: Purchase
  cumulativeCashFlow = -cashRequired
  peakCashOutlay = Math.abs(cumulativeCashFlow)
  
  events.push({
    month: 0,
    label: 'Purchase',
    type: 'purchase',
    cashFlow: -cashRequired,
    cumulativeCashFlow
  })
  
  // Month 1: Rehab Start
  events.push({
    month: 1,
    label: 'Rehab Start',
    type: 'rehab_start',
    cashFlow: -totalMonthlyHoldingCost,
    cumulativeCashFlow: cumulativeCashFlow - totalMonthlyHoldingCost
  })
  
  // Rehab End (typically 2-4 months)
  const rehabEndMonth = Math.min(rehabDurationMonths, holdingPeriodMonths - 1)
  const rehabHoldingCosts = totalMonthlyHoldingCost * rehabDurationMonths
  cumulativeCashFlow -= rehabHoldingCosts
  peakCashOutlay = Math.max(peakCashOutlay, Math.abs(cumulativeCashFlow))
  
  events.push({
    month: rehabEndMonth,
    label: 'Rehab Complete',
    type: 'rehab_end',
    cashFlow: -rehabHoldingCosts,
    cumulativeCashFlow
  })
  
  // Listing (1 month after rehab)
  const listingMonth = rehabEndMonth + 1
  const listingHoldingCosts = totalMonthlyHoldingCost
  cumulativeCashFlow -= listingHoldingCosts
  
  events.push({
    month: listingMonth,
    label: 'Listed for Sale',
    type: 'listing',
    cashFlow: -listingHoldingCosts,
    cumulativeCashFlow
  })
  
  // Sale (end of holding period)
  const saleProceeds = arv - sellingCosts - calculation.loanAmount
  const remainingHoldingCosts = totalMonthlyHoldingCost * (holdingPeriodMonths - listingMonth)
  cumulativeCashFlow -= remainingHoldingCosts
  cumulativeCashFlow += saleProceeds
  
  events.push({
    month: holdingPeriodMonths,
    label: 'Sale Closed',
    type: 'sale',
    cashFlow: saleProceeds - remainingHoldingCosts,
    cumulativeCashFlow
  })
  
  // Find break-even month (if any)
  let breakEvenMonth: number | null = null
  for (const event of events) {
    if (event.cumulativeCashFlow >= 0) {
      breakEvenMonth = event.month
      break
    }
  }
  
  return {
    events,
    totalMonths: holdingPeriodMonths,
    peakCashOutlay,
    breakEvenMonth,
    finalProfit: cumulativeCashFlow
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Estimate monthly holding costs based on property value
 */
export function estimateMonthlyHoldingCosts(
  purchasePrice: number,
  includeHoa: boolean = false
): MonthlyHoldingCosts {
  // Rough estimates based on property value
  const annualTaxRate = 0.012 // 1.2% of value annually
  const annualInsuranceRate = 0.005 // 0.5% of value annually
  
  return {
    propertyTaxes: Math.round((purchasePrice * annualTaxRate) / 12),
    insurance: Math.round((purchasePrice * annualInsuranceRate) / 12),
    utilities: 200, // Fixed estimate
    hoaFees: includeHoa ? 250 : 0,
    maintenance: 100,
    loanPayment: 0 // Calculated separately
  }
}
