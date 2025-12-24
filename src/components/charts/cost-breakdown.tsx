'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface CostBreakdownProps {
  data: {
    categoryBreakdown: {
      category: string
      cost: number
      percentage: number
    }[]
    phaseBreakdown?: {
      phase: string
      cost: number
      materials: number
      labor: number
    }[]
    totalCost: number
    materialsCost: number
    laborCost: number
  }
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'oklch(0.55 0.15 180)',
  'oklch(0.55 0.15 240)',
  'oklch(0.55 0.15 300)',
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          ${payload[0].value.toLocaleString()}
        </p>
        {payload[0].payload.percentage && (
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        )}
      </div>
    )
  }
  return null
}

export function CostBreakdownChart({ data }: CostBreakdownProps) {
  // Prepare pie chart data
  const pieData = data.categoryBreakdown.map((item, index) => ({
    ...item,
    name: item.category,
    value: item.cost,
    fill: COLORS[index % COLORS.length]
  }))

  // Prepare materials vs labor comparison
  const materialLaborData = [
    {
      name: 'Materials',
      value: data.materialsCost,
      fill: 'hsl(var(--chart-1))'
    },
    {
      name: 'Labor',
      value: data.laborCost,
      fill: 'hsl(var(--chart-2))'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>
          Detailed analysis of project costs by category and phase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="phase">By Phase</TabsTrigger>
            <TabsTrigger value="type">By Type</TabsTrigger>
          </TabsList>

          {/* Category Breakdown - Pie Chart */}
          <TabsContent value="category" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-3xl font-bold">
                  ${data.totalCost.toLocaleString()}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percentage
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs font-semibold"
                      >
                        {`${(percentage * 100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                  outerRadius={120}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Category List */}
            <div className="space-y-2 mt-4">
              {data.categoryBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${item.cost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Phase Breakdown - Bar Chart */}
          <TabsContent value="phase" className="space-y-4">
            {data.phaseBreakdown && data.phaseBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.phaseBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="phase" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="materials" fill="hsl(var(--chart-1))" name="Materials" />
                    <Bar dataKey="labor" fill="hsl(var(--chart-2))" name="Labor" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Phase List */}
                <div className="space-y-2">
                  {data.phaseBreakdown.map((phase) => (
                    <div key={phase.phase} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                      <span className="text-sm font-medium">{phase.phase}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${phase.cost.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          M: ${phase.materials.toLocaleString()} | L: ${phase.labor.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>No phase data available</p>
              </div>
            )}
          </TabsContent>

          {/* Materials vs Labor */}
          <TabsContent value="type" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialLaborData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  dataKey="value"
                >
                  {materialLaborData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${data.materialsCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {((data.materialsCost / data.totalCost) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Labor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${data.laborCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {((data.laborCost / data.totalCost) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

