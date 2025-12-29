'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calculator, 
  MapPin, 
  Star, 
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { 
  CostCalculationEngine, 
  CostUtils, 
  getCostItemById,
  getRegionalMultipliersByZip,
  QUALITY_TIERS,
  BASE_COST_DATABASE
} from '@/lib/cost-calculator'
import { CostBreakdown, CostRangeVisualization, QualityTierSelector } from '@/components/cost-display'

export default function CostTestPage() {
  const [selectedItemId, setSelectedItemId] = useState('kitchen-001')
  const [quantity, setQuantity] = useState(15)
  const [qualityTier, setQualityTier] = useState<keyof typeof QUALITY_TIERS>('standard')
  const [zipCode, setZipCode] = useState('30301')
  const [state, setState] = useState('GA')
  
  // Calculate cost with current settings
  const selectedItem = getCostItemById(selectedItemId)
  const location = { zipCode, state }
  
  const costResult = selectedItem ? CostCalculationEngine.calculateItemCost({
    item: selectedItem,
    quantity,
    qualityTier,
    location,
    projectConditions: {
      urgency: 'medium',
      complexity: 'moderate',
      accessibility: 'moderate'
    }
  }) : null
  
  const regionalData = getRegionalMultipliersByZip(zipCode)
  
  // Generate comparison scenarios
  const comparisonScenarios = Object.keys(QUALITY_TIERS).map(tier => {
    if (!selectedItem) return null
    
    const result = CostCalculationEngine.calculateItemCost({
      item: selectedItem,
      quantity,
      qualityTier: tier as keyof typeof QUALITY_TIERS,
      location
    })
    
    return {
      name: `${selectedItem.itemName} (${tier})`,
      totalCost: result.totalCost,
      timeline: result.timelineEstimate,
      roiImpact: result.factors.quality * 10,
      qualityTier: tier
    }
  }).filter(Boolean) as any[]
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Cost Calculation Test Lab</h1>
        <p className="text-muted-foreground">
          Test our proprietary cost calculation engine with real data
        </p>
      </div>
      
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Test Parameters
          </CardTitle>
          <CardDescription>
            Adjust these settings to see how our cost engine responds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Item Selector */}
            <div>
              <Label>Cost Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASE_COST_DATABASE.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div>
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Quantity */}
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
            
            {/* Location */}
            <div>
              <Label>Zip Code</Label>
              <Select value={zipCode} onValueChange={setZipCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="94102">94102 - San Francisco, CA</SelectItem>
                  <SelectItem value="90210">90210 - Beverly Hills, CA</SelectItem>
                  <SelectItem value="10001">10001 - New York, NY</SelectItem>
                  <SelectItem value="75201">75201 - Dallas, TX</SelectItem>
                  <SelectItem value="30301">30301 - Atlanta, GA</SelectItem>
                  <SelectItem value="44101">44101 - Cleveland, OH</SelectItem>
                  <SelectItem value="98101">98101 - Seattle, WA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Quality Tier */}
            <div>
              <Label>Quality Tier</Label>
              <Select value={qualityTier} onValueChange={(value: keyof typeof QUALITY_TIERS) => setQualityTier(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(QUALITY_TIERS).map(tier => (
                    <SelectItem key={tier} value={tier}>
                      <span className="capitalize">{tier}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      {costResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <CostBreakdown
            materialCost={costResult.materialCost}
            laborCost={costResult.laborCost}
            totalCost={costResult.totalCost}
            timeline={costResult.timelineEstimate}
            confidenceLevel={costResult.confidenceLevel}
            costRange={costResult.costRange}
          />
          
          {/* Cost Range Visualization */}
          <CostRangeVisualization
            estimatedCost={costResult.totalCost}
            costRange={costResult.costRange}
            confidenceLevel={costResult.confidenceLevel}
            factors={costResult.factors}
          />
        </div>
      )}
      
      {/* Regional Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Regional Pricing Data
          </CardTitle>
          <CardDescription>
            Location-specific multipliers applied to base costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{regionalData.laborMultiplier}x</div>
              <div className="text-sm text-muted-foreground">Labor Multiplier</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{regionalData.materialMultiplier}x</div>
              <div className="text-sm text-muted-foreground">Material Multiplier</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{CostUtils.formatCurrency(regionalData.permitBaseCost)}</div>
              <div className="text-sm text-muted-foreground">Permit Costs</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{regionalData.costOfLivingIndex}x</div>
              <div className="text-sm text-muted-foreground">Cost of Living</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Metro Area:</strong> {regionalData.metroArea} | 
            <strong> State:</strong> {regionalData.state}
          </div>
        </CardContent>
      </Card>
      
      {/* Quality Tier Comparison */}
      {selectedItem && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Quality Tier Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(QUALITY_TIERS).map(([tier, config]) => {
              const tierResult = CostCalculationEngine.calculateItemCost({
                item: selectedItem,
                quantity,
                qualityTier: tier as keyof typeof QUALITY_TIERS,
                location
              })
              
              return (
                <Card key={tier} className={cn(
                  "cursor-pointer transition-all",
                  tier === qualityTier ? "ring-2 ring-primary" : "hover:shadow-md"
                )} onClick={() => setQualityTier(tier as keyof typeof QUALITY_TIERS)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">{tier}</CardTitle>
                    <CardDescription className="text-xs">
                      Materials: {config.materials}x | Labor: {config.labor}x
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        {CostUtils.formatCurrency(tierResult.totalCost)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tierResult.timelineEstimate} days
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {Math.round(tierResult.confidenceLevel * 100)}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Raw Calculation Data */}
      {costResult && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Calculation Data</CardTitle>
            <CardDescription>
              Detailed calculation breakdown for development/debugging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(costResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
