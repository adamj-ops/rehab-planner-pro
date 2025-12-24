'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Shield
} from 'lucide-react'
import { ROICalculationResult } from '@/lib/roi-calculator'
import { CostUtils } from '@/lib/cost-calculator'
import { cn } from '@/lib/utils'

interface ROISummaryProps {
  roiResult: ROICalculationResult
  className?: string
}

export function ROISummary({ roiResult, className }: ROISummaryProps) {
  const {
    totalInvestment,
    netProfit,
    roiPercentage,
    annualizedROI,
    cashFlow,
    scenarios,
    riskFactors,
    recommendations,
    warnings
  } = roiResult
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const getROIColor = (roi: number) => {
    if (roi > 20) return 'text-green-600'
    if (roi > 10) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main ROI Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ROI Analysis Summary
          </CardTitle>
          <CardDescription>
            Comprehensive return on investment analysis for your renovation project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className={cn("text-2xl font-bold", getROIColor(roiPercentage))}>
                {roiPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Total ROI</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className={cn("text-2xl font-bold", getROIColor(annualizedROI))}>
                {annualizedROI.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Annualized ROI</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">
                {CostUtils.formatCurrency(netProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Shield className={cn("w-8 h-8 mx-auto mb-2", 
                riskFactors.overallRisk === 'low' ? 'text-green-600' :
                riskFactors.overallRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
              )} />
              <div className="text-2xl font-bold capitalize">
                {riskFactors.overallRisk}
              </div>
              <div className="text-sm text-muted-foreground">Risk Level</div>
            </div>
          </div>
          
          {/* Investment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Investment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Investment:</span>
                  <span className="font-medium">{CostUtils.formatCurrency(totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Return:</span>
                  <span className="font-medium">{CostUtils.formatCurrency(totalInvestment + netProfit)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Profit:</span>
                  <span className={cn("font-medium", getROIColor(roiPercentage))}>
                    {CostUtils.formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Cash Flow</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Cash Flow:</span>
                  <span className={cn("font-medium", 
                    cashFlow.monthly > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {CostUtils.formatCurrency(cashFlow.monthly)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Cash Flow:</span>
                  <span className={cn("font-medium",
                    cashFlow.annual > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {CostUtils.formatCurrency(cashFlow.annual)}
                  </span>
                </div>
                {roiResult.capRate && (
                  <div className="flex justify-between">
                    <span>Cap Rate:</span>
                    <span className="font-medium">{roiResult.capRate.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="font-medium mb-1">Market Risk</div>
              <Badge className={getRiskColor(riskFactors.marketRisk)}>
                {riskFactors.marketRisk}
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="font-medium mb-1">Execution Risk</div>
              <Badge className={getRiskColor(riskFactors.executionRisk)}>
                {riskFactors.executionRisk}
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="font-medium mb-1">Liquidity Risk</div>
              <Badge className={getRiskColor(riskFactors.liquidityRisk)}>
                {riskFactors.liquidityRisk}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
          <CardDescription>
            Conservative, realistic, and optimistic projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(scenarios).map(([scenarioName, scenario]) => (
              <div key={scenarioName} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{scenarioName}</span>
                    <Badge variant="outline">{(scenario.probability * 100).toFixed(0)}% likely</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{CostUtils.formatCurrency(scenario.netProfit)}</div>
                    <div className="text-sm text-muted-foreground">{scenario.roiPercentage.toFixed(1)}% ROI</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>ARV: {CostUtils.formatCurrency(scenario.arv)}</div>
                  <div>Rehab: {CostUtils.formatCurrency(scenario.rehabCost)}</div>
                  <div>Timeline: {scenario.timeline} months</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendations & Warnings */}
      {(recommendations.length > 0 || warnings.length > 0) && (
        <div className="space-y-4">
          {recommendations.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Recommendations:</div>
                <ul className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Warnings:</div>
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
