import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CACHE_TTL_SECONDS, cacheKeys, invalidateDealsCache, withCache } from '@/server/cache'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await withCache({
      key: cacheKeys.dealsList(user.id),
      ttlSeconds: CACHE_TTL_SECONDS.PROPERTY_LISTS,
      loader: async () => {
        const { data, error } = await supabase
          .from('property_leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message ?? 'Failed to load deals')
        }

        return data ?? []
      },
    })

    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load deals'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('property_leads')
    .insert({
      ...body,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to create lead' }, { status: 500 })
  }

  // Invalidate cached list/detail for this user
  await invalidateDealsCache(user.id)

  return NextResponse.json(data, { status: 201 })
}
