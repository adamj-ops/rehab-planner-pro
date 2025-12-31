'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  useDealsStore,
  useLeadsByPhase,
  usePhaseCounts,
  useDealsLoading,
  ACQUISITION_PHASES,
  type PropertyLead,
} from '@/hooks/use-deals-store'

function formatPrice(price: number | null | undefined): string {
  if (!price) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function LeadCard({ lead }: { lead: PropertyLead }) {
  return (
    <Link
      href={`/deals/${lead.id}`}
      className="block p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <p className="font-medium text-sm truncate">{lead.address}</p>
      <p className="text-xs text-muted-foreground truncate">
        {lead.city}, {lead.state} {lead.zip}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-semibold">{formatPrice(Number(lead.asking_price))}</span>
        {lead.screening_score !== null && (
          <span className="text-xs text-muted-foreground">
            Score: {lead.screening_score}
          </span>
        )}
      </div>
      {lead.source && (
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {lead.source.replace(/_/g, ' ')}
        </p>
      )}
    </Link>
  )
}

function PipelineColumn({
  phase,
  leads,
  count,
}: {
  phase: (typeof ACQUISITION_PHASES)[number]
  leads: PropertyLead[]
  count: number
}) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${phase.color}`} />
        <h3 className="font-medium text-sm">{phase.label}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{count}</span>
      </div>
      <div className="space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg border border-dashed">
        {leads.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No deals in this phase
          </p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}

export default function DealsPage() {
  const fetchLeads = useDealsStore((state) => state.fetchLeads)
  const loading = useDealsLoading()
  const leadsByPhase = useLeadsByPhase()
  const phaseCounts = usePhaseCounts()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Track properties through your acquisition funnel
          </p>
        </div>

        <Link
          href="/deals/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Add Lead
        </Link>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {ACQUISITION_PHASES.map((phase) => (
          <div key={phase.id} className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${phase.color}`} />
              <span className="text-xs text-muted-foreground">{phase.label}</span>
            </div>
            <p className="text-2xl font-semibold">{phaseCounts[phase.id]}</p>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading deals...</p>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {ACQUISITION_PHASES.map((phase) => (
              <PipelineColumn
                key={phase.id}
                phase={phase}
                leads={leadsByPhase[phase.id] || []}
                count={phaseCounts[phase.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
