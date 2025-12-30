import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Cache duration for materials list (30 minutes) */
const MATERIALS_CACHE_TTL = 1800

/**
 * Cached materials query function
 * Key includes all filter params for granular caching
 */
const getCachedMaterials = unstable_cache(
  async (params: {
    page: number
    limit: number
    materialType?: string
    materialCategory?: string
    brand?: string
    designStyle?: string
    roomType?: string
    priceMin?: number
    priceMax?: number
    popular?: boolean
    searchTerm?: string
  }) => {
    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from('material_library')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('popular', { ascending: false })
      .order('product_name', { ascending: true })
    
    // Apply filters
    if (params.materialType) {
      query = query.eq('material_type', params.materialType)
    }
    if (params.materialCategory) {
      query = query.eq('material_category', params.materialCategory)
    }
    if (params.brand) {
      query = query.eq('brand', params.brand)
    }
    if (params.designStyle) {
      query = query.contains('design_styles', [params.designStyle])
    }
    if (params.roomType) {
      query = query.contains('recommended_for', [params.roomType])
    }
    if (params.priceMin) {
      query = query.gte('avg_cost_per_unit', params.priceMin)
    }
    if (params.priceMax) {
      query = query.lte('avg_cost_per_unit', params.priceMax)
    }
    if (params.popular) {
      query = query.eq('popular', true)
    }
    if (params.searchTerm) {
      query = query.or(
        `product_name.ilike.%${params.searchTerm}%,brand.ilike.%${params.searchTerm}%,description.ilike.%${params.searchTerm}%`
      )
    }
    
    // Pagination
    const from = (params.page - 1) * params.limit
    const to = from + params.limit - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      throw new Error(error.message)
    }
    
    return {
      data: data || [],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      hasMore: (count || 0) > params.page * params.limit,
    }
  },
  ['materials-list'],
  { 
    revalidate: MATERIALS_CACHE_TTL,
    tags: ['materials'],
  }
)

// GET /api/materials - List materials with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query params
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      materialType: searchParams.get('materialType') || undefined,
      materialCategory: searchParams.get('materialCategory') || undefined,
      brand: searchParams.get('brand') || undefined,
      designStyle: searchParams.get('designStyle') || undefined,
      roomType: searchParams.get('roomType') || undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin') ?? '0') : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax') ?? '0') : undefined,
      popular: searchParams.get('popular') === 'true' || undefined,
      searchTerm: searchParams.get('search') || undefined,
    }
    
    const result = await getCachedMaterials(params)
    
    // Add cache headers for CDN/browser caching
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

