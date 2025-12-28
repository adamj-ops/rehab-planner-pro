'use client'

import {
  IconHome,
  IconMapPin,
  IconCalendar,
  IconRuler,
  IconBed,
  IconBath,
  IconCash,
  IconTrendingUp,
  IconTarget,
  IconClock,
} from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RehabProject } from '@/types/database'

interface OverviewTabProps {
  project: RehabProject
}

// Strategy display labels
const strategyLabels: Record<string, string> = {
  flip: 'Flip',
  rental: 'Rental',
  brrrr: 'BRRRR',
  airbnb: 'Airbnb',
  wholetail: 'Wholetail',
}

// Property type labels
const propertyTypeLabels: Record<string, string> = {
  single_family: 'Single Family',
  multi_family: 'Multi Family',
  condo: 'Condo',
  townhouse: 'Townhouse',
}

export function OverviewTab({ project }: OverviewTabProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Calculate budget progress
  const budgetProgress = project.max_budget && project.total_estimated_cost
    ? Math.min((project.total_estimated_cost / project.max_budget) * 100, 100)
    : 0

  // Calculate potential profit (ARV - Purchase Price - Estimated Cost)
  const potentialProfit = project.arv && project.purchase_price && project.total_estimated_cost
    ? project.arv - project.purchase_price - project.total_estimated_cost
    : null

  // Calculate ROI percentage
  const totalInvestment = (project.purchase_price || 0) + (project.total_estimated_cost || 0)
  const roi = potentialProfit && totalInvestment > 0
    ? (potentialProfit / totalInvestment) * 100
    : null

  const address = [
    project.address_street,
    project.address_city,
    project.address_state,
    project.address_zip,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Property Details */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconHome className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {address && (
            <div className="flex items-start gap-3">
              <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{address}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {project.property_type && (
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {propertyTypeLabels[project.property_type] || project.property_type}
                </p>
              </div>
            )}
            {project.year_built && (
              <div className="flex items-start gap-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{project.year_built}</p>
                </div>
              </div>
            )}
            {project.square_feet && (
              <div className="flex items-start gap-2">
                <IconRuler className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Sq Ft</p>
                  <p className="font-medium">{formatNumber(project.square_feet)}</p>
                </div>
              </div>
            )}
            {(project.bedrooms || project.bathrooms) && (
              <div className="flex items-center gap-4">
                {project.bedrooms && (
                  <div className="flex items-center gap-1">
                    <IconBed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{project.bedrooms}</span>
                  </div>
                )}
                {project.bathrooms && (
                  <div className="flex items-center gap-1">
                    <IconBath className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{project.bathrooms}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Strategy */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconTarget className="h-5 w-5" />
            Investment Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {project.investment_strategy && (
              <div>
                <p className="text-sm text-muted-foreground">Strategy</p>
                <p className="font-medium">
                  {strategyLabels[project.investment_strategy] || project.investment_strategy}
                </p>
              </div>
            )}
            {project.target_buyer && (
              <div>
                <p className="text-sm text-muted-foreground">Target Buyer</p>
                <p className="font-medium capitalize">
                  {project.target_buyer.replace('_', ' ')}
                </p>
              </div>
            )}
            {project.hold_period_months && (
              <div className="flex items-start gap-2">
                <IconClock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Hold Period</p>
                  <p className="font-medium">{project.hold_period_months} months</p>
                </div>
              </div>
            )}
            {project.target_roi && (
              <div>
                <p className="text-sm text-muted-foreground">Target ROI</p>
                <p className="font-medium">{project.target_roi}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="rounded-none lg:row-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconCash className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="font-semibold">{formatCurrency(project.purchase_price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Renovation Budget</span>
              <span className="font-semibold">{formatCurrency(project.max_budget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Cost</span>
              <span className="font-semibold">{formatCurrency(project.total_estimated_cost)}</span>
            </div>
            {project.max_budget && project.total_estimated_cost && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span>{Math.round(budgetProgress)}%</span>
                </div>
                <Progress value={budgetProgress} className="h-2 rounded-none" />
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ARV (After Repair Value)</span>
              <span className="font-semibold">{formatCurrency(project.arv)}</span>
            </div>
            {potentialProfit !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Potential Profit</span>
                <span className={`font-semibold ${potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(potentialProfit)}
                </span>
              </div>
            )}
            {roi !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projected ROI</span>
                <span className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="rounded-none md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconTrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-none">
              <p className="text-2xl font-bold">{project.estimated_days || '-'}</p>
              <p className="text-sm text-muted-foreground">Est. Days</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-none">
              <p className="text-2xl font-bold">{project.priority_score?.toFixed(1) || '-'}</p>
              <p className="text-sm text-muted-foreground">Priority Score</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-none">
              <p className="text-2xl font-bold">{project.roi_score?.toFixed(1) || '-'}</p>
              <p className="text-sm text-muted-foreground">ROI Score</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-none">
              <p className="text-2xl font-bold">
                {project.neighborhood_comp_avg ? formatCurrency(project.neighborhood_comp_avg) : '-'}
              </p>
              <p className="text-sm text-muted-foreground">Comp Avg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
