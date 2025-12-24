'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

interface ROIAnalysisProps {
  data: {
    roi: number
    projectedProfit: number
    purchasePrice: number
    rehabCost: number
    arv: number
    strategy: 'flip' | 'rental' | 'brrrr'
    monthlyRent?: number
    paybackPeriod?: number
    breakEvenMonth?: number
    seventyPercentRule?: {
      maxAllowable: number
      actualTotal: number
      meets: boolean
    }
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function ROIAnalysisChart({ data }: ROIAnalysisProps) {
  // Prepare profit projection data
  const profitData = [
    {
      name: 'Purchase',
      value: -data.purchasePrice,
      fill: 'hsl(var(--destructive))'
    },
    {
      name: 'Rehab',
      value: -data.rehabCost,
      fill: 'hsl(var(--destructive))'
    },
    {
      name: 'ARV',
      value: data.arv,
      fill: 'hsl(var(--chart-1))'
    },
    {
      name: 'Net Profit',
      value: data.projectedProfit,
      fill: data.projectedProfit > 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'
    }
  ]

  // Break-even analysis (for rentals)
  const breakEvenData = data.monthlyRent && data.breakEvenMonth
    ? Array.from({ length: Math.min(data.breakEvenMonth + 12, 60) }, (_, i) => ({
        month: i + 1,
        income: (i + 1) * data.monthlyRent,
        costs: data.purchasePrice + data.rehabCost,
        netCashFlow: (i + 1) * data.monthlyRent - (data.purchasePrice + data.rehabCost)
      }))
    : []

  // ROI gauge percentage (0-100 for visual, actual can be higher)
  const roiGaugeValue = Math.min(Math.abs(data.roi), 100)

  return (
    <div className="space-y-6">
      {/* ROI Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ROI Analysis</CardTitle>
              <CardDescription>
                Projected return on investment for {data.strategy} strategy
              </CardDescription>
            </div>
            <Badge variant={data.roi > 0 ? 'default' : 'destructive'} className="text-lg px-4 py-2">
              {data.roi > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {data.roi.toFixed(1)}% ROI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ROI Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Return on Investment</span>
              <span className="font-semibold">{data.roi.toFixed(1)}%</span>
            </div>
            <Progress 
              value={roiGaugeValue} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%+</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Purchase Price</p>
              <p className="text-lg font-bold">${data.purchasePrice.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rehab Cost</p>
              <p className="text-lg font-bold">${data.rehabCost.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">After Repair Value</p>
              <p className="text-lg font-bold">${data.arv.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Projected Profit</p>
              <p className={`text-lg font-bold ${data.projectedProfit > 0 ? 'text-green-600' : 'text-destructive'}`}>
                ${data.projectedProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 70% Rule Check (for flips) */}
          {data.seventyPercentRule && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">70% Rule Analysis</h4>
                <Badge variant={data.seventyPercentRule.meets ? 'default' : 'destructive'}>
                  {data.seventyPercentRule.meets ? 'Meets Rule' : 'Exceeds Limit'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Maximum allowable purchase + rehab should not exceed 70% of ARV
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Max Allowable (70% of ARV)</span>
                  <span className="font-semibold">${data.seventyPercentRule.maxAllowable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Actual Total</span>
                  <span className={`font-semibold ${data.seventyPercentRule.meets ? 'text-green-600' : 'text-destructive'}`}>
                    ${data.seventyPercentRule.actualTotal.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(data.seventyPercentRule.actualTotal / data.seventyPercentRule.maxAllowable) * 100}
                  className="h-2"
                />
              </div>
            </div>
          )}

          {/* Rental Specific Metrics */}
          {(data.strategy === 'rental' || data.strategy === 'brrrr') && data.monthlyRent && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Rental Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Monthly Rent</p>
                  <p className="text-lg font-bold">${data.monthlyRent.toLocaleString()}/mo</p>
                </div>
                {data.paybackPeriod && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Payback Period</p>
                    <p className="text-lg font-bold">{data.paybackPeriod} months</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profit Waterfall Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit Breakdown</CardTitle>
          <CardDescription>
            Cash flow from purchase to final profit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {profitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Break-Even Analysis (Rentals Only) */}
      {breakEvenData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Break-Even Analysis</CardTitle>
            <CardDescription>
              Projected cash flow over time showing break-even point
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={breakEvenData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month"
                  label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--chart-1))" 
                  name="Cumulative Income"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="costs" 
                  stroke="hsl(var(--destructive))" 
                  name="Total Investment"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="netCashFlow" 
                  stroke="hsl(var(--chart-2))" 
                  name="Net Cash Flow"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>

            {data.breakEvenMonth && (
              <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  Break-even expected at month <strong>{data.breakEvenMonth}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

