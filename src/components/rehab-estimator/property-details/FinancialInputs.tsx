'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconCurrencyDollar, IconTrendingUp, IconAlertTriangle } from '@/lib/icons'
import type { PropertyDetailsFormData } from '@/lib/schemas/property-details'
import { shouldShowArvWarning } from '@/lib/schemas/property-details'

// ============================================================================
// Currency Input Component
// ============================================================================

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  disabled,
  className
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0
    onChange(numericValue)
  }
  
  const displayValue = value ? value.toLocaleString() : ''
  
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>
      <Input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('pl-7 text-lg font-medium', className)}
      />
    </div>
  )
}

// ============================================================================
// Percentage Slider Component  
// ============================================================================

interface PercentageSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

function PercentageSlider({
  value,
  onChange,
  min = 0,
  max = 15,
  step = 0.5,
  disabled
}: PercentageSliderProps) {
  return (
    <div className="flex items-center gap-4">
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="flex-1"
      />
      <div className="w-16 text-right">
        <span className="text-sm font-medium">{value.toFixed(1)}%</span>
      </div>
    </div>
  )
}

// ============================================================================
// Computed Value Display
// ============================================================================

interface ComputedValueProps {
  label: string
  value: number
  variant?: 'default' | 'positive' | 'negative'
  className?: string
}

function ComputedValue({ label, value, variant = 'default', className }: ComputedValueProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-medium',
          variant === 'positive' && 'text-green-600 dark:text-green-400',
          variant === 'negative' && 'text-red-600 dark:text-red-400'
        )}
      >
        ${value.toLocaleString()}
      </span>
    </div>
  )
}

// ============================================================================
// Financial Inputs Component
// ============================================================================

interface FinancialInputsProps {
  disabled?: boolean
  className?: string
}

function FinancialInputs({ disabled, className }: FinancialInputsProps) {
  const form = useFormContext<PropertyDetailsFormData>()
  
  // Watch values for computed calculations
  const purchasePrice = useWatch({ control: form.control, name: 'purchasePrice' }) || 0
  const arv = useWatch({ control: form.control, name: 'arv' }) || 0
  const closingCostsPercent = useWatch({ control: form.control, name: 'closingCostsPercent' }) || 3
  const sellingCostsPercent = useWatch({ control: form.control, name: 'sellingCostsPercent' }) || 6
  
  // Computed values
  const potentialEquity = arv > 0 ? arv - purchasePrice : 0
  const closingCosts = Math.round(purchasePrice * (closingCostsPercent / 100))
  const sellingCosts = Math.round(arv * (sellingCostsPercent / 100))
  
  const showArvWarning = shouldShowArvWarning(purchasePrice, arv)
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCurrencyDollar className="h-5 w-5 text-primary" stroke={1.5} />
          Financial Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Purchase Price & ARV */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="250,000"
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>
                  Agreed purchase price for the property
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="arv"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <IconTrendingUp className="h-4 w-4 text-muted-foreground" stroke={1.5} />
                  After Repair Value (ARV)
                </FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    placeholder="350,000"
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>
                  Estimated value after renovations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* ARV Warning */}
        {showArvWarning && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <IconAlertTriangle className="h-4 w-4 text-amber-600" stroke={1.5} />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              ARV is lower than purchase price. This may indicate an unprofitable deal.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Cost Percentages */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="closingCostsPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Costs</FormLabel>
                <FormControl>
                  <PercentageSlider
                    value={field.value ?? 3}
                    onChange={field.onChange}
                    min={0}
                    max={10}
                    step={0.5}
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>
                  Typical range: 2-5% of purchase price
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sellingCostsPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Costs</FormLabel>
                <FormControl>
                  <PercentageSlider
                    value={field.value ?? 6}
                    onChange={field.onChange}
                    min={0}
                    max={12}
                    step={0.5}
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>
                  Agent fees, closing costs (~6-8%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Computed Values Display */}
        {purchasePrice > 0 && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium mb-3">Calculated Costs</p>
            
            <ComputedValue
              label="Potential Equity"
              value={potentialEquity}
              variant={potentialEquity > 0 ? 'positive' : potentialEquity < 0 ? 'negative' : 'default'}
            />
            
            <ComputedValue
              label="Est. Closing Costs"
              value={closingCosts}
            />
            
            <ComputedValue
              label="Est. Selling Costs"
              value={sellingCosts}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { FinancialInputs, CurrencyInput, PercentageSlider, ComputedValue }
export type { FinancialInputsProps, CurrencyInputProps, PercentageSliderProps }
