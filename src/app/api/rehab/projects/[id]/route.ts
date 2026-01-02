import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CACHE_TTL_SECONDS, cacheKeys, invalidateComputedCache, invalidateRehabProjectsCache, withCache } from '@/server/cache'

export const runtime = 'nodejs'

// GET /api/rehab/projects/[id] - Get project details
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projectId = params.id

    const project = await withCache({
      key: cacheKeys.rehabProjectById(user.id, projectId),
      ttlSeconds: CACHE_TTL_SECONDS.PORTFOLIO_METRICS,
      loader: async () => {
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

        if (error) throw error
        return project
      },
    })

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    // Preserve existing not-found handling
    const maybe = error as { code?: string }
    if (maybe?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projectId = params.id
    const body = await request.json()

    // Update project
    const updateData = {
      ...body,
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

    await invalidateRehabProjectsCache(user.id, projectId)
    await invalidateComputedCache('rehab-project', projectId)

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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
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

    await invalidateRehabProjectsCache(user.id, projectId)
    await invalidateComputedCache('rehab-project', projectId)

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

