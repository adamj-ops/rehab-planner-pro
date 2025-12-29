'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  IconCurrencyDollar,
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconPigMoney,
  IconCalculator,
  IconAlertTriangle,
  IconCircleCheck
} from '@/lib/icons'
import { 
  type FinancingCalculation,
  type FinancingSummary as FinancingSummaryData,
  type DealAnalysis,
  calculateSummary,
  analyzeDeal,
  formatCurrency,
  formatPercent
} from '@/lib/financing'
import type { FinancingInputs } from '@/lib/financing/types'

// ============================================================================
// Metric Card Component
// ============================================================================

interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  variant?: 'default' | 'positive' | 'negative' | 'warning'
  icon?: React.ComponentType<{ className?: string; stroke?: number }>
  className?: string
}

function MetricCard({ 
  label, 
  value, 
  subValue, 
  variant = 'default', 
  icon: Icon,
  className 
}: MetricCardProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-card p-4',
      variant === 'positive' && 'border-green-500/30 bg-green-500/5',
      variant === 'negative' && 'border-red-500/30 bg-red-500/5',
      variant === 'warning' && 'border-amber-500/30 bg-amber-500/5',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn(
            'text-xl font-semibold',
            variant === 'positive' && 'text-green-600 dark:text-green-400',
            variant === 'negative' && 'text-red-600 dark:text-red-400',
            variant === 'warning' && 'text-amber-600 dark:text-amber-400'
          )}>
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subValue && (
            <p className="text-xs text-muted-foreground">{subValue}</p>
          )}
        </div>
        {Icon && (
          <Icon 
            className={cn(
              'h-5 w-5',
              variant === 'positive' && 'text-green-600',
              variant === 'negative' && 'text-red-600',
              variant === 'warning' && 'text-amber-600',
              variant === 'default' && 'text-muted-foreground'
            )} 
            stroke={1.5} 
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ROI Gauge Component
// ============================================================================

interface ROIGaugeProps {
  roi: number
  annualizedROI: number
  className?: string
}

function ROIGauge({ roi, annualizedROI, className }: ROIGaugeProps) {
  // Determine color based on ROI
  const getColor = (value: number) => {
    if (value >= 20) return 'text-green-600'
    if (value >= 10) return 'text-amber-600'
    return 'text-red-600'
  }
  
  const getBgColor = (value: number) => {
    if (value >= 20) return 'bg-green-500'
    if (value >= 10) return 'bg-amber-500'
    return 'bg-red-500'
  }
  
  // Calculate gauge fill (max at 50% ROI for visual purposes)
  const gaugeFill = Math.min(Math.max(roi, 0), 50) * 2 // 50% ROI = 100% fill
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Return on Investment</span>
        <span className={cn('text-2xl font-bold', getColor(roi))}>
          {formatPercent(roi)}
        </span>
      </div>
      
      {/* Gauge bar */}
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all', getBgColor(roi))}
          style={{ width: `${gaugeFill}%` }}
        />
      </div>
      
      {/* Scale markers */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>10%</span>
        <span>20%</span>
        <span>30%</span>
        <span>50%+</span>
      </div>
      
      {/* Annualized ROI */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-sm text-muted-foreground">Annualized ROI</span>
        <span className={cn('text-sm font-semibold', getColor(annualizedROI))}>
          {formatPercent(annualizedROI)}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// Deal Analysis Component
// ============================================================================

interface DealAnalysisDisplayProps {
  analysis: DealAnalysis
  className?: string
}

function DealAnalysisDisplay({ analysis, className }: DealAnalysisDisplayProps) {
  const { isViable, warnings, suggestions, metrics } = analysis
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Viability Badge */}
      <div className="flex items-center gap-2">
        {isViable ? (
          <>
            <IconCircleCheck className="h-5 w-5 text-green-600" stroke={1.5} />
            <Badge variant="outline" className="border-green-500 text-green-600">
              Viable Deal
            </Badge>
          </>
        ) : (
          <>
            <IconAlertTriangle className="h-5 w-5 text-amber-600" stroke={1.5} />
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              Review Required
            </Badge>
          </>
        )}
      </div>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Warnings</p>
          <ul className="space-y-1">
            {warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-600">
                <IconAlertTriangle className="h-4 w-4 shrink-0 mt-0.5" stroke={1.5} />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
          <ul className="space-y-1">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="shrink-0">→</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Max Allowable Offer</p>
          <p className="text-sm font-medium">{formatCurrency(metrics.maxAllowableOffer)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Break-Even ARV</p>
          <p className="text-sm font-medium">{formatCurrency(metrics.breakEvenArv)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Min. Safe ARV</p>
          <p className="text-sm font-medium">{formatCurrency(metrics.minimumArv)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Cushion</p>
          <p className={cn(
            'text-sm font-medium',
            metrics.cushionPercent >= 10 ? 'text-green-600' : 'text-amber-600'
          )}>
            {formatPercent(metrics.cushionPercent)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Financing Summary Component
// ============================================================================

interface FinancingSummaryProps {
  calculation: FinancingCalculation | null
  inputs: FinancingInputs | null
  className?: string
}

function FinancingSummary({ calculation, inputs, className }: FinancingSummaryProps) {
  if (!calculation || !inputs) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-primary" stroke={1.5} />
            Investment Summary
          </CardTitle>
          <CardDescription>
            Complete the calculator to see your investment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Enter financing details to generate summary
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const summary = calculateSummary(calculation)
  const analysis = analyzeDeal(inputs, calculation)
  
  const profitVariant = summary.profitability === 'profitable' 
    ? 'positive' 
    : summary.profitability === 'unprofitable' 
      ? 'negative' 
      : 'warning'
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconChartBar className="h-5 w-5 text-primary" stroke={1.5} />
          Investment Summary
        </CardTitle>
        <CardDescription>
          Key metrics and deal analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Metrics */}
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Cash Required"
            value={calculation.cashRequired}
            subValue="At closing"
            icon={IconCurrencyDollar}
          />
          <MetricCard
            label="Monthly Holding Cost"
            value={calculation.totalMonthlyHoldingCost}
            subValue="All-in monthly"
            icon={IconCalculator}
          />
          <MetricCard
            label="All-In Cost"
            value={calculation.allInCost}
            subValue="Total investment"
            icon={IconPigMoney}
          />
          <MetricCard
            label="Estimated Profit"
            value={calculation.estimatedProfit}
            variant={profitVariant}
            icon={calculation.estimatedProfit >= 0 ? IconTrendingUp : IconTrendingDown}
          />
        </div>
        
        <Separator />
        
        {/* ROI Gauge */}
        <ROIGauge 
          roi={calculation.roi} 
          annualizedROI={calculation.annualizedROI}
        />
        
        <Separator />
        
        {/* Deal Analysis */}
        <DealAnalysisDisplay analysis={analysis} />
        
        {/* Cost Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Cost Breakdown</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Price</span>
              <span>{formatCurrency(inputs.purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closing Costs</span>
              <span>{formatCurrency(calculation.closingCosts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rehab Budget</span>
              <span>{formatCurrency(inputs.rehabBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Holding Costs ({inputs.holdingPeriodMonths} mo)</span>
              <span>{formatCurrency(calculation.totalHoldingCosts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling Costs</span>
              <span>{formatCurrency(calculation.sellingCosts)}</span>
            </div>
            {calculation.pointsCost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Points</span>
                <span>{formatCurrency(calculation.pointsCost)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between font-medium">
              <span>Total Costs</span>
              <span>{formatCurrency(calculation.allInCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ARV (Sale Price)</span>
              <span>{formatCurrency(inputs.arv)}</span>
            </div>
            <Separator className="my-1" />
            <div className={cn(
              'flex justify-between font-semibold',
              calculation.estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              <span>Net Profit</span>
              <span>{formatCurrency(calculation.estimatedProfit)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { FinancingSummary, MetricCard, ROIGauge, DealAnalysisDisplay }
export type { FinancingSummaryProps, MetricCardProps, ROIGaugeProps, DealAnalysisDisplayProps }
