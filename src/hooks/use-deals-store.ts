'use client'

import { create } from 'zustand'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

// Types from the database
export type PropertyLead = Tables<'property_leads'>
export type MarketAnalysis = Tables<'market_analysis'>
export type Comp = Tables<'comps'>

// Insert/Update types for forms
export type MarketAnalysisInsert = TablesInsert<'market_analysis'>
export type MarketAnalysisUpdate = TablesUpdate<'market_analysis'>
export type CompInsert = TablesInsert<'comps'>
export type CompUpdate = TablesUpdate<'comps'>

// Acquisition phases matching the database enum
export const ACQUISITION_PHASES = [
  { id: 'phase_1_screening', label: 'Screening', color: 'bg-slate-500' },
  { id: 'phase_2_market_analysis', label: 'Market Analysis', color: 'bg-blue-500' },
  { id: 'phase_3_due_diligence', label: 'Due Diligence', color: 'bg-amber-500' },
  { id: 'phase_4_deal_analysis', label: 'Deal Analysis', color: 'bg-purple-500' },
  { id: 'phase_5_contract', label: 'Contract', color: 'bg-emerald-500' },
] as const

export type AcquisitionPhase = (typeof ACQUISITION_PHASES)[number]['id']

// Lead sources matching the database enum
export const LEAD_SOURCES = [
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'mls', label: 'MLS' },
  { value: 'direct_mail', label: 'Direct Mail' },
  { value: 'driving_for_dollars', label: 'Driving for Dollars' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'online_marketing', label: 'Online Marketing' },
  { value: 'auction', label: 'Auction' },
  { value: 'fsbo', label: 'FSBO' },
  { value: 'other', label: 'Other' },
] as const

export type LeadSource = (typeof LEAD_SOURCES)[number]['value']

// Market temperature options
export const MARKET_TEMPERATURES = [
  { value: 'cold', label: 'Cold', color: 'text-blue-500' },
  { value: 'cool', label: 'Cool', color: 'text-cyan-500' },
  { value: 'neutral', label: 'Neutral', color: 'text-gray-500' },
  { value: 'warm', label: 'Warm', color: 'text-orange-500' },
  { value: 'hot', label: 'Hot', color: 'text-red-500' },
] as const

export type MarketTemperature = (typeof MARKET_TEMPERATURES)[number]['value']

// Target buyer profiles
export const TARGET_BUYERS = [
  { value: 'first_time', label: 'First-Time Buyer' },
  { value: 'move_up', label: 'Move-Up Buyer' },
  { value: 'investor', label: 'Investor' },
  { value: 'downsizer', label: 'Downsizer' },
] as const

export type TargetBuyer = (typeof TARGET_BUYERS)[number]['value']

// ARV methods
export const ARV_METHODS = [
  { value: 'comp_based', label: 'Comp-Based' },
  { value: 'sqft_based', label: 'Price per Sq Ft' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

export type ArvMethod = (typeof ARV_METHODS)[number]['value']

// Store state interface
interface DealsState {
  // Data
  leads: PropertyLead[]

  // UI State
  loading: boolean
  error: string | null
  searchQuery: string

  // Lead Actions
  fetchLeads: () => Promise<void>
  setSearchQuery: (query: string) => void
  createLead: (lead: Partial<PropertyLead>) => Promise<PropertyLead | null>
  updateLead: (id: string, updates: Partial<PropertyLead>) => Promise<PropertyLead | null>
  deleteLead: (id: string) => Promise<boolean>
  advancePhase: (id: string) => Promise<boolean>
  passLead: (id: string, reason?: string) => Promise<boolean>

  // Market Analysis Actions
  fetchMarketAnalysis: (leadId: string) => Promise<MarketAnalysis | null>
  createMarketAnalysis: (leadId: string, data: Partial<MarketAnalysisInsert>) => Promise<MarketAnalysis | null>
  updateMarketAnalysis: (leadId: string, data: Partial<MarketAnalysisUpdate>) => Promise<MarketAnalysis | null>

  // Comps Actions
  fetchComps: (leadId: string) => Promise<Comp[]>
  createComp: (leadId: string, data: Partial<CompInsert>) => Promise<Comp | null>
  updateComp: (leadId: string, compId: string, data: Partial<CompUpdate>) => Promise<Comp | null>
  deleteComp: (leadId: string, compId: string) => Promise<boolean>
}

export const useDealsStore = create<DealsState>((set, get) => ({
  // Initial state
  leads: [],
  loading: false,
  error: null,
  searchQuery: '',

  // Fetch leads from API
  fetchLeads: async () => {
    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/deals')
      if (!response.ok) {
        throw new Error('Failed to fetch deals')
      }
      const leads = await response.json()
      set({ leads, loading: false })
    } catch (error) {
      console.error('Error fetching deals:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch deals',
        loading: false,
      })
    }
  },

  // Set search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  // Create a new lead
  createLead: async (lead: Partial<PropertyLead>) => {
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create lead')
      }

      const newLead = await response.json()
      set((state) => ({
        leads: [newLead, ...state.leads],
      }))
      return newLead
    } catch (error) {
      console.error('Error creating lead:', error)
      return null
    }
  },

  // Update an existing lead
  updateLead: async (id: string, updates: Partial<PropertyLead>) => {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update lead')
      }

      const updatedLead = await response.json()
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? updatedLead : l)),
      }))
      return updatedLead
    } catch (error) {
      console.error('Error updating lead:', error)
      return null
    }
  },

  // Delete a lead
  deleteLead: async (id: string) => {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete lead')
      }

      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }))
      return true
    } catch (error) {
      console.error('Error deleting lead:', error)
      return false
    }
  },

  // Advance a lead to the next phase
  advancePhase: async (id: string) => {
    const { leads, updateLead } = get()
    const lead = leads.find((l) => l.id === id)
    if (!lead) return false

    const currentPhaseIndex = ACQUISITION_PHASES.findIndex(
      (p) => p.id === lead.current_phase
    )
    if (currentPhaseIndex === -1 || currentPhaseIndex >= ACQUISITION_PHASES.length - 1) {
      return false
    }

    const nextPhase = ACQUISITION_PHASES[currentPhaseIndex + 1].id
    const result = await updateLead(id, {
      current_phase: nextPhase,
      phase_entered_at: new Date().toISOString(),
    })
    return result !== null
  },

  // Pass on a lead (move to 'passed' status)
  passLead: async (id: string, reason?: string) => {
    const { updateLead } = get()
    const result = await updateLead(id, {
      current_phase: 'passed',
      pass_reason: reason,
      passed_at: new Date().toISOString(),
    })
    return result !== null
  },

  // ===== Market Analysis Actions =====

  // Fetch market analysis for a lead
  fetchMarketAnalysis: async (leadId: string) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/market-analysis`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch market analysis')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching market analysis:', error)
      return null
    }
  },

  // Create market analysis for a lead
  createMarketAnalysis: async (leadId: string, data: Partial<MarketAnalysisInsert>) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/market-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create market analysis')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating market analysis:', error)
      return null
    }
  },

  // Update market analysis for a lead
  updateMarketAnalysis: async (leadId: string, data: Partial<MarketAnalysisUpdate>) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/market-analysis`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update market analysis')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating market analysis:', error)
      return null
    }
  },

  // ===== Comps Actions =====

  // Fetch all comps for a lead
  fetchComps: async (leadId: string) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/comps`)
      if (!response.ok) {
        throw new Error('Failed to fetch comps')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching comps:', error)
      return []
    }
  },

  // Create a comp for a lead
  createComp: async (leadId: string, data: Partial<CompInsert>) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/comps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create comp')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating comp:', error)
      return null
    }
  },

  // Update a comp
  updateComp: async (leadId: string, compId: string, data: Partial<CompUpdate>) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/comps/${compId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update comp')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating comp:', error)
      return null
    }
  },

  // Delete a comp
  deleteComp: async (leadId: string, compId: string) => {
    try {
      const response = await fetch(`/api/deals/${leadId}/comps/${compId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete comp')
      }

      return true
    } catch (error) {
      console.error('Error deleting comp:', error)
      return false
    }
  },
}))

// Selector hooks for optimized re-renders
export const useLeads = () => useDealsStore((state) => state.leads)
export const useDealsLoading = () => useDealsStore((state) => state.loading)
export const useDealsError = () => useDealsStore((state) => state.error)
export const useDealsSearchQuery = () => useDealsStore((state) => state.searchQuery)

// Derived selectors
export const useLeadsByPhase = () =>
  useDealsStore((state) => {
    const grouped: Record<string, PropertyLead[]> = {}

    // Initialize all phases with empty arrays
    for (const phase of ACQUISITION_PHASES) {
      grouped[phase.id] = []
    }

    // Group leads by phase (exclude passed and closed)
    for (const lead of state.leads) {
      if (lead.current_phase && grouped[lead.current_phase]) {
        grouped[lead.current_phase].push(lead)
      }
    }

    return grouped
  })

export const usePhaseCounts = () =>
  useDealsStore((state) => {
    const counts: Record<string, number> = {}

    // Initialize all phases with 0
    for (const phase of ACQUISITION_PHASES) {
      counts[phase.id] = 0
    }

    // Count leads by phase
    for (const lead of state.leads) {
      if (lead.current_phase && counts[lead.current_phase] !== undefined) {
        counts[lead.current_phase]++
      }
    }

    return counts
  })

export const useFilteredLeads = () =>
  useDealsStore((state) => {
    const query = state.searchQuery.toLowerCase().trim()
    if (!query) return state.leads

    return state.leads.filter(
      (lead) =>
        lead.address?.toLowerCase().includes(query) ||
        lead.city?.toLowerCase().includes(query) ||
        lead.zip?.includes(query)
    )
  })
