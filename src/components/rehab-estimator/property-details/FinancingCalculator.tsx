'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  IconCreditCard, 
  IconBuildingWarehouse, 
  IconCurrencyDollar,
  IconCalendar,
  IconReceipt
} from '@/lib/icons'
import { CurrencyInput } from './FinancialInputs'
import { 
  calculateFinancing,
  estimateMonthlyHoldingCosts,
  type FinancingInputs,
  type MonthlyHoldingCosts,
  type FinancingCalculation,
  LOAN_TYPE_DEFAULTS
} from '@/lib/financing'
import type { PropertyDetailsFormData, LoanType } from '@/lib/schemas/property-details'

// ============================================================================
// Loan Type Toggle Component
// ============================================================================

interface LoanTypeOption {
  value: LoanType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string; stroke?: number }>
}

const loanTypes: LoanTypeOption[] = [
  {
    value: 'cash',
    label: 'Cash',
    description: 'No financing',
    icon: IconCurrencyDollar
  },
  {
    value: 'conventional',
    label: 'Conventional',
    description: '15-30 year loan',
    icon: IconBuildingWarehouse
  },
  {
    value: 'hard_money',
    label: 'Hard Money',
    description: 'Short-term bridge',
    icon: IconCreditCard
  }
]

interface LoanTypeToggleProps {
  value: LoanType
  onChange: (type: LoanType) => void
  disabled?: boolean
}

function LoanTypeToggle({ value, onChange, disabled }: LoanTypeToggleProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {loanTypes.map((type) => {
        const isSelected = value === type.value
        const Icon = type.icon
        
        return (
          <button
            key={type.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <Icon 
              className={cn(
                'h-5 w-5',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
              stroke={1.5}
            />
            <span className={cn(
              'text-sm font-medium',
              isSelected ? 'text-primary' : 'text-foreground'
            )}>
              {type.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {type.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================================================
// Percentage Input with Slider
// ============================================================================

interface PercentageInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showSlider?: boolean
}

function PercentageInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.5,
  disabled,
  showSlider = true
}: PercentageInputProps) {
  return (
    <div className="space-y-2">
      {showSlider && (
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
      )}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-20 text-center"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  )
}

// ============================================================================
// Monthly Costs Section
// ============================================================================

interface MonthlyCostsInputsProps {
  costs: MonthlyHoldingCosts
  onChange: (costs: MonthlyHoldingCosts) => void
  disabled?: boolean
}

function MonthlyCostsInputs({ costs, onChange, disabled }: MonthlyCostsInputsProps) {
  const handleChange = (field: keyof MonthlyHoldingCosts, value: number) => {
    onChange({ ...costs, [field]: value })
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconReceipt className="h-4 w-4 text-muted-foreground" stroke={1.5} />
        <Label className="text-sm font-medium">Monthly Holding Costs</Label>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Property Taxes</Label>
          <CurrencyInput
            value={costs.propertyTaxes}
            onChange={(v) => handleChange('propertyTaxes', v)}
            placeholder="250"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Insurance</Label>
          <CurrencyInput
            value={costs.insurance}
            onChange={(v) => handleChange('insurance', v)}
            placeholder="150"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Utilities</Label>
          <CurrencyInput
            value={costs.utilities}
            onChange={(v) => handleChange('utilities', v)}
            placeholder="200"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">HOA (if applicable)</Label>
          <CurrencyInput
            value={costs.hoaFees}
            onChange={(v) => handleChange('hoaFees', v)}
            placeholder="0"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Maintenance</Label>
          <CurrencyInput
            value={costs.maintenance}
            onChange={(v) => handleChange('maintenance', v)}
            placeholder="100"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Financing Calculator Component
// ============================================================================

interface FinancingCalculatorProps {
  onCalculationChange?: (calculation: FinancingCalculation) => void
  disabled?: boolean
  className?: string
}

function FinancingCalculator({ 
  onCalculationChange, 
  disabled, 
  className 
}: FinancingCalculatorProps) {
  const form = useFormContext<PropertyDetailsFormData>()
  
  // Watch financial inputs
  const purchasePrice = useWatch({ control: form.control, name: 'purchasePrice' }) || 0
  const arv = useWatch({ control: form.control, name: 'arv' }) || 0
  const closingCostsPercent = useWatch({ control: form.control, name: 'closingCostsPercent' }) || 3
  const sellingCostsPercent = useWatch({ control: form.control, name: 'sellingCostsPercent' }) || 6
  const financing = useWatch({ control: form.control, name: 'financing' })
  
  // Local state for financing details
  const [loanType, setLoanType] = useState<LoanType>(financing?.loanType || 'conventional')
  const [downPaymentPercent, setDownPaymentPercent] = useState(financing?.downPaymentPercent || 20)
  const [interestRate, setInterestRate] = useState(financing?.interestRate || 7)
  const [loanTermMonths, setLoanTermMonths] = useState(financing?.loanTermMonths || 12)
  const [points, setPoints] = useState(financing?.points || 0)
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState(financing?.holdingPeriodMonths || 6)
  const [rehabBudget, setRehabBudget] = useState(0)
  
  // Monthly holding costs state
  const [holdingCosts, setHoldingCosts] = useState<MonthlyHoldingCosts>(() => 
    estimateMonthlyHoldingCosts(purchasePrice, false)
  )
  
  // Track previous loan type to apply defaults only on actual change
  const prevLoanTypeRef = useRef(loanType)
  
  // Update defaults when loan type changes (user-initiated change only)
  useEffect(() => {
    if (prevLoanTypeRef.current !== loanType) {
      const defaults = LOAN_TYPE_DEFAULTS[loanType]
      if (defaults.downPaymentPercent !== undefined) setDownPaymentPercent(defaults.downPaymentPercent)
      if (defaults.interestRate !== undefined) setInterestRate(defaults.interestRate)
      if (defaults.loanTermMonths !== undefined) setLoanTermMonths(defaults.loanTermMonths)
      if (defaults.points !== undefined) setPoints(defaults.points)
      prevLoanTypeRef.current = loanType
    }
  }, [loanType])
  
  // Debounced form update to prevent infinite loops
  const updateFormFinancing = useCallback(() => {
    form.setValue('financing', {
      loanType,
      downPaymentPercent,
      interestRate,
      loanTermMonths,
      points,
      holdingPeriodMonths
    }, { shouldDirty: false }) // Don't mark as dirty to prevent auto-save loops
  }, [form, loanType, downPaymentPercent, interestRate, loanTermMonths, points, holdingPeriodMonths])
  
  // Use a ref to track if we need to update and a timeout to debounce
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // Schedule debounced update
    updateTimeoutRef.current = setTimeout(() => {
      updateFormFinancing()
    }, 100)
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [updateFormFinancing])
  
  // Calculate financing
  const calculation = useMemo(() => {
    if (purchasePrice <= 0) return null
    
    const inputs: FinancingInputs = {
      purchasePrice,
      arv: arv || purchasePrice,
      loanType,
      downPaymentPercent,
      interestRate,
      loanTermMonths,
      points,
      holdingPeriodMonths,
      rehabBudget,
      closingCostsPercent,
      sellingCostsPercent
    }
    
    const calc = calculateFinancing(inputs, holdingCosts)
    onCalculationChange?.(calc)
    return calc
  }, [
    purchasePrice, arv, loanType, downPaymentPercent, interestRate,
    loanTermMonths, points, holdingPeriodMonths, rehabBudget,
    closingCostsPercent, sellingCostsPercent, holdingCosts, onCalculationChange
  ])
  
  // Loan term options based on loan type
  const loanTermOptions = loanType === 'hard_money'
    ? [
        { value: 6, label: '6 months' },
        { value: 12, label: '12 months' },
        { value: 18, label: '18 months' },
        { value: 24, label: '24 months' }
      ]
    : [
        { value: 12, label: '1 year' },
        { value: 60, label: '5 years' },
        { value: 180, label: '15 years' },
        { value: 360, label: '30 years' }
      ]
  
  const isCashDeal = loanType === 'cash'
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCreditCard className="h-5 w-5 text-primary" stroke={1.5} />
          Financing Calculator
        </CardTitle>
        <CardDescription>
          Configure your financing to calculate holding costs and ROI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loan Type Selection */}
        <div className="space-y-2">
          <Label>Financing Type</Label>
          <LoanTypeToggle
            value={loanType}
            onChange={setLoanType}
            disabled={disabled}
          />
        </div>
        
        {/* Financing Details (hidden for cash) */}
        {!isCashDeal && (
          <>
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Down Payment */}
              <div className="space-y-2">
                <Label>Down Payment</Label>
                <PercentageInput
                  value={downPaymentPercent}
                  onChange={setDownPaymentPercent}
                  min={0}
                  max={100}
                  step={5}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  ${Math.round(purchasePrice * (downPaymentPercent / 100)).toLocaleString()}
                </p>
              </div>
              
              {/* Interest Rate */}
              <div className="space-y-2">
                <Label>Interest Rate</Label>
                <PercentageInput
                  value={interestRate}
                  onChange={setInterestRate}
                  min={0}
                  max={25}
                  step={0.25}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Annual percentage rate
                </p>
              </div>
              
              {/* Loan Term */}
              <div className="space-y-2">
                <Label>Loan Term</Label>
                <Select
                  value={loanTermMonths.toString()}
                  onValueChange={(v) => setLoanTermMonths(parseInt(v))}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {loanTermOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Points */}
              {loanType === 'hard_money' && (
                <div className="space-y-2">
                  <Label>Points</Label>
                  <PercentageInput
                    value={points}
                    onChange={setPoints}
                    min={0}
                    max={5}
                    step={0.5}
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    ${Math.round(purchasePrice * (1 - downPaymentPercent / 100) * (points / 100)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        
        <Separator />
        
        {/* Holding Period */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <IconCalendar className="h-4 w-4 text-muted-foreground" stroke={1.5} />
              Holding Period
            </Label>
            <span className="text-sm font-medium">{holdingPeriodMonths} months</span>
          </div>
          <Slider
            value={[holdingPeriodMonths]}
            onValueChange={([v]) => setHoldingPeriodMonths(v)}
            min={1}
            max={24}
            step={1}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 month</span>
            <span>24 months</span>
          </div>
        </div>
        
        {/* Rehab Budget */}
        <div className="space-y-2">
          <Label>Estimated Rehab Budget</Label>
          <CurrencyInput
            value={rehabBudget}
            onChange={setRehabBudget}
            placeholder="50,000"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Total renovation costs (calculated in later steps)
          </p>
        </div>
        
        <Separator />
        
        {/* Monthly Holding Costs */}
        <MonthlyCostsInputs
          costs={holdingCosts}
          onChange={setHoldingCosts}
          disabled={disabled}
        />
        
        {/* Quick Summary */}
        {calculation && purchasePrice > 0 && (
          <>
            <Separator />
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-medium">Monthly Payment Summary</p>
              
              {!isCashDeal && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Payment (P&I)</span>
                  <span className="font-medium">${Math.round(calculation.monthlyPayment).toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Holding Costs</span>
                <span className="font-medium">
                  ${Math.round(calculation.totalMonthlyHoldingCost - calculation.monthlyPayment).toLocaleString()}
                </span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between text-sm font-medium">
                <span>Total Monthly Cost</span>
                <span className="text-primary">
                  ${Math.round(calculation.totalMonthlyHoldingCost).toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { FinancingCalculator, LoanTypeToggle, MonthlyCostsInputs }
export type { FinancingCalculatorProps, LoanTypeToggleProps, MonthlyCostsInputsProps }
