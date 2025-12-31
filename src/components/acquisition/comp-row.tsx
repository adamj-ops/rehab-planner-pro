'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Comp, CompUpdate } from '@/hooks/use-deals-store'
import { cn } from '@/lib/utils'

interface CompRowProps {
  comp: Comp
  index: number
  onUpdate: (compId: string, data: Partial<CompUpdate>) => Promise<void>
  onDelete: (compId: string) => Promise<void>
}

// Helper to format currency
function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Helper to format price per sqft
function formatPricePerSqft(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return `$${Math.round(value)}`
}

// Helper to format days since sale
function formatDaysSinceSale(saleDate: string | null): string {
  if (!saleDate) return '-'
  const sale = new Date(saleDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - sale.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays}d`
}

// Calculate total adjustments
function calculateTotalAdjustments(comp: Comp): number {
  const sqft = Number(comp.adjustment_sqft) || 0
  const bedrooms = Number(comp.adjustment_bedrooms) || 0
  const bathrooms = Number(comp.adjustment_bathrooms) || 0
  const condition = Number(comp.adjustment_condition) || 0
  const age = Number(comp.adjustment_age) || 0
  const other = Number(comp.adjustment_other) || 0
  return sqft + bedrooms + bathrooms + condition + age + other
}

// Format adjustment value with sign
function formatAdjustment(value: number): string {
  if (value === 0) return '$0'
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatCurrency(value)}`
}

export function CompRow({ comp, index, onUpdate, onDelete }: CompRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Local adjustment state for inline editing
  const [adjustments, setAdjustments] = useState({
    adjustment_sqft: comp.adjustment_sqft ?? 0,
    adjustment_bedrooms: comp.adjustment_bedrooms ?? 0,
    adjustment_bathrooms: comp.adjustment_bathrooms ?? 0,
    adjustment_condition: comp.adjustment_condition ?? 0,
    adjustment_age: comp.adjustment_age ?? 0,
    adjustment_other: comp.adjustment_other ?? 0,
  })

  const totalAdjustments = calculateTotalAdjustments(comp)
  const adjustedValue = (Number(comp.sale_price) || 0) + totalAdjustments

  const handleAdjustmentChange = async (field: keyof typeof adjustments, value: string) => {
    const numValue = parseFloat(value) || 0
    setAdjustments((prev) => ({ ...prev, [field]: numValue }))
  }

  const handleAdjustmentBlur = async (field: keyof typeof adjustments) => {
    if (adjustments[field] !== (comp[field] ?? 0)) {
      setIsUpdating(true)
      try {
        await onUpdate(comp.id, { [field]: adjustments[field] })
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(comp.id)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      {/* Main Row */}
      <TableRow className={cn(isExpanded && 'border-b-0')}>
        <TableCell className="w-10 text-center text-muted-foreground">{index + 1}</TableCell>
        <TableCell className="font-medium max-w-[180px] truncate" title={comp.address}>
          {comp.address}
        </TableCell>
        <TableCell>{formatCurrency(Number(comp.sale_price))}</TableCell>
        <TableCell>{formatPricePerSqft(Number(comp.price_per_sqft))}</TableCell>
        <TableCell className="text-center">{comp.bedrooms ?? '-'}</TableCell>
        <TableCell className="text-center">{comp.bathrooms ?? '-'}</TableCell>
        <TableCell className="text-center">{comp.sqft?.toLocaleString() ?? '-'}</TableCell>
        <TableCell className="text-muted-foreground">{formatDaysSinceSale(comp.sale_date)}</TableCell>
        <TableCell
          className={cn(
            'font-medium',
            totalAdjustments > 0 && 'text-emerald-600',
            totalAdjustments < 0 && 'text-red-600'
          )}
        >
          {formatAdjustment(totalAdjustments)}
        </TableCell>
        <TableCell className="w-20">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-7 text-xs px-2"
                >
                  {isDeleting ? '...' : 'Yes'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-7 text-xs px-2"
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Adjustment Row */}
      {isExpanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/40">
          <TableCell colSpan={10} className="py-4">
            <div className="px-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Adjustment Breakdown</h4>
                <div className="text-sm">
                  <span className="text-muted-foreground">Adjusted Value: </span>
                  <span className="font-semibold">{formatCurrency(adjustedValue)}</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4">
                {/* Sqft Adjustment */}
                <div>
                  <label htmlFor={`adj-sqft-${comp.id}`} className="text-xs text-muted-foreground block mb-1">Sqft Adj.</label>
                  <Input
                    id={`adj-sqft-${comp.id}`}
                    type="number"
                    value={adjustments.adjustment_sqft}
                    onChange={(e) => handleAdjustmentChange('adjustment_sqft', e.target.value)}
                    onBlur={() => handleAdjustmentBlur('adjustment_sqft')}
                    disabled={isUpdating}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Bedrooms Adjustment */}
                <div>
                  <label htmlFor={`adj-bed-${comp.id}`} className="text-xs text-muted-foreground block mb-1">Bedrooms Adj.</label>
                  <Input
                    id={`adj-bed-${comp.id}`}
                    type="number"
                    value={adjustments.adjustment_bedrooms}
                    onChange={(e) => handleAdjustmentChange('adjustment_bedrooms', e.target.value)}
                    onBlur={() => handleAdjustmentBlur('adjustment_bedrooms')}
                    disabled={isUpdating}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Bathrooms Adjustment */}
                <div>
                  <label htmlFor={`adj-bath-${comp.id}`} className="text-xs text-muted-foreground block mb-1">Bathrooms Adj.</label>
                  <Input
                    id={`adj-bath-${comp.id}`}
                    type="number"
                    value={adjustments.adjustment_bathrooms}
                    onChange={(e) => handleAdjustmentChange('adjustment_bathrooms', e.target.value)}
                    onBlur={() => handleAdjustmentBlur('adjustment_bathrooms')}
                    disabled={isUpdating}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Condition Adjustment */}
                <div>
                  <label htmlFor={`adj-cond-${comp.id}`} className="text-xs text-muted-foreground block mb-1">Condition Adj.</label>
                  <Input
                    id={`adj-cond-${comp.id}`}
                    type="number"
                    value={adjustments.adjustment_condition}
                    onChange={(e) => handleAdjustmentChange('adjustment_condition', e.target.value)}
                    onBlur={() => handleAdjustmentBlur('adjustment_condition')}
                    disabled={isUpdating}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Age Adjustment */}
                <div>
                  <label htmlFor={`adj-age-${comp.id}`} className="text-xs text-muted-foreground block mb-1">Age Adj.</label>
                  <Input
                    id={`adj-age-${comp.id}`}
                    type="number"
                    value={adjustments.adjustment_age}
                    onChange={(e) => handleAdjustmentChange('adjustment_age', e.target.value)}
                    onBlur={() => handleAdjustmentBlur('adjustment_age')}
                    disabled={isUpdating}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Other Adjustment */}
                <div>
                  <label htmlFor={`adj-other-${comp.id}`} className="text-xs text-muted-foreground block mb-1">Other Adj.</label>
                  <Input
                    id={`adj-other-${comp.id}`}
                    type="number"
                    value={adjustments.adjustment_other}
                    onChange={(e) => handleAdjustmentChange('adjustment_other', e.target.value)}
                    onBlur={() => handleAdjustmentBlur('adjustment_other')}
                    disabled={isUpdating}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {comp.adjustment_notes && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Notes: </span>
                  <span className="text-sm">{comp.adjustment_notes}</span>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
