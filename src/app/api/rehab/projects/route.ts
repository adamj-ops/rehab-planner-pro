import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CACHE_TTL_SECONDS, cacheKeys, invalidateRehabProjectsCache, withCache } from '@/server/cache'

export const runtime = 'nodejs'

// GET /api/rehab/projects - List all user projects
export async function GET(_request: NextRequest) {
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

    const projects = await withCache({
      key: cacheKeys.rehabProjectsList(user.id),
      ttlSeconds: CACHE_TTL_SECONDS.PROPERTY_LISTS,
      loader: async () => {
        // Get user's projects
        const { data: projects, error } = await supabase
          .from('rehab_projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) {
          throw error
        }

        return projects ?? []
      },
    })

    return NextResponse.json({ success: true, data: projects })
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

    const body = await request.json()
    
    // Create project with user_id
    const projectData = {
      ...body,
      user_id: user.id,
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

    await invalidateRehabProjectsCache(user.id)

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

