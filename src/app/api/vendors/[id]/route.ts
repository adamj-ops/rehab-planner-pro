import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { invalidateSearchCache } from '@/server/cache'

export const runtime = 'nodejs'

// GET a single vendor by ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vendor not found', success: false },
          { status: 404 }
        )
      }
      console.error('Error fetching vendor:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Unexpected error in GET /api/vendors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

// PUT update a vendor
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Remove fields that shouldn't be updated
    const { id: _id, user_id: _user_id, created_at: _created_at, updated_at: _updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendor not found', success: false }, { status: 404 })
      }
      console.error('Error updating vendor:', error)
      return NextResponse.json({ error: error.message, success: false }, { status: 500 })
    }

    // Invalidate cached vendor search/list results for this user
    await invalidateSearchCache(user.id, 'vendors')

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Unexpected error in PUT /api/vendors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

// DELETE a vendor
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting vendor:', error)
      return NextResponse.json({ error: error.message, success: false }, { status: 500 })
    }

    // Invalidate cached vendor search/list results for this user
    await invalidateSearchCache(user.id, 'vendors')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/vendors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

