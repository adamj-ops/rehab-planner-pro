'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Grid3X3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Network,
  Calendar,
  Shield,
  Zap
} from 'lucide-react'
import { RehabProject, ScopeItem, PriorityMatrixItem } from '@/types/rehab'
import { cn } from '@/lib/utils'
import { 
  PriorityScoringEngine,
  DependencyMappingEngine,
  MarketTimingEngine,
  PriorityMatrixEnhanced
} from '@/lib/priority-engine'
import { CostUtils } from '@/lib/cost-calculator'

interface PriorityMatrixProps {
  project: Partial<RehabProject>
  onNext: (data: any) => void
  onBack: () => void
}

interface MatrixCell {
  x: number // ROI Impact (0-100)
  y: number // Urgency (0-100)
  items: PriorityMatrixItem[]
}

export function PriorityMatrix({ project, onNext, onBack }: PriorityMatrixProps) {
  const [matrixItems, setMatrixItems] = useState<PriorityMatrixItem[]>([])
  const [enhancedItems, setEnhancedItems] = useState<PriorityMatrixEnhanced[]>([])
  const [selectedItem, setSelectedItem] = useState<PriorityMatrixItem | null>(null)
  const [matrixCells, setMatrixCells] = useState<MatrixCell[][]>([])
  const [activeTab, setActiveTab] = useState('matrix')

  // Project context for advanced scoring
  const projectContext = {
    strategy: project.investmentStrategy || 'flip',
    timeline: project.holdPeriodMonths || 6,
    budget: project.maxBudget || 100000,
    season: getCurrentSeason(),
    marketConditions: 'balanced' as const
  }

  // Initialize matrix when scope items change
  useEffect(() => {
    if (project.scopeItems) {
      const items: PriorityMatrixItem[] = project.scopeItems.map(item => ({
        id: item.id,
        name: item.itemName,
        category: getCategoryFromItem(item),
        roiImpact: item.roiImpact,
        urgency: calculateUrgency(item),
        cost: item.totalCost,
        priority: item.priority,
        included: item.included
      }))
      
      // Generate enhanced items with advanced scoring
      const enhanced = generateEnhancedItems(project.scopeItems, projectContext)
      
      setMatrixItems(items)
      setEnhancedItems(enhanced)
      generateMatrix(items)
    }
  }, [project.scopeItems])

  // Generate enhanced priority items with advanced scoring
  const generateEnhancedItems = (scopeItems: ScopeItem[], context: any): PriorityMatrixEnhanced[] => {
    return scopeItems.map(item => {
      const priorityScore = PriorityScoringEngine.calculatePriorityScore(item, scopeItems, context)
      const dependencies = DependencyMappingEngine.createDependencyMapping(scopeItems)
        .find(dep => dep.itemId === item.id)!
      
      return {
        id: item.id,
        name: item.itemName,
        category: getCategoryFromItem(item),
        roiImpact: item.roiImpact,
        urgency: priorityScore.components.urgency,
        cost: item.totalCost,
        priority: item.priority,
        included: item.included,
        priorityScore,
        dependencies,
        riskFactors: {
          executionRisk: item.totalCost > 10000 ? 'high' : item.totalCost > 5000 ? 'medium' : 'low',
          timeRisk: item.daysRequired > 10 ? 'high' : item.daysRequired > 5 ? 'medium' : 'low',
          costRisk: item.dependsOn.length > 2 ? 'high' : item.dependsOn.length > 0 ? 'medium' : 'low',
          marketRisk: context.marketConditions === 'cold' ? 'high' : 'low'
        },
        marketTiming: {
          seasonalFactor: 1.0,
          marketConditions: context.marketConditions,
          recommendedStartDate: new Date(),
          reasoning: 'Optimal timing based on current conditions'
        }
      }
    })
  }

  // Get current season helper
  function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  const getCategoryFromItem = (item: ScopeItem): 'safety' | 'structural' | 'systems' | 'cosmetic' | 'optional' => {
    const category = item.category.toLowerCase()
    
    if (category.includes('electrical') || category.includes('plumbing') || category.includes('hvac')) {
      return 'systems'
    }
    
    if (category.includes('foundation') || category.includes('roof') || category.includes('structural')) {
      return 'structural'
    }
    
    if (category.includes('safety') || category.includes('code')) {
      return 'safety'
    }
    
    if (category.includes('paint') || category.includes('flooring') || category.includes('cosmetic')) {
      return 'cosmetic'
    }
    
    return 'optional'
  }

  const calculateUrgency = (item: ScopeItem): number => {
    let urgency = 50 // Base urgency
    
    // Adjust based on priority
    if (item.priority === 'must') urgency += 30
    else if (item.priority === 'should') urgency += 15
    else if (item.priority === 'could') urgency -= 10
    else urgency -= 25
    
    // Adjust based on dependencies
    if (item.dependsOn.length > 0) urgency += 10
    
    // Adjust based on category
    const category = getCategoryFromItem(item)
    if (category === 'safety') urgency += 20
    else if (category === 'structural') urgency += 15
    else if (category === 'systems') urgency += 10
    
    // Clamp between 0-100
    return Math.max(0, Math.min(100, urgency))
  }

  const generateMatrix = (items: PriorityMatrixItem[]) => {
    const matrix: MatrixCell[][] = []
    const cellSize = 20 // 5x5 grid (0-100 in steps of 20)
    
    for (let y = 0; y < 5; y++) {
      matrix[y] = []
      for (let x = 0; x < 5; x++) {
        const minX = x * cellSize
        const maxX = (x + 1) * cellSize
        const minY = y * cellSize
        const maxY = (y + 1) * cellSize
        
        const cellItems = items.filter(item => 
          item.roiImpact >= minX && item.roiImpact < maxX &&
          item.urgency >= minY && item.urgency < maxY
        )
        
        matrix[y][x] = {
          x: minX + cellSize / 2,
          y: minY + cellSize / 2,
          items: cellItems
        }
      }
    }
    
    setMatrixCells(matrix)
  }

  const getQuadrantColor = (x: number, y: number): string => {
    if (x >= 60 && y >= 60) return 'bg-green-100 border-green-300' // High ROI, High Urgency
    if (x >= 60 && y < 60) return 'bg-blue-100 border-blue-300'   // High ROI, Low Urgency
    if (x < 60 && y >= 60) return 'bg-orange-100 border-orange-300' // Low ROI, High Urgency
    return 'bg-gray-100 border-gray-300' // Low ROI, Low Urgency
  }

  const getQuadrantLabel = (x: number, y: number): string => {
    if (x >= 60 && y >= 60) return 'Do First'
    if (x >= 60 && y < 60) return 'Schedule'
    if (x < 60 && y >= 60) return 'Delegate'
    return 'Eliminate'
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'safety': return 'bg-red-500'
      case 'structural': return 'bg-orange-500'
      case 'systems': return 'bg-blue-500'
      case 'cosmetic': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleItemClick = (item: PriorityMatrixItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item)
  }

  const handleSubmit = () => {
    onNext({ matrixItems })
  }

  const totalCost = matrixItems.reduce((sum, item) => sum + item.cost, 0)
  const totalROI = matrixItems.reduce((sum, item) => sum + item.roiImpact, 0)
  const avgUrgency = matrixItems.length > 0 ? matrixItems.reduce((sum, item) => sum + item.urgency, 0) / matrixItems.length : 0

  return (
    <div className="space-y-6">
      {/* Enhanced Priority Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5" />
            <span>Advanced Priority Analysis</span>
          </CardTitle>
          <CardDescription>
            AI-powered priority analysis with dependency mapping and market timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="matrix">Priority Matrix</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="timeline">Critical Path</TabsTrigger>
              <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="matrix" className="mt-6">
              {/* Original Matrix Visualization */}
          {/* Matrix Grid */}
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Y-axis label */}
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium">
              Urgency
            </div>
            
            {/* X-axis label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium">
              ROI Impact
            </div>
            
            {/* Matrix Grid */}
            <div className="grid grid-cols-5 grid-rows-5 gap-1 border-2 border-gray-300 rounded-lg p-2">
              {matrixCells.map((row, y) => 
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={cn(
                      "relative min-h-[80px] border rounded p-1 cursor-pointer transition-colors",
                      getQuadrantColor(cell.x, cell.y),
                      cell.items.length > 0 && "hover:bg-opacity-80"
                    )}
                    onClick={() => cell.items.length > 0 && handleItemClick(cell.items[0])}
                  >
                    {/* Quadrant Label */}
                    <div className="absolute top-1 left-1 text-xs font-medium text-gray-600">
                      {getQuadrantLabel(cell.x, cell.y)}
                    </div>
                    
                    {/* Items in cell */}
                    {cell.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          "absolute w-3 h-3 rounded-full border-2 border-white shadow-sm",
                          getCategoryColor(item.category),
                          selectedItem?.id === item.id && "ring-2 ring-blue-500 ring-offset-2"
                        )}
                        style={{
                          left: `${20 + (index % 3) * 8}%`,
                          top: `${20 + Math.floor(index / 3) * 8}%`
                        }}
                        title={`${item.name} (ROI: ${item.roiImpact}%, Urgency: ${item.urgency}%)`}
                      />
                    ))}
                    
                    {/* Item count */}
                    {cell.items.length > 0 && (
                      <div className="absolute bottom-1 right-1 text-xs font-medium text-gray-600">
                        {cell.items.length}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedItem.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn(getCategoryColor(selectedItem.category), "text-white")}
                  >
                    {selectedItem.category}
                  </Badge>
                  <Badge variant="outline">
                    {selectedItem.priority}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-bold">{selectedItem.roiImpact}%</div>
                  <div className="text-xs text-muted-foreground">ROI Impact</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold">{selectedItem.urgency}%</div>
                  <div className="text-xs text-muted-foreground">Urgency</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">${selectedItem.cost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrix Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Matrix Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quadrants */}
            <div>
              <h4 className="font-medium mb-3">Quadrants</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm">Do First (High ROI, High Urgency)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm">Schedule (High ROI, Low Urgency)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                  <span className="text-sm">Delegate (Low ROI, High Urgency)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm">Eliminate (Low ROI, Low Urgency)</span>
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Safety</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Structural</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Systems</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Cosmetic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Optional</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{matrixItems.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Investment</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">+{totalROI.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Total ROI Impact</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{avgUrgency.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Avg Urgency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Priority Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrixItems.filter(item => item.roiImpact >= 60 && item.urgency >= 60).length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Priority Items:</strong> {matrixItems.filter(item => item.roiImpact >= 60 && item.urgency >= 60).length} items 
                  should be completed first. These offer high ROI and are urgent.
                </AlertDescription>
              </Alert>
            )}
            
            {matrixItems.filter(item => item.roiImpact < 40 && item.urgency < 40).length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Priority Items:</strong> {matrixItems.filter(item => item.roiImpact < 40 && item.urgency < 40).length} items 
                  have low ROI and urgency. Consider eliminating these to focus on higher-impact items.
                </AlertDescription>
              </Alert>
            )}
            
            {matrixItems.filter(item => item.category === 'safety').length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Safety Items:</strong> {matrixItems.filter(item => item.category === 'safety').length} safety-related items 
                  should be prioritized regardless of ROI due to code compliance and liability concerns.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

            </TabsContent>
            
            <TabsContent value="dependencies" className="mt-6">
              {/* Dependencies View */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dependency Analysis</h3>
                {enhancedItems.length > 0 ? (
                  <div className="space-y-3">
                    {enhancedItems
                      .sort((a, b) => b.priorityScore.overall - a.priorityScore.overall)
                      .map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              Score: {item.priorityScore.overall}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {CostUtils.formatCurrency(item.cost)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Dependencies Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Depends On:</span>
                            <div className="text-muted-foreground">
                              {item.dependencies.dependsOn.length > 0 ? 
                                item.dependencies.dependsOn.join(', ') : 'None'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Blocks:</span>
                            <div className="text-muted-foreground">
                              {item.dependencies.dependents.length} items
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Phase:</span>
                            <div className="text-muted-foreground">
                              Phase {item.dependencies.phase}
                              {item.dependencies.criticalPath && (
                                <Badge variant="destructive" className="ml-2 text-xs">Critical</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Priority Score Breakdown */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium">Urgency</div>
                            <div>{item.priorityScore.components.urgency}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">ROI</div>
                            <div>{item.priorityScore.components.roiImpact}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Risk</div>
                            <div>{item.priorityScore.components.riskMitigation}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Deps</div>
                            <div>{item.priorityScore.components.dependencies}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Timing</div>
                            <div>{item.priorityScore.components.marketTiming}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Complex</div>
                            <div>{item.priorityScore.components.complexity}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scope items found for dependency analysis.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-6">
              {/* Critical Path View */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Critical Path Analysis</h3>
                {project.scopeItems && project.scopeItems.length > 0 ? (
                  <div className="space-y-4">
                    {/* Phase Timeline */}
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(phase => {
                        const phaseItems = enhancedItems.filter(item => item.dependencies.phase === phase)
                        if (phaseItems.length === 0) return null
                        
                        return (
                          <div key={phase} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {phase}
                              </div>
                              <span className="font-medium">Phase {phase}</span>
                              <Badge variant="outline">
                                {Math.max(...phaseItems.map(item => 
                                  project.scopeItems?.find(si => si.id === item.id)?.daysRequired || 0
                                ))} days
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {phaseItems.map(item => (
                                <div key={item.id} className={cn(
                                  "p-2 rounded text-sm",
                                  item.dependencies.criticalPath ? "bg-red-100 border border-red-300" : "bg-muted/50"
                                )}>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-muted-foreground">
                                    {CostUtils.formatCurrency(item.cost)}
                                    {item.dependencies.criticalPath && (
                                      <Badge variant="destructive" className="ml-1 text-xs">Critical</Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scope items found for timeline analysis.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              {/* AI Insights View */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
                {enhancedItems.length > 0 ? (
                  <div className="space-y-4">
                    {/* Top Priority Items */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          High Priority Actions
                        </CardTitle>
                        <CardDescription>
                          Items that should be prioritized based on AI analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {enhancedItems
                            .filter(item => item.priorityScore.overall > 70)
                            .slice(0, 5)
                            .map((item) => (
                            <div key={item.id} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <Badge variant="default" className="mt-1">
                                    Priority Score: {item.priorityScore.overall}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{CostUtils.formatCurrency(item.cost)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    +{item.roiImpact.toFixed(1)}% ROI
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {item.priorityScore.reasoning.map((reason, index) => (
                                  <div key={index} className="text-sm text-muted-foreground">
                                    • {reason}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Complete scope building to see AI recommendations.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Handler - Navigation is handled by parent component */}
      <div className="hidden">
        <Button 
          onClick={handleSubmit}
          disabled={matrixItems.length === 0}
        >
          Continue to Action Plan
        </Button>
      </div>
    </div>
  )
}
