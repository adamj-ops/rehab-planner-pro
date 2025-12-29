'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  IconHome2, 
  IconBuilding, 
  IconBuildingEstate,
  IconBuildingWarehouse 
} from '@/lib/icons'
import { Label } from '@/components/ui/label'
import type { PropertyType } from '@/lib/schemas/property-details'

interface PropertyTypeOption {
  value: PropertyType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string; stroke?: number }>
}

const propertyTypes: PropertyTypeOption[] = [
  {
    value: 'single_family',
    label: 'Single Family',
    description: 'Detached home on its own lot',
    icon: IconHome2
  },
  {
    value: 'multi_family',
    label: 'Multi-Family',
    description: 'Duplex, triplex, or fourplex',
    icon: IconBuildingWarehouse
  },
  {
    value: 'condo',
    label: 'Condo',
    description: 'Unit in a shared building',
    icon: IconBuilding
  },
  {
    value: 'townhouse',
    label: 'Townhouse',
    description: 'Attached home with shared walls',
    icon: IconBuildingEstate
  }
]

interface PropertyTypeSelectorProps {
  value?: PropertyType
  onChange: (type: PropertyType) => void
  error?: string
  disabled?: boolean
  className?: string
}

const PropertyTypeSelector = forwardRef<HTMLDivElement, PropertyTypeSelectorProps>(
  ({ value, onChange, error, disabled = false, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <Label className="text-sm font-medium">Property Type</Label>
        
        <div 
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          role="radiogroup"
          aria-label="Property type selection"
        >
          {propertyTypes.map((type) => {
            const isSelected = value === type.value
            const Icon = type.icon
            
            return (
              <button
                key={type.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onChange(type.value)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50',
                  disabled && 'cursor-not-allowed opacity-50',
                  error && 'border-destructive'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
                    isSelected
                      ? 'bg-primary/10'
                      : 'bg-muted group-hover:bg-primary/5'
                  )}
                >
                  <Icon 
                    className={cn(
                      'h-6 w-6 transition-colors',
                      isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )}
                    stroke={1.5}
                  />
                </div>
                
                <div className="text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {type.description}
                  </p>
                </div>
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
        
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

PropertyTypeSelector.displayName = 'PropertyTypeSelector'

export { PropertyTypeSelector, propertyTypes }
export type { PropertyTypeSelectorProps, PropertyTypeOption }
