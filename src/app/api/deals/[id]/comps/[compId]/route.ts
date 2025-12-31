import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string; compId: string }> }

/**
 * GET /api/deals/[id]/comps/[compId]
 * Fetch a specific comp
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

  const { id: leadId, compId } = await context.params

  // Verify lead ownership
  const { data: lead, error: leadError } = await supabase
    .from('property_leads')
    .select('id')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  // Fetch the comp
  const { data, error } = await supabase
    .from('comps')
    .select('*')
    .eq('id', compId)
    .eq('lead_id', leadId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Comp not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

/**
 * PATCH /api/deals/[id]/comps/[compId]
 * Update a specific comp
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

  const { id: leadId, compId } = await context.params

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

  // Recalculate price_per_sqft if sqft or sale_price changed
  // First fetch current values
  const { data: currentComp } = await supabase
    .from('comps')
    .select('sqft, sale_price')
    .eq('id', compId)
    .eq('lead_id', leadId)
    .single()

  if (!currentComp) {
    return NextResponse.json({ error: 'Comp not found' }, { status: 404 })
  }

  const sqft = (body.sqft as number | undefined) ?? currentComp.sqft
  const salePrice = (body.sale_price as number | undefined) ?? currentComp.sale_price

  let pricePerSqft: number | null = null
  if (typeof sqft === 'number' && sqft > 0 && typeof salePrice === 'number') {
    pricePerSqft = salePrice / sqft
  }

  // Calculate adjusted_value if adjustments are provided
  let adjustedValue: number | null = null
  if (salePrice) {
    const adjSqft = (body.adjustment_sqft as number) ?? 0
    const adjBedrooms = (body.adjustment_bedrooms as number) ?? 0
    const adjBathrooms = (body.adjustment_bathrooms as number) ?? 0
    const adjCondition = (body.adjustment_condition as number) ?? 0
    const adjAge = (body.adjustment_age as number) ?? 0
    const adjOther = (body.adjustment_other as number) ?? 0
    
    const totalAdjustments = adjSqft + adjBedrooms + adjBathrooms + adjCondition + adjAge + adjOther
    if (totalAdjustments !== 0) {
      adjustedValue = salePrice + totalAdjustments
    }
  }

  const updateData: Record<string, unknown> = {
    ...body,
    price_per_sqft: pricePerSqft,
  }

  if (adjustedValue !== null) {
    updateData.adjusted_value = adjustedValue
  }

  const { data, error } = await supabase
    .from('comps')
    .update(updateData)
    .eq('id', compId)
    .eq('lead_id', leadId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to update comp' }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * DELETE /api/deals/[id]/comps/[compId]
 * Delete a specific comp
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

  const { id: leadId, compId } = await context.params

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
    .from('comps')
    .delete()
    .eq('id', compId)
    .eq('lead_id', leadId)

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to delete comp' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
