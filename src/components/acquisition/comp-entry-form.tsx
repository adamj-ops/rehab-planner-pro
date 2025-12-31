'use client'

import { useState, useId } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CompInsert } from '@/hooks/use-deals-store'

interface CompEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<CompInsert>) => Promise<void>
}

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

export function CompEntryForm({ open, onOpenChange, onSubmit }: CompEntryFormProps) {
  const id = useId()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    sale_price: '',
    sale_date: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    year_built: '',
    condition: '',
    distance_miles: '',
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.address || !formData.sale_price || !formData.sale_date) {
      return
    }

    setIsSubmitting(true)
    try {
      const compData: Partial<CompInsert> = {
        address: formData.address,
        sale_price: parseFloat(formData.sale_price),
        sale_date: formData.sale_date,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
        sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
        year_built: formData.year_built ? parseInt(formData.year_built) : undefined,
        condition: formData.condition || undefined,
        distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : undefined,
      }

      await onSubmit(compData)

      // Reset form
      setFormData({
        address: '',
        sale_price: '',
        sale_date: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        year_built: '',
        condition: '',
        distance_miles: '',
      })

      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Comparable Sale</DialogTitle>
          <DialogDescription>
            Enter the details of a comparable property sale for ARV calculation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address - Required */}
          <div className="space-y-1.5">
            <label htmlFor={`${id}-address`} className="text-sm font-medium">
              Address <span className="text-destructive">*</span>
            </label>
            <Input
              id={`${id}-address`}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, City, State"
              required
            />
          </div>

          {/* Sale Price and Date - Required */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-sale-price`} className="text-sm font-medium">
                Sale Price <span className="text-destructive">*</span>
              </label>
              <Input
                id={`${id}-sale-price`}
                type="number"
                value={formData.sale_price}
                onChange={(e) => handleChange('sale_price', e.target.value)}
                placeholder="250000"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-sale-date`} className="text-sm font-medium">
                Sale Date <span className="text-destructive">*</span>
              </label>
              <Input
                id={`${id}-sale-date`}
                type="date"
                value={formData.sale_date}
                onChange={(e) => handleChange('sale_date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-bedrooms`} className="text-sm font-medium">Bedrooms</label>
              <Input
                id={`${id}-bedrooms`}
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                placeholder="3"
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-bathrooms`} className="text-sm font-medium">Bathrooms</label>
              <Input
                id={`${id}-bathrooms`}
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                placeholder="2"
                min={0}
              />
            </div>
          </div>

          {/* Sqft and Year Built */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-sqft`} className="text-sm font-medium">Square Feet</label>
              <Input
                id={`${id}-sqft`}
                type="number"
                value={formData.sqft}
                onChange={(e) => handleChange('sqft', e.target.value)}
                placeholder="1500"
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-year-built`} className="text-sm font-medium">Year Built</label>
              <Input
                id={`${id}-year-built`}
                type="number"
                value={formData.year_built}
                onChange={(e) => handleChange('year_built', e.target.value)}
                placeholder="1985"
                min={1800}
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* Condition and Distance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-condition`} className="text-sm font-medium">Condition</label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleChange('condition', value)}
              >
                <SelectTrigger id={`${id}-condition`}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-distance`} className="text-sm font-medium">Distance (miles)</label>
              <Input
                id={`${id}-distance`}
                type="number"
                step="0.1"
                value={formData.distance_miles}
                onChange={(e) => handleChange('distance_miles', e.target.value)}
                placeholder="0.5"
                min={0}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Comp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
