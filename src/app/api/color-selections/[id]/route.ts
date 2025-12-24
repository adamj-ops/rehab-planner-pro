import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/color-selections/[id] - Get a single color selection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('project_color_selections')
      .select(`
        *,
        color:color_library(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Color selection not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch color selection', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching color selection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/color-selections/[id] - Update a color selection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.roomType !== undefined) updateData.room_type = body.roomType
    if (body.roomName !== undefined) updateData.room_name = body.roomName
    if (body.surfaceType !== undefined) updateData.surface_type = body.surfaceType
    if (body.colorId !== undefined) updateData.color_id = body.colorId
    if (body.customColorName !== undefined) updateData.custom_color_name = body.customColorName
    if (body.customHexCode !== undefined) updateData.custom_hex_code = body.customHexCode
    if (body.finish !== undefined) updateData.finish = body.finish
    if (body.coats !== undefined) updateData.coats = body.coats
    if (body.primerNeeded !== undefined) updateData.primer_needed = body.primerNeeded
    if (body.linkedScopeItemId !== undefined) updateData.linked_scope_item_id = body.linkedScopeItemId
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.applicationInstructions !== undefined) updateData.application_instructions = body.applicationInstructions
    if (body.isPrimary !== undefined) updateData.is_primary = body.isPrimary
    if (body.isApproved !== undefined) updateData.is_approved = body.isApproved
    if (body.approvedByClient !== undefined) updateData.approved_by_client = body.approvedByClient
    
    const { data, error } = await supabase
      .from('project_color_selections')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        color:color_library(*)
      `)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update color selection', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating color selection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/color-selections/[id] - Delete a color selection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('project_color_selections')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete color selection', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting color selection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

