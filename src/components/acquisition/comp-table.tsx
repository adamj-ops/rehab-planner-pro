'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDealsStore, type Comp, type CompInsert, type CompUpdate } from '@/hooks/use-deals-store'
import { CompRow } from './comp-row'
import { CompEntryForm } from './comp-entry-form'
import { cn } from '@/lib/utils'

interface CompTableProps {
  leadId: string
  onCompsChange?: (comps: Comp[]) => void
  className?: string
}

type SortField = 'sale_date' | 'sale_price' | 'relevance_score'
type SortDirection = 'asc' | 'desc'

// Sort button component - extracted to avoid defining inside another component
interface SortButtonProps {
  field: SortField
  currentField: SortField
  onClick: (field: SortField) => void
  children: React.ReactNode
}

function SortButton({ field, currentField, onClick, children }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick(field)}
      className={cn(
        'h-auto p-0 font-medium hover:bg-transparent',
        currentField === field && 'text-primary'
      )}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )
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

export function CompTable({ leadId, onCompsChange, className }: CompTableProps) {
  const { fetchComps, createComp, updateComp, deleteComp } = useDealsStore()

  const [comps, setComps] = useState<Comp[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('sale_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Fetch comps on mount
  useEffect(() => {
    const loadComps = async () => {
      setLoading(true)
      const data = await fetchComps(leadId)
      setComps(data)
      setLoading(false)
    }
    loadComps()
  }, [leadId, fetchComps])

  // Sort comps
  const sortedComps = useMemo(() => {
    return [...comps].sort((a, b) => {
      let aVal: number | string | null = null
      let bVal: number | string | null = null

      switch (sortField) {
        case 'sale_date':
          aVal = a.sale_date ?? ''
          bVal = b.sale_date ?? ''
          break
        case 'sale_price':
          aVal = Number(a.sale_price) || 0
          bVal = Number(b.sale_price) || 0
          break
        case 'relevance_score':
          aVal = a.relevance_score ?? 0
          bVal = b.relevance_score ?? 0
          break
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [comps, sortField, sortDirection])

  // Calculate averages
  const averages = useMemo(() => {
    if (comps.length === 0) return { avgPrice: null, avgPricePerSqft: null }

    const prices = comps.map((c) => Number(c.sale_price) || 0).filter((p) => p > 0)
    const pricesPerSqft = comps.map((c) => Number(c.price_per_sqft) || 0).filter((p) => p > 0)

    return {
      avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
      avgPricePerSqft:
        pricesPerSqft.length > 0
          ? pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length
          : null,
    }
  }, [comps])

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Handle create comp
  const handleCreateComp = async (data: Partial<CompInsert>) => {
    const newComp = await createComp(leadId, data)
    if (newComp) {
      const updatedComps = [...comps, newComp]
      setComps(updatedComps)
      onCompsChange?.(updatedComps)
    }
  }

  // Handle update comp
  const handleUpdateComp = async (compId: string, data: Partial<CompUpdate>) => {
    const updatedComp = await updateComp(leadId, compId, data)
    if (updatedComp) {
      const updatedComps = comps.map((c) => (c.id === compId ? updatedComp : c))
      setComps(updatedComps)
      onCompsChange?.(updatedComps)
    }
  }

  // Handle delete comp
  const handleDeleteComp = async (compId: string) => {
    const success = await deleteComp(leadId, compId)
    if (success) {
      const updatedComps = comps.filter((c) => c.id !== compId)
      setComps(updatedComps)
      onCompsChange?.(updatedComps)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base font-medium">Comparable Sales Analysis</CardTitle>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Comp
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading comps...</div>
          </div>
        ) : comps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">No comparable sales added yet.</p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Comp
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>
                  <SortButton field="sale_price" currentField={sortField} onClick={handleSort}>Price</SortButton>
                </TableHead>
                <TableHead>$/SF</TableHead>
                <TableHead className="text-center">Bed</TableHead>
                <TableHead className="text-center">Bath</TableHead>
                <TableHead className="text-center">Sqft</TableHead>
                <TableHead>
                  <SortButton field="sale_date" currentField={sortField} onClick={handleSort}>Sold</SortButton>
                </TableHead>
                <TableHead>Adj.</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedComps.map((comp, index) => (
                <CompRow
                  key={comp.id}
                  comp={comp}
                  index={index}
                  onUpdate={handleUpdateComp}
                  onDelete={handleDeleteComp}
                />
              ))}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-medium">
                  Average ({comps.length} comp{comps.length !== 1 ? 's' : ''})
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(averages.avgPrice)}</TableCell>
                <TableCell className="font-medium">
                  {formatPricePerSqft(averages.avgPricePerSqft)}
                </TableCell>
                <TableCell colSpan={6}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>

      {/* Add Comp Form Modal */}
      <CompEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateComp}
      />
    </Card>
  )
}
