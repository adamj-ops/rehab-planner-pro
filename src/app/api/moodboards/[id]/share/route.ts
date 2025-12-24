import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moodboardId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("moodboard_shares")
      .select("*")
      .eq("moodboard_id", moodboardId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch shares"
    console.error("Error fetching moodboard shares:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moodboardId } = await params
    const body = await request.json()
    const supabase = await createClient()

    const shortCode = generateShortCode()
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null

    // Make the moodboard public
    await supabase
      .from("moodboards")
      .update({
        is_public: true,
        public_slug: shortCode,
      })
      .eq("id", moodboardId)

    // Create share record
    const { data, error } = await supabase
      .from("moodboard_shares")
      .insert({
        moodboard_id: moodboardId,
        share_type: body.shareType || "link",
        short_code: shortCode,
        share_url: `/moodboard/${shortCode}`,
        expires_at: expiresAt,
        password_protected: body.passwordProtected || false,
        recipient_email: body.recipientEmail || null,
        recipient_name: body.recipientName || null,
        recipient_type: body.recipientType || null,
      })
      .select()
      .single()

    if (error) throw error

    // Increment share count
    await supabase.rpc("increment", {
      table_name: "moodboards",
      row_id: moodboardId,
      column_name: "share_count",
    }).catch(() => {
      // RPC might not exist, update directly
      supabase
        .from("moodboards")
        .select("share_count")
        .eq("id", moodboardId)
        .single()
        .then(({ data: moodboard }) => {
          if (moodboard) {
            supabase
              .from("moodboards")
              .update({ share_count: (moodboard.share_count || 0) + 1 })
              .eq("id", moodboardId)
          }
        })
    })

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create share"
    console.error("Error creating moodboard share:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

