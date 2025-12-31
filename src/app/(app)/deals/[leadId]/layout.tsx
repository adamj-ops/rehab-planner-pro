'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { use, useEffect, useState } from 'react'
import { ACQUISITION_PHASES, type PropertyLead } from '@/hooks/use-deals-store'

interface Props {
  children: ReactNode
  params: Promise<{ leadId: string }>
}

const PHASE_TABS = [
  { href: '', label: 'Overview', phase: 1 },
  { href: '/market', label: 'Market Analysis', phase: 2 },
  { href: '/diligence', label: 'Due Diligence', phase: 3 },
  { href: '/analyze', label: 'Deal Analysis', phase: 4 },
  { href: '/offer', label: 'Offer Strategy', phase: 4 },
  { href: '/contract', label: 'Contract', phase: 5 },
] as const

function getPhaseLabel(phaseId: string | null): string {
  if (!phaseId) return 'Unknown'
  const phase = ACQUISITION_PHASES.find((p) => p.id === phaseId)
  return phase ? phase.label : phaseId.replace(/_/g, ' ')
}

// Static Tailwind class mapping for phase colors (required for build-time compilation)
const PHASE_COLOR_CLASSES: Record<string, { bg: string; text: string; bgLight: string }> = {
  'bg-slate-500': { bg: 'bg-slate-500', text: 'text-slate-600', bgLight: 'bg-slate-500/10' },
  'bg-blue-500': { bg: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-500/10' },
  'bg-amber-500': { bg: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-500/10' },
  'bg-purple-500': { bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-500/10' },
  'bg-emerald-500': { bg: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-500/10' },
  'bg-rose-500': { bg: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-500/10' },
  'bg-gray-500': { bg: 'bg-gray-500', text: 'text-gray-600', bgLight: 'bg-gray-500/10' },
}

function getPhaseColorKey(phaseId: string | null): string {
  if (!phaseId) return 'bg-gray-500'
  const phase = ACQUISITION_PHASES.find((p) => p.id === phaseId)
  return phase ? phase.color : 'bg-gray-500'
}

function getPhaseColorClasses(phaseId: string | null): { bg: string; text: string; bgLight: string } {
  const colorKey = getPhaseColorKey(phaseId)
  return PHASE_COLOR_CLASSES[colorKey] || PHASE_COLOR_CLASSES['bg-gray-500']
}

export default function LeadDetailLayout({ children, params }: Props) {
  const { leadId } = use(params)
  const pathname = usePathname()
  const basePath = `/deals/${leadId}`

  const [lead, setLead] = useState<PropertyLead | null>(null)
  const [loading, setLoading] = useState(true)

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

  const isActiveTab = (tabHref: string) => {
    const fullPath = `${basePath}${tabHref}`
    if (tabHref === '') {
      return pathname === basePath || pathname === `${basePath}/`
    }
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Pipeline
        </Link>

        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            {loading ? (
              <>
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
              </>
            ) : lead ? (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">{lead.address}</h1>
                <p className="text-muted-foreground text-sm">
                  {lead.city}, {lead.state} {lead.zip}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Lead Not Found</h1>
                <p className="text-muted-foreground text-sm">ID: {leadId}</p>
              </>
            )}
          </div>

          {!loading && lead && (
            <div className="flex items-center gap-2">
              {(() => {
                const colors = getPhaseColorClasses(lead.current_phase)
                return (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${colors.bgLight} ${colors.text}`}
                  >
                    {getPhaseLabel(lead.current_phase)}
                  </span>
                )
              })()}
              {lead.screening_score !== null && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600">
                  Score: {lead.screening_score}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6 -mb-px overflow-x-auto">
          {PHASE_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={`${basePath}${tab.href}`}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActiveTab(tab.href)
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              }`}
            >
              <span className="text-xs text-muted-foreground mr-1">{tab.phase}.</span>
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Page Content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
