import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/materials - List materials with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const materialType = searchParams.get('materialType')
    const materialCategory = searchParams.get('materialCategory')
    const brand = searchParams.get('brand')
    const designStyle = searchParams.get('designStyle')
    const roomType = searchParams.get('roomType')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const popular = searchParams.get('popular')
    const searchTerm = searchParams.get('search')
    
    // Build query
    let query = supabase
      .from('material_library')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('popular', { ascending: false })
      .order('product_name', { ascending: true })
    
    // Apply filters
    if (materialType) {
      query = query.eq('material_type', materialType)
    }
    if (materialCategory) {
      query = query.eq('material_category', materialCategory)
    }
    if (brand) {
      query = query.eq('brand', brand)
    }
    if (designStyle) {
      query = query.contains('design_styles', [designStyle])
    }
    if (roomType) {
      query = query.contains('recommended_for', [roomType])
    }
    if (priceMin) {
      query = query.gte('avg_cost_per_unit', parseFloat(priceMin))
    }
    if (priceMax) {
      query = query.lte('avg_cost_per_unit', parseFloat(priceMax))
    }
    if (popular === 'true') {
      query = query.eq('popular', true)
    }
    if (searchTerm) {
      query = query.or(
        `product_name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }
    
    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch materials', details: error.message },
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
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

