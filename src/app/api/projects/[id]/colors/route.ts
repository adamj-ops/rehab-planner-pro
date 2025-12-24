import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/[id]/colors - Get color selections for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('project_color_selections')
      .select(`
        *,
        color:color_library(*)
      `)
      .eq('project_id', projectId)
      .order('room_type', { ascending: true })
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch color selections', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error fetching color selections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/colors - Create a new color selection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('project_color_selections')
      .insert({
        project_id: projectId,
        room_type: body.roomType,
        room_name: body.roomName || null,
        surface_type: body.surfaceType,
        color_id: body.colorId || null,
        custom_color_name: body.customColorName || null,
        custom_hex_code: body.customHexCode || null,
        finish: body.finish || null,
        coats: body.coats || 2,
        primer_needed: body.primerNeeded || false,
        linked_scope_item_id: body.linkedScopeItemId || null,
        notes: body.notes || null,
        application_instructions: body.applicationInstructions || null,
        is_primary: body.isPrimary || false,
      })
      .select(`
        *,
        color:color_library(*)
      `)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create color selection', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating color selection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

