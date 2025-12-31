'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { 
  IconHome2, 
  IconMapPin, 
  IconBuilding,
  IconClipboardList,
  IconCurrencyDollar
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
import {
  WizardStepContainer,
  WizardStepHeader,
  WizardStepContent,
  WizardStepSections,
  WizardStepSection,
  InlineFieldGroup,
} from '@/components/wizard/wizard-step-container'
import type { 
  FinancingCalculation,
  FinancingInputs as FinancingInputsType
} from '@/lib/financing'
import { useRehabStore } from '@/hooks/use-rehab-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useWizard } from '@/components/wizard/wizard-context'

// ============================================================================
// Project Type Selector
// ============================================================================

interface ProjectTypeSelectorLocalProps {
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

function ProjectTypeSelectorLocal({ value, onChange }: ProjectTypeSelectorLocalProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {projectTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={`
            flex flex-col items-center gap-1 rounded-none border-2 p-3 transition-all
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
  // Wizard context
  const { goToNextStep, setIsDirty } = useWizard()
  
  // Store integration
  const { project, updateProject } = useRehabStore()
  
  // Track which sections are complete
  const [sectionStatus, setSectionStatus] = useState({
    projectSetup: false,
    address: false,
    propertyType: false,
    specs: false,
    financial: false,
  })
  
  // Form state
  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: {
      ...defaultPropertyDetails,
      ...(project as Partial<PropertyDetailsFormData>)
    },
    mode: 'onChange'
  })
  
  // Local state for financing calculation
  const [calculation, setCalculation] = useState<FinancingCalculation | null>(null)
  
  // Watch all form values for auto-save
  const watchedValues = useWatch({ control: form.control })
  
  // Auto-save callback
  const handleAutoSave = useCallback(async (data: Partial<PropertyDetailsFormData>) => {
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
    
    setIsDirty(false)
  }, [form, updateProject, setIsDirty])
  
  // Auto-save hook
  const { status: saveStatus, lastSaved, error: saveError, isDirty, saveNow } = useAutoSave({
    data: watchedValues,
    onSave: handleAutoSave,
    debounceMs: 2000,
    enabled: true
  })
  
  // Mark form as dirty when values change
  const handleFieldChange = useCallback(() => {
    setIsDirty(true)
  }, [setIsDirty])
  
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
      rehabBudget: 0,
      closingCostsPercent: values.closingCostsPercent || 3,
      sellingCostsPercent: values.sellingCostsPercent || 6
    }
  }, [form])
  
  // Handle calculation updates
  const handleCalculationChange = useCallback((calc: FinancingCalculation) => {
    setCalculation(calc)
  }, [])
  
  // Handle form submission
  const onSubmit = useCallback((data: PropertyDetailsFormData) => {
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
    
    goToNextStep()
  }, [calculation, updateProject, goToNextStep])
  
  return (
    <WizardStepContainer>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step Header */}
          <WizardStepHeader
            stepNumber={1}
            title="Property Details"
            description="Enter the property information and financing details to analyze your investment."
            badge={isDirty ? 'Unsaved changes' : undefined}
          />
          
          {/* Auto-save indicator */}
          <div className="flex justify-end mb-4">
            <SaveStatusIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              error={saveError}
              isDirty={isDirty}
              onSave={saveNow}
              size="sm"
            />
          </div>
          
          <WizardStepContent>
            <WizardStepSections defaultValue={['projectSetup', 'address', 'financial']}>
              {/* Project Setup Section */}
              <WizardStepSection
                id="projectSetup"
                title="Project Setup"
                description="Name your project and select strategy"
                icon={<IconClipboardList className="h-4 w-4" />}
                isComplete={sectionStatus.projectSetup}
              >
                <div className="space-y-4">
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
                            onChange={(e) => {
                              field.onChange(e)
                              handleFieldChange()
                            }}
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
                          <ProjectTypeSelectorLocal
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              handleFieldChange()
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </WizardStepSection>
              
              {/* Property Address Section */}
              <WizardStepSection
                id="address"
                title="Property Address"
                description="Enter the full property address"
                icon={<IconMapPin className="h-4 w-4" />}
                isComplete={sectionStatus.address}
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 Main Street" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleFieldChange()
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <InlineFieldGroup columns={3}>
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Austin" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                handleFieldChange()
                              }}
                            />
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
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value)
                              handleFieldChange()
                            }} 
                            value={field.value}
                          >
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
                              onChange={(e) => {
                                field.onChange(e)
                                handleFieldChange()
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </InlineFieldGroup>
                </div>
              </WizardStepSection>
              
              {/* Property Type Section */}
              <WizardStepSection
                id="propertyType"
                title="Property Type"
                description="Select the type of property"
                icon={<IconHome2 className="h-4 w-4" />}
                isComplete={sectionStatus.propertyType}
                defaultOpen={false}
              >
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PropertyTypeSelector
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value)
                            handleFieldChange()
                          }}
                          error={form.formState.errors.propertyType?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </WizardStepSection>
              
              {/* Property Specs Section */}
              <WizardStepSection
                id="specs"
                title="Property Specifications"
                description="Physical characteristics"
                icon={<IconBuilding className="h-4 w-4" />}
                isComplete={sectionStatus.specs}
                defaultOpen={false}
              >
                <PropertySpecsInputs />
              </WizardStepSection>
              
              {/* Financial Analysis Section */}
              <WizardStepSection
                id="financial"
                title="Financial Analysis"
                description="Purchase price, financing, and ROI"
                icon={<IconCurrencyDollar className="h-4 w-4" />}
                isComplete={sectionStatus.financial}
              >
                <div className="space-y-6">
                  <FinancialInputs />
                  
                  <FinancingCalculator 
                    onCalculationChange={handleCalculationChange}
                  />
                  
                  {/* Results Grid */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <FinancialTimeline 
                      calculation={calculation}
                      inputs={financingInputs}
                    />
                    <FinancingSummary 
                      calculation={calculation}
                      inputs={financingInputs}
                    />
                  </div>
                </div>
              </WizardStepSection>
            </WizardStepSections>
          </WizardStepContent>
        </form>
      </FormProvider>
    </WizardStepContainer>
  )
}
