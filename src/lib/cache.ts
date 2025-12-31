/**
 * Server-side caching utilities using Next.js unstable_cache
 * 
 * Provides cached versions of expensive database queries and API calls.
 * Cache is automatically invalidated based on TTL or can be manually revalidated.
 */

import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/** Cache durations in seconds */
export const CACHE_TTL = {
  /** Material prices - changes infrequently */
  MATERIAL_PRICES: 3600, // 1 hour
  
  /** Labor rates - changes infrequently */
  LABOR_RATES: 3600, // 1 hour
  
  /** Scope catalog items - relatively static */
  SCOPE_CATALOG: 1800, // 30 minutes
  
  /** Project summary stats - can be stale briefly */
  PROJECT_STATS: 300, // 5 minutes
  
  /** Vendor directory - changes occasionally */
  VENDORS: 600, // 10 minutes
  
  /** AI-generated content - cache to reduce API costs */
  AI_RESPONSES: 86400, // 24 hours
} as const

// ============================================================================
// MATERIAL PRICES CACHE
// ============================================================================

/**
 * Get cached material prices for a region
 * Falls back to 'national' if no region-specific prices exist
 */
export const getCachedMaterialPrices = unstable_cache(
  async (region: string = 'national') => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('material_prices')
      .select('*')
      .or(`region.eq.${region},region.eq.national`)
      .order('category')
    
    if (error) {
      console.error('Error fetching material prices:', error)
      return []
    }
    
    return data
  },
  ['material-prices'],
  { 
    revalidate: CACHE_TTL.MATERIAL_PRICES,
    tags: ['material-prices'],
  }
)

// ============================================================================
// LABOR RATES CACHE
// ============================================================================

/**
 * Get cached labor rates by trade type
 */
export const getCachedLaborRates = unstable_cache(
  async (region: string = 'national') => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('labor_rates')
      .select('*')
      .or(`region.eq.${region},region.eq.national`)
      .order('trade_type')
    
    if (error) {
      console.error('Error fetching labor rates:', error)
      return []
    }
    
    return data
  },
  ['labor-rates'],
  { 
    revalidate: CACHE_TTL.LABOR_RATES,
    tags: ['labor-rates'],
  }
)

// ============================================================================
// SCOPE CATALOG CACHE
// ============================================================================

/**
 * Get cached scope catalog items by category
 */
export const getCachedScopeCatalog = unstable_cache(
  async (category?: string) => {
    const supabase = await createClient()
    
    let query = supabase
      .from('scope_catalog')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching scope catalog:', error)
      return []
    }
    
    return data
  },
  ['scope-catalog'],
  { 
    revalidate: CACHE_TTL.SCOPE_CATALOG,
    tags: ['scope-catalog'],
  }
)

// ============================================================================
// VENDOR DIRECTORY CACHE
// ============================================================================

/**
 * Get cached vendor directory with ratings
 */
export const getCachedVendorDirectory = unstable_cache(
  async (tradeType?: string) => {
    const supabase = await createClient()
    
    let query = supabase
      .from('vendors')
      .select(`
        id,
        vendor_name,
        trade_type,
        phone,
        email,
        rating,
        total_jobs,
        is_preferred
      `)
      .eq('is_active', true)
      .order('is_preferred', { ascending: false })
      .order('rating', { ascending: false })
    
    if (tradeType) {
      query = query.eq('trade_type', tradeType)
    }
    
    const { data, error } = await query.limit(100)
    
    if (error) {
      console.error('Error fetching vendors:', error)
      return []
    }
    
    return data
  },
  ['vendor-directory'],
  { 
    revalidate: CACHE_TTL.VENDORS,
    tags: ['vendors'],
  }
)

// ============================================================================
// PROJECT STATS CACHE (per-project)
// ============================================================================

/**
 * Get cached project statistics
 * Uses project ID as part of cache key for per-project caching
 */
export const getCachedProjectStats = (projectId: string) => 
  unstable_cache(
    async () => {
      const supabase = await createClient()
      
      // Get project with aggregated stats
      const { data, error } = await supabase
        .from('rehab_projects')
        .select(`
          id,
          project_name,
          phase,
          tasks_total,
          tasks_completed,
          total_estimated_cost,
          total_actual_cost,
          max_budget,
          days_ahead_behind
        `)
        .eq('id', projectId)
        .single()
      
      if (error) {
        console.error('Error fetching project stats:', error)
        return null
      }
      
      return {
        ...data,
        completion_percentage: data.tasks_total > 0 
          ? Math.round((data.tasks_completed / data.tasks_total) * 100) 
          : 0,
        budget_remaining: data.max_budget 
          ? data.max_budget - (data.total_actual_cost || 0)
          : null,
        budget_variance: data.total_estimated_cost && data.total_actual_cost
          ? data.total_actual_cost - data.total_estimated_cost
          : null,
      }
    },
    [`project-stats-${projectId}`],
    { 
      revalidate: CACHE_TTL.PROJECT_STATS,
      tags: [`project-${projectId}`, 'project-stats'],
    }
  )()

// ============================================================================
// AI RESPONSE CACHE
// ============================================================================

/**
 * Cache key generator for AI responses
 * Creates a deterministic key from prompt + context
 */
function generateAICacheKey(prompt: string, context: Record<string, unknown>): string {
  const contextStr = JSON.stringify(context, Object.keys(context).sort())
  return `ai-${Buffer.from(prompt + contextStr).toString('base64').slice(0, 32)}`
}

/**
 * Get cached AI response or generate new one
 * Useful for common prompts like cost estimates, scope suggestions
 */
export const getCachedAIResponse = (
  prompt: string, 
  context: Record<string, unknown>,
  generator: () => Promise<string>
) => 
  unstable_cache(
    generator,
    [generateAICacheKey(prompt, context)],
    { 
      revalidate: CACHE_TTL.AI_RESPONSES,
      tags: ['ai-responses'],
    }
  )()

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

import { revalidateTag } from 'next/cache'

/**
 * Invalidate all caches for a specific project
 */
export function invalidateProjectCache(projectId: string) {
  revalidateTag(`project-${projectId}`)
}

/**
 * Invalidate material prices cache (e.g., after admin update)
 */
export function invalidateMaterialPricesCache() {
  revalidateTag('material-prices')
}

/**
 * Invalidate labor rates cache
 */
export function invalidateLaborRatesCache() {
  revalidateTag('labor-rates')
}

/**
 * Invalidate scope catalog cache
 */
export function invalidateScopeCatalogCache() {
  revalidateTag('scope-catalog')
}

/**
 * Invalidate vendor directory cache
 */
export function invalidateVendorCache() {
  revalidateTag('vendors')
}

/**
 * Invalidate all AI response caches
 */
export function invalidateAICache() {
  revalidateTag('ai-responses')
}

/**
 * Invalidate all caches (nuclear option)
 */
export function invalidateAllCaches() {
  revalidateTag('material-prices')
  revalidateTag('labor-rates')
  revalidateTag('scope-catalog')
  revalidateTag('vendors')
  revalidateTag('project-stats')
  revalidateTag('ai-responses')
}
