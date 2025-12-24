import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("moodboards")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: "Moodboard not found", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch moodboard"
    console.error("Error fetching moodboard:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.isPrimary !== undefined) updateData.is_primary = body.isPrimary
    if (body.layoutType !== undefined) updateData.layout_type = body.layoutType
    if (body.canvasWidth !== undefined) updateData.canvas_width = body.canvasWidth
    if (body.canvasHeight !== undefined) updateData.canvas_height = body.canvasHeight
    if (body.backgroundColor !== undefined) updateData.background_color = body.backgroundColor
    if (body.backgroundImageUrl !== undefined) updateData.background_image_url = body.backgroundImageUrl
    if (body.showGrid !== undefined) updateData.show_grid = body.showGrid
    if (body.gridSize !== undefined) updateData.grid_size = body.gridSize
    if (body.snapToGrid !== undefined) updateData.snap_to_grid = body.snapToGrid
    if (body.isPublic !== undefined) updateData.is_public = body.isPublic
    if (body.publicSlug !== undefined) updateData.public_slug = body.publicSlug

    const { data, error } = await supabase
      .from("moodboards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update moodboard"
    console.error("Error updating moodboard:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from("moodboards")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Moodboard deleted" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete moodboard"
    console.error("Error deleting moodboard:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

