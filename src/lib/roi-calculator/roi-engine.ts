import { 
  ROICalculationInput, 
  ROICalculationResult, 
  ROIScenario, 
  CashFlowProjection,
  ROIComparison 
} from './types'

/**
 * Advanced ROI Calculation Engine
 * Provides comprehensive return on investment analysis for real estate renovations
 */
export class ROICalculationEngine {
  
  /**
   * Calculate comprehensive ROI analysis
   */
  static calculateROI(input: ROICalculationInput): ROICalculationResult {
    const { 
      purchasePrice, 
      arv, 
      totalRehabCost, 
      strategy, 
      holdPeriodMonths = 6,
      monthlyRent = 0,
      vacancy = 5,
      propertyManagement = 8,
      appreciationRate = 3,
      downPayment = 0,
      loanAmount = 0,
      interestRate = 7
    } = input
    
    // Calculate basic costs
    const acquisitionCosts = purchasePrice * 0.03 // 3% for closing, inspection, etc.
    const holdingCosts = this.calculateHoldingCosts(purchasePrice, loanAmount, interestRate, holdPeriodMonths)
    const sellingCosts = arv * 0.08 // 8% for agent fees, closing costs, etc.
    
    const totalInvestment = purchasePrice + totalRehabCost + acquisitionCosts + holdingCosts + (downPayment || 0)
    
    // Strategy-specific calculations
    let netProfit: number
    let cashFlow: { monthly: number; annual: number; cumulative: number[] } = {
      monthly: 0,
      annual: 0,
      cumulative: []
    }
    
    switch (strategy) {
      case 'flip':
        netProfit = arv - totalInvestment - sellingCosts
        break
        
      case 'rental':
        const monthlyNetIncome = this.calculateRentalCashFlow(monthlyRent, purchasePrice, vacancy, propertyManagement)
        cashFlow = this.projectRentalCashFlow(monthlyNetIncome, holdPeriodMonths || 12)
        netProfit = cashFlow.cumulative[cashFlow.cumulative.length - 1] + (arv - totalInvestment - sellingCosts)
        break
        
      case 'wholetail':
        // Minimal rehab, quick sale
        netProfit = (arv * 0.9) - totalInvestment - (sellingCosts * 0.5) // Lower selling costs
        break
        
      case 'airbnb':
        const airbnbMonthlyIncome = monthlyRent * 1.5 // 50% premium for short-term rental
        const airbnbNetIncome = this.calculateRentalCashFlow(airbnbMonthlyIncome, purchasePrice, vacancy * 1.5, 15)
        cashFlow = this.projectRentalCashFlow(airbnbNetIncome, holdPeriodMonths || 12)
        netProfit = cashFlow.cumulative[cashFlow.cumulative.length - 1]
        break
        
      default:
        netProfit = arv - totalInvestment - sellingCosts
    }
    
    const roiPercentage = (netProfit / totalInvestment) * 100
    const annualizedROI = strategy === 'flip' ? 
      (roiPercentage * 12) / holdPeriodMonths : 
      roiPercentage / (holdPeriodMonths / 12)
    
    // Calculate additional metrics
    const capRate = strategy === 'rental' ? (cashFlow.annual / totalInvestment) * 100 : undefined
    const cashOnCashReturn = downPayment > 0 ? (cashFlow.annual / downPayment) * 100 : undefined
    
    // Generate scenarios
    const scenarios = this.generateScenarios(input)
    
    // Risk assessment
    const riskFactors = this.assessRisk(input, roiPercentage)
    
    // Generate recommendations and warnings
    const { recommendations, warnings } = this.generateInsights(input, roiPercentage, riskFactors)
    
    return {
      totalInvestment,
      netProfit,
      roiPercentage,
      annualizedROI,
      cashFlow,
      capRate,
      cashOnCashReturn,
      breakEvenMonths: this.calculateBreakEven(totalInvestment, cashFlow.monthly),
      scenarios,
      riskFactors,
      recommendations,
      warnings
    }
  }
  
  /**
   * Calculate holding costs (taxes, insurance, utilities, loan payments)
   */
  private static calculateHoldingCosts(
    purchasePrice: number, 
    loanAmount: number, 
    interestRate: number, 
    months: number
  ): number {
    const monthlyTaxes = (purchasePrice * 0.012) / 12 // 1.2% annual property tax
    const monthlyInsurance = (purchasePrice * 0.003) / 12 // 0.3% annual insurance
    const monthlyUtilities = 150 // Average utilities during renovation
    const monthlyLoanPayment = loanAmount > 0 ? 
      this.calculateMonthlyPayment(loanAmount, interestRate, 30 * 12) : 0
    
    const monthlyHoldingCosts = monthlyTaxes + monthlyInsurance + monthlyUtilities + monthlyLoanPayment
    
    return monthlyHoldingCosts * months
  }
  
  /**
   * Calculate monthly loan payment
   */
  private static calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / termMonths
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
           (Math.pow(1 + monthlyRate, termMonths) - 1)
  }
  
  /**
   * Calculate rental cash flow
   */
  private static calculateRentalCashFlow(
    monthlyRent: number, 
    propertyValue: number, 
    vacancy: number, 
    management: number
  ): number {
    const effectiveRent = monthlyRent * (1 - vacancy / 100)
    const managementFee = effectiveRent * (management / 100)
    const maintenance = propertyValue * 0.01 / 12 // 1% annual maintenance
    const monthlyTaxes = (propertyValue * 0.012) / 12
    const monthlyInsurance = (propertyValue * 0.003) / 12
    
    return effectiveRent - managementFee - maintenance - monthlyTaxes - monthlyInsurance
  }
  
  /**
   * Project rental cash flow over time
   */
  private static projectRentalCashFlow(monthlyNetIncome: number, months: number): {
    monthly: number
    annual: number
    cumulative: number[]
  } {
    const cumulative: number[] = []
    let total = 0
    
    for (let i = 0; i < months; i++) {
      total += monthlyNetIncome
      cumulative.push(total)
    }
    
    return {
      monthly: monthlyNetIncome,
      annual: monthlyNetIncome * 12,
      cumulative
    }
  }
  
  /**
   * Generate optimistic, realistic, and conservative scenarios
   */
  private static generateScenarios(input: ROICalculationInput): {
    conservative: ROIScenario
    realistic: ROIScenario
    optimistic: ROIScenario
  } {
    const { arv, totalRehabCost } = input
    
    return {
      conservative: {
        arv: arv * 0.9, // 10% lower ARV
        rehabCost: totalRehabCost * 1.2, // 20% cost overrun
        timeline: (input.holdPeriodMonths || 6) * 1.3, // 30% longer timeline
        holdingCosts: this.calculateHoldingCosts(input.purchasePrice, 0, 0, (input.holdPeriodMonths || 6) * 1.3),
        netProfit: 0, // Will be calculated
        roiPercentage: 0, // Will be calculated
        probability: 0.2
      },
      realistic: {
        arv: arv,
        rehabCost: totalRehabCost,
        timeline: input.holdPeriodMonths || 6,
        holdingCosts: this.calculateHoldingCosts(input.purchasePrice, 0, 0, input.holdPeriodMonths || 6),
        netProfit: 0, // Will be calculated
        roiPercentage: 0, // Will be calculated
        probability: 0.6
      },
      optimistic: {
        arv: arv * 1.1, // 10% higher ARV
        rehabCost: totalRehabCost * 0.9, // 10% under budget
        timeline: (input.holdPeriodMonths || 6) * 0.8, // 20% faster
        holdingCosts: this.calculateHoldingCosts(input.purchasePrice, 0, 0, (input.holdPeriodMonths || 6) * 0.8),
        netProfit: 0, // Will be calculated
        roiPercentage: 0, // Will be calculated
        probability: 0.2
      }
    }
  }
  
  /**
   * Assess investment risk factors
   */
  private static assessRisk(input: ROICalculationInput, roiPercentage: number): {
    marketRisk: 'low' | 'medium' | 'high'
    liquidityRisk: 'low' | 'medium' | 'high'
    executionRisk: 'low' | 'medium' | 'high'
    overallRisk: 'low' | 'medium' | 'high'
  } {
    // Market risk assessment
    const marketRisk = roiPercentage < 10 ? 'high' : roiPercentage < 20 ? 'medium' : 'low'
    
    // Liquidity risk (how quickly can you exit)
    const liquidityRisk = input.strategy === 'rental' ? 'high' : 
                         input.strategy === 'flip' ? 'low' : 'medium'
    
    // Execution risk (complexity of renovation)
    const rehabIntensity = input.totalRehabCost / input.purchasePrice
    const executionRisk = rehabIntensity > 0.5 ? 'high' : rehabIntensity > 0.25 ? 'medium' : 'low'
    
    // Overall risk (weighted average)
    const riskScores = {
      'low': 1,
      'medium': 2,
      'high': 3
    }
    
    const overallScore = (
      riskScores[marketRisk] * 0.4 + 
      riskScores[liquidityRisk] * 0.3 + 
      riskScores[executionRisk] * 0.3
    )
    
    const overallRisk = overallScore <= 1.5 ? 'low' : overallScore <= 2.5 ? 'medium' : 'high'
    
    return {
      marketRisk,
      liquidityRisk,
      executionRisk,
      overallRisk
    }
  }
  
  /**
   * Generate insights and recommendations
   */
  private static generateInsights(
    input: ROICalculationInput, 
    roiPercentage: number, 
    riskFactors: any
  ): { recommendations: string[]; warnings: string[] } {
    const recommendations: string[] = []
    const warnings: string[] = []
    
    // ROI-based recommendations
    if (roiPercentage > 25) {
      recommendations.push("Excellent ROI potential - strong investment opportunity")
    } else if (roiPercentage > 15) {
      recommendations.push("Good ROI potential - proceed with caution")
    } else if (roiPercentage > 8) {
      recommendations.push("Moderate ROI - consider reducing costs or increasing ARV")
    } else {
      warnings.push("Low ROI potential - reconsider this investment")
    }
    
    // Strategy-specific recommendations
    if (input.strategy === 'flip') {
      if (input.holdPeriodMonths && input.holdPeriodMonths > 9) {
        warnings.push("Long flip timeline increases holding costs and risk")
      }
      recommendations.push("Focus on high-impact improvements for quick sale")
    }
    
    if (input.strategy === 'rental') {
      const rentRatio = (input.monthlyRent || 0) / input.purchasePrice * 100
      if (rentRatio < 1) {
        warnings.push("Rent-to-price ratio below 1% - cash flow will be negative")
      } else if (rentRatio > 2) {
        recommendations.push("Excellent rent ratio - strong cash flow potential")
      }
    }
    
    // Risk-based warnings
    if (riskFactors.overallRisk === 'high') {
      warnings.push("High overall risk - ensure adequate reserves and exit strategies")
    }
    
    if (input.totalRehabCost / input.purchasePrice > 0.7) {
      warnings.push("Heavy renovation required - consider execution complexity")
    }
    
    // Market-based insights
    const equityPosition = (arv - input.purchasePrice - input.totalRehabCost) / arv
    if (equityPosition < 0.2) {
      warnings.push("Low equity position - limited safety margin")
    } else if (equityPosition > 0.4) {
      recommendations.push("Strong equity position provides good downside protection")
    }
    
    return { recommendations, warnings }
  }
  
  /**
   * Calculate break-even analysis
   */
  private static calculateBreakEven(totalInvestment: number, monthlyCashFlow: number): number | undefined {
    if (monthlyCashFlow <= 0) return undefined
    return Math.ceil(totalInvestment / monthlyCashFlow)
  }
  
  /**
   * Compare different investment strategies
   */
  static compareStrategies(baseInput: ROICalculationInput): ROIComparison {
    const strategies: Array<{
      strategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
      roi: number
      risk: 'low' | 'medium' | 'high'
      timeline: number
      cashRequired: number
      pros: string[]
      cons: string[]
    }> = []
    
    // Flip strategy
    const flipResult = this.calculateROI({ ...baseInput, strategy: 'flip', holdPeriodMonths: 6 })
    strategies.push({
      strategy: 'flip',
      roi: flipResult.annualizedROI,
      risk: flipResult.riskFactors.overallRisk,
      timeline: 6,
      cashRequired: flipResult.totalInvestment,
      pros: ['Quick returns', 'High ROI potential', 'No landlord responsibilities'],
      cons: ['Market timing risk', 'Capital gains tax', 'One-time profit']
    })
    
    // Rental strategy
    if (baseInput.monthlyRent && baseInput.monthlyRent > 0) {
      const rentalResult = this.calculateROI({ ...baseInput, strategy: 'rental', holdPeriodMonths: 12 })
      strategies.push({
        strategy: 'rental',
        roi: rentalResult.annualizedROI,
        risk: 'medium',
        timeline: 12,
        cashRequired: rentalResult.totalInvestment,
        pros: ['Passive income', 'Appreciation potential', 'Tax benefits'],
        cons: ['Tenant management', 'Maintenance costs', 'Vacancy risk']
      })
    }
    
    // Wholetail strategy
    const wholetailResult = this.calculateROI({ ...baseInput, strategy: 'wholetail', holdPeriodMonths: 3 })
    strategies.push({
      strategy: 'wholetail',
      roi: wholetailResult.annualizedROI,
      risk: 'low',
      timeline: 3,
      cashRequired: wholetailResult.totalInvestment,
      pros: ['Low renovation costs', 'Quick turnaround', 'Lower risk'],
      cons: ['Lower profit margins', 'Limited value-add', 'Market dependent']
    })
    
    // Find best strategy
    const bestStrategy = strategies.reduce((best, current) => 
      current.roi > best.roi ? current : best
    )
    
    const recommendation = `Based on your parameters, ${bestStrategy.strategy} strategy offers the best risk-adjusted returns at ${bestStrategy.roi.toFixed(1)}% annualized ROI.`
    
    return {
      strategies,
      recommendation
    }
  }
  
  /**
   * Project detailed cash flow month by month
   */
  static projectDetailedCashFlow(input: ROICalculationInput): CashFlowProjection[] {
    const projections: CashFlowProjection[] = []
    const { purchasePrice, totalRehabCost, monthlyRent = 0, strategy } = input
    
    const monthlyHolding = this.calculateHoldingCosts(purchasePrice, 0, 0, 1)
    const renovationMonths = Math.ceil((input.holdPeriodMonths || 6) / 2) // Assume renovation takes half the hold period
    
    // Renovation phase
    for (let month = 1; month <= renovationMonths; month++) {
      const rehabExpense = totalRehabCost / renovationMonths
      projections.push({
        month,
        income: 0,
        expenses: rehabExpense + monthlyHolding,
        netCashFlow: -(rehabExpense + monthlyHolding),
        cumulativeCashFlow: month === 1 ? 
          -(rehabExpense + monthlyHolding) : 
          projections[month - 2].cumulativeCashFlow - (rehabExpense + monthlyHolding),
        description: `Renovation Month ${month}`
      })
    }
    
    // Post-renovation phase
    const totalMonths = input.holdPeriodMonths || 6
    for (let month = renovationMonths + 1; month <= totalMonths; month++) {
      let income = 0
      let expenses = monthlyHolding
      
      if (strategy === 'rental' || strategy === 'airbnb') {
        income = strategy === 'airbnb' ? monthlyRent * 1.5 : monthlyRent
        expenses += income * 0.3 // 30% expense ratio
      }
      
      const netCashFlow = income - expenses
      projections.push({
        month,
        income,
        expenses,
        netCashFlow,
        cumulativeCashFlow: projections[month - 2].cumulativeCashFlow + netCashFlow,
        description: strategy === 'flip' ? `Holding Month ${month - renovationMonths}` : 
                    `Rental Month ${month - renovationMonths}`
      })
    }
    
    return projections
  }
  
  /**
   * Calculate optimal renovation budget allocation
   */
  static optimizeRehabBudget(
    totalBudget: number,
    scopeItems: Array<{ category: string; cost: number; roiImpact: number }>,
    strategy: 'flip' | 'rental' | 'wholetail' | 'airbnb'
  ): {
    recommendedItems: Array<{ category: string; cost: number; roiImpact: number; priority: number }>
    totalCost: number
    expectedROI: number
    budgetUtilization: number
  } {
    // Calculate ROI efficiency (ROI per dollar spent)
    const itemsWithEfficiency = scopeItems.map(item => ({
      ...item,
      efficiency: item.roiImpact / item.cost,
      priority: 0
    }))
    
    // Strategy-specific ROI multipliers
    const strategyMultipliers: Record<string, Record<string, number>> = {
      flip: {
        kitchen: 1.2,
        bathroom: 1.1,
        exterior: 1.3,
        systems: 0.8
      },
      rental: {
        kitchen: 0.9,
        bathroom: 1.0,
        systems: 1.2,
        exterior: 1.1
      },
      wholetail: {
        exterior: 1.4,
        systems: 1.1,
        kitchen: 0.7,
        bathroom: 0.8
      },
      airbnb: {
        kitchen: 1.3,
        bathroom: 1.2,
        interior: 1.1,
        systems: 1.0
      }
    }
    
    // Apply strategy multipliers and sort by efficiency
    const adjustedItems = itemsWithEfficiency.map(item => ({
      ...item,
      adjustedROI: item.roiImpact * (strategyMultipliers[strategy][item.category] || 1.0),
      adjustedEfficiency: (item.roiImpact * (strategyMultipliers[strategy][item.category] || 1.0)) / item.cost
    })).sort((a, b) => b.adjustedEfficiency - a.adjustedEfficiency)
    
    // Select items within budget, prioritizing highest efficiency
    const recommendedItems: Array<{ category: string; cost: number; roiImpact: number; priority: number }> = []
    let totalCost = 0
    let expectedROI = 0
    
    for (const item of adjustedItems) {
      if (totalCost + item.cost <= totalBudget) {
        recommendedItems.push({
          category: item.category,
          cost: item.cost,
          roiImpact: item.adjustedROI,
          priority: recommendedItems.length + 1
        })
        totalCost += item.cost
        expectedROI += item.adjustedROI
      }
    }
    
    return {
      recommendedItems,
      totalCost,
      expectedROI,
      budgetUtilization: (totalCost / totalBudget) * 100
    }
  }
  
  /**
   * Calculate financing scenarios
   */
  static calculateFinancingScenarios(
    purchasePrice: number,
    rehabCost: number,
    arv: number
  ): Array<{
    name: string
    downPayment: number
    loanAmount: number
    monthlyPayment: number
    totalInterest: number
    cashRequired: number
    leverageRatio: number
    roiImpact: number
  }> {
    const scenarios = [
      { name: 'Cash Purchase', downPaymentPercent: 100, rate: 0, term: 0 },
      { name: 'Conventional (20% down)', downPaymentPercent: 20, rate: 7.5, term: 30 },
      { name: 'Investment Loan (25% down)', downPaymentPercent: 25, rate: 8.0, term: 30 },
      { name: 'Hard Money (30% down)', downPaymentPercent: 30, rate: 12.0, term: 2 },
    ]
    
    return scenarios.map(scenario => {
      const totalCost = purchasePrice + rehabCost
      const downPayment = totalCost * (scenario.downPaymentPercent / 100)
      const loanAmount = totalCost - downPayment
      
      const monthlyPayment = scenario.term > 0 ? 
        this.calculateMonthlyPayment(loanAmount, scenario.rate, scenario.term * 12) : 0
      
      const totalInterest = scenario.term > 0 ? 
        (monthlyPayment * scenario.term * 12) - loanAmount : 0
      
      const leverageRatio = loanAmount / totalCost
      const roiImpact = leverageRatio > 0 ? 
        ((arv - totalCost - totalInterest) / downPayment) * 100 :
        ((arv - totalCost) / totalCost) * 100
      
      return {
        name: scenario.name,
        downPayment,
        loanAmount,
        monthlyPayment,
        totalInterest,
        cashRequired: downPayment + rehabCost, // Assuming rehab paid in cash
        leverageRatio,
        roiImpact
      }
    })
  }
}
