'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Info,
  Star
} from 'lucide-react'
import { CostUtils } from '@/lib/cost-calculator'
import { cn } from '@/lib/utils'

interface CostBreakdownProps {
  materialCost: number
  laborCost: number
  totalCost: number
  contingency?: number
  timeline?: number
  confidenceLevel?: number
  costRange?: { min: number; max: number }
  budgetLimit?: number
  className?: string
}

export function CostBreakdown({
  materialCost,
  laborCost,
  totalCost,
  contingency = totalCost * 0.1,
  timeline,
  confidenceLevel,
  costRange,
  budgetLimit,
  className
}: CostBreakdownProps) {
  const totalWithContingency = totalCost + contingency
  const budgetUsage = budgetLimit ? (totalWithContingency / budgetLimit) * 100 : 0
  const isOverBudget = budgetLimit && totalWithContingency > budgetLimit
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cost Breakdown
        </CardTitle>
        {confidenceLevel && (
          <CardDescription className="flex items-center gap-2">
            <Badge variant={confidenceLevel > 0.8 ? "default" : "secondary"}>
              {Math.round(confidenceLevel * 100)}% Confidence
            </Badge>
            {confidenceLevel > 0.8 ? (
              <span className="text-green-600 text-sm">High accuracy</span>
            ) : (
              <span className="text-yellow-600 text-sm">Moderate accuracy</span>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Cost Display */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {CostUtils.formatCurrency(totalWithContingency)}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Project Cost (with contingency)
          </div>
        </div>
        
        {/* Cost Range */}
        {costRange && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Estimated Range</div>
            <div className="font-medium">
              {CostUtils.formatCurrency(costRange.min)} - {CostUtils.formatCurrency(costRange.max)}
            </div>
          </div>
        )}
        
        {/* Budget Usage */}
        {budgetLimit && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className={cn(
                "text-sm font-medium",
                isOverBudget ? "text-destructive" : budgetUsage > 80 ? "text-yellow-600" : "text-green-600"
              )}>
                {budgetUsage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(budgetUsage, 100)} 
              className={cn(
                "h-2",
                isOverBudget && "bg-destructive/20"
              )}
            />
            {isOverBudget && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" />
                Over budget by {CostUtils.formatCurrency(totalWithContingency - budgetLimit)}
              </div>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Cost Components</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Materials</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{CostUtils.formatCurrency(materialCost)}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((materialCost / totalCost) * 100)}% of project
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Labor</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{CostUtils.formatCurrency(laborCost)}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((laborCost / totalCost) * 100)}% of project
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">{CostUtils.formatCurrency(totalCost)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Contingency (10%)</span>
              <span>{CostUtils.formatCurrency(contingency)}</span>
            </div>
            
            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">{CostUtils.formatCurrency(totalWithContingency)}</span>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        {timeline && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Project Timeline</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{timeline} days</div>
                <div className="text-xs text-muted-foreground">
                  {Math.ceil(timeline / 7)} weeks
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface CostComparisonProps {
  scenarios: Array<{
    name: string
    totalCost: number
    timeline: number
    roiImpact: number
    qualityTier: string
  }>
  className?: string
}

export function CostComparison({ scenarios, className }: CostComparisonProps) {
  const maxCost = Math.max(...scenarios.map(s => s.totalCost))
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cost Comparison
        </CardTitle>
        <CardDescription>
          Compare different quality tiers and renovation approaches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {scenario.qualityTier}
                </Badge>
                <span className="font-medium">{scenario.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{CostUtils.formatCurrency(scenario.totalCost)}</div>
                <div className="text-xs text-muted-foreground">
                  {scenario.timeline} days • +{scenario.roiImpact.toFixed(1)}% ROI
                </div>
              </div>
            </div>
            
            {/* Cost bar visualization */}
            <div className="space-y-1">
              <Progress 
                value={(scenario.totalCost / maxCost) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cost Ratio</span>
                <span>{Math.round((scenario.totalCost / maxCost) * 100)}% of highest</span>
              </div>
            </div>
            
            {index < scenarios.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface QualityTierSelectorProps {
  selectedTier: 'budget' | 'standard' | 'premium' | 'luxury'
  onTierChange: (tier: 'budget' | 'standard' | 'premium' | 'luxury') => void
  baseCost: number
  className?: string
}

export function QualityTierSelector({ 
  selectedTier, 
  onTierChange, 
  baseCost, 
  className 
}: QualityTierSelectorProps) {
  const tiers = [
    { 
      name: 'budget', 
      label: 'Budget', 
      description: 'Basic materials, good value',
      multiplier: 0.75,
      color: 'bg-gray-500'
    },
    { 
      name: 'standard', 
      label: 'Standard', 
      description: 'Quality materials, balanced approach',
      multiplier: 1.0,
      color: 'bg-blue-500'
    },
    { 
      name: 'premium', 
      label: 'Premium', 
      description: 'High-end materials, superior finish',
      multiplier: 1.5,
      color: 'bg-purple-500'
    },
    { 
      name: 'luxury', 
      label: 'Luxury', 
      description: 'Top-tier materials, custom work',
      multiplier: 2.2,
      color: 'bg-gold-500'
    }
  ]
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Quality Tier Selection
        </CardTitle>
        <CardDescription>
          Choose your renovation quality level to see cost impact
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tiers.map((tier) => {
            const tierCost = baseCost * tier.multiplier
            const isSelected = selectedTier === tier.name
            
            return (
              <button
                key={tier.name}
                onClick={() => onTierChange(tier.name as any)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-muted-foreground/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("w-4 h-4 rounded-full", tier.color)} />
                  <span className="font-medium">{tier.label}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {tier.description}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    {CostUtils.formatCurrency(tierCost)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {tier.multiplier === 1.0 ? 'Standard' : 
                     tier.multiplier < 1.0 ? `${Math.round((1 - tier.multiplier) * 100)}% less` :
                     `+${Math.round((tier.multiplier - 1) * 100)}%`}
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
