'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  IconCalendar, 
  IconHome2, 
  IconHammer, 
  IconTag, 
  IconCheck,
  IconTrendingUp,
  IconTrendingDown
} from '@/lib/icons'
import { 
  type FinancingCalculation,
  type FinancialTimeline as FinancialTimelineData,
  type TimelineEvent,
  generateTimeline,
  formatCurrency
} from '@/lib/financing'
import type { FinancingInputs } from '@/lib/financing/types'

// ============================================================================
// Timeline Event Component
// ============================================================================

interface TimelineEventProps {
  event: TimelineEvent
  isLast: boolean
  maxCashOutlay: number
}

function TimelineEventItem({ event, isLast, maxCashOutlay }: TimelineEventProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'purchase':
        return IconHome2
      case 'rehab_start':
      case 'rehab_end':
        return IconHammer
      case 'listing':
        return IconTag
      case 'sale':
        return IconCheck
      default:
        return IconCalendar
    }
  }
  
  const Icon = getIcon()
  const isPositive = event.cumulativeCashFlow >= 0
  
  // Calculate position for the cash flow bar
  const barWidth = Math.abs(event.cumulativeCashFlow) / maxCashOutlay * 100
  
  return (
    <div className="relative flex items-start gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 h-full w-0.5 bg-border" />
      )}
      
      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
          event.type === 'sale' 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-primary bg-primary/10'
        )}
      >
        <Icon 
          className={cn(
            'h-4 w-4',
            event.type === 'sale' ? 'text-green-600' : 'text-primary'
          )} 
          stroke={1.5} 
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-xs text-muted-foreground">Month {event.month}</p>
          </div>
          <div className="text-right">
            <p className={cn(
              'text-sm font-medium',
              event.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {event.cashFlow >= 0 ? '+' : ''}{formatCurrency(event.cashFlow)}
            </p>
          </div>
        </div>
        
        {/* Cumulative cash flow bar */}
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isPositive ? 'bg-green-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(barWidth, 100)}%` }}
          />
        </div>
        <p className={cn(
          'mt-1 text-xs',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          Cumulative: {formatCurrency(event.cumulativeCashFlow)}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Cash Flow Chart Component
// ============================================================================

interface CashFlowChartProps {
  timeline: FinancialTimelineData
  className?: string
}

function CashFlowChart({ timeline, className }: CashFlowChartProps) {
  const { events, peakCashOutlay } = timeline
  
  // Calculate chart dimensions
  const chartHeight = 120
  const chartWidth = 100 // percentage
  
  // Generate path for the line chart
  const pathPoints = useMemo(() => {
    if (events.length === 0) return ''
    
    const maxMonth = events[events.length - 1].month
    const maxValue = Math.max(peakCashOutlay, Math.abs(timeline.finalProfit))
    
    return events.map((event, i) => {
      const x = maxMonth > 0 ? (event.month / maxMonth) * chartWidth : 0
      // Normalize to chart height, with 0 at middle
      const normalizedValue = event.cumulativeCashFlow / maxValue
      const y = chartHeight / 2 - (normalizedValue * (chartHeight / 2 - 10))
      
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [events, peakCashOutlay, timeline.finalProfit])
  
  // Calculate zero line position
  const maxValue = Math.max(peakCashOutlay, Math.abs(timeline.finalProfit))
  const zeroY = chartHeight / 2
  
  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-32 w-full"
        preserveAspectRatio="none"
      >
        {/* Zero line */}
        <line
          x1="0"
          y1={zeroY}
          x2={chartWidth}
          y2={zeroY}
          stroke="currentColor"
          strokeDasharray="2 2"
          className="text-muted-foreground/30"
        />
        
        {/* Gradient fill */}
        <defs>
          <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={`${pathPoints} L ${chartWidth} ${zeroY} L 0 ${zeroY} Z`}
          fill="url(#cashFlowGradient)"
        />
        
        {/* Line */}
        <path
          d={pathPoints}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {events.map((event, i) => {
          const maxMonth = events[events.length - 1].month
          const x = maxMonth > 0 ? (event.month / maxMonth) * chartWidth : 0
          const normalizedValue = event.cumulativeCashFlow / maxValue
          const y = chartHeight / 2 - (normalizedValue * (chartHeight / 2 - 10))
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          )
        })}
      </svg>
      
      {/* Labels */}
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Purchase</span>
        <span>Rehab</span>
        <span>Sale</span>
      </div>
    </div>
  )
}

// ============================================================================
// Main Financial Timeline Component
// ============================================================================

interface FinancialTimelineProps {
  calculation: FinancingCalculation | null
  inputs: FinancingInputs | null
  rehabDurationMonths?: number
  className?: string
}

function FinancialTimeline({ 
  calculation, 
  inputs,
  rehabDurationMonths = 3,
  className 
}: FinancialTimelineProps) {
  // Generate timeline
  const timeline = useMemo(() => {
    if (!calculation || !inputs) return null
    return generateTimeline(inputs, calculation, rehabDurationMonths)
  }, [calculation, inputs, rehabDurationMonths])
  
  if (!timeline || !calculation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5 text-primary" stroke={1.5} />
            Financial Timeline
          </CardTitle>
          <CardDescription>
            Enter financial details to see your project timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Complete the financing calculator to generate timeline
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const isProfit = timeline.finalProfit >= 0
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="h-5 w-5 text-primary" stroke={1.5} />
          Financial Timeline
        </CardTitle>
        <CardDescription>
          Cash flow visualization over {timeline.totalMonths} month holding period
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Peak Outlay</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(-timeline.peakCashOutlay)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Break Even</p>
            <p className="text-lg font-semibold">
              {timeline.breakEvenMonth !== null 
                ? `Month ${timeline.breakEvenMonth}` 
                : 'At Sale'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Final Profit</p>
            <p className={cn(
              'text-lg font-semibold flex items-center justify-center gap-1',
              isProfit ? 'text-green-600' : 'text-red-600'
            )}>
              {isProfit 
                ? <IconTrendingUp className="h-4 w-4" stroke={1.5} />
                : <IconTrendingDown className="h-4 w-4" stroke={1.5} />
              }
              {formatCurrency(timeline.finalProfit)}
            </p>
          </div>
        </div>
        
        {/* Cash Flow Chart */}
        <CashFlowChart timeline={timeline} />
        
        {/* Timeline Events */}
        <div className="space-y-0">
          {timeline.events.map((event, index) => (
            <TimelineEventItem
              key={event.month + event.type}
              event={event}
              isLast={index === timeline.events.length - 1}
              maxCashOutlay={timeline.peakCashOutlay}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { FinancialTimeline, CashFlowChart, TimelineEventItem }
export type { FinancialTimelineProps, CashFlowChartProps, TimelineEventProps }
