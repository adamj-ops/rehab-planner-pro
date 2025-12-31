'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { MarketAnalysis } from '@/hooks/use-deals-store'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number | null
  score: number | null // 0-10 scale
  status: string
  statusColor?: string
  progressColor?: string
}

function MetricCard({ label, value, score, status, statusColor, progressColor }: MetricCardProps) {
  const displayValue = value === null || value === undefined ? '—' : String(value)
  const scorePercent = score !== null && score !== undefined ? Math.min((score / 10) * 100, 100) : 0

  // Default colors based on score
  const defaultProgressColor =
    score === null || score === undefined
      ? 'bg-muted'
      : score >= 8
        ? 'bg-emerald-500'
        : score >= 6
          ? 'bg-blue-500'
          : score >= 4
            ? 'bg-amber-500'
            : 'bg-red-500'

  const defaultStatusColor =
    score === null || score === undefined
      ? 'text-muted-foreground'
      : score >= 8
        ? 'text-emerald-600 dark:text-emerald-400'
        : score >= 6
          ? 'text-blue-600 dark:text-blue-400'
          : score >= 4
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-600 dark:text-red-400'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Label */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>

          {/* Value */}
          <p className="text-xl font-semibold tabular-nums">{displayValue}</p>

          {/* Progress Bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all duration-300', progressColor || defaultProgressColor)}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          {/* Status */}
          <p className={cn('text-xs font-medium', statusColor || defaultStatusColor)}>{status}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface NeighborhoodHealthGridProps {
  marketAnalysis: MarketAnalysis | null
  className?: string
}

/**
 * Helper function to format appreciation rate
 */
function formatAppreciationRate(value: number | null): string {
  if (value === null || value === undefined) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Helper function to format DOM (Days on Market)
 */
function formatDOM(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value} days`
}

/**
 * Helper function to format inventory months
 */
function formatInventoryMonths(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)} months`
}

/**
 * Helper function to format list-to-sale ratio
 */
function formatListToSaleRatio(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}%`
}

/**
 * Helper function to format crime index change
 */
function formatCrimeIndex(value: number | null): string {
  if (value === null || value === undefined) return '—'
  // Assuming crime_index is 1-10, where 10 is safest
  // For display, we might want to show it as a score
  return `${value.toFixed(1)}/10`
}

/**
 * Helper function to format school rating
 */
function formatSchoolRating(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}/10`
}

/**
 * Helper function to format employment score
 */
function formatEmploymentScore(value: number | null): string {
  if (value === null || value === undefined) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Helper function to format rental demand score
 */
function formatRentalDemandScore(value: number | null): string {
  if (value === null || value === undefined) return '—'
  // Assuming rental_demand_score is 1-10
  if (value >= 8) return 'High'
  if (value >= 6) return 'Moderate'
  if (value >= 4) return 'Low'
  return 'Very Low'
}

/**
 * Helper function to get status text for appreciation rate
 */
function getAppreciationStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Above avg'
  if (score >= 6) return 'Average'
  if (score >= 4) return 'Below avg'
  return 'Poor'
}

/**
 * Helper function to get status text for DOM
 */
function getDOMStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Very good'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Average'
  return 'Slow'
}

/**
 * Helper function to get status text for inventory
 */
function getInventoryStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Seller mkt'
  if (score >= 6) return 'Balanced'
  if (score >= 4) return 'Buyer mkt'
  return 'Oversupply'
}

/**
 * Helper function to get status text for list-to-sale ratio
 */
function getListToSaleStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Strong'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Average'
  return 'Weak'
}

/**
 * Helper function to get status text for crime index
 */
function getCrimeStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Very safe'
  if (score >= 6) return 'Safe'
  if (score >= 4) return 'Average'
  return 'Concern'
}

/**
 * Helper function to get status text for school rating
 */
function getSchoolStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Average'
  return 'Below avg'
}

/**
 * Helper function to get status text for employment
 */
function getEmploymentStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Growing'
  if (score >= 6) return 'Stable'
  if (score >= 4) return 'Declining'
  return 'Weak'
}

/**
 * Helper function to get status text for rental demand
 */
function getRentalDemandStatus(score: number | null): string {
  if (score === null || score === undefined) return 'Not set'
  if (score >= 8) return 'Strong'
  if (score >= 6) return 'Moderate'
  if (score >= 4) return 'Low'
  return 'Very Low'
}

/**
 * Calculate score from value for metrics that need conversion
 * For metrics already on 0-10 scale, return as-is
 */
function calculateScore(value: number | null, metricType: string): number | null {
  if (value === null || value === undefined) return null

  switch (metricType) {
    case 'appreciation_rate':
      // Convert percentage to 0-10 scale (assume 5% = 5, 10% = 10, etc.)
      return Math.min(Math.max(value * 2, 0), 10)
    case 'avg_dom':
      // Lower DOM is better, so invert: 0 days = 10, 60+ days = 0
      return Math.max(0, Math.min(10, 10 - value / 6))
    case 'inventory_months':
      // Lower inventory is better: 0-2 months = 10, 6+ months = 0
      return Math.max(0, Math.min(10, 10 - value * 1.67))
    case 'list_to_sale_ratio':
      // Higher ratio is better: 100% = 10, 90% = 5, 80% = 0
      return Math.max(0, Math.min(10, (value - 80) * 0.5))
    case 'crime_index':
    case 'school_rating':
    case 'rental_demand_score':
    case 'employment_score':
      // Already on 0-10 scale
      return Math.max(0, Math.min(10, value))
    default:
      return null
  }
}

export function NeighborhoodHealthGrid({ marketAnalysis, className }: NeighborhoodHealthGridProps) {
  if (!marketAnalysis) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No market analysis data available</p>
        </CardContent>
      </Card>
    )
  }

  const metrics = [
    // Row 1
    {
      label: 'Appreciation',
      value: formatAppreciationRate(marketAnalysis.appreciation_rate),
      score: calculateScore(marketAnalysis.appreciation_rate, 'appreciation_rate'),
      status: getAppreciationStatus(calculateScore(marketAnalysis.appreciation_rate, 'appreciation_rate')),
    },
    {
      label: 'Avg DOM',
      value: formatDOM(marketAnalysis.avg_dom),
      score: calculateScore(marketAnalysis.avg_dom, 'avg_dom'),
      status: getDOMStatus(calculateScore(marketAnalysis.avg_dom, 'avg_dom')),
    },
    {
      label: 'Inventory',
      value: formatInventoryMonths(marketAnalysis.inventory_months),
      score: calculateScore(marketAnalysis.inventory_months, 'inventory_months'),
      status: getInventoryStatus(calculateScore(marketAnalysis.inventory_months, 'inventory_months')),
    },
    {
      label: 'List/Sale',
      value: formatListToSaleRatio(marketAnalysis.list_to_sale_ratio),
      score: calculateScore(marketAnalysis.list_to_sale_ratio, 'list_to_sale_ratio'),
      status: getListToSaleStatus(calculateScore(marketAnalysis.list_to_sale_ratio, 'list_to_sale_ratio')),
    },
    // Row 2
    {
      label: 'Crime Rate',
      value: formatCrimeIndex(marketAnalysis.crime_index),
      score: calculateScore(marketAnalysis.crime_index, 'crime_index'),
      status: getCrimeStatus(calculateScore(marketAnalysis.crime_index, 'crime_index')),
    },
    {
      label: 'Schools',
      value: formatSchoolRating(marketAnalysis.school_rating),
      score: calculateScore(marketAnalysis.school_rating, 'school_rating'),
      status: getSchoolStatus(calculateScore(marketAnalysis.school_rating, 'school_rating')),
    },
    {
      label: 'Employment',
      value: formatEmploymentScore(marketAnalysis.employment_score),
      score: calculateScore(marketAnalysis.employment_score, 'employment_score'),
      status: getEmploymentStatus(calculateScore(marketAnalysis.employment_score, 'employment_score')),
    },
    {
      label: 'Rental Dem.',
      value: formatRentalDemandScore(marketAnalysis.rental_demand_score),
      score: calculateScore(marketAnalysis.rental_demand_score, 'rental_demand_score'),
      status: getRentalDemandStatus(calculateScore(marketAnalysis.rental_demand_score, 'rental_demand_score')),
    },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  )
}
