/**
 * Scope Catalog API Route
 *
 * Provides cached access to the scope catalog for rehab work items.
 * This is reference data that rarely changes, making it ideal for aggressive caching.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Cache duration for scope catalog (30 minutes) */
const SCOPE_CATALOG_CACHE_TTL = 1800

/**
 * Cached scope catalog query function
 * Key includes category for granular caching
 */
const getCachedScopeCatalog = unstable_cache(
  async (params: { category?: string; phase?: number; priority?: string }) => {
    const supabase = await createClient()

    let query = supabase
      .from('scope_catalog')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('category')
      .order('name')

    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.phase !== undefined) {
      query = query.eq('default_phase', params.phase)
    }

    if (params.priority) {
      query = query.eq('default_priority', params.priority)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return {
      data: data || [],
      total: count || 0,
    }
  },
  ['scope-catalog'],
  {
    revalidate: SCOPE_CATALOG_CACHE_TTL,
    tags: ['scope-catalog'],
  }
)

/**
 * GET /api/scope-catalog
 *
 * List scope catalog items with optional filters
 *
 * Query params:
 * - category: Filter by category (e.g., 'electrical', 'plumbing')
 * - phase: Filter by default phase (1-5)
 * - priority: Filter by default priority ('must', 'should', 'could', 'nice')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      category: searchParams.get('category') || undefined,
      phase: searchParams.get('phase') ? parseInt(searchParams.get('phase') ?? '0') : undefined,
      priority: searchParams.get('priority') || undefined,
    }

    const result = await getCachedScopeCatalog(params)

    // Add cache headers for CDN/browser caching
    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching scope catalog:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scope catalog',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET scope catalog categories
 * Returns distinct categories for filtering UI
 */
export async function OPTIONS() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from('scope_catalog').select('category').eq('is_active', true)

    if (error) {
      throw new Error(error.message)
    }

    // Extract unique categories
    const categories = [...new Set(data?.map((item) => item.category) || [])]

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Error fetching scope catalog categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    )
  }
}
