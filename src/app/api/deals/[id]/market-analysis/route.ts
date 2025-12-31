import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/deals/[id]/market-analysis
 * Fetch market analysis for a specific lead
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

  // Fetch market analysis
  const { data, error } = await supabase
    .from('market_analysis')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to fetch market analysis' }, { status: 500 })
  }

  // Return null if no analysis exists yet (not an error)
  return NextResponse.json(data)
}

/**
 * POST /api/deals/[id]/market-analysis
 * Create market analysis for a lead (one-to-one relationship)
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

  // Check if market analysis already exists
  const { data: existing } = await supabase
    .from('market_analysis')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Market analysis already exists for this lead. Use PATCH to update.' },
      { status: 409 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('market_analysis')
    .insert({
      ...body,
      lead_id: leadId,
      analyzed_by: user.id,
      analyzed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to create market analysis' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

/**
 * PATCH /api/deals/[id]/market-analysis
 * Update market analysis for a lead
 */
export async function PATCH(request: Request, context: RouteContext) {
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

  // Update market analysis
  const { data, error } = await supabase
    .from('market_analysis')
    .update({
      ...body,
      analyzed_by: user.id,
      analyzed_at: new Date().toISOString(),
    })
    .eq('lead_id', leadId)
    .select()
    .single()

  if (error) {
    // If no rows updated, it might not exist
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Market analysis not found for this lead' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message ?? 'Failed to update market analysis' }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * DELETE /api/deals/[id]/market-analysis
 * Delete market analysis for a lead
 */
export async function DELETE(_request: Request, context: RouteContext) {
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

  const { error } = await supabase
    .from('market_analysis')
    .delete()
    .eq('lead_id', leadId)

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to delete market analysis' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
