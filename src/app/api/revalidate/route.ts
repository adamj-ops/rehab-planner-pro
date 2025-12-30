/**
 * Cache Revalidation API
 * 
 * Allows manual cache invalidation for specific tags.
 * Useful for admin operations or webhooks from Supabase.
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

type ValidTag = typeof VALID_TAGS[number]

interface RevalidateRequest {
  /** Cache tag to invalidate */
  tag?: ValidTag
  /** Specific path to revalidate */
  path?: string
  /** Project ID for project-specific cache */
  projectId?: string
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
    message: 'POST to this endpoint with { tag, path, or projectId } to revalidate cache',
  })
}
