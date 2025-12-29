# ROI Calculator Engine - Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: Ready for Implementation  
**Epic**: Phase 2 - Core Business Logic  
**Priority**: HIGH - Core Value Proposition  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Calculation Models](#calculation-models)
3. [Data Flow](#data-flow)
4. [API Design](#api-design)
5. [Database Schema](#database-schema)
6. [Component Architecture](#component-architecture)
7. [Visualization Components](#visualization-components)
8. [Implementation Plan](#implementation-plan)
9. [Testing Strategy](#testing-strategy)

---

## 🎯 Overview

### Purpose

The ROI Calculator Engine is the financial brain of Rehab Estimator. It provides:

1. **Real-time ROI calculations** as users build their scope
2. **Multi-scenario analysis** (conservative, realistic, optimistic)
3. **Strategy-specific metrics** (flip ROI vs. rental cash flow)
4. **Risk assessment** based on market conditions
5. **Break-even analysis** for hold-period decisions

### Business Value

```
┌────────────────────────────────────────────────────────────────┐
│                    ROI CALCULATOR VALUE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. INVESTMENT DECISION CONFIDENCE                               │
│     ├── Clear ROI projections before starting                   │
│     └── Risk-adjusted return analysis                           │
│                                                                  │
│  2. STRATEGY COMPARISON                                          │
│     ├── Flip vs Rental vs BRRRR side-by-side                   │
│     └── Optimal strategy recommendation                          │
│                                                                  │
│  3. LENDER DOCUMENTATION                                         │
│     ├── Professional ROI reports                                 │
│     └── Deal analysis for hard money approval                   │
│                                                                  │
│  4. SCOPE OPTIMIZATION                                           │
│     ├── Per-item ROI impact                                      │
│     └── Budget allocation guidance                               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Calculation Modes

| Mode | Strategy | Primary Metric | Secondary Metrics |
|------|----------|----------------|-------------------|
| **Flip** | Fix & Flip | Net Profit & ROI % | Days to profit, $/hour |
| **Rental** | Buy & Hold | Monthly Cash Flow | Cap Rate, Cash-on-Cash |
| **BRRRR** | Buy-Rehab-Rent-Refi-Repeat | Cash Left in Deal | Infinite ROI potential |
| **Airbnb** | Short-Term Rental | Annual Revenue | Occupancy breakeven |
| **Wholetail** | Light Cosmetic Flip | Quick Profit | Days on market |

---

## 🧮 Calculation Models

### Core Investment Metrics

```typescript
// src/lib/roi-calculator/types.ts

export interface InvestmentInputs {
  // Property Acquisition
  purchasePrice: number;
  closingCostsBuy: number;        // As percentage (e.g., 0.02 for 2%)
  
  // Renovation
  rehabCost: number;
  contingencyPercent: number;     // Typically 10-20%
  
  // Financing
  downPaymentPercent: number;
  loanInterestRate: number;       // Annual rate (e.g., 0.08 for 8%)
  loanTermMonths: number;
  loanPointsPercent: number;      // Origination points
  
  // Holding Costs (Monthly)
  propertyTaxes: number;
  insurance: number;
  utilities: number;
  hoa: number;
  maintenance: number;
  propertyManagement: number;     // As percentage of rent
  
  // Exit (Flip)
  afterRepairValue: number;       // ARV
  closingCostsSell: number;       // As percentage (e.g., 0.08 for 8%)
  realtorCommission: number;      // As percentage (e.g., 0.06 for 6%)
  holdingPeriodMonths: number;
  
  // Rental Income
  monthlyRent: number;
  vacancyRate: number;            // As percentage (e.g., 0.05 for 5%)
}

export interface FlipAnalysis {
  // Investment Summary
  totalInvestment: number;        // All cash in
  totalCosts: number;             // All costs (acquisition + rehab + holding + selling)
  
  // Profit Metrics
  grossProfit: number;            // ARV - Purchase - Rehab
  netProfit: number;              // After all costs
  roi: number;                    // Net Profit / Total Investment
  annualizedROI: number;          // ROI adjusted for time
  
  // Time Metrics
  profitPerMonth: number;
  profitPerDay: number;
  breakEvenARV: number;           // Minimum ARV to break even
  
  // Cost Breakdown
  acquisitionCosts: number;
  rehabCosts: number;
  holdingCosts: number;
  sellingCosts: number;
  financingCosts: number;
  
  // 70% Rule Check
  maxAllowableOffer: number;      // ARV * 0.7 - Rehab
  isWithin70Rule: boolean;
  
  // Risk Assessment
  cushion: number;                // ARV - All Costs - Profit Target
  cushionPercent: number;
}

export interface RentalAnalysis {
  // Cash Flow
  grossMonthlyRent: number;
  effectiveGrossIncome: number;   // After vacancy
  operatingExpenses: number;
  netOperatingIncome: number;     // NOI
  debtService: number;            // Monthly mortgage payment
  monthlyCashFlow: number;        // After debt service
  annualCashFlow: number;
  
  // Return Metrics
  capRate: number;                // NOI / Purchase Price
  cashOnCashReturn: number;       // Annual Cash Flow / Cash Invested
  grossRentMultiplier: number;    // Purchase Price / Annual Rent
  
  // Break-Even Analysis
  breakEvenOccupancy: number;     // Occupancy needed to break even
  breakEvenRent: number;          // Rent needed to break even
  monthsToRecoupInvestment: number;
  
  // Equity Building
  annualPrincipalPaydown: number;
  annualAppreciation: number;     // Assumed rate
  totalAnnualReturn: number;      // Cash flow + Principal + Appreciation
  
  // Expense Ratios
  operatingExpenseRatio: number;
  debtCoverageRatio: number;      // NOI / Debt Service
}

export interface BRRRRAnalysis extends RentalAnalysis {
  // Refinance Metrics
  refinanceARV: number;
  refinanceLTV: number;           // Loan-to-value (typically 75%)
  refinanceLoanAmount: number;
  cashOutAmount: number;
  
  // Cash Left in Deal
  initialCashInvested: number;
  cashRecoveredAtRefi: number;
  cashLeftInDeal: number;
  
  // Infinite ROI Check
  isInfiniteROI: boolean;         // Cash left <= 0
  
  // Post-Refi Cash Flow
  newMonthlyPayment: number;
  postRefiCashFlow: number;
  postRefiCashOnCash: number;
}
```

### Flip ROI Calculator

```typescript
// src/lib/roi-calculator/flip-calculator.ts

export function calculateFlipROI(inputs: InvestmentInputs): FlipAnalysis {
  // ═══════════════════════════════════════════════════════════════
  // ACQUISITION COSTS
  // ═══════════════════════════════════════════════════════════════
  
  const closingCostsBuyAmount = inputs.purchasePrice * inputs.closingCostsBuy;
  const acquisitionCosts = inputs.purchasePrice + closingCostsBuyAmount;
  
  // ═══════════════════════════════════════════════════════════════
  // REHAB COSTS
  // ═══════════════════════════════════════════════════════════════
  
  const contingency = inputs.rehabCost * inputs.contingencyPercent;
  const rehabCosts = inputs.rehabCost + contingency;
  
  // ═══════════════════════════════════════════════════════════════
  // FINANCING COSTS
  // ═══════════════════════════════════════════════════════════════
  
  const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent);
  const pointsCost = loanAmount * inputs.loanPointsPercent;
  const monthlyInterestRate = inputs.loanInterestRate / 12;
  const interestCost = loanAmount * monthlyInterestRate * inputs.holdingPeriodMonths;
  const financingCosts = pointsCost + interestCost;
  
  // ═══════════════════════════════════════════════════════════════
  // HOLDING COSTS
  // ═══════════════════════════════════════════════════════════════
  
  const monthlyHoldingCosts = 
    inputs.propertyTaxes +
    inputs.insurance +
    inputs.utilities +
    inputs.hoa +
    inputs.maintenance;
  
  const holdingCosts = monthlyHoldingCosts * inputs.holdingPeriodMonths;
  
  // ═══════════════════════════════════════════════════════════════
  // SELLING COSTS
  // ═══════════════════════════════════════════════════════════════
  
  const realtorCommissionAmount = inputs.afterRepairValue * inputs.realtorCommission;
  const closingCostsSellAmount = inputs.afterRepairValue * inputs.closingCostsSell;
  const sellingCosts = realtorCommissionAmount + closingCostsSellAmount;
  
  // ═══════════════════════════════════════════════════════════════
  // TOTALS & PROFIT
  // ═══════════════════════════════════════════════════════════════
  
  const totalCosts = acquisitionCosts + rehabCosts + financingCosts + holdingCosts + sellingCosts;
  
  // Cash invested = down payment + closing + rehab + holding (financed portion covered by loan)
  const downPaymentAmount = inputs.purchasePrice * inputs.downPaymentPercent;
  const totalInvestment = downPaymentAmount + closingCostsBuyAmount + rehabCosts + holdingCosts + pointsCost;
  
  const grossProfit = inputs.afterRepairValue - inputs.purchasePrice - inputs.rehabCost;
  const netProfit = inputs.afterRepairValue - totalCosts;
  
  // ═══════════════════════════════════════════════════════════════
  // ROI CALCULATIONS
  // ═══════════════════════════════════════════════════════════════
  
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const annualizedROI = roi * (12 / inputs.holdingPeriodMonths);
  
  const profitPerMonth = netProfit / inputs.holdingPeriodMonths;
  const profitPerDay = netProfit / (inputs.holdingPeriodMonths * 30);
  
  // ═══════════════════════════════════════════════════════════════
  // 70% RULE & BREAK-EVEN
  // ═══════════════════════════════════════════════════════════════
  
  const maxAllowableOffer = (inputs.afterRepairValue * 0.7) - inputs.rehabCost;
  const isWithin70Rule = inputs.purchasePrice <= maxAllowableOffer;
  
  // Break-even ARV = Total Costs (no profit margin)
  const breakEvenARV = totalCosts / (1 - inputs.closingCostsSell - inputs.realtorCommission);
  
  // Cushion = How much ARV can drop before losing money
  const cushion = inputs.afterRepairValue - breakEvenARV;
  const cushionPercent = (cushion / inputs.afterRepairValue) * 100;
  
  return {
    totalInvestment,
    totalCosts,
    grossProfit,
    netProfit,
    roi,
    annualizedROI,
    profitPerMonth,
    profitPerDay,
    breakEvenARV,
    acquisitionCosts,
    rehabCosts,
    holdingCosts,
    sellingCosts,
    financingCosts,
    maxAllowableOffer,
    isWithin70Rule,
    cushion,
    cushionPercent,
  };
}
```

### Rental Cash Flow Calculator

```typescript
// src/lib/roi-calculator/rental-calculator.ts

export function calculateRentalCashFlow(inputs: InvestmentInputs): RentalAnalysis {
  // ═══════════════════════════════════════════════════════════════
  // INCOME
  // ═══════════════════════════════════════════════════════════════
  
  const grossMonthlyRent = inputs.monthlyRent;
  const vacancyLoss = grossMonthlyRent * inputs.vacancyRate;
  const effectiveGrossIncome = grossMonthlyRent - vacancyLoss;
  
  // ═══════════════════════════════════════════════════════════════
  // OPERATING EXPENSES
  // ═══════════════════════════════════════════════════════════════
  
  const propertyManagementFee = effectiveGrossIncome * inputs.propertyManagement;
  
  const operatingExpenses = 
    inputs.propertyTaxes +
    inputs.insurance +
    inputs.maintenance +
    inputs.hoa +
    propertyManagementFee;
  
  // Net Operating Income (before debt service)
  const netOperatingIncome = effectiveGrossIncome - operatingExpenses;
  
  // ═══════════════════════════════════════════════════════════════
  // DEBT SERVICE (Mortgage Payment)
  // ═══════════════════════════════════════════════════════════════
  
  const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent);
  const monthlyRate = inputs.loanInterestRate / 12;
  const numPayments = inputs.loanTermMonths;
  
  // PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
  const debtService = loanAmount > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  
  // ═══════════════════════════════════════════════════════════════
  // CASH FLOW
  // ═══════════════════════════════════════════════════════════════
  
  const monthlyCashFlow = netOperatingIncome - debtService;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // ═══════════════════════════════════════════════════════════════
  // RETURN METRICS
  // ═══════════════════════════════════════════════════════════════
  
  // Cash invested = down payment + closing + rehab
  const closingCosts = inputs.purchasePrice * inputs.closingCostsBuy;
  const totalCashInvested = 
    (inputs.purchasePrice * inputs.downPaymentPercent) +
    closingCosts +
    inputs.rehabCost;
  
  // Cap Rate = NOI / Property Value
  const propertyValue = inputs.afterRepairValue || inputs.purchasePrice + inputs.rehabCost;
  const annualNOI = netOperatingIncome * 12;
  const capRate = (annualNOI / propertyValue) * 100;
  
  // Cash-on-Cash Return = Annual Cash Flow / Cash Invested
  const cashOnCashReturn = totalCashInvested > 0
    ? (annualCashFlow / totalCashInvested) * 100
    : 0;
  
  // Gross Rent Multiplier
  const annualRent = grossMonthlyRent * 12;
  const grossRentMultiplier = annualRent > 0 
    ? inputs.purchasePrice / annualRent 
    : 0;
  
  // ═══════════════════════════════════════════════════════════════
  // BREAK-EVEN ANALYSIS
  // ═══════════════════════════════════════════════════════════════
  
  // What occupancy needed to break even?
  const totalMonthlyExpenses = operatingExpenses + debtService;
  const breakEvenOccupancy = grossMonthlyRent > 0
    ? (totalMonthlyExpenses / grossMonthlyRent) * 100
    : 0;
  
  // What rent needed to break even?
  const breakEvenRent = totalMonthlyExpenses / (1 - inputs.vacancyRate);
  
  // Months to recoup investment
  const monthsToRecoupInvestment = monthlyCashFlow > 0
    ? Math.ceil(totalCashInvested / monthlyCashFlow)
    : Infinity;
  
  // ═══════════════════════════════════════════════════════════════
  // EQUITY BUILDING
  // ═══════════════════════════════════════════════════════════════
  
  // Calculate first year principal paydown
  let balance = loanAmount;
  let annualPrincipalPaydown = 0;
  for (let month = 0; month < 12; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = debtService - interestPayment;
    annualPrincipalPaydown += principalPayment;
    balance -= principalPayment;
  }
  
  // Assumed appreciation (configurable, default 3%)
  const appreciationRate = 0.03;
  const annualAppreciation = propertyValue * appreciationRate;
  
  // Total annual return = cash flow + principal + appreciation
  const totalAnnualReturn = annualCashFlow + annualPrincipalPaydown + annualAppreciation;
  
  // ═══════════════════════════════════════════════════════════════
  // RATIOS
  // ═══════════════════════════════════════════════════════════════
  
  const operatingExpenseRatio = effectiveGrossIncome > 0
    ? (operatingExpenses / effectiveGrossIncome) * 100
    : 0;
  
  const debtCoverageRatio = debtService > 0
    ? netOperatingIncome / debtService
    : Infinity;
  
  return {
    grossMonthlyRent,
    effectiveGrossIncome,
    operatingExpenses,
    netOperatingIncome,
    debtService,
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    cashOnCashReturn,
    grossRentMultiplier,
    breakEvenOccupancy,
    breakEvenRent,
    monthsToRecoupInvestment,
    annualPrincipalPaydown,
    annualAppreciation,
    totalAnnualReturn,
    operatingExpenseRatio,
    debtCoverageRatio,
  };
}
```

### BRRRR Calculator

```typescript
// src/lib/roi-calculator/brrrr-calculator.ts

export function calculateBRRRR(inputs: InvestmentInputs): BRRRRAnalysis {
  // First calculate base rental metrics
  const rentalAnalysis = calculateRentalCashFlow(inputs);
  
  // ═══════════════════════════════════════════════════════════════
  // INITIAL INVESTMENT
  // ═══════════════════════════════════════════════════════════════
  
  const downPayment = inputs.purchasePrice * inputs.downPaymentPercent;
  const closingCosts = inputs.purchasePrice * inputs.closingCostsBuy;
  const rehabCost = inputs.rehabCost * (1 + inputs.contingencyPercent);
  
  // For BRRRR, often using hard money initially (higher rates, interest-only)
  const holdingMonths = inputs.holdingPeriodMonths;
  const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent);
  const interestOnlyPayments = loanAmount * (inputs.loanInterestRate / 12) * holdingMonths;
  
  const initialCashInvested = downPayment + closingCosts + rehabCost + interestOnlyPayments;
  
  // ═══════════════════════════════════════════════════════════════
  // REFINANCE CALCULATIONS
  // ═══════════════════════════════════════════════════════════════
  
  const refinanceARV = inputs.afterRepairValue;
  const refinanceLTV = 0.75; // Typical conventional LTV
  const refinanceLoanAmount = refinanceARV * refinanceLTV;
  
  // Pay off original loan and get cash out
  const originalLoanPayoff = loanAmount; // No principal paid if interest-only
  const refinanceClosingCosts = refinanceLoanAmount * 0.02; // ~2% refi costs
  const cashOutAmount = refinanceLoanAmount - originalLoanPayoff - refinanceClosingCosts;
  
  // Cash left in deal
  const cashRecoveredAtRefi = cashOutAmount;
  const cashLeftInDeal = initialCashInvested - cashRecoveredAtRefi;
  
  // Infinite ROI check
  const isInfiniteROI = cashLeftInDeal <= 0;
  
  // ═══════════════════════════════════════════════════════════════
  // POST-REFI CASH FLOW
  // ═══════════════════════════════════════════════════════════════
  
  // New mortgage payment on refinanced loan
  const newLoanRate = 0.07; // Assume conventional rate
  const newLoanTermMonths = 360; // 30-year
  const newMonthlyRate = newLoanRate / 12;
  
  const newMonthlyPayment = refinanceLoanAmount * 
    (newMonthlyRate * Math.pow(1 + newMonthlyRate, newLoanTermMonths)) / 
    (Math.pow(1 + newMonthlyRate, newLoanTermMonths) - 1);
  
  // Recalculate cash flow with new payment
  const postRefiCashFlow = rentalAnalysis.netOperatingIncome - newMonthlyPayment;
  
  // Cash-on-cash if any cash left in deal
  const postRefiCashOnCash = cashLeftInDeal > 0
    ? ((postRefiCashFlow * 12) / cashLeftInDeal) * 100
    : Infinity; // Infinite return if no cash left
  
  return {
    ...rentalAnalysis,
    refinanceARV,
    refinanceLTV,
    refinanceLoanAmount,
    cashOutAmount,
    initialCashInvested,
    cashRecoveredAtRefi,
    cashLeftInDeal,
    isInfiniteROI,
    newMonthlyPayment,
    postRefiCashFlow,
    postRefiCashOnCash,
  };
}
```

### Scenario Analysis

```typescript
// src/lib/roi-calculator/scenario-analyzer.ts

export interface ScenarioConfig {
  name: string;
  arvAdjustment: number;        // Percentage (e.g., -0.10 for -10%)
  costAdjustment: number;       // Percentage (e.g., 0.15 for +15%)
  holdingAdjustment: number;    // Additional months
  probability: number;          // 0-1
}

export const DEFAULT_SCENARIOS: ScenarioConfig[] = [
  {
    name: 'Conservative',
    arvAdjustment: -0.10,       // ARV 10% lower
    costAdjustment: 0.20,       // Costs 20% higher
    holdingAdjustment: 2,       // 2 months longer
    probability: 0.25,
  },
  {
    name: 'Realistic',
    arvAdjustment: 0,
    costAdjustment: 0.10,       // 10% contingency already factored
    holdingAdjustment: 0,
    probability: 0.50,
  },
  {
    name: 'Optimistic',
    arvAdjustment: 0.05,        // ARV 5% higher
    costAdjustment: -0.05,      // Costs 5% lower
    holdingAdjustment: -1,      // 1 month faster
    probability: 0.25,
  },
];

export interface ScenarioResult {
  scenario: ScenarioConfig;
  analysis: FlipAnalysis | RentalAnalysis | BRRRRAnalysis;
  adjustedInputs: InvestmentInputs;
}

export interface ScenarioComparison {
  scenarios: ScenarioResult[];
  weightedNetProfit: number;
  weightedROI: number;
  riskMetrics: {
    profitRange: { min: number; max: number };
    roiRange: { min: number; max: number };
    probabilityOfLoss: number;
  };
}

export function runScenarioAnalysis(
  baseInputs: InvestmentInputs,
  strategy: 'flip' | 'rental' | 'brrrr',
  scenarios: ScenarioConfig[] = DEFAULT_SCENARIOS
): ScenarioComparison {
  const results: ScenarioResult[] = [];
  
  for (const scenario of scenarios) {
    // Adjust inputs based on scenario
    const adjustedInputs: InvestmentInputs = {
      ...baseInputs,
      afterRepairValue: baseInputs.afterRepairValue * (1 + scenario.arvAdjustment),
      rehabCost: baseInputs.rehabCost * (1 + scenario.costAdjustment),
      holdingPeriodMonths: baseInputs.holdingPeriodMonths + scenario.holdingAdjustment,
    };
    
    // Calculate based on strategy
    let analysis;
    switch (strategy) {
      case 'flip':
        analysis = calculateFlipROI(adjustedInputs);
        break;
      case 'rental':
        analysis = calculateRentalCashFlow(adjustedInputs);
        break;
      case 'brrrr':
        analysis = calculateBRRRR(adjustedInputs);
        break;
    }
    
    results.push({
      scenario,
      analysis,
      adjustedInputs,
    });
  }
  
  // Calculate weighted averages
  const weightedNetProfit = results.reduce((sum, r) => {
    const profit = 'netProfit' in r.analysis 
      ? r.analysis.netProfit 
      : r.analysis.annualCashFlow;
    return sum + (profit * r.scenario.probability);
  }, 0);
  
  const weightedROI = results.reduce((sum, r) => {
    const roi = 'roi' in r.analysis 
      ? r.analysis.roi 
      : r.analysis.cashOnCashReturn;
    return sum + (roi * r.scenario.probability);
  }, 0);
  
  // Calculate risk metrics
  const profits = results.map(r => 
    'netProfit' in r.analysis ? r.analysis.netProfit : r.analysis.annualCashFlow
  );
  const rois = results.map(r =>
    'roi' in r.analysis ? r.analysis.roi : r.analysis.cashOnCashReturn
  );
  
  const lossScenarios = results.filter(r => {
    const profit = 'netProfit' in r.analysis 
      ? r.analysis.netProfit 
      : r.analysis.annualCashFlow;
    return profit < 0;
  });
  
  const probabilityOfLoss = lossScenarios.reduce(
    (sum, r) => sum + r.scenario.probability, 
    0
  );
  
  return {
    scenarios: results,
    weightedNetProfit,
    weightedROI,
    riskMetrics: {
      profitRange: { min: Math.min(...profits), max: Math.max(...profits) },
      roiRange: { min: Math.min(...rois), max: Math.max(...rois) },
      probabilityOfLoss,
    },
  };
}
```

---

## 🔄 Data Flow

### Real-Time Calculation Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROI CALCULATION FLOW                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   Step 1    │───▶│   Step 3    │───▶│   Step 4    │                  │
│  │  Property   │    │  Strategy   │    │   Scope     │                  │
│  │   Details   │    │   & Goals   │    │  Building   │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
│        │                  │                  │                          │
│        ▼                  ▼                  ▼                          │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │                   ZUSTAND STORE                          │           │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │           │
│  │  │  property   │  │  strategy   │  │   scope     │     │           │
│  │  │    data     │  │   config    │  │   items     │     │           │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │           │
│  │        │                │                │              │           │
│  │        └────────────────┼────────────────┘              │           │
│  │                         ▼                               │           │
│  │              ┌─────────────────────┐                   │           │
│  │              │   computeROI()      │  ◀── Derived      │           │
│  │              │   (Zustand selector)│      Calculation  │           │
│  │              └─────────────────────┘                   │           │
│  │                         │                               │           │
│  └─────────────────────────┼───────────────────────────────┘           │
│                            ▼                                            │
│                  ┌─────────────────────┐                               │
│                  │   ROI Dashboard     │                               │
│                  │   (Real-time UI)    │                               │
│                  └─────────────────────┘                               │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Zustand Integration

```typescript
// src/stores/project-store.ts

import { create } from 'zustand';
import { calculateFlipROI, calculateRentalCashFlow, calculateBRRRR } from '@/lib/roi-calculator';

interface ProjectState {
  // Property data
  property: PropertyData | null;
  
  // Strategy config
  strategy: StrategyConfig | null;
  
  // Scope items
  scopeItems: ScopeItem[];
  
  // Actions
  setProperty: (property: PropertyData) => void;
  setStrategy: (strategy: StrategyConfig) => void;
  addScopeItem: (item: ScopeItem) => void;
  updateScopeItem: (id: string, updates: Partial<ScopeItem>) => void;
  removeScopeItem: (id: string) => void;
}

// Derived selectors
export const useROICalculation = () => {
  const property = useProjectStore(state => state.property);
  const strategy = useProjectStore(state => state.strategy);
  const scopeItems = useProjectStore(state => state.scopeItems);
  
  return useMemo(() => {
    if (!property || !strategy) return null;
    
    const totalRehabCost = scopeItems.reduce((sum, item) => sum + item.cost, 0);
    
    const inputs: InvestmentInputs = {
      purchasePrice: property.purchasePrice,
      afterRepairValue: property.arv,
      rehabCost: totalRehabCost,
      // ... map all other fields
    };
    
    switch (strategy.investmentType) {
      case 'flip':
        return calculateFlipROI(inputs);
      case 'rental':
        return calculateRentalCashFlow(inputs);
      case 'brrrr':
        return calculateBRRRR(inputs);
      default:
        return calculateFlipROI(inputs);
    }
  }, [property, strategy, scopeItems]);
};
```

---

## 🔌 API Design

### ROI Calculation Endpoints

```typescript
// src/app/api/calculate/roi/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateFlipROI, calculateRentalCashFlow, calculateBRRRR } from '@/lib/roi-calculator';
import { runScenarioAnalysis } from '@/lib/roi-calculator/scenario-analyzer';

const requestSchema = z.object({
  strategy: z.enum(['flip', 'rental', 'brrrr', 'airbnb', 'wholetail']),
  inputs: z.object({
    purchasePrice: z.number().positive(),
    afterRepairValue: z.number().positive(),
    rehabCost: z.number().min(0),
    contingencyPercent: z.number().min(0).max(1).default(0.15),
    downPaymentPercent: z.number().min(0).max(1).default(0.20),
    loanInterestRate: z.number().min(0).max(1).default(0.08),
    loanTermMonths: z.number().int().positive().default(360),
    holdingPeriodMonths: z.number().int().positive().default(6),
    closingCostsBuy: z.number().min(0).max(1).default(0.02),
    closingCostsSell: z.number().min(0).max(1).default(0.02),
    realtorCommission: z.number().min(0).max(1).default(0.06),
    propertyTaxes: z.number().min(0).default(0),
    insurance: z.number().min(0).default(0),
    utilities: z.number().min(0).default(0),
    monthlyRent: z.number().min(0).optional(),
    vacancyRate: z.number().min(0).max(1).default(0.05),
  }),
  includeScenarios: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategy, inputs, includeScenarios } = requestSchema.parse(body);
    
    let analysis;
    switch (strategy) {
      case 'flip':
      case 'wholetail':
        analysis = calculateFlipROI(inputs);
        break;
      case 'rental':
      case 'airbnb':
        analysis = calculateRentalCashFlow(inputs);
        break;
      case 'brrrr':
        analysis = calculateBRRRR(inputs);
        break;
    }
    
    const response: any = { analysis };
    
    if (includeScenarios) {
      response.scenarios = runScenarioAnalysis(inputs, strategy as any);
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('ROI calculation error:', error);
    return NextResponse.json(
      { error: 'Calculation failed' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/calculate/per-item-roi/route.ts

// Calculate ROI impact of adding/removing a single scope item
export async function POST(request: NextRequest) {
  const { baseInputs, scopeItem, action } = await request.json();
  
  // Calculate baseline
  const baselineAnalysis = calculateFlipROI(baseInputs);
  
  // Adjust rehab cost
  const adjustedInputs = {
    ...baseInputs,
    rehabCost: action === 'add'
      ? baseInputs.rehabCost + scopeItem.cost
      : baseInputs.rehabCost - scopeItem.cost,
  };
  
  // Calculate with adjustment
  const adjustedAnalysis = calculateFlipROI(adjustedInputs);
  
  // Calculate deltas
  const impact = {
    costChange: scopeItem.cost * (action === 'add' ? 1 : -1),
    netProfitChange: adjustedAnalysis.netProfit - baselineAnalysis.netProfit,
    roiChange: adjustedAnalysis.roi - baselineAnalysis.roi,
    breakEvenARVChange: adjustedAnalysis.breakEvenARV - baselineAnalysis.breakEvenARV,
  };
  
  return NextResponse.json(impact);
}
```

---

## 💾 Database Schema

```sql
-- ROI Calculation History (for audit and comparison)

CREATE TABLE roi_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    strategy TEXT NOT NULL CHECK (strategy IN ('flip', 'rental', 'brrrr', 'airbnb', 'wholetail')),
    
    -- Input snapshot
    inputs JSONB NOT NULL,
    
    -- Output snapshot
    analysis JSONB NOT NULL,
    
    -- Scenario analysis (if run)
    scenarios JSONB,
    
    -- Metadata
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    calculated_by UUID REFERENCES auth.users(id),
    
    -- For comparison tracking
    is_baseline BOOLEAN DEFAULT false,
    comparison_notes TEXT
);

-- Index for quick project lookups
CREATE INDEX idx_roi_calculations_project ON roi_calculations(project_id, calculated_at DESC);

-- RLS
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project calculations"
    ON roi_calculations FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );
```

---

## 🧩 Component Architecture

### File Structure

```
src/
├── lib/
│   └── roi-calculator/
│       ├── index.ts                    # Barrel export
│       ├── types.ts                    # TypeScript interfaces
│       ├── flip-calculator.ts          # Flip ROI calculations
│       ├── rental-calculator.ts        # Rental cash flow calculations
│       ├── brrrr-calculator.ts         # BRRRR analysis
│       ├── scenario-analyzer.ts        # Multi-scenario analysis
│       └── utils.ts                    # Shared calculation utilities
│
├── components/
│   └── roi/
│       ├── ROIDashboard.tsx            # Main ROI display
│       ├── FlipAnalysisCard.tsx        # Flip-specific metrics
│       ├── RentalAnalysisCard.tsx      # Rental-specific metrics
│       ├── BRRRRAnalysisCard.tsx       # BRRRR-specific metrics
│       ├── ScenarioComparison.tsx      # Side-by-side scenarios
│       ├── ROIChart.tsx                # Visualization charts
│       ├── CostBreakdownChart.tsx      # Pie/bar cost breakdown
│       ├── CashFlowChart.tsx           # Monthly cash flow projection
│       ├── PerItemROIBadge.tsx         # ROI impact per scope item
│       └── SensitivityAnalysis.tsx     # What-if slider analysis
│
├── hooks/
│   └── use-roi-calculation.ts          # Real-time calculation hook
│
└── app/
    └── api/
        └── calculate/
            ├── roi/route.ts            # Full ROI calculation
            └── per-item-roi/route.ts   # Per-item impact
```

### React Components

```tsx
// src/components/roi/ROIDashboard.tsx

'use client';

import { useROICalculation } from '@/hooks/use-roi-calculation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  IconTrendingUp, 
  IconTrendingDown,
  IconCash,
  IconPercentage,
  IconClock,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import { FlipAnalysisCard } from './FlipAnalysisCard';
import { RentalAnalysisCard } from './RentalAnalysisCard';
import { ScenarioComparison } from './ScenarioComparison';
import { CostBreakdownChart } from './CostBreakdownChart';

interface ROIDashboardProps {
  projectId: string;
  strategy: 'flip' | 'rental' | 'brrrr';
}

export function ROIDashboard({ projectId, strategy }: ROIDashboardProps) {
  const { analysis, scenarios, isLoading } = useROICalculation(projectId);
  
  if (isLoading || !analysis) {
    return <ROIDashboardSkeleton />;
  }
  
  const isFlip = strategy === 'flip';
  const mainMetric = isFlip 
    ? { label: 'Net Profit', value: analysis.netProfit, format: 'currency' }
    : { label: 'Monthly Cash Flow', value: analysis.monthlyCashFlow, format: 'currency' };
  
  const mainROI = isFlip ? analysis.roi : analysis.cashOnCashReturn;
  
  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label={mainMetric.label}
          value={mainMetric.value}
          format="currency"
          trend={mainMetric.value > 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="ROI"
          value={mainROI}
          format="percent"
          trend={mainROI > 15 ? 'up' : mainROI > 0 ? 'neutral' : 'down'}
        />
        <MetricCard
          label={isFlip ? 'Holding Period' : 'Break-Even'}
          value={isFlip ? analysis.holdingPeriodMonths : analysis.monthsToRecoupInvestment}
          suffix={isFlip ? ' months' : ' months'}
        />
        <MetricCard
          label="70% Rule"
          value={analysis.isWithin70Rule ? 'PASS' : 'FAIL'}
          variant={analysis.isWithin70Rule ? 'success' : 'warning'}
        />
      </div>
      
      {/* Risk Indicator */}
      <Card className={`
        border-l-4
        ${analysis.cushionPercent >= 15 ? 'border-l-green-500' : ''}
        ${analysis.cushionPercent >= 5 && analysis.cushionPercent < 15 ? 'border-l-yellow-500' : ''}
        ${analysis.cushionPercent < 5 ? 'border-l-red-500' : ''}
      `}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Profit Cushion</p>
              <p className="text-2xl font-bold">
                {analysis.cushionPercent.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Break-Even ARV</p>
              <p className="text-lg font-semibold">
                ${analysis.breakEvenARV.toLocaleString()}
              </p>
            </div>
            <Progress 
              value={analysis.cushionPercent} 
              max={30}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Analysis */}
      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="breakdown">
          <CostBreakdownChart analysis={analysis} />
        </TabsContent>
        
        <TabsContent value="scenarios">
          <ScenarioComparison scenarios={scenarios} />
        </TabsContent>
        
        <TabsContent value="sensitivity">
          <SensitivityAnalysis projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  format = 'number',
  suffix = '',
  trend,
  variant,
}: {
  label: string;
  value: number | string;
  format?: 'currency' | 'percent' | 'number';
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'success' | 'warning' | 'danger';
}) {
  const formattedValue = typeof value === 'number'
    ? format === 'currency'
      ? `$${value.toLocaleString()}`
      : format === 'percent'
        ? `${value.toFixed(1)}%`
        : value.toLocaleString()
    : value;
  
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className={`text-2xl font-bold ${
            variant === 'success' ? 'text-green-600' :
            variant === 'warning' ? 'text-yellow-600' :
            variant === 'danger' ? 'text-red-600' : ''
          }`}>
            {formattedValue}{suffix}
          </p>
          {trend === 'up' && <IconTrendingUp className="h-5 w-5 text-green-500" />}
          {trend === 'down' && <IconTrendingDown className="h-5 w-5 text-red-500" />}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📊 Visualization Components

### Cost Breakdown Chart

```tsx
// src/components/roi/CostBreakdownChart.tsx

'use client';

import { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FlipAnalysis } from '@/lib/roi-calculator/types';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface CostBreakdownChartProps {
  analysis: FlipAnalysis;
}

export function CostBreakdownChart({ analysis }: CostBreakdownChartProps) {
  const data = useMemo(() => [
    { name: 'Acquisition', value: analysis.acquisitionCosts },
    { name: 'Renovation', value: analysis.rehabCosts },
    { name: 'Holding', value: analysis.holdingCosts },
    { name: 'Financing', value: analysis.financingCosts },
    { name: 'Selling', value: analysis.sellingCosts },
  ].filter(item => item.value > 0), [analysis]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={entry.name} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Detailed breakdown table */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="font-medium">
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between items-center font-bold">
            <span>Total</span>
            <span>${analysis.totalCosts.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Scenario Comparison

```tsx
// src/components/roi/ScenarioComparison.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ScenarioComparison as ScenarioComparisonType } from '@/lib/roi-calculator/scenario-analyzer';

interface ScenarioComparisonProps {
  scenarios: ScenarioComparisonType;
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const chartData = scenarios.scenarios.map(s => ({
    name: s.scenario.name,
    profit: 'netProfit' in s.analysis ? s.analysis.netProfit : s.analysis.annualCashFlow,
    roi: 'roi' in s.analysis ? s.analysis.roi : s.analysis.cashOnCashReturn,
    probability: s.scenario.probability * 100,
  }));
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Weighted Profit</p>
            <p className="text-2xl font-bold">
              ${scenarios.weightedNetProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Weighted ROI</p>
            <p className="text-2xl font-bold">
              {scenarios.weightedROI.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className={scenarios.riskMetrics.probabilityOfLoss > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Loss Probability</p>
            <p className={`text-2xl font-bold ${
              scenarios.riskMetrics.probabilityOfLoss > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {(scenarios.riskMetrics.probabilityOfLoss * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'profit' ? `$${value.toLocaleString()}` : `${value.toFixed(1)}%`,
                    name === 'profit' ? 'Net Profit' : 'ROI'
                  ]}
                />
                <Legend />
                <ReferenceLine yAxisId="left" y={0} stroke="#666" />
                <Bar yAxisId="left" dataKey="profit" fill="hsl(var(--chart-1))" name="Net Profit" />
                <Bar yAxisId="right" dataKey="roi" fill="hsl(var(--chart-2))" name="ROI %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Risk Range */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Badge variant="destructive">Worst Case</Badge>
              <p className="text-lg font-bold mt-1">
                ${scenarios.riskMetrics.profitRange.min.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
            <div className="text-center">
              <Badge variant="default" className="bg-green-600">Best Case</Badge>
              <p className="text-lg font-bold mt-1">
                ${scenarios.riskMetrics.profitRange.max.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📅 Implementation Plan

### Phase 1: Core Calculators (2-3 days)

| Task | Description | Est. |
|------|-------------|------|
| Type definitions | All TypeScript interfaces | 2h |
| Flip calculator | Full flip ROI calculation | 4h |
| Rental calculator | Cash flow and returns | 4h |
| BRRRR calculator | Refinance and infinite ROI | 3h |
| Unit tests | Test all calculators | 4h |

### Phase 2: Scenario Analysis (1-2 days)

| Task | Description | Est. |
|------|-------------|------|
| Scenario config | Default scenarios and customization | 2h |
| Scenario runner | Multi-scenario analysis | 3h |
| Risk metrics | Probability calculations | 2h |
| Weighted averages | Expected value calculations | 2h |

### Phase 3: API Integration (1 day)

| Task | Description | Est. |
|------|-------------|------|
| ROI calculation endpoint | POST /api/calculate/roi | 3h |
| Per-item ROI endpoint | Calculate item impact | 2h |
| Database schema | History table migration | 1h |

### Phase 4: UI Components (2-3 days)

| Task | Description | Est. |
|------|-------------|------|
| ROIDashboard | Main dashboard component | 4h |
| MetricCards | Individual metric displays | 2h |
| CostBreakdownChart | Pie chart visualization | 3h |
| ScenarioComparison | Side-by-side scenarios | 4h |
| SensitivityAnalysis | What-if sliders | 4h |

### Phase 5: Integration (1 day)

| Task | Description | Est. |
|------|-------------|------|
| Zustand integration | Real-time calculation hook | 3h |
| Wizard integration | Add ROI preview to steps | 3h |
| Final Review page | Full ROI display | 2h |

**Total Estimated Time: 8-10 days**

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/lib/roi-calculator/__tests__/flip-calculator.test.ts

import { describe, it, expect } from 'vitest';
import { calculateFlipROI } from '../flip-calculator';

describe('calculateFlipROI', () => {
  const baseInputs = {
    purchasePrice: 200000,
    afterRepairValue: 300000,
    rehabCost: 50000,
    contingencyPercent: 0.15,
    downPaymentPercent: 0.20,
    loanInterestRate: 0.10,
    holdingPeriodMonths: 6,
    closingCostsBuy: 0.02,
    closingCostsSell: 0.02,
    realtorCommission: 0.06,
    propertyTaxes: 200,
    insurance: 100,
    utilities: 150,
    hoa: 0,
    maintenance: 0,
  };
  
  it('should calculate positive ROI for profitable flip', () => {
    const result = calculateFlipROI(baseInputs);
    
    expect(result.netProfit).toBeGreaterThan(0);
    expect(result.roi).toBeGreaterThan(0);
  });
  
  it('should correctly apply 70% rule', () => {
    const result = calculateFlipROI(baseInputs);
    
    // MAO = ARV * 0.7 - Rehab = 300000 * 0.7 - 50000 = 160000
    expect(result.maxAllowableOffer).toBe(160000);
    expect(result.isWithin70Rule).toBe(false); // 200000 > 160000
  });
  
  it('should pass 70% rule when purchase is low enough', () => {
    const inputs = { ...baseInputs, purchasePrice: 150000 };
    const result = calculateFlipROI(inputs);
    
    expect(result.isWithin70Rule).toBe(true);
  });
  
  it('should calculate break-even ARV correctly', () => {
    const result = calculateFlipROI(baseInputs);
    
    // Break-even is where net profit = 0
    const breakEvenInputs = { ...baseInputs, afterRepairValue: result.breakEvenARV };
    const breakEvenResult = calculateFlipROI(breakEvenInputs);
    
    expect(Math.abs(breakEvenResult.netProfit)).toBeLessThan(100); // Within $100 of break-even
  });
});
```

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Calculation speed | < 50ms | Performance timer |
| Accuracy vs manual | 99%+ | Compare to spreadsheet |
| User trust score | > 4.5/5 | Survey feedback |
| Feature adoption | > 70% | Track usage |

---

## 🔗 Related Documentation

- [AI Recommendations Spec](./AI_RECOMMENDATIONS_SPEC.md)
- [Property Details Form Spec](./PROPERTY_DETAILS_FORM_SPEC.md)
- [PRD - ROI Calculator Module](../PRD.md#10-roi-calculator-module)
