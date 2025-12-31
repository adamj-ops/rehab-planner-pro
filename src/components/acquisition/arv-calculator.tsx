'use client'

import { useState, useEffect, useMemo, useId } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MethodTabs } from './method-tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertTriangle, IconAlertCircle } from '@/lib/icons'
import type { 
  Comp, 
  MarketAnalysis, 
  MarketAnalysisUpdate,
  ArvMethod
} from '@/hooks/use-deals-store'
import { cn } from '@/lib/utils'

interface ArvCalculatorProps {
  leadId: string
  subjectSqft: number | null
  comps: Comp[]
  marketAnalysis: MarketAnalysis | null
  onSave: (data: Partial<MarketAnalysisUpdate>) => Promise<void>
  className?: string
}


// Helper to format currency
function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Calculate total adjustments for a comp
function calculateCompTotalAdjustments(comp: Comp): number {
  const sqft = Number(comp.adjustment_sqft) || 0
  const bedrooms = Number(comp.adjustment_bedrooms) || 0
  const bathrooms = Number(comp.adjustment_bathrooms) || 0
  const condition = Number(comp.adjustment_condition) || 0
  const age = Number(comp.adjustment_age) || 0
  const other = Number(comp.adjustment_other) || 0
  return sqft + bedrooms + bathrooms + condition + age + other
}

// Calculate confidence score based on comps quality
function calculateConfidenceScore(comps: Comp[]): number {
  if (comps.length === 0) return 0

  let score = 0
  
  // Comp count (0-25 pts)
  if (comps.length >= 3) score += 25
  else if (comps.length === 2) score += 15
  else if (comps.length === 1) score += 5
  
  // Recency (0-25 pts) - check how recent the comps are
  const now = new Date()
  const recentComps = comps.filter((comp) => {
    if (!comp.sale_date) return false
    const saleDate = new Date(comp.sale_date)
    const monthsAgo = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsAgo <= 6 // within 6 months
  })
  
  if (recentComps.length === comps.length && comps.length > 0) {
    const avgMonthsAgo = comps.reduce((acc, comp) => {
      if (!comp.sale_date) return acc
      const saleDate = new Date(comp.sale_date)
      const monthsAgo = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return acc + monthsAgo
    }, 0) / comps.length
    
    if (avgMonthsAgo <= 3) score += 25
    else if (avgMonthsAgo <= 6) score += 20
    else if (avgMonthsAgo <= 12) score += 10
  }
  
  // Price variance (0-25 pts) - check consistency of sale prices
  if (comps.length >= 2) {
    const prices = comps.map(c => Number(c.sale_price) || 0).filter(p => p > 0)
    if (prices.length >= 2) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length
      const stdDev = Math.sqrt(variance)
      const coeffVariation = stdDev / avg
      
      if (coeffVariation <= 0.1) score += 25 // Low variance
      else if (coeffVariation <= 0.2) score += 15 // Medium variance
      else score += 5 // High variance
    }
  }
  
  // Adjustment spread (0-25 pts) - tight adjustments indicate good comps
  if (comps.length >= 2) {
    const adjustments = comps.map(calculateCompTotalAdjustments)
    const absAdjustments = adjustments.map(Math.abs)
    const avgAbsAdj = absAdjustments.reduce((a, b) => a + b, 0) / absAdjustments.length
    
    if (avgAbsAdj <= 5000) score += 25 // Tight adjustments
    else if (avgAbsAdj <= 15000) score += 15 // Medium adjustments
    else score += 5 // Wide adjustments
  }
  
  return Math.min(100, score)
}

// Get confidence descriptor
function getConfidenceDescriptor(score: number): string {
  if (score <= 40) return 'Low'
  if (score <= 70) return 'Medium'
  return 'High'
}

// Get confidence descriptor details
function getConfidenceDetails(comps: Comp[]): string {
  if (comps.length === 0) return 'No comps available'
  
  const recentCount = comps.filter((comp) => {
    if (!comp.sale_date) return false
    const saleDate = new Date(comp.sale_date)
    const monthsAgo = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsAgo <= 6
  }).length
  
  const timeframe = recentCount === comps.length ? 'within 6 mo' : 'mixed timeframe'
  return `${comps.length} comp${comps.length !== 1 ? 's' : ''} ${timeframe}`
}

// Validation system
interface ValidationResult {
  isValid: boolean
  warning?: string
  severity: 'info' | 'warning' | 'error'
}

function validateAdjustment(value: number, type: string): ValidationResult {
  const absValue = Math.abs(value)
  
  if (absValue > 100000) {
    return {
      isValid: false,
      warning: `${type} adjustment exceeds $100K. This may indicate an error.`,
      severity: 'error'
    }
  }
  
  if (absValue > 50000) {
    return {
      isValid: false,
      warning: `${type} adjustment of ${formatCurrency(absValue)} seems unusually large. Please verify.`,
      severity: 'warning'
    }
  }
  
  return { isValid: true, severity: 'info' }
}

function validateARV(arv: number, comps: Comp[]): ValidationResult {
  if (comps.length === 0) return { isValid: true, severity: 'info' }
  
  const avgCompPrice = comps.reduce((sum, comp) => 
    sum + (Number(comp.sale_price) || 0), 0) / comps.length
  
  const deviation = Math.abs(arv - avgCompPrice) / avgCompPrice
  
  if (deviation > 0.3) {
    return {
      isValid: false,
      warning: `ARV is ${(deviation * 100).toFixed(0)}% different from average comp price. Consider reviewing adjustments.`,
      severity: 'warning'
    }
  }
  
  return { isValid: true, severity: 'info' }
}

function validateConfidence(score: number): ValidationResult {
  if (score < 40) {
    return {
      isValid: false,
      warning: 'Low confidence score. Consider adding more recent comps or reducing adjustments.',
      severity: 'warning'
    }
  }
  
  return { isValid: true, severity: 'info' }
}

// Validation Alert Component
function ValidationAlert({ validation }: { validation: ValidationResult }) {
  if (validation.isValid) return null
  
  const Icon = validation.severity === 'error' ? IconAlertTriangle : IconAlertCircle
  
  return (
    <Alert variant={validation.severity === 'error' ? 'destructive' : 'default'}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{validation.warning}</AlertDescription>
    </Alert>
  )
}

export function ArvCalculator({
  leadId: _leadId,
  subjectSqft,
  comps,
  marketAnalysis,
  onSave,
  className,
}: ArvCalculatorProps) {
  const id = useId()
  
  // Form state
  const [method, setMethod] = useState<ArvMethod>(
    (marketAnalysis?.arv_method as ArvMethod) || 'sqft_based'
  )
  const [featureAdjustment, setFeatureAdjustment] = useState(0)
  const [conditionAdjustment, setConditionAdjustment] = useState(0)
  const [notes, setNotes] = useState(marketAnalysis?.arv_notes || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [arvChanged, setArvChanged] = useState(false)

  // Calculate ARV based on selected method
  const calculatedArv = useMemo(() => {
    if (comps.length === 0) return null

    let baseArv = 0

    switch (method) {
      case 'comp_based': {
        // Average of adjusted comp values
        const adjustedValues = comps.map((comp) => {
          const salePrice = Number(comp.sale_price) || 0
          const totalAdjustments = calculateCompTotalAdjustments(comp)
          return salePrice + totalAdjustments
        })
        baseArv = adjustedValues.reduce((a, b) => a + b, 0) / adjustedValues.length
        break
      }
      
      case 'sqft_based': {
        // Average $/SF from comps × subject sqft
        if (!subjectSqft) return null
        const pricesPerSqft = comps
          .map((comp) => Number(comp.price_per_sqft) || 0)
          .filter((price) => price > 0)
        
        if (pricesPerSqft.length === 0) return null
        const avgPricePerSqft = pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length
        baseArv = avgPricePerSqft * subjectSqft
        break
      }
      
      case 'hybrid': {
        // 50/50 weighted average of both methods
        if (!subjectSqft) return null
        
        // Comp-based calculation
        const adjustedValues = comps.map((comp) => {
          const salePrice = Number(comp.sale_price) || 0
          const totalAdjustments = calculateCompTotalAdjustments(comp)
          return salePrice + totalAdjustments
        })
        const compBasedArv = adjustedValues.reduce((a, b) => a + b, 0) / adjustedValues.length
        
        // $/SF-based calculation
        const pricesPerSqft = comps
          .map((comp) => Number(comp.price_per_sqft) || 0)
          .filter((price) => price > 0)
        
        if (pricesPerSqft.length === 0) return compBasedArv
        const avgPricePerSqft = pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length
        const sqftBasedArv = avgPricePerSqft * subjectSqft
        
        baseArv = (compBasedArv + sqftBasedArv) / 2
        break
      }
    }

    return baseArv + featureAdjustment + conditionAdjustment
  }, [comps, method, subjectSqft, featureAdjustment, conditionAdjustment])

  // Calculate confidence score
  const confidenceScore = useMemo(() => calculateConfidenceScore(comps), [comps])
  const confidenceDescriptor = useMemo(() => getConfidenceDescriptor(confidenceScore), [confidenceScore])
  const confidenceDetails = useMemo(() => getConfidenceDetails(comps), [comps])

  // Validation state
  const featureValidation = useMemo(() => validateAdjustment(featureAdjustment, 'Feature'), [featureAdjustment])
  const conditionValidation = useMemo(() => validateAdjustment(conditionAdjustment, 'Condition'), [conditionAdjustment])
  const arvValidation = useMemo(() => {
    if (!calculatedArv) return { isValid: true, severity: 'info' as const }
    return validateARV(calculatedArv, comps)
  }, [calculatedArv, comps])
  const confidenceValidation = useMemo(() => validateConfidence(confidenceScore), [confidenceScore])

  // Update form when marketAnalysis changes
  useEffect(() => {
    if (marketAnalysis) {
      setNotes(marketAnalysis.arv_notes || '')
      if (marketAnalysis.arv_method) {
        setMethod(marketAnalysis.arv_method as ArvMethod)
      }
    }
  }, [marketAnalysis])

  // Handle comps changes with visual feedback
  useEffect(() => {
    if (comps.length > 0) {
      setIsCalculating(true)
      const timer = setTimeout(() => {
        setIsCalculating(false)
        setArvChanged(true)
        // Clear highlight after animation
        const highlightTimer = setTimeout(() => setArvChanged(false), 1000)
        return () => clearTimeout(highlightTimer)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [comps])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        arv_estimate: calculatedArv,
        arv_confidence: confidenceScore,
        arv_method: method,
        arv_notes: notes || null,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium mb-4">ARV Calculation</CardTitle>
        <MethodTabs value={method} onChange={setMethod} />
      </CardHeader>

      <CardContent className="pt-0 space-y-6">
        {comps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comps available for ARV calculation.</p>
            <p className="text-sm text-muted-foreground mt-1">Add comparable sales to get started.</p>
          </div>
        ) : calculatedArv === null ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {method === 'sqft_based' || method === 'hybrid'
                ? 'Subject property square footage required for $/SF calculation.'
                : 'Unable to calculate ARV with current data.'}
            </p>
          </div>
        ) : (
          <>
            {/* Calculation Breakdown */}
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Method: {ARV_METHODS.find(m => m.value === method)?.label}</div>
              
              {/* Method-specific calculation display */}
              {method === 'sqft_based' && subjectSqft && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Average Comp $/SF</span>
                    <span>{formatCurrency(
                      comps
                        .map((comp) => Number(comp.price_per_sqft) || 0)
                        .filter((price) => price > 0)
                        .reduce((a, b) => a + b, 0) / 
                      comps.filter(comp => Number(comp.price_per_sqft) > 0).length
                    ).replace('$', '$')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>× Subject SF</span>
                    <span>{subjectSqft.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>= Base ARV</span>
                    <span>{formatCurrency((calculatedArv || 0) - featureAdjustment - conditionAdjustment)}</span>
                  </div>
                </div>
              )}

              {method === 'comp_based' && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Average Adjusted Comp Value</span>
                    <span>{formatCurrency((calculatedArv || 0) - featureAdjustment - conditionAdjustment)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on {comps.length} comp{comps.length !== 1 ? 's' : ''} with adjustments
                  </div>
                </div>
              )}

              {method === 'hybrid' && subjectSqft && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Weighted Average (50/50)</span>
                    <span>{formatCurrency((calculatedArv || 0) - featureAdjustment - conditionAdjustment)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Comp-based + $/SF-based methods
                  </div>
                </div>
              )}

              {/* Adjustments */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Adjustments:</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${id}-feature`} className="text-sm text-muted-foreground block mb-1">
                      Feature Adj.
                    </label>
                    <Input
                      id={`${id}-feature`}
                      type="number"
                      value={featureAdjustment}
                      onChange={(e) => setFeatureAdjustment(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`${id}-condition`} className="text-sm text-muted-foreground block mb-1">
                      Condition Adj.
                    </label>
                    <Input
                      id={`${id}-condition`}
                      type="number"
                      value={conditionAdjustment}
                      onChange={(e) => setConditionAdjustment(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                </div>

                {(featureAdjustment !== 0 || conditionAdjustment !== 0) && (
                  <div className="space-y-1 text-sm">
                    {featureAdjustment !== 0 && (
                      <div className="flex justify-between">
                        <span>Feature Adj.</span>
                        <span className={featureAdjustment > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {featureAdjustment > 0 ? '+' : ''}{formatCurrency(featureAdjustment)}
                        </span>
                      </div>
                    )}
                    {conditionAdjustment !== 0 && (
                      <div className="flex justify-between">
                        <span>Condition Adj.</span>
                        <span className={conditionAdjustment > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {conditionAdjustment > 0 ? '+' : ''}{formatCurrency(conditionAdjustment)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final ARV */}
              <div className="pt-2 border-t-2 border-double">
                <div className="flex justify-between text-lg font-semibold">
                  <span>FINAL ARV</span>
                  <span className={cn(
                    "transition-all duration-500",
                    isCalculating && "text-muted-foreground",
                    arvChanged && "text-emerald-600 scale-105"
                  )}>
                    {isCalculating ? "Calculating..." : formatCurrency(calculatedArv)}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Warnings */}
            <div className="space-y-2">
              <ValidationAlert validation={featureValidation} />
              <ValidationAlert validation={conditionValidation} />
              <ValidationAlert validation={arvValidation} />
              <ValidationAlert validation={confidenceValidation} />
            </div>

            {/* Confidence Gauge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence:</span>
                <span className="text-sm font-semibold">
                  {confidenceDescriptor} ({confidenceScore}%)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      confidenceScore <= 40 && "bg-red-500",
                      confidenceScore > 40 && confidenceScore <= 70 && "bg-yellow-500",
                      confidenceScore > 70 && "bg-emerald-500"
                    )}
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {confidenceScore}%
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {confidenceDetails}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor={`${id}-notes`} className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id={`${id}-notes`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about adjustments, methodology, or other considerations..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving ARV...' : 'Save ARV'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}