'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChargingProgressCompact } from '@/components/rehab-estimator/charging-progress-compact'
import { 
  DollarSign, 
  TrendingUp, 
  Home, 
  AlertTriangle
} from 'lucide-react'
import { RehabProject, EstimateSummary as EstimateSummaryType } from '@/types/rehab'
import { cn } from '@/lib/utils'

interface EstimateSummaryProps {
  project: Partial<RehabProject>
  estimateSummary: EstimateSummaryType | null
  currentStep: number
}

export function EstimateSummary({ project, estimateSummary, currentStep }: EstimateSummaryProps) {
  const summary = estimateSummary || {
    totalCost: 0,
    materialCost: 0,
    laborCost: 0,
    contingency: 0,
    timeline: 0,
    roiImpact: 0,
    budgetUsage: 0,
    categoryBreakdown: {}
  }

  const isOverBudget = project.maxBudget && summary.totalCost > project.maxBudget
  const budgetRemaining = project.maxBudget ? project.maxBudget - summary.totalCost : 0

  return (
    <div className="space-y-4">
      {/* Project Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <ChargingProgressCompact 
              currentStep={currentStep} 
              totalSteps={7}
            />
          </div>

          <Separator />

          {/* Project Info */}
          {project.projectName && (
            <div>
              <div className="text-sm font-medium">{project.projectName}</div>
              <div className="text-xs text-muted-foreground">
                {project.address?.street}, {project.address?.city}
              </div>
            </div>
          )}
          
          {project.squareFeet && (
            <div className="flex items-center space-x-2">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{project.squareFeet.toLocaleString()} sq ft</span>
            </div>
          )}
          
          {project.investmentStrategy && (
            <Badge variant="outline" className="capitalize">
              {project.investmentStrategy.replace('_', ' ')}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Deal Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Deal Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What we know */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="font-semibold">
                {project.purchasePrice ? `$${project.purchasePrice.toLocaleString()}` : '--'}
              </span>
            </div>
          </div>

          <Separator />

          {/* What we'll calculate */}
          <div className="space-y-2 opacity-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Est. Rehab Cost</span>
              <span className="text-sm">Pending assessment</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Investment</span>
              <span className="text-sm">Pending assessment</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Est. ARV</span>
              <span className="text-sm">Pending scope</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Projected Profit</span>
              <span className="text-sm">Pending scope</span>
            </div>
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Complete all steps to see full analysis
          </p>

          {/* ROI Impact */}
          {summary.roiImpact > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ROI Impact</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    +{summary.roiImpact.toFixed(1)}%
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Completion Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Completion Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Message */}
          <div className="text-xs text-muted-foreground">
            {currentStep < 7 ? (
              <>
                Complete the current step to continue building your estimate.
                {summary.totalCost > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700">
                    <strong>Tip:</strong> Your current estimate is ${summary.totalCost.toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <div className="p-2 bg-green-50 rounded text-green-700">
                <strong>Ready!</strong> Your rehab estimate is complete and ready for review.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {isOverBudget && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Over Budget</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Consider removing some items or increasing your budget.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown - Only show if there are categories */}
      {Object.keys(summary.categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">By Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(summary.categoryBreakdown).map(([category, cost]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="capitalize">{category}</span>
                <span>${cost.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
