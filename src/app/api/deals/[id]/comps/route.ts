import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/deals/[id]/comps
 * Fetch all comps for a specific lead
 */
export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: leadId } = await context.params

  // Verify lead ownership
  const { data: lead, error: leadError } = await supabase
    .from('property_leads')
    .select('id')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  // Fetch all comps for this lead, ordered by relevance score (best first)
  const { data, error } = await supabase
    .from('comps')
    .select('*')
    .eq('lead_id', leadId)
    .order('relevance_score', { ascending: false, nullsFirst: false })
    .order('sale_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to fetch comps' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

/**
 * POST /api/deals/[id]/comps
 * Create a new comp for a lead
 */
export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: leadId } = await context.params

  // Verify lead ownership
  const { data: lead, error: leadError } = await supabase
    .from('property_leads')
    .select('id')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate required fields
  if (!body.address || typeof body.address !== 'string') {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }
  if (body.sale_price === undefined || body.sale_price === null) {
    return NextResponse.json({ error: 'sale_price is required' }, { status: 400 })
  }
  if (!body.sale_date) {
    return NextResponse.json({ error: 'sale_date is required' }, { status: 400 })
  }

  // Calculate price_per_sqft if sqft is provided
  let pricePerSqft: number | null = null
  if (typeof body.sqft === 'number' && body.sqft > 0 && typeof body.sale_price === 'number') {
    pricePerSqft = body.sale_price / body.sqft
  }

  // Get market_analysis_id if it exists
  const { data: marketAnalysis } = await supabase
    .from('market_analysis')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle()

  const { data, error } = await supabase
    .from('comps')
    .insert({
      ...body,
      lead_id: leadId,
      market_analysis_id: marketAnalysis?.id ?? null,
      price_per_sqft: pricePerSqft,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to create comp' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
