import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required", success: false },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("moodboards")
      .select("*")
      .eq("project_id", projectId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch moodboards"
    console.error("Error fetching moodboards:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("moodboards")
      .insert({
        project_id: body.projectId,
        name: body.name,
        description: body.description || null,
        moodboard_type: body.moodboardType || "custom",
        is_primary: body.isPrimary || false,
        layout_type: body.layoutType || "free",
        canvas_width: body.canvasWidth || 1920,
        canvas_height: body.canvasHeight || 1080,
        background_color: body.backgroundColor || "#FFFFFF",
        show_grid: body.showGrid ?? true,
        grid_size: body.gridSize || 20,
        snap_to_grid: body.snapToGrid ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create moodboard"
    console.error("Error creating moodboard:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

