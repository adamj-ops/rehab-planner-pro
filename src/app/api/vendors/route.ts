import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all vendors for the authenticated user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .order('preferred', { ascending: false })
      .order('company_name')

    if (error) {
      console.error('Error fetching vendors:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Unexpected error in GET /api/vendors:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

// POST create a new vendor
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.company_name || !body.vendor_type) {
      return NextResponse.json(
        { error: 'Company name and vendor type are required', success: false },
        { status: 400 }
      )
    }

    // Add user_id to the vendor data
    const vendorData = {
      ...body,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single()

    if (error) {
      console.error('Error creating vendor:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/vendors:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

