/**
 * Cache Revalidation API
 *
 * Allows manual cache invalidation for specific tags.
 * Useful for admin operations or webhooks from Supabase.
 *
 * Supabase Webhook Setup:
 * 1. Go to Database → Webhooks in Supabase dashboard
 * 2. Create a new webhook for each table you want to track
 * 3. Configure:
 *    - URL: https://your-domain.com/api/revalidate
 *    - Method: POST
 *    - Headers: { "Content-Type": "application/json" }
 *    - Body: See examples below
 *
 * Example webhook payloads:
 * - Vendors table: { "secret": "YOUR_SECRET", "tag": "vendors" }
 * - Materials table: { "secret": "YOUR_SECRET", "tag": "materials" }
 * - Scope catalog: { "secret": "YOUR_SECRET", "tag": "scope-catalog" }
 * - User-specific vendors: { "secret": "YOUR_SECRET", "userId": "user-uuid" }
 * - Project-specific: { "secret": "YOUR_SECRET", "projectId": "project-uuid" }
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

// Secret token for authorization (set in environment variables)
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET

/** Valid cache tags that can be revalidated */
const VALID_TAGS = [
  'materials',
  'colors',
  'vendors',
  'scope-catalog',
  'labor-rates',
  'material-prices',
  'project-stats',
  'ai-responses',
] as const

type ValidTag = (typeof VALID_TAGS)[number]

interface RevalidateRequest {
  /** Cache tag to invalidate */
  tag?: ValidTag
  /** Specific path to revalidate */
  path?: string
  /** Project ID for project-specific cache */
  projectId?: string
  /** User ID for user-specific cache (e.g., user-vendors) */
  userId?: string
  /** Table name for Supabase webhook integration */
  table?: string
  /** Secret token for authorization */
  secret?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RevalidateRequest = await request.json()
    
    // Verify authorization
    if (REVALIDATION_SECRET && body.secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      )
    }
    
    const revalidated: string[] = []
    
    // Revalidate by tag
    if (body.tag) {
      if (!VALID_TAGS.includes(body.tag)) {
        return NextResponse.json(
          { error: `Invalid tag: ${body.tag}. Valid tags: ${VALID_TAGS.join(', ')}` },
          { status: 400 }
        )
      }
      
      revalidateTag(body.tag)
      revalidated.push(`tag:${body.tag}`)
    }
    
    // Revalidate project-specific cache
    if (body.projectId) {
      revalidateTag(`project-${body.projectId}`)
      revalidated.push(`tag:project-${body.projectId}`)
    }

    // Revalidate user-specific cache
    if (body.userId) {
      revalidateTag(`user-vendors-${body.userId}`)
      revalidated.push(`tag:user-vendors-${body.userId}`)
    }

    // Handle Supabase webhook table-based revalidation
    if (body.table) {
      const tableTagMap: Record<string, ValidTag[]> = {
        vendors: ['vendors'],
        material_library: ['materials'],
        color_library: ['colors'],
        scope_catalog: ['scope-catalog'],
        labor_rates: ['labor-rates'],
        material_prices: ['material-prices'],
        rehab_projects: ['project-stats'],
      }

      const tags = tableTagMap[body.table]
      if (tags) {
        for (const tag of tags) {
          revalidateTag(tag)
          revalidated.push(`tag:${tag}`)
        }
      }
    }

    // Revalidate by path
    if (body.path) {
      revalidatePath(body.path)
      revalidated.push(`path:${body.path}`)
    }
    
    if (revalidated.length === 0) {
      return NextResponse.json(
        { error: 'No tag, path, or projectId provided' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in revalidation:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    )
  }
}

// GET endpoint for quick health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    validTags: VALID_TAGS,
    supportedTables: [
      'vendors',
      'material_library',
      'color_library',
      'scope_catalog',
      'labor_rates',
      'material_prices',
      'rehab_projects',
    ],
    message: 'POST to this endpoint with { tag, path, projectId, userId, or table } to revalidate cache',
    examples: {
      byTag: { secret: 'YOUR_SECRET', tag: 'vendors' },
      byTable: { secret: 'YOUR_SECRET', table: 'vendors' },
      byProject: { secret: 'YOUR_SECRET', projectId: 'uuid' },
      byUser: { secret: 'YOUR_SECRET', userId: 'uuid' },
    },
  })
}
