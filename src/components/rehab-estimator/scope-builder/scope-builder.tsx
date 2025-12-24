'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Hammer, 
  Plus, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Star,
  Info
} from 'lucide-react'
import { RehabProject, ScopeItem } from '@/types/rehab'
import { cn } from '@/lib/utils'
import { 
  CostCalculationEngine, 
  CostUtils, 
  ScopeIntegration,
  getCostItemsByCategory,
  COST_CATEGORIES,
  QUALITY_TIERS
} from '@/lib/cost-calculator'
import { AssessmentScopeGenerator } from '@/lib/cost-calculator/assessment-integration'
import { useRehabStore } from '@/hooks/use-rehab-store'

interface ScopeBuilderProps {
  project: Partial<RehabProject>
  onNext: (data: any) => void
  onBack: () => void
}

const priorityOptions = [
  { value: 'must', label: 'Must Have', color: 'bg-red-500' },
  { value: 'should', label: 'Should Have', color: 'bg-orange-500' },
  { value: 'could', label: 'Could Have', color: 'bg-yellow-500' },
  { value: 'nice', label: 'Nice to Have', color: 'bg-green-500' }
]

export function ScopeBuilder({ project, onNext, onBack }: ScopeBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState('interior')
  const [qualityTier, setQualityTier] = useState<keyof typeof QUALITY_TIERS>('standard')
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingFromAssessment, setIsGeneratingFromAssessment] = useState(false)
  
  // Get assessment data from store
  const store = useRehabStore()
  const assessmentData = store.project.assessments
  const [customItem, setCustomItem] = useState({
    name: '',
    category: 'interior',
    materialCost: 0,
    laborCost: 0,
    days: 1,
    priority: 'should' as const
  })

  // Get location data for cost calculations
  const location = {
    zipCode: project.address?.zip || '30301', // Default to Atlanta
    state: project.address?.state || 'GA'
  }

  // Get available cost items for selected category
  const availableCostItems = getCostItemsByCategory(selectedCategory)

  // Calculate totals
  const totalCost = scopeItems.reduce((sum, item) => sum + item.totalCost, 0)
  const totalDays = scopeItems.reduce((sum, item) => sum + item.daysRequired, 0)
  const totalROI = scopeItems.reduce((sum, item) => sum + item.roiImpact, 0)

  const addScopeItem = (costItem: any, quantity: number = 1) => {
    // Calculate real costs using our cost engine
    const costResult = CostCalculationEngine.calculateItemCost({
      item: costItem,
      quantity,
      qualityTier,
      location,
      projectConditions: {
        urgency: 'medium',
        complexity: 'moderate',
        accessibility: 'moderate'
      }
    })

    const newItem: ScopeItem = {
      id: `item-${Date.now()}`,
      projectId: project.id || '',
      category: costItem.category,
      subcategory: costItem.subcategory,
      itemName: costItem.itemName,
      description: costItem.description || '',
      location: '',
      quantity,
      unitOfMeasure: costItem.unit,
      materialCost: costResult.materialCost,
      laborCost: costResult.laborCost,
      totalCost: costResult.totalCost,
      priority: 'should',
      roiImpact: costResult.factors.quality * 10, // Estimated ROI impact
      daysRequired: costResult.timelineEstimate,
      dependsOn: [],
      phase: 1,
      included: true,
      completed: false
    }
    setScopeItems([...scopeItems, newItem])
  }

  const removeScopeItem = (itemId: string) => {
    setScopeItems(scopeItems.filter(item => item.id !== itemId))
  }

  const toggleScopeItem = (itemId: string) => {
    setScopeItems(scopeItems.map(item => 
      item.id === itemId ? { ...item, included: !item.included } : item
    ))
  }

  const updateScopeItem = (itemId: string, updates: Partial<ScopeItem>) => {
    setScopeItems(scopeItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates }
        
        // If quantity changed, recalculate costs
        if (updates.quantity && updates.quantity !== item.quantity) {
          // Find the original cost item to recalculate
          const costItem = availableCostItems.find(ci => ci.itemName === item.itemName)
          if (costItem) {
            const costResult = CostCalculationEngine.calculateItemCost({
              item: costItem,
              quantity: updates.quantity,
              qualityTier,
              location,
              projectConditions: {
                urgency: 'medium',
                complexity: 'moderate',
                accessibility: 'moderate'
              }
            })
            
            updatedItem.materialCost = costResult.materialCost
            updatedItem.laborCost = costResult.laborCost
            updatedItem.totalCost = costResult.totalCost
            updatedItem.daysRequired = costResult.timelineEstimate
          }
        }
        
        return updatedItem
      }
      return item
    }))
  }

  const generateFromAssessment = async () => {
    if (!assessmentData || Object.keys(assessmentData).length === 0) {
      alert('No property assessment data found. Please complete the property assessment first.')
      return
    }
    
    setIsGeneratingFromAssessment(true)
    
    try {
      // Generate scope items from assessment data
      const generatedItems = AssessmentScopeGenerator.generateScopeFromAssessments(
        assessmentData,
        location,
        qualityTier
      )
      
      // Add generated items to existing scope
      setScopeItems([...scopeItems, ...generatedItems])
      
      setTimeout(() => {
        setIsGeneratingFromAssessment(false)
      }, 1500)
      
    } catch (error) {
      console.error('Error generating scope from assessment:', error)
      setIsGeneratingFromAssessment(false)
    }
  }

  const generateSmartRecommendations = async () => {
    setIsGenerating(true)
    
    // Use our cost database for smarter recommendations
    setTimeout(() => {
      const recommendations: ScopeItem[] = []
      
      // Kitchen recommendations based on property type and condition
      if (project.propertyType === 'single_family' && project.squareFeet && project.squareFeet > 1500) {
        const kitchenItems = getCostItemsBySubcategory('interior', 'kitchen')
        kitchenItems.forEach(costItem => {
          const costResult = CostCalculationEngine.calculateItemCost({
            item: costItem,
            quantity: costItem.itemName.includes('Cabinet') ? 15 : costItem.itemName.includes('Countertop') ? 40 : 1,
            qualityTier,
            location
          })
          
          recommendations.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId: project.id || '',
            category: costItem.category,
            subcategory: costItem.subcategory,
            itemName: costItem.itemName,
            description: 'Recommended for better resale value',
            location: 'Kitchen',
            quantity: costItem.itemName.includes('Cabinet') ? 15 : costItem.itemName.includes('Countertop') ? 40 : 1,
            unitOfMeasure: costItem.unit,
            materialCost: costResult.materialCost,
            laborCost: costResult.laborCost,
            totalCost: costResult.totalCost,
            priority: 'should',
            roiImpact: costResult.factors.quality * 12,
            daysRequired: costResult.timelineEstimate,
            dependsOn: [],
            phase: 1,
            included: true,
            completed: false
          })
        })
      }

      // Add recommendations to scope
      setScopeItems([...scopeItems, ...recommendations])
      setIsGenerating(false)
    }, 2000)
  }

  const handleSubmit = () => {
    onNext({ scopeItems })
  }

  return (
    <div className="space-y-6">
      {/* Smart Scope Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Smart Scope Generation</span>
          </CardTitle>
          <CardDescription>
            Generate renovation scope automatically from your property assessment or get AI-powered suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Generate from Assessment */}
          <Button 
            onClick={generateFromAssessment} 
            disabled={isGeneratingFromAssessment || !assessmentData}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isGeneratingFromAssessment ? 'Generating from Assessment...' : 'Generate from Property Assessment'}
          </Button>
          
          {!assessmentData && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Complete the property assessment first to enable automatic scope generation.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Smart Recommendations */}
          <Button 
            onClick={generateSmartRecommendations}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating Recommendations...' : 'Generate Smart Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {/* Quality & Location Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Cost Calculation Settings
          </CardTitle>
          <CardDescription>
            These settings affect all cost calculations for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quality Tier Selector */}
            <div>
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Quality Tier
              </Label>
              <Select value={qualityTier} onValueChange={(value: keyof typeof QUALITY_TIERS) => setQualityTier(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUALITY_TIERS).map(([tier, config]) => (
                    <SelectItem key={tier} value={tier}>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{tier}</span>
                        <Badge variant="outline" className="text-xs">
                          {tier === 'budget' ? '-25%' : tier === 'premium' ? '+50%' : tier === 'luxury' ? '+120%' : 'Standard'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Display */}
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {project.address?.city ? `${project.address.city}, ${project.address.state}` : 'Atlanta, GA (Default)'}
              </div>
            </div>

            {/* Quality Info */}
            <div>
              <Label className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Current Multipliers
              </Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                Materials: {QUALITY_TIERS[qualityTier].materials}x<br/>
                Labor: {QUALITY_TIERS[qualityTier].labor}x
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Items */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Items</CardTitle>
              <CardDescription>
                Select items to add to your renovation scope
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Selector */}
              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COST_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items in Category */}
              <div className="space-y-2">
                {availableCostItems.map((item, index) => {
                  // Calculate preview cost
                  const previewCost = CostCalculationEngine.calculateItemCost({
                    item,
                    quantity: 1,
                    qualityTier,
                    location
                  })
                  
                  return (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                         onClick={() => addScopeItem(item, 1)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {item.description}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{CostUtils.formatCurrency(previewCost.totalCost)} per {item.unit}</span>
                            <span>{previewCost.timelineEstimate} days</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(previewCost.confidenceLevel * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Custom Item */}
              <Separator />
              <div className="space-y-3">
                <Label>Add Custom Item</Label>
                <Input
                  placeholder="Item name"
                  value={customItem.name}
                  onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Material cost"
                    value={customItem.materialCost}
                    onChange={(e) => setCustomItem({ ...customItem, materialCost: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Labor cost"
                    value={customItem.laborCost}
                    onChange={(e) => setCustomItem({ ...customItem, laborCost: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Days required"
                    value={customItem.days}
                    onChange={(e) => setCustomItem({ ...customItem, days: Number(e.target.value) })}
                  />
                  <Select value={customItem.priority} onValueChange={(value: any) => setCustomItem({ ...customItem, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => {
                    if (customItem.name) {
                      addScopeItem(customItem)
                      setCustomItem({ ...customItem, name: '', materialCost: 0, laborCost: 0, days: 1 })
                    }
                  }}
                  disabled={!customItem.name}
                  className="w-full"
                >
                  Add Custom Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Scope */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Renovation Scope</CardTitle>
              <CardDescription>
                Your selected renovation items and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scopeItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Hammer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No items added to scope yet.</p>
                  <p className="text-sm">Select items from the left panel or generate smart recommendations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scopeItems.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={item.included}
                            onCheckedChange={() => toggleScopeItem(item.id)}
                          />
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-sm text-muted-foreground">{item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={cn(
                            priorityOptions.find(p => p.value === item.priority)?.color,
                            'text-white'
                          )}>
                            {priorityOptions.find(p => p.value === item.priority)?.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeScopeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Total Cost</div>
                          <div className="font-medium text-lg">{CostUtils.formatCurrency(item.totalCost)}</div>
                          <div className="text-xs text-muted-foreground">
                            {CostUtils.formatCurrency(item.totalCost / item.quantity)} per {item.unitOfMeasure}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Materials</div>
                          <div className="font-medium">{CostUtils.formatCurrency(item.materialCost)}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((item.materialCost / item.totalCost) * 100)}% of total
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Labor</div>
                          <div className="font-medium">{CostUtils.formatCurrency(item.laborCost)}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((item.laborCost / item.totalCost) * 100)}% of total
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Timeline</div>
                          <div className="font-medium">{item.daysRequired} days</div>
                          <div className="text-xs text-muted-foreground">
                            ROI: {item.roiImpact.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Summary */}
      {scopeItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Project Cost Summary
            </CardTitle>
            <CardDescription>
              Calculated using {qualityTier} quality tier for {location.zipCode ? `${project.address?.city}, ${project.address?.state}` : 'Atlanta, GA'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{CostUtils.formatCurrency(totalCost)}</div>
                <div className="text-sm text-muted-foreground">Total Project Cost</div>
                {project.maxBudget && (
                  <div className="text-xs mt-1">
                    {Math.round((totalCost / project.maxBudget) * 100)}% of budget
                  </div>
                )}
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{Math.max(...scopeItems.map(item => item.daysRequired), 0)}</div>
                <div className="text-sm text-muted-foreground">Project Timeline</div>
                <div className="text-xs mt-1">
                  {Math.ceil(Math.max(...scopeItems.map(item => item.daysRequired), 0) / 7)} weeks
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">+{totalROI.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Est. ROI Impact</div>
                <div className="text-xs mt-1">
                  {CostUtils.formatCurrency(totalCost * (totalROI / 100))} value add
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{scopeItems.filter(item => item.included).length}</div>
                <div className="text-sm text-muted-foreground">Included Items</div>
                <div className="text-xs mt-1">
                  {scopeItems.length} total items
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span className="font-medium">{CostUtils.formatCurrency(scopeItems.reduce((sum, item) => sum + item.materialCost, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span className="font-medium">{CostUtils.formatCurrency(scopeItems.reduce((sum, item) => sum + item.laborCost, 0))}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">{CostUtils.formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Contingency (10%):</span>
                    <span>{CostUtils.formatCurrency(totalCost * 0.1)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total with Contingency:</span>
                    <span>{CostUtils.formatCurrency(totalCost * 1.1)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Quality Tier Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Tier:</span>
                    <Badge variant="outline" className="capitalize">{qualityTier}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Material Multiplier:</span>
                    <span>{QUALITY_TIERS[qualityTier].materials}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor Multiplier:</span>
                    <span>{QUALITY_TIERS[qualityTier].labor}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline Impact:</span>
                    <span>{QUALITY_TIERS[qualityTier].timeline}x</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Change quality tier above to see cost impact
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Warning */}
      {project.maxBudget && totalCost > project.maxBudget && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your scope exceeds your budget by ${(totalCost - project.maxBudget).toLocaleString()}. 
            Consider removing some items or increasing your budget.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Handler - Navigation is handled by parent component */}
      <div className="hidden">
        <Button 
          onClick={handleSubmit}
          disabled={scopeItems.length === 0}
        >
          Continue to Priority Analysis
        </Button>
      </div>
    </div>
  )
}
