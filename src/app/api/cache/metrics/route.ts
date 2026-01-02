import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCacheMetrics, isRedisCacheEnabled } from '@/server/cache'

export const runtime = 'nodejs'

// GET /api/cache/metrics - Basic cache hit/miss stats
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const metrics = await getCacheMetrics()

  return NextResponse.json({
    success: true,
    enabled: isRedisCacheEnabled(),
    metrics,
  })
}

