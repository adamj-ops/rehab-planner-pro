import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moodboardId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("moodboard_elements")
      .select("*")
      .eq("moodboard_id", moodboardId)
      .order("z_index", { ascending: true })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch elements"
    console.error("Error fetching moodboard elements:", message)
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

    // Get the highest z-index
    const { data: existingElements } = await supabase
      .from("moodboard_elements")
      .select("z_index")
      .eq("moodboard_id", moodboardId)
      .order("z_index", { ascending: false })
      .limit(1)

    const maxZIndex = existingElements?.[0]?.z_index || 0

    const { data, error } = await supabase
      .from("moodboard_elements")
      .insert({
        moodboard_id: moodboardId,
        element_type: body.elementType,
        position_x: body.positionX || 0,
        position_y: body.positionY || 0,
        width: body.width || 200,
        height: body.height || 200,
        rotation: body.rotation || 0,
        z_index: body.zIndex ?? maxZIndex + 1,
        opacity: body.opacity || 1.0,
        border_width: body.borderWidth || 0,
        border_color: body.borderColor || null,
        border_radius: body.borderRadius || 0,
        image_url: body.imageUrl || null,
        color_id: body.colorId || null,
        text_content: body.textContent || null,
        font_family: body.fontFamily || "sans-serif",
        font_size: body.fontSize || 16,
        font_weight: body.fontWeight || "normal",
        text_color: body.textColor || "#000000",
        text_align: body.textAlign || "left",
        material_id: body.materialId || null,
        shape_type: body.shapeType || null,
        fill_color: body.fillColor || null,
        stroke_color: body.strokeColor || null,
        stroke_width: body.strokeWidth || null,
        is_locked: body.isLocked ?? false,
        is_visible: body.isVisible ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create element"
    console.error("Error creating moodboard element:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

