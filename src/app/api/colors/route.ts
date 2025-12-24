import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ColorSearchFilters } from '@/types/design'

// GET /api/colors - List colors with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const brand = searchParams.get('brand')
    const colorFamily = searchParams.get('colorFamily')
    const lrvMin = searchParams.get('lrvMin')
    const lrvMax = searchParams.get('lrvMax')
    const undertone = searchParams.get('undertone')
    const designStyle = searchParams.get('designStyle')
    const roomType = searchParams.get('roomType')
    const popular = searchParams.get('popular')
    const searchTerm = searchParams.get('search')
    
    // Build query
    let query = supabase
      .from('color_library')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('popular', { ascending: false })
      .order('color_name', { ascending: true })
    
    // Apply filters
    if (brand) {
      query = query.eq('brand', brand)
    }
    if (colorFamily) {
      query = query.eq('color_family', colorFamily)
    }
    if (lrvMin) {
      query = query.gte('lrv', parseInt(lrvMin))
    }
    if (lrvMax) {
      query = query.lte('lrv', parseInt(lrvMax))
    }
    if (undertone) {
      query = query.contains('undertones', [undertone])
    }
    if (designStyle) {
      query = query.contains('design_styles', [designStyle])
    }
    if (roomType) {
      query = query.contains('recommended_rooms', [roomType])
    }
    if (popular === 'true') {
      query = query.eq('popular', true)
    }
    if (searchTerm) {
      query = query.or(
        `color_name.ilike.%${searchTerm}%,color_code.ilike.%${searchTerm}%`
      )
    }
    
    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch colors', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit,
    })
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

