'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { WizardFooter } from '@/components/wizard/wizard-footer'
import { 
  IconHome2, 
  IconMapPin, 
  IconBuilding,
  IconClipboardList
} from '@/lib/icons'
import { 
  propertyDetailsSchema,
  defaultPropertyDetails,
  US_STATES,
  type PropertyDetailsFormData 
} from '@/lib/schemas/property-details'
import {
  PropertyTypeSelector,
  PropertySpecsInputs,
  FinancialInputs,
  FinancingCalculator,
  FinancialTimeline,
  FinancingSummary,
  SaveStatusIndicator
} from '@/components/rehab-estimator/property-details'
import type { 
  FinancingCalculation,
  FinancingInputs as FinancingInputsType
} from '@/lib/financing'
import { useRehabStore } from '@/hooks/use-rehab-store'
import { useAutoSave } from '@/hooks/use-auto-save'

// ============================================================================
// Project Type Selector
// ============================================================================

interface ProjectTypeSelectorProps {
  value: 'flip' | 'rental' | 'wholesale'
  onChange: (type: 'flip' | 'rental' | 'wholesale') => void
}

const projectTypes = [
  {
    value: 'flip' as const,
    label: 'Flip',
    description: 'Buy, renovate, sell quickly'
  },
  {
    value: 'rental' as const,
    label: 'Rental',
    description: 'Buy, renovate, rent out'
  },
  {
    value: 'wholesale' as const,
    label: 'Wholesale',
    description: 'Find deals for investors'
  }
]

function ProjectTypeSelector({ value, onChange }: ProjectTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {projectTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={`
            flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${value === type.value 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'}
          `}
        >
          <span className={`text-sm font-medium ${value === type.value ? 'text-primary' : ''}`}>
            {type.label}
          </span>
          <span className="text-xs text-muted-foreground text-center">
            {type.description}
          </span>
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function Step1PropertyDetails() {
  // Store integration
  const { project, updateProject, goToNextStep } = useRehabStore()
  
  // Form state
  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: {
      ...defaultPropertyDetails,
      ...(project as Partial<PropertyDetailsFormData>)
    },
    mode: 'onChange' // Enable validation on change for auto-save
  })
  
  // Local state for financing calculation
  const [calculation, setCalculation] = useState<FinancingCalculation | null>(null)
  
  // Watch all form values for auto-save
  const watchedValues = useWatch({ control: form.control })
  
  // Auto-save callback
  const handleAutoSave = useCallback(async (data: Partial<PropertyDetailsFormData>) => {
    // Skip save if form has validation errors (don't trigger validation here to avoid loops)
    if (!form.formState.isValid && Object.keys(form.formState.errors).length > 0) return
    
    const formData = data as PropertyDetailsFormData
    
    updateProject({
      projectName: formData.projectName,
      address: formData.address,
      squareFeet: formData.squareFeet,
      lotSize: formData.lotSize,
      yearBuilt: formData.yearBuilt,
      propertyType: formData.propertyType,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      purchasePrice: formData.purchasePrice,
      arv: formData.arv,
      financingDetails: formData.financing,
      holdingCosts: formData.holdingCosts ? {
        propertyTaxesMonthly: formData.holdingCosts.propertyTaxesMonthly,
        insuranceMonthly: formData.holdingCosts.insuranceMonthly,
        utilitiesMonthly: formData.holdingCosts.utilitiesMonthly,
        hoaMonthly: formData.holdingCosts.hoaMonthly,
        maintenanceMonthly: formData.holdingCosts.maintenanceMonthly
      } : undefined
    })
  }, [form, updateProject])
  
  // Auto-save hook
  const { status: saveStatus, lastSaved, error: saveError, isDirty, saveNow } = useAutoSave({
    data: watchedValues,
    onSave: handleAutoSave,
    debounceMs: 2000,
    enabled: true
  })
  
  // Build financing inputs from form values
  const financingInputs = useMemo((): FinancingInputsType | null => {
    const values = form.getValues()
    if (!values.purchasePrice || values.purchasePrice <= 0) return null
    
    const financing = values.financing ?? defaultPropertyDetails.financing ?? {
      loanType: 'conventional' as const,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTermMonths: 12,
      points: 0,
      holdingPeriodMonths: 6
    }
    
    return {
      purchasePrice: values.purchasePrice,
      arv: values.arv || values.purchasePrice,
      loanType: financing.loanType,
      downPaymentPercent: financing.downPaymentPercent,
      interestRate: financing.interestRate,
      loanTermMonths: financing.loanTermMonths,
      points: financing.points,
      holdingPeriodMonths: financing.holdingPeriodMonths,
      rehabBudget: 0, // Will be calculated in later steps
      closingCostsPercent: values.closingCostsPercent || 3,
      sellingCostsPercent: values.sellingCostsPercent || 6
    }
  }, [form])
  
  // Handle calculation updates from FinancingCalculator
  const handleCalculationChange = useCallback((calc: FinancingCalculation) => {
    setCalculation(calc)
  }, [])
  
  // Handle form submission
  const onSubmit = (data: PropertyDetailsFormData) => {
    // Update store with form data
    updateProject({
      projectName: data.projectName,
      address: data.address,
      squareFeet: data.squareFeet,
      lotSize: data.lotSize,
      yearBuilt: data.yearBuilt,
      propertyType: data.propertyType,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      purchasePrice: data.purchasePrice,
      arv: data.arv,
      financingDetails: data.financing,
      holdingCosts: data.holdingCosts ? {
        propertyTaxesMonthly: data.holdingCosts.propertyTaxesMonthly,
        insuranceMonthly: data.holdingCosts.insuranceMonthly,
        utilitiesMonthly: data.holdingCosts.utilitiesMonthly,
        hoaMonthly: data.holdingCosts.hoaMonthly,
        maintenanceMonthly: data.holdingCosts.maintenanceMonthly
      } : undefined,
      holdingCostEstimate: calculation ? {
        loanAmount: calculation.loanAmount,
        downPayment: calculation.downPayment,
        monthlyPayment: calculation.monthlyPayment,
        totalInterest: calculation.totalInterest,
        pointsCost: calculation.pointsCost,
        closingCosts: calculation.closingCosts,
        sellingCosts: calculation.sellingCosts,
        totalHoldingCosts: calculation.totalHoldingCosts,
        totalMonthlyHoldingCost: calculation.totalMonthlyHoldingCost,
        cashRequired: calculation.cashRequired,
        allInCost: calculation.allInCost,
        estimatedProfit: calculation.estimatedProfit,
        roi: calculation.roi,
        annualizedROI: calculation.annualizedROI,
        cashOnCashReturn: calculation.cashOnCashReturn
      } : undefined
    })
    
    // Navigate to next step
    goToNextStep()
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Property Details</h1>
          <p className="text-muted-foreground">
            Enter the property information and financing details to analyze your investment.
          </p>
        </div>
        
        {/* Auto-save Status */}
        <SaveStatusIndicator
          status={saveStatus}
          lastSaved={lastSaved}
          error={saveError}
          isDirty={isDirty}
          onSave={saveNow}
          size="sm"
        />
      </div>
      
      {/* Form Provider */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Project Setup Card */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClipboardList className="h-5 w-5 text-primary" stroke={1.5} />
                Project Setup
              </CardTitle>
              <CardDescription>
                Name your project and select your investment strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Project Name
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 123 Main Street Renovation"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a memorable name to identify this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Strategy</FormLabel>
                    <FormControl>
                      <ProjectTypeSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Property Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMapPin className="h-5 w-5 text-primary" stroke={1.5} />
                Property Address
              </CardTitle>
              <CardDescription>
                Enter the full property address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Austin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="78701" 
                          maxLength={10}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Property Type Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconHome2 className="h-5 w-5 text-primary" stroke={1.5} />
                Property Type
              </CardTitle>
              <CardDescription>
                Select the type of property you&apos;re analyzing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PropertyTypeSelector
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.propertyType?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Property Specs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBuilding className="h-5 w-5 text-primary" stroke={1.5} />
                Property Specifications
              </CardTitle>
              <CardDescription>
                Enter the property&apos;s physical characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertySpecsInputs />
            </CardContent>
          </Card>
          
          <Separator className="my-8" />
          
          {/* Financial Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Financial Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Enter your purchase price and financing details to calculate ROI
            </p>
          </div>
          
          {/* Financial Inputs */}
          <FinancialInputs />
          
          {/* Financing Calculator */}
          <FinancingCalculator 
            onCalculationChange={handleCalculationChange}
          />
          
          {/* Results Grid - Timeline and Summary side by side on larger screens */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Financial Timeline */}
            <FinancialTimeline 
              calculation={calculation}
              inputs={financingInputs}
            />
            
            {/* Financing Summary */}
            <FinancingSummary 
              calculation={calculation}
              inputs={financingInputs}
            />
          </div>
          
          {/* Wizard Footer */}
          <WizardFooter />
        </form>
      </FormProvider>
    </div>
  )
}
