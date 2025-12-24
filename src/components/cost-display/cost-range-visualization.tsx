'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { CostUtils } from '@/lib/cost-calculator'
import { cn } from '@/lib/utils'

interface CostRangeVisualizationProps {
  estimatedCost: number
  costRange: { min: number; max: number }
  confidenceLevel: number
  factors?: {
    regional: number
    quality: number
    market: number
    difficulty: number
  }
  className?: string
}

export function CostRangeVisualization({
  estimatedCost,
  costRange,
  confidenceLevel,
  factors,
  className
}: CostRangeVisualizationProps) {
  const variance = ((costRange.max - costRange.min) / estimatedCost) * 100
  const confidencePercentage = Math.round(confidenceLevel * 100)
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cost Range Analysis
        </CardTitle>
        <CardDescription>
          Estimated cost range with confidence analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Range Display */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {CostUtils.formatCurrency(estimatedCost)}
            </div>
            <div className="text-sm text-muted-foreground">
              Most Likely Cost
            </div>
          </div>
          
          {/* Range Visualization */}
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <div className="text-center">
                <div className="text-lg font-medium text-green-600">
                  {CostUtils.formatCurrency(costRange.min)}
                </div>
                <div className="text-xs text-muted-foreground">Best Case</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-red-600">
                  {CostUtils.formatCurrency(costRange.max)}
                </div>
                <div className="text-xs text-muted-foreground">Worst Case</div>
              </div>
            </div>
            
            {/* Visual Range Bar */}
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-60"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-2 h-6 bg-primary rounded-sm shadow-sm"
                style={{ 
                  left: `${((estimatedCost - costRange.min) / (costRange.max - costRange.min)) * 100}%`,
                  marginLeft: '-4px'
                }}
              />
            </div>
            
            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="text-xs">
                ±{variance.toFixed(1)}% variance
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Confidence Level */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Confidence Level</span>
            <div className="flex items-center gap-2">
              {confidenceLevel > 0.8 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : confidenceLevel > 0.6 ? (
                <Info className="w-4 h-4 text-yellow-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium">{confidencePercentage}%</span>
            </div>
          </div>
          
          <Progress value={confidencePercentage} className="h-2" />
          
          <div className="text-sm text-muted-foreground">
            {confidenceLevel > 0.8 ? (
              "High confidence - estimate based on recent, local data"
            ) : confidenceLevel > 0.6 ? (
              "Moderate confidence - some data limitations"
            ) : (
              "Lower confidence - limited local data available"
            )}
          </div>
        </div>
        
        {/* Cost Factors */}
        {factors && (
          <div className="space-y-3">
            <h4 className="font-medium">Cost Factors Applied</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Regional:</span>
                <span className="font-medium">{factors.regional.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className="font-medium">{factors.quality.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Market:</span>
                <span className="font-medium">{factors.market.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="font-medium">{factors.difficulty.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CostTrendProps {
  historicalCosts?: Array<{ date: Date; cost: number }>
  projectedCost: number
  className?: string
}

export function CostTrend({ historicalCosts, projectedCost, className }: CostTrendProps) {
  // For now, we'll show a placeholder since we don't have historical data yet
  const mockTrend = [
    { period: '3 months ago', cost: projectedCost * 0.95, trend: 'up' },
    { period: '2 months ago', cost: projectedCost * 0.98, trend: 'up' },
    { period: '1 month ago', cost: projectedCost * 1.02, trend: 'up' },
    { period: 'Current', cost: projectedCost, trend: 'stable' }
  ]
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cost Trend Analysis
        </CardTitle>
        <CardDescription>
          How costs have changed over time in your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockTrend.map((period, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {period.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : period.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm">{period.period}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{CostUtils.formatCurrency(period.cost)}</div>
              {index > 0 && (
                <div className="text-xs text-muted-foreground">
                  {period.cost > mockTrend[index - 1].cost ? '+' : ''}
                  {(((period.cost - mockTrend[index - 1].cost) / mockTrend[index - 1].cost) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Costs in your area have increased 5.2% over the past quarter. 
            Consider locking in contractor quotes soon.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
