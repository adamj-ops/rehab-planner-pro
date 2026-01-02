import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PlacesError, validateAndGeocodeAddress } from '@/lib/google/places'

// GET /api/rehab/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projectId = params.id

    // Get project with all related data
    const { data: project, error } = await supabase
      .from('rehab_projects')
      .select(`
        *,
        scope_items:rehab_scope_items(*),
        assessments:property_assessments(*),
        comparables:market_comparables(*),
        recommendations:rehab_recommendations(*)
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching project:', error)
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error in GET /api/rehab/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/rehab/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projectId = params.id
    const body = await request.json()

    const addressStreet = body.address_street ?? body?.address?.street
    const addressCity = body.address_city ?? body?.address?.city
    const addressState = body.address_state ?? body?.address?.state
    const addressZip = body.address_zip ?? body?.address?.zip
    const addressPlaceId = body.address_place_id ?? body?.addressPlaceId
    const addressFormatted = body.address_formatted ?? body?.addressFormatted

    let geo:
      | { placeId: string; formattedAddress: string; street: string; city: string; state: string; zip: string; lat: number; lng: number }
      | null = null

    if (addressStreet || addressFormatted || addressPlaceId) {
      try {
        geo = await validateAndGeocodeAddress({
          placeId: addressPlaceId,
          street: addressStreet,
          city: addressCity,
          state: addressState,
          zip: addressZip,
          formatted: addressFormatted,
        })
      } catch (e) {
        if (e instanceof PlacesError) {
          return NextResponse.json({ error: e.message }, { status: 422 })
        }
        throw e
      }
    }

    // Update project
    const updateData = {
      ...body,
      ...(geo
        ? {
            address_street: geo.street,
            address_city: geo.city,
            address_state: geo.state,
            address_zip: geo.zip,
            address_place_id: geo.placeId,
            address_formatted: geo.formattedAddress,
            address_lat: geo.lat,
            address_lng: geo.lng,
          }
        : {}),
      updated_at: new Date().toISOString(),
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.user_id
    delete updateData.created_at

    const { data: project, error } = await supabase
      .from('rehab_projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      console.error('Error updating project:', error)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error in PUT /api/rehab/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/rehab/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projectId = params.id

    // Delete project (cascade will handle related records)
    const { error } = await supabase
      .from('rehab_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/rehab/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

