'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconCircleCheck, IconAlertTriangle, IconAlertCircle } from '@/lib/icons'
import type { Comp } from '@/hooks/use-deals-store'
import { cn } from '@/lib/utils'

interface ConfidenceFactor {
  score: number
  max: number
  label: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  explanation: string
  improvement: string
}

interface ConfidenceBreakdownProps {
  comps: Comp[]
  totalScore: number
  className?: string
}

// Calculate detailed confidence breakdown
function calculateConfidenceBreakdown(comps: Comp[]): ConfidenceFactor[] {
  const factors: ConfidenceFactor[] = []
  
  // Comp Count Factor (0-25 pts)
  let compScore = 0
  let compStatus: ConfidenceFactor['status'] = 'poor'
  let compExplanation = ''
  let compImprovement = ''
  
  if (comps.length >= 3) {
    compScore = 25
    compStatus = 'excellent'
    compExplanation = 'Excellent comp count provides strong foundation for ARV'
    compImprovement = 'Continue adding comps for even higher confidence'
  } else if (comps.length === 2) {
    compScore = 15
    compStatus = 'good'
    compExplanation = 'Good comp count, but more data would improve accuracy'
    compImprovement = 'Add 1-2 more comps for excellent confidence'
  } else if (comps.length === 1) {
    compScore = 5
    compStatus = 'fair'
    compExplanation = 'Single comp provides limited data for accurate ARV'
    compImprovement = 'Add 2-3 more comparable sales'
  } else {
    compScore = 0
    compStatus = 'poor'
    compExplanation = 'No comps available for calculation'
    compImprovement = 'Add at least 3 comparable sales'
  }
  
  factors.push({
    score: compScore,
    max: 25,
    label: 'Comp Count',
    status: compStatus,
    explanation: compExplanation,
    improvement: compImprovement
  })
  
  // Recency Factor (0-25 pts)
  let recencyScore = 0
  let recencyStatus: ConfidenceFactor['status'] = 'poor'
  let recencyExplanation = ''
  let recencyImprovement = ''
  
  if (comps.length > 0) {
    const now = new Date()
    const avgMonthsAgo = comps.reduce((acc, comp) => {
      if (!comp.sale_date) return acc + 12 // Assume old if no date
      const saleDate = new Date(comp.sale_date)
      const monthsAgo = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return acc + monthsAgo
    }, 0) / comps.length
    
    if (avgMonthsAgo <= 3) {
      recencyScore = 25
      recencyStatus = 'excellent'
      recencyExplanation = 'All comps are very recent (within 3 months)'
      recencyImprovement = 'Excellent recency - no action needed'
    } else if (avgMonthsAgo <= 6) {
      recencyScore = 20
      recencyStatus = 'good'
      recencyExplanation = 'Comps are reasonably recent (within 6 months)'
      recencyImprovement = 'Consider adding more recent sales if available'
    } else if (avgMonthsAgo <= 12) {
      recencyScore = 10
      recencyStatus = 'fair'
      recencyExplanation = 'Some comps are getting dated (6-12 months old)'
      recencyImprovement = 'Replace older comps with more recent sales'
    } else {
      recencyScore = 0
      recencyStatus = 'poor'
      recencyExplanation = 'Comps are quite old (over 12 months)'
      recencyImprovement = 'Find more recent comparable sales'
    }
  }
  
  factors.push({
    score: recencyScore,
    max: 25,
    label: 'Sale Recency',
    status: recencyStatus,
    explanation: recencyExplanation,
    improvement: recencyImprovement
  })
  
  // Price Variance Factor (0-25 pts)
  let varianceScore = 0
  let varianceStatus: ConfidenceFactor['status'] = 'poor'
  let varianceExplanation = ''
  let varianceImprovement = ''
  
  if (comps.length >= 2) {
    const prices = comps.map(c => Number(c.sale_price) || 0).filter(p => p > 0)
    if (prices.length >= 2) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length
      const stdDev = Math.sqrt(variance)
      const coeffVariation = stdDev / avg
      
      if (coeffVariation <= 0.1) {
        varianceScore = 25
        varianceStatus = 'excellent'
        varianceExplanation = 'Very consistent pricing across comps'
        varianceImprovement = 'Excellent consistency - no action needed'
      } else if (coeffVariation <= 0.2) {
        varianceScore = 15
        varianceStatus = 'good'
        varianceExplanation = 'Reasonably consistent pricing'
        varianceImprovement = 'Consider removing outlier comps if any'
      } else {
        varianceScore = 5
        varianceStatus = 'fair'
        varianceExplanation = 'Wide price variation between comps'
        varianceImprovement = 'Review comp selection for better consistency'
      }
    }
  } else {
    varianceExplanation = 'Need multiple comps to assess price variance'
    varianceImprovement = 'Add more comps to evaluate consistency'
  }
  
  factors.push({
    score: varianceScore,
    max: 25,
    label: 'Price Consistency',
    status: varianceStatus,
    explanation: varianceExplanation,
    improvement: varianceImprovement
  })
  
  // Adjustment Spread Factor (0-25 pts)
  let adjustmentScore = 0
  let adjustmentStatus: ConfidenceFactor['status'] = 'poor'
  let adjustmentExplanation = ''
  let adjustmentImprovement = ''
  
  if (comps.length >= 2) {
    const adjustments = comps.map(comp => {
      const sqft = Number(comp.adjustment_sqft) || 0
      const bedrooms = Number(comp.adjustment_bedrooms) || 0
      const bathrooms = Number(comp.adjustment_bathrooms) || 0
      const condition = Number(comp.adjustment_condition) || 0
      const age = Number(comp.adjustment_age) || 0
      const other = Number(comp.adjustment_other) || 0
      return Math.abs(sqft + bedrooms + bathrooms + condition + age + other)
    })
    
    const avgAbsAdj = adjustments.reduce((a, b) => a + b, 0) / adjustments.length
    
    if (avgAbsAdj <= 5000) {
      adjustmentScore = 25
      adjustmentStatus = 'excellent'
      adjustmentExplanation = 'Minimal adjustments needed - comps are very similar'
      adjustmentImprovement = 'Excellent comp selection'
    } else if (avgAbsAdj <= 15000) {
      adjustmentScore = 15
      adjustmentStatus = 'good'
      adjustmentExplanation = 'Moderate adjustments required'
      adjustmentImprovement = 'Look for more similar properties if possible'
    } else {
      adjustmentScore = 5
      adjustmentStatus = 'fair'
      adjustmentExplanation = 'Large adjustments required - comps are quite different'
      adjustmentImprovement = 'Find more similar properties to reduce adjustments'
    }
  } else {
    adjustmentExplanation = 'Need multiple comps to assess adjustment spread'
    adjustmentImprovement = 'Add more comps to evaluate similarity'
  }
  
  factors.push({
    score: adjustmentScore,
    max: 25,
    label: 'Comp Similarity',
    status: adjustmentStatus,
    explanation: adjustmentExplanation,
    improvement: adjustmentImprovement
  })
  
  return factors
}

// Get status icon
function getStatusIcon(status: ConfidenceFactor['status']) {
  switch (status) {
    case 'excellent':
      return <IconCircleCheck className="h-4 w-4 text-emerald-500" />
    case 'good':
      return <IconCircleCheck className="h-4 w-4 text-blue-500" />
    case 'fair':
      return <IconAlertCircle className="h-4 w-4 text-yellow-500" />
    case 'poor':
      return <IconAlertTriangle className="h-4 w-4 text-red-500" />
  }
}

// Get status color for progress bar
function getStatusColor(status: ConfidenceFactor['status']) {
  switch (status) {
    case 'excellent':
      return 'bg-emerald-500'
    case 'good':
      return 'bg-blue-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'poor':
      return 'bg-red-500'
  }
}

export function ConfidenceBreakdown({ comps, totalScore, className }: ConfidenceBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const factors = calculateConfidenceBreakdown(comps)
  
  const overallStatus = totalScore >= 75 ? 'excellent' : totalScore >= 60 ? 'good' : totalScore >= 40 ? 'fair' : 'poor'
  
  return (
    <div className={className}>
      {/* Overall Confidence Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Confidence Analysis:</span>
          {getStatusIcon(overallStatus)}
          <span className="text-sm font-semibold">
            {totalScore >= 75 ? 'High' : totalScore >= 60 ? 'Good' : totalScore >= 40 ? 'Medium' : 'Low'} ({totalScore}%)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-1"
        >
          <span className="text-xs mr-1">Details</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Main Confidence Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          {/* Segmented progress bar showing each factor */}
          <div className="h-full flex">
            {factors.map((factor, index) => (
              <div
                key={factor.label}
                className={cn(
                  "h-full transition-all duration-500",
                  getStatusColor(factor.status),
                  index > 0 && "ml-0.5"
                )}
                style={{ width: `${(factor.score / 100) * 100}%` }}
                title={`${factor.label}: ${factor.score}/${factor.max}`}
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-muted-foreground w-12 text-right">
          {totalScore}%
        </span>
      </div>
      
      {/* Expandable Factor Details */}
      {isExpanded && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Confidence Factors Breakdown
            </div>
            
            <div className="space-y-3">
              {factors.map((factor) => (
                <div key={factor.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(factor.status)}
                      <span className="text-sm font-medium">{factor.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", getStatusColor(factor.status))}
                          style={{ width: `${(factor.score / factor.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {factor.score}/{factor.max}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pl-6 space-y-1">
                    <p className="text-xs text-muted-foreground">{factor.explanation}</p>
                    {factor.status !== 'excellent' && (
                      <p className="text-xs text-blue-600 font-medium">
                        💡 {factor.improvement}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Overall Recommendation */}
            <div className="pt-3 border-t">
              <div className="flex items-start gap-2">
                <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Confidence Summary</p>
                  <p className="text-muted-foreground">
                    {totalScore >= 75 
                      ? "Excellent confidence level. Your ARV calculation is highly reliable."
                      : totalScore >= 60
                      ? "Good confidence level. Consider the improvements above for even better accuracy."
                      : totalScore >= 40
                      ? "Medium confidence. Review the recommendations above to strengthen your ARV."
                      : "Low confidence. Focus on adding more and better comparable sales before proceeding."
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { ConfidenceBreakdown }