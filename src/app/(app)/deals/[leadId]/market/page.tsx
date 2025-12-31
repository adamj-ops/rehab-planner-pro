'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NeighborhoodHealthGrid, MarketVelocityScore, CompTable, ArvCalculator } from '@/components/acquisition'
import { useDealsStore, type MarketAnalysis, type Comp, type PropertyLead } from '@/hooks/use-deals-store'

export default function MarketAnalysisPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params)
  const { fetchMarketAnalysis, updateMarketAnalysis, fetchComps } = useDealsStore()

  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null)
  const [comps, setComps] = useState<Comp[]>([])
  const [propertyLead, setPropertyLead] = useState<PropertyLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMarketData() {
      setLoading(true)
      setError(null)
      try {
        // Load market analysis, comps, and property lead data in parallel
        const [marketData, compsData, leadResponse] = await Promise.all([
          fetchMarketAnalysis(leadId),
          fetchComps(leadId),
          fetch(`/api/deals/${leadId}`).then(res => res.ok ? res.json() : null)
        ])
        
        setMarketAnalysis(marketData)
        setComps(compsData)
        setPropertyLead(leadResponse)
      } catch (err) {
        console.error('Error loading market data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load market data')
      } finally {
        setLoading(false)
      }
    }
    loadMarketData()
  }, [leadId, fetchMarketAnalysis, fetchComps])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Neighborhood Health Section */}
      <Card>
        <CardHeader>
          <CardTitle>Neighborhood Health</CardTitle>
        </CardHeader>
        <CardContent>
          <NeighborhoodHealthGrid marketAnalysis={marketAnalysis} />
        </CardContent>
      </Card>

      {/* Market Velocity Score */}
      <MarketVelocityScore marketAnalysis={marketAnalysis} />

      {/* Comparable Sales Table */}
      <CompTable leadId={leadId} onCompsChange={setComps} />

      {/* ARV Calculator */}
      <ArvCalculator
        leadId={leadId}
        subjectSqft={propertyLead?.sqft || null}
        comps={comps}
        marketAnalysis={marketAnalysis}
        onSave={async (data) => {
          const updated = await updateMarketAnalysis(leadId, data)
          if (updated) {
            setMarketAnalysis(updated)
          }
        }}
      />
    </div>
  )
}
