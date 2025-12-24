import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/colors/popular - Get popular colors
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const { data, error } = await supabase
      .from('color_library')
      .select('*')
      .eq('is_active', true)
      .eq('popular', true)
      .order('color_name', { ascending: true })
      .limit(limit)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch popular colors', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error fetching popular colors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

