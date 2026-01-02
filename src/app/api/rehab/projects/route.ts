import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PlacesError, validateAndGeocodeAddress } from '@/lib/google/places'

// GET /api/rehab/projects - List all user projects
export async function GET() {
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

    // Get user's projects
    const { data: projects, error } = await supabase
      .from('rehab_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('Error in GET /api/rehab/projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/rehab/projects - Create new project
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Normalize common input shapes into rehab_projects columns
    const projectName = body.project_name ?? body.projectName ?? body?.step1?.project_name ?? body?.wizardData?.step1?.project_name
    const addressStreet = body.address_street ?? body?.address?.street ?? body?.step1?.address_street ?? body?.wizardData?.step1?.address_street
    const addressCity = body.address_city ?? body?.address?.city ?? body?.step1?.address_city ?? body?.wizardData?.step1?.address_city
    const addressState = body.address_state ?? body?.address?.state ?? body?.step1?.address_state ?? body?.wizardData?.step1?.address_state
    const addressZip = body.address_zip ?? body?.address?.zip ?? body?.step1?.address_zip ?? body?.wizardData?.step1?.address_zip
    const addressPlaceId = body.address_place_id ?? body?.step1?.address_place_id ?? body?.wizardData?.step1?.address_place_id ?? body?.addressPlaceId
    const addressFormatted = body.address_formatted ?? body?.step1?.address_formatted ?? body?.wizardData?.step1?.address_formatted ?? body?.addressFormatted

    let geo:
      | { placeId: string; formattedAddress: string; street: string; city: string; state: string; zip: string; lat: number; lng: number }
      | null = null

    if (addressStreet || addressFormatted) {
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

    // Create project with user_id
    const projectData = {
      user_id: user.id,
      project_name: projectName,
      address_street: geo?.street ?? addressStreet ?? '',
      address_city: geo?.city ?? addressCity ?? '',
      address_state: geo?.state ?? addressState ?? '',
      address_zip: geo?.zip ?? addressZip ?? '',
      address_place_id: geo?.placeId ?? addressPlaceId ?? null,
      address_formatted: geo?.formattedAddress ?? addressFormatted ?? null,
      address_lat: geo?.lat ?? null,
      address_lng: geo?.lng ?? null,
      square_feet: body.square_feet ?? body.squareFeet ?? null,
      year_built: body.year_built ?? body.yearBuilt ?? null,
      property_type: body.property_type ?? body.propertyType ?? null,
      bedrooms: body.bedrooms ?? null,
      bathrooms: body.bathrooms ?? null,
      purchase_price: body.purchase_price ?? body.purchasePrice ?? null,
      arv: body.arv ?? null,
      status: body.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: project, error } = await supabase
      .from('rehab_projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/rehab/projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/rehab/projects - Update project (legacy endpoint used by some flows)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const id = body.id
    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 })
    }

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

    const updateData = {
      project_name: body.project_name ?? body.projectName,
      address_street: geo?.street ?? addressStreet,
      address_city: geo?.city ?? addressCity,
      address_state: geo?.state ?? addressState,
      address_zip: geo?.zip ?? addressZip,
      address_place_id: geo?.placeId ?? addressPlaceId ?? null,
      address_formatted: geo?.formattedAddress ?? addressFormatted ?? null,
      address_lat: geo?.lat ?? null,
      address_lng: geo?.lng ?? null,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>

    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k])

    const { data: project, error } = await supabase
      .from('rehab_projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error in PUT /api/rehab/projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

