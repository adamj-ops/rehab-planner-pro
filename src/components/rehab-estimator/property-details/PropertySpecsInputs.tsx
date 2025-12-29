'use client'

import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { IconCalendar, IconRuler } from '@/lib/icons'
import type { PropertyDetailsFormData } from '@/lib/schemas/property-details'

// ============================================================================
// Button Group Component
// ============================================================================

interface ButtonGroupOption {
  value: number
  label: string
}

interface ButtonGroupProps {
  options: ButtonGroupOption[]
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

function ButtonGroup({ options, value, onChange, disabled, className }: ButtonGroupProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {options.map((option) => {
        const isSelected = value === option.value
        
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================================================
// Formatted Number Input Component
// ============================================================================

interface FormattedNumberInputProps {
  value: number
  onChange: (value: number) => void
  suffix?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: number
  max?: number
}

function FormattedNumberInput({
  value,
  onChange,
  suffix,
  placeholder = '0',
  disabled,
  className,
  min,
  max
}: FormattedNumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    let numericValue = rawValue ? parseInt(rawValue, 10) : 0
    
    if (min !== undefined && numericValue < min) numericValue = min
    if (max !== undefined && numericValue > max) numericValue = max
    
    onChange(numericValue)
  }
  
  const displayValue = value ? value.toLocaleString() : ''
  
  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(suffix && 'pr-14', className)}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Property Specs Inputs Component
// ============================================================================

const bedroomOptions: ButtonGroupOption[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' }
]

const bathroomOptions: ButtonGroupOption[] = [
  { value: 1, label: '1' },
  { value: 1.5, label: '1.5' },
  { value: 2, label: '2' },
  { value: 2.5, label: '2.5' },
  { value: 3, label: '3+' }
]

const garageOptions: ButtonGroupOption[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3+' }
]

const storyOptions: ButtonGroupOption[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3+' }
]

interface PropertySpecsInputsProps {
  disabled?: boolean
  className?: string
}

function PropertySpecsInputs({ disabled, className }: PropertySpecsInputsProps) {
  const form = useFormContext<PropertyDetailsFormData>()
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Year Built & Square Footage Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="yearBuilt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <IconCalendar className="h-4 w-4 text-muted-foreground" stroke={1.5} />
                Year Built
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2000"
                  min={1800}
                  max={new Date().getFullYear()}
                  disabled={disabled}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
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
              <FormLabel className="flex items-center gap-1.5">
                <IconRuler className="h-4 w-4 text-muted-foreground" stroke={1.5} />
                Square Feet
              </FormLabel>
              <FormControl>
                <FormattedNumberInput
                  value={field.value}
                  onChange={field.onChange}
                  suffix="sq ft"
                  placeholder="1,850"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Lot Size Row */}
      <FormField
        control={form.control}
        name="lotSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lot Size (Optional)</FormLabel>
            <FormControl>
              <FormattedNumberInput
                value={field.value ?? 0}
                onChange={field.onChange}
                suffix="sq ft"
                placeholder="5,000"
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Bedrooms & Bathrooms Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <ButtonGroup
                  options={bedroomOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <FormControl>
                <ButtonGroup
                  options={bathroomOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Garage & Stories Row (Optional) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="garageSpaces"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Garage Spaces (Optional)</FormLabel>
              <FormControl>
                <ButtonGroup
                  options={garageOptions}
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="stories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stories (Optional)</FormLabel>
              <FormControl>
                <ButtonGroup
                  options={storyOptions}
                  value={field.value ?? 1}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export { PropertySpecsInputs, ButtonGroup, FormattedNumberInput }
export type { PropertySpecsInputsProps, ButtonGroupProps, FormattedNumberInputProps }
