'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MarketAnalysis } from '@/hooks/use-deals-store'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

interface MarketVelocityScoreProps {
  marketAnalysis: MarketAnalysis | null
  className?: string
}

interface BreakdownScores {
  dom: number
  listSale: number
  absorption: number
  reductions: number
}

type MarketTemperature = 'cold' | 'cool' | 'warm' | 'hot'

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate DOM Score (0-3) based on average days on market
 * Lower DOM = higher score (faster market)
 */
function calculateDOMScore(avgDOM: number | null): number {
  if (avgDOM === null || avgDOM === undefined) return 0
  if (avgDOM <= 20) return 3
  if (avgDOM <= 35) return 2
  if (avgDOM <= 50) return 1
  return 0
}

/**
 * Calculate List-Sale Score (0-3) based on list-to-sale ratio
 * Higher ratio = higher score (sellers getting asking price)
 */
function calculateListSaleScore(listToSaleRatio: number | null): number {
  if (listToSaleRatio === null || listToSaleRatio === undefined) return 0
  if (listToSaleRatio >= 98) return 3
  if (listToSaleRatio >= 95) return 2
  if (listToSaleRatio >= 92) return 1
  return 0
}

/**
 * Calculate Absorption Score (0-3) based on inventory months
 * Lower inventory = higher score (seller's market)
 */
function calculateAbsorptionScore(inventoryMonths: number | null): number {
  if (inventoryMonths === null || inventoryMonths === undefined) return 0
  if (inventoryMonths <= 2) return 3
  if (inventoryMonths <= 4) return 2
  if (inventoryMonths <= 6) return 1
  return 0
}

/**
 * Calculate Reductions Score (0-3) based on appreciation rate
 * Higher appreciation = fewer price reductions = higher score
 */
function calculateReductionsScore(appreciationRate: number | null): number {
  if (appreciationRate === null || appreciationRate === undefined) return 0
  if (appreciationRate >= 5) return 3
  if (appreciationRate >= 3) return 2
  if (appreciationRate >= 1) return 1
  return 0
}

/**
 * Calculate total velocity score from breakdown components
 */
function calculateTotalVelocityScore(breakdown: BreakdownScores): number {
  return breakdown.dom + breakdown.listSale + breakdown.absorption + breakdown.reductions
}

/**
 * Get market temperature from score (0-12)
 */
function getMarketTemperature(score: number): MarketTemperature {
  if (score >= 8) return 'hot'
  if (score >= 6) return 'warm'
  if (score >= 4) return 'cool'
  return 'cold'
}

/**
 * Get temperature label text
 */
function getTemperatureLabel(temp: MarketTemperature): string {
  switch (temp) {
    case 'hot':
      return 'Hot'
    case 'warm':
      return 'Warm'
    case 'cool':
      return 'Cool'
    case 'cold':
      return 'Cold'
  }
}

/**
 * Get color classes based on temperature
 */
function getTemperatureColors(temp: MarketTemperature): { bg: string; text: string; border: string } {
  switch (temp) {
    case 'hot':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500',
      }
    case 'warm':
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-500',
      }
    case 'cool':
      return {
        bg: 'bg-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500',
      }
    case 'cold':
      return {
        bg: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500',
      }
  }
}

// ============================================================================
// Scale Segment Component
// ============================================================================

interface ScaleSegmentProps {
  startValue: number
  endValue: number
  color: string
  isFirst?: boolean
  isLast?: boolean
}

function ScaleSegment({ color, isFirst, isLast }: ScaleSegmentProps) {
  return (
    <div
      className={cn(
        'flex-1 h-3',
        color,
        isFirst && 'rounded-l-full',
        isLast && 'rounded-r-full'
      )}
    />
  )
}

// ============================================================================
// Score Indicator Component
// ============================================================================

interface ScoreIndicatorProps {
  score: number
  maxScore: number
}

function ScoreIndicator({ score, maxScore }: ScoreIndicatorProps) {
  const percentage = Math.min((score / maxScore) * 100, 100)

  return (
    <div
      className="absolute -top-1 transform -translate-x-1/2"
      style={{ left: `${percentage}%` }}
    >
      <div className="flex flex-col items-center">
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground" />
      </div>
    </div>
  )
}

// ============================================================================
// Breakdown Item Component
// ============================================================================

interface BreakdownItemProps {
  label: string
  score: number
  maxScore: number
}

function BreakdownItem({ label, score, maxScore }: BreakdownItemProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="font-medium">{label}:</span>
      <span className="tabular-nums">
        {score}/{maxScore}
      </span>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function MarketVelocityScore({ marketAnalysis, className }: MarketVelocityScoreProps) {
  // Handle null case
  if (!marketAnalysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Market Velocity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No market analysis data available
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate breakdown scores
  const breakdown: BreakdownScores = {
    dom: calculateDOMScore(marketAnalysis.avg_dom),
    listSale: calculateListSaleScore(marketAnalysis.list_to_sale_ratio),
    absorption: calculateAbsorptionScore(marketAnalysis.inventory_months),
    reductions: calculateReductionsScore(marketAnalysis.appreciation_rate),
  }

  // Use stored velocity_score if available, otherwise calculate
  const totalScore = marketAnalysis.velocity_score ?? calculateTotalVelocityScore(breakdown)

  // Get market temperature (use stored value if available)
  const temperature: MarketTemperature =
    (marketAnalysis.market_temp as MarketTemperature) ?? getMarketTemperature(totalScore)
  const tempColors = getTemperatureColors(temperature)

  // Scale segments (6 segments for 0-12 scale)
  const segments = [
    { start: 0, end: 2, color: 'bg-red-500' },
    { start: 2, end: 4, color: 'bg-red-400' },
    { start: 4, end: 6, color: 'bg-orange-500' },
    { start: 6, end: 8, color: 'bg-yellow-500' },
    { start: 8, end: 10, color: 'bg-yellow-400' },
    { start: 10, end: 12, color: 'bg-emerald-500' },
  ]

  // Tick marks
  const ticks = [0, 2, 4, 6, 8, 10, 12]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Market Velocity Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('text-2xl font-bold tabular-nums', tempColors.text)}>
              {totalScore}
            </span>
            <span className="text-lg text-muted-foreground">/12</span>
          </div>
          <div
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              tempColors.bg,
              'text-white'
            )}
          >
            {getTemperatureLabel(temperature)}
          </div>
        </div>

        {/* Scale Visualization */}
        <div className="space-y-1">
          {/* Scale Bar */}
          <div className="relative">
            <div className="flex h-3 rounded-full overflow-hidden">
              {segments.map((segment, index) => (
                <ScaleSegment
                  key={segment.start}
                  startValue={segment.start}
                  endValue={segment.end}
                  color={segment.color}
                  isFirst={index === 0}
                  isLast={index === segments.length - 1}
                />
              ))}
            </div>
            {/* Score Indicator */}
            <ScoreIndicator score={totalScore} maxScore={12} />
          </div>

          {/* Tick Labels */}
          <div className="relative flex justify-between px-0.5">
            {ticks.map((tick) => (
              <span key={tick} className="text-[10px] text-muted-foreground tabular-nums">
                {tick}
              </span>
            ))}
          </div>

          {/* Temperature Labels */}
          <div className="flex text-[10px] text-muted-foreground mt-1">
            <div className="flex-1 text-center" style={{ flex: 4 }}>
              Cold
            </div>
            <div className="flex-1 text-center" style={{ flex: 2 }}>
              Cool
            </div>
            <div className="flex-1 text-center" style={{ flex: 2 }}>
              Warm
            </div>
            <div className="flex-1 text-center" style={{ flex: 4 }}>
              Hot
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="pt-2 border-t">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <BreakdownItem label="DOM Score" score={breakdown.dom} maxScore={3} />
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <BreakdownItem label="List-Sale" score={breakdown.listSale} maxScore={3} />
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <BreakdownItem label="Absorption" score={breakdown.absorption} maxScore={3} />
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <BreakdownItem label="Reductions" score={breakdown.reductions} maxScore={3} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
