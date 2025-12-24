'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  MapPin, 
  Ruler, 
  Bed, 
  Bath, 
  DollarSign, 
  TrendingUp,
  Info,
  Calculator,
  Building,
  Save,
  ArrowRight
} from 'lucide-react'
import { RehabProject, PropertyDetailsFormData } from '@/types/rehab'
import { cn } from '@/lib/utils'
import { FinancialSection } from '@/components/rehab-estimator/property-details-financial'

const propertyDetailsSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectType: z.enum(['flip', 'rental', 'wholesale']),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().min(5, 'Valid ZIP code is required')
  }),
  squareFeet: z.number().min(100, 'Square footage must be at least 100'),
  lotSize: z.number().min(0),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  propertyType: z.enum(['single_family', 'multi_family', 'condo', 'townhouse']),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  purchasePrice: z.number().min(0, 'Purchase price must be positive')
})

interface PropertyDetailsFormProps {
  project: Partial<RehabProject>
  onNext: (data: PropertyDetailsFormData) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

const propertyTypes = [
  { value: 'single_family', label: 'Single Family', icon: Home },
  { value: 'multi_family', label: 'Multi-Family', icon: Building },
  { value: 'condo', label: 'Condo', icon: Building },
  { value: 'townhouse', label: 'Townhouse', icon: Building }
]

const projectTypes = [
  { value: 'flip', label: 'Flip', description: 'Buy, renovate, sell quickly' },
  { value: 'rental', label: 'Rental', description: 'Buy, renovate, rent out' },
  { value: 'wholesale', label: 'Wholesale', description: 'Find deals for other investors' }
]

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function PropertyDetailsForm({ project, onNext, onBack, currentStep, totalSteps }: PropertyDetailsFormProps) {

  const [bedrooms, setBedrooms] = useState(project.bedrooms || 3)
  const [bathrooms, setBathrooms] = useState(project.bathrooms || 2)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState('flip')
  const [purchasePrice, setPurchasePrice] = useState(project.purchasePrice || 0)
  const [propertyType, setPropertyType] = useState(project.propertyType || 'single_family')

  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: {
      projectName: project.projectName || '',
      projectType: selectedStrategy as 'flip' | 'rental' | 'wholesale',
      address: {
        street: project.address?.street || '',
        city: project.address?.city || '',
        state: project.address?.state || '',
        zip: project.address?.zip || ''
      },
      squareFeet: project.squareFeet || 0,
      lotSize: project.lotSize || 0,
      yearBuilt: project.yearBuilt || 2000,
      propertyType: propertyType as 'single_family' | 'multi_family' | 'condo' | 'townhouse',
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      purchasePrice: purchasePrice
    }
  })

  // Watch for changes to update unsaved changes indicator
  const watchedValues = form.watch()
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') {
        setHasUnsavedChanges(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = (data: PropertyDetailsFormData) => {
    const formData = {
      ...data,
      selectedStrategy,
      purchasePrice,
      propertyType
    }
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      {/* Main Form */}
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Setup Card */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  <CardTitle>Project Setup</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
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
                            className="mt-1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a memorable name to easily identify this project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Address Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Property Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {states.map((state) => (
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
                            <Input placeholder="78701" maxLength={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Characteristics Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <CardTitle>Property Characteristics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Property Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setPropertyType('single_family')}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                          propertyType === 'single_family'
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        Single Family
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyType('multi_family')}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                          propertyType === 'multi_family'
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        Multi-Family
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyType('condo')}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                          propertyType === 'condo'
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        Condo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyType('townhouse')}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                          propertyType === 'townhouse'
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        Townhouse
                      </button>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2000" 
                            min="1800" 
                            max="2024"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="squareFeet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Feet</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              className="pr-12"
                              value={field.value ? field.value.toLocaleString() : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                field.onChange(value ? parseInt(value) : 0)
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              sq ft
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lotSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lot Size</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              className="pr-12"
                              value={field.value ? field.value.toLocaleString() : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                field.onChange(value ? parseInt(value) : 0)
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              sq ft
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label>Bedrooms</Label>
                    <div className="flex gap-2 mt-2">
                      {([1, 2, 3, 4, '5+'] as const).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            const value = num === '5+' ? 5 : num
                            setBedrooms(value)
                            form.setValue('bedrooms', value)
                          }}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                            bedrooms === (num === '5+' ? 5 : num)
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <div className="flex gap-2 mt-2">
                      {([1, 1.5, 2, 2.5, '3+'] as const).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            const value = num === '3+' ? 3 : num
                            setBathrooms(value)
                            form.setValue('bathrooms', value)
                          }}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                            bathrooms === (num === '3+' ? 3 : num)
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Section */}
            <FinancialSection 
              purchasePrice={purchasePrice}
              onPurchasePriceChange={setPurchasePrice}
            />

            {/* Save Draft Button - Only show if there are unsaved changes */}
            {hasUnsavedChanges && (
              <div className="flex justify-end pt-6">
                <Button type="button" variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
