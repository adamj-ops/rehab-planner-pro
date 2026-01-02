import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CACHE_TTL_SECONDS, cacheKeys, invalidateDealsCache, withCache } from '@/server/cache'

export const runtime = 'nodejs'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const data = await withCache({
      key: cacheKeys.dealById(user.id, id),
      ttlSeconds: CACHE_TTL_SECONDS.PROPERTY_LISTS,
      loader: async () => {
        const { data, error } = await supabase
          .from('property_leads')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error) throw new Error(error.message ?? 'Not found')
        return data
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not found'
    // Preserve previous behavior: treat failures as not found.
    return NextResponse.json({ error: message }, { status: 404 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('property_leads')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to update lead' }, { status: 500 })
  }

  await invalidateDealsCache(user.id, id)

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const { error } = await supabase
    .from('property_leads')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to delete lead' }, { status: 500 })
  }

  await invalidateDealsCache(user.id, id)

  return NextResponse.json({ ok: true })
}
