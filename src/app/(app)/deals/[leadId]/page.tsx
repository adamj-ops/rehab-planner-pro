'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDealsStore, type PropertyLead, ACQUISITION_PHASES } from '@/hooks/use-deals-store'

function formatPrice(price: number | string | null | undefined): string {
  if (!price) return '—'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString()
}

export default function LeadOverviewPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params)
  const router = useRouter()
  const advancePhase = useDealsStore((state) => state.advancePhase)
  const passLead = useDealsStore((state) => state.passLead)

  const [lead, setLead] = useState<PropertyLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isPassing, setIsPassing] = useState(false)

  useEffect(() => {
    async function fetchLead() {
      try {
        const response = await fetch(`/api/deals/${leadId}`)
        if (response.ok) {
          const data = await response.json()
          setLead(data)
        }
      } catch (error) {
        console.error('Error fetching lead:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [leadId])

  const handleAdvance = async () => {
    setIsAdvancing(true)
    const success = await advancePhase(leadId)
    if (success) {
      // Refresh lead data
      const response = await fetch(`/api/deals/${leadId}`)
      if (response.ok) {
        setLead(await response.json())
      }
    }
    setIsAdvancing(false)
  }

  const handlePass = async () => {
    setIsPassing(true)
    const success = await passLead(leadId)
    if (success) {
      router.push('/deals')
    }
    setIsPassing(false)
  }

  const currentPhaseIndex = lead
    ? ACQUISITION_PHASES.findIndex((p) => p.id === lead.current_phase)
    : -1
  const canAdvance = currentPhaseIndex >= 0 && currentPhaseIndex < ACQUISITION_PHASES.length - 1
  const nextPhase = canAdvance ? ACQUISITION_PHASES[currentPhaseIndex + 1] : null

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border bg-card animate-pulse">
                <div className="h-3 w-16 bg-muted rounded mb-2" />
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lead not found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Asking Price', value: formatPrice(lead.asking_price) },
            { label: 'Est. ARV', value: '—' }, // Placeholder - from market_analysis
            { label: 'Est. Rehab', value: '—' }, // Placeholder - from due_diligence
            { label: 'Potential ROI', value: '—' }, // Placeholder - from deal_analysis
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg border bg-card">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Screening Checklist */}
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-4">Phase 1: Initial Screening</h2>
          <div className="space-y-3">
            {[
              { label: 'Location acceptable', checked: true },
              { label: 'Price within range', checked: true },
              { label: 'Property type matches criteria', checked: !!lead.property_type },
              { label: 'No major red flags from photos', checked: false },
              { label: 'Seller motivation confirmed', checked: !!lead.seller_motivation },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={item.checked} className="rounded" />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Screening Score</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${lead.screening_score ?? 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{lead.screening_score ?? 0}/100</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-4">Notes</h2>
          <textarea
            placeholder="Add notes about this lead..."
            defaultValue={lead.screening_notes ?? ''}
            className="w-full h-24 rounded-md border bg-background px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Property Details */}
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-4">Property Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd>{lead.property_type ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Beds / Baths</dt>
              <dd>
                {lead.bedrooms ?? '—'} / {lead.bathrooms ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Sq Ft</dt>
              <dd>{formatNumber(lead.sqft)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Year Built</dt>
              <dd>{lead.year_built ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lot Size</dt>
              <dd>{lead.lot_sqft ? `${(lead.lot_sqft / 43560).toFixed(2)} acres` : '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Lead Source */}
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-4">Lead Source</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Source</dt>
              <dd className="capitalize">{lead.source?.replace(/_/g, ' ') ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Contact</dt>
              <dd>{lead.source_detail ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Days on Market</dt>
              <dd>{lead.days_on_market ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {canAdvance && nextPhase && (
            <button
              onClick={handleAdvance}
              disabled={isAdvancing}
              className="w-full px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isAdvancing ? 'Advancing...' : `Advance to ${nextPhase.label} →`}
            </button>
          )}
          <button
            onClick={handlePass}
            disabled={isPassing}
            className="w-full px-4 py-2 text-sm font-medium rounded-md border text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {isPassing ? 'Passing...' : 'Pass on Deal'}
          </button>
        </div>
      </div>
    </div>
  )
}
