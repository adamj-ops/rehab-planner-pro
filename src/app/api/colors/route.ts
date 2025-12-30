import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Cache duration for colors list (30 minutes) */
const COLORS_CACHE_TTL = 1800

/**
 * Cached colors query function
 * Key includes all filter params for granular caching
 */
const getCachedColors = unstable_cache(
  async (params: {
    page: number
    limit: number
    brand?: string
    colorFamily?: string
    lrvMin?: number
    lrvMax?: number
    undertone?: string
    designStyle?: string
    roomType?: string
    popular?: boolean
    searchTerm?: string
  }) => {
    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from('color_library')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('popular', { ascending: false })
      .order('color_name', { ascending: true })
    
    // Apply filters
    if (params.brand) {
      query = query.eq('brand', params.brand)
    }
    if (params.colorFamily) {
      query = query.eq('color_family', params.colorFamily)
    }
    if (params.lrvMin !== undefined) {
      query = query.gte('lrv', params.lrvMin)
    }
    if (params.lrvMax !== undefined) {
      query = query.lte('lrv', params.lrvMax)
    }
    if (params.undertone) {
      query = query.contains('undertones', [params.undertone])
    }
    if (params.designStyle) {
      query = query.contains('design_styles', [params.designStyle])
    }
    if (params.roomType) {
      query = query.contains('recommended_rooms', [params.roomType])
    }
    if (params.popular) {
      query = query.eq('popular', true)
    }
    if (params.searchTerm) {
      query = query.or(
        `color_name.ilike.%${params.searchTerm}%,color_code.ilike.%${params.searchTerm}%`
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
  ['colors-list'],
  { 
    revalidate: COLORS_CACHE_TTL,
    tags: ['colors'],
  }
)

// GET /api/colors - List colors with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query params
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      brand: searchParams.get('brand') || undefined,
      colorFamily: searchParams.get('colorFamily') || undefined,
      lrvMin: searchParams.get('lrvMin') ? parseInt(searchParams.get('lrvMin') ?? '0') : undefined,
      lrvMax: searchParams.get('lrvMax') ? parseInt(searchParams.get('lrvMax') ?? '0') : undefined,
      undertone: searchParams.get('undertone') || undefined,
      designStyle: searchParams.get('designStyle') || undefined,
      roomType: searchParams.get('roomType') || undefined,
      popular: searchParams.get('popular') === 'true' || undefined,
      searchTerm: searchParams.get('search') || undefined,
    }
    
    const result = await getCachedColors(params)
    
    // Add cache headers for CDN/browser caching
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

