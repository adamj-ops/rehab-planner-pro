'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Clock,
  Zap,
  Check,
  X
} from 'lucide-react'
import { ScopeItem } from '@/types/rehab'

interface AIRecommendationsPanelProps {
  scopeItems: ScopeItem[]
  budget?: number
  strategy?: 'flip' | 'rental' | 'brrrr'
  onAddRecommendation: (item: ScopeItem) => void
  onRemoveItem: (itemId: string) => void
  onOptimizeScope: (optimizedItems: ScopeItem[]) => void
}

interface Recommendation {
  id: string
  type: 'add' | 'remove' | 'upgrade' | 'downgrade' | 'reorder'
  category: string
  title: string
  description: string
  impact: {
    cost: number
    roi: number
    timeline: number
  }
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

export function AIRecommendationsPanel({
  scopeItems,
  budget,
  strategy = 'flip',
  onAddRecommendation,
  onRemoveItem,
  onOptimizeScope
}: AIRecommendationsPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set())

  const generateRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItems,
          budget,
          strategy
        })
      })

      if (!response.ok) throw new Error('Failed to generate recommendations')

      const data = await response.json()
      if (data.success) {
        setRecommendations(data.data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const optimizeScopeForBudget = async () => {
    if (!budget) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-recommendations/optimize-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItems,
          maxBudget: budget,
          strategy
        })
      })

      if (!response.ok) throw new Error('Failed to optimize scope')

      const data = await response.json()
      if (data.success && data.data.optimizedItems) {
        onOptimizeScope(data.data.optimizedItems)
      }
    } catch (error) {
      console.error('Failed to optimize scope:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const suggestDependencies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-recommendations/suggest-dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItems
        })
      })

      if (!response.ok) throw new Error('Failed to suggest dependencies')

      const data = await response.json()
      if (data.success) {
        // Dependencies would be automatically applied to the scope items
        console.log('Dependencies suggested:', data.data)
      }
    } catch (error) {
      console.error('Failed to suggest dependencies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyRecommendation = (rec: Recommendation) => {
    const newApplied = new Set(appliedRecommendations)
    newApplied.add(rec.id)
    setAppliedRecommendations(newApplied)

    // Handle different recommendation types
    switch (rec.type) {
      case 'add':
        // Logic to add recommended item
        console.log('Adding recommended item:', rec)
        break
      case 'remove':
        // Logic to remove item
        const itemToRemove = scopeItems.find(item => item.itemName.toLowerCase().includes(rec.title.toLowerCase()))
        if (itemToRemove) {
          onRemoveItem(itemToRemove.id)
        }
        break
      default:
        console.log('Applying recommendation:', rec)
    }
  }

  const dismissRecommendation = (recId: string) => {
    setRecommendations(recommendations.filter(r => r.id !== recId))
  }

  // Group recommendations by type
  const recommendationsByType = {
    cost_saving: recommendations.filter(r => r.impact.cost < 0),
    roi_boost: recommendations.filter(r => r.impact.roi > 0),
    missing: recommendations.filter(r => r.type === 'add'),
    removable: recommendations.filter(r => r.type === 'remove')
  }

  const confidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const impactIcon = (type: string) => {
    switch (type) {
      case 'add': return <Sparkles className="w-4 h-4" />
      case 'remove': return <X className="w-4 h-4" />
      case 'upgrade': return <TrendingUp className="w-4 h-4" />
      case 'downgrade': return <DollarSign className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Smart suggestions to optimize your scope and ROI
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateRecommendations}
              disabled={isLoading || scopeItems.length === 0}
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
            {budget && (
              <Button
                variant="outline"
                size="sm"
                onClick={optimizeScopeForBudget}
                disabled={isLoading}
              >
                <Zap className="w-4 h-4 mr-2" />
                Optimize for Budget
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {scopeItems.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Add some scope items to get AI-powered recommendations
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Generate" to get AI-powered recommendations</p>
            <p className="text-sm mt-2">Based on your scope, budget, and strategy</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="cost">
                Cost Savings ({recommendationsByType.cost_saving.length})
              </TabsTrigger>
              <TabsTrigger value="roi">
                ROI Boost ({recommendationsByType.roi_boost.length})
              </TabsTrigger>
              <TabsTrigger value="missing">
                Missing ({recommendationsByType.missing.length})
              </TabsTrigger>
              <TabsTrigger value="removable">
                Remove ({recommendationsByType.removable.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className={appliedRecommendations.has(rec.id) ? 'opacity-50' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded ${rec.type === 'add' ? 'bg-green-100' : rec.type === 'remove' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          {impactIcon(rec.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge variant="outline" className={confidenceColor(rec.confidence)}>
                              {rec.confidence}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                      </div>
                      {!appliedRecommendations.has(rec.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissRecommendation(rec.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        {rec.impact.cost !== 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className={rec.impact.cost < 0 ? 'text-green-600' : 'text-red-600'}>
                              {rec.impact.cost < 0 ? '-' : '+'}${Math.abs(rec.impact.cost).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {rec.impact.roi !== 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-green-600">+{rec.impact.roi}% ROI</span>
                          </div>
                        )}
                        {rec.impact.timeline !== 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{rec.impact.timeline > 0 ? '+' : ''}{rec.impact.timeline} days</span>
                          </div>
                        )}
                      </div>
                      {!appliedRecommendations.has(rec.id) && (
                        <Button
                          size="sm"
                          onClick={() => applyRecommendation(rec)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Apply
                        </Button>
                      )}
                      {appliedRecommendations.has(rec.id) && (
                        <Badge variant="secondary">
                          <Check className="w-3 h-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {rec.reasoning}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Similar structure for other tabs */}
            {(['cost', 'roi', 'missing', 'removable'] as const).map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
                {(recommendationsByType[
                  tab === 'cost' ? 'cost_saving' : 
                  tab === 'roi' ? 'roi_boost' : 
                  tab
                ] as Recommendation[]).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recommendations in this category</p>
                  </div>
                ) : (
                  (recommendationsByType[
                    tab === 'cost' ? 'cost_saving' : 
                    tab === 'roi' ? 'roi_boost' : 
                    tab
                  ] as Recommendation[]).map((rec) => (
                    <Card key={rec.id} className={appliedRecommendations.has(rec.id) ? 'opacity-50' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded ${rec.type === 'add' ? 'bg-green-100' : rec.type === 'remove' ? 'bg-red-100' : 'bg-blue-100'}`}>
                              {impactIcon(rec.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{rec.title}</h4>
                                <Badge variant="outline" className={confidenceColor(rec.confidence)}>
                                  {rec.confidence}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                            </div>
                          </div>
                          {!appliedRecommendations.has(rec.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissRecommendation(rec.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm">
                            {rec.impact.cost !== 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className={rec.impact.cost < 0 ? 'text-green-600' : 'text-red-600'}>
                                  {rec.impact.cost < 0 ? '-' : '+'}${Math.abs(rec.impact.cost).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {rec.impact.roi !== 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-green-600">+{rec.impact.roi}% ROI</span>
                              </div>
                            )}
                            {rec.impact.timeline !== 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{rec.impact.timeline > 0 ? '+' : ''}{rec.impact.timeline} days</span>
                              </div>
                            )}
                          </div>
                          {!appliedRecommendations.has(rec.id) && (
                            <Button
                              size="sm"
                              onClick={() => applyRecommendation(rec)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Apply
                            </Button>
                          )}
                          {appliedRecommendations.has(rec.id) && (
                            <Badge variant="secondary">
                              <Check className="w-3 h-3 mr-1" />
                              Applied
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {rec.reasoning}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

