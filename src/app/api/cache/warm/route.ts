import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CACHE_TTL_SECONDS, cacheKeys, warmCache } from '@/server/cache'

export const runtime = 'nodejs'

// POST /api/cache/warm - Warm common per-user caches
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const deals = await warmCache({
    key: cacheKeys.dealsList(user.id),
    ttlSeconds: CACHE_TTL_SECONDS.PROPERTY_LISTS,
    loader: async () => {
      const { data, error } = await supabase
        .from('property_leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message ?? 'Failed to load deals')
      return data ?? []
    },
  })

  const rehabProjects = await warmCache({
    key: cacheKeys.rehabProjectsList(user.id),
    ttlSeconds: CACHE_TTL_SECONDS.PROPERTY_LISTS,
    loader: async () => {
      const { data, error } = await supabase
        .from('rehab_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (error) throw new Error(error.message ?? 'Failed to fetch projects')
      return data ?? []
    },
  })

  const vendors = await warmCache({
    key: cacheKeys.searchResults({ userId: user.id, scope: 'vendors', query: {} }),
    ttlSeconds: CACHE_TTL_SECONDS.SEARCH_RESULTS,
    loader: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .order('preferred', { ascending: false })
        .order('company_name')
      if (error) throw new Error(error.message ?? 'Failed to load vendors')
      return data ?? []
    },
  })

  return NextResponse.json({
    success: true,
    warmed: {
      deals: deals.warmed,
      rehabProjects: rehabProjects.warmed,
      vendors: vendors.warmed,
    },
  })
}

