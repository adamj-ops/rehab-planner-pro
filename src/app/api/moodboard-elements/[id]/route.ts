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
      .from("moodboard_elements")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: "Element not found", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch element"
    console.error("Error fetching moodboard element:", message)
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
    
    // Position and size
    if (body.positionX !== undefined) updateData.position_x = body.positionX
    if (body.positionY !== undefined) updateData.position_y = body.positionY
    if (body.width !== undefined) updateData.width = body.width
    if (body.height !== undefined) updateData.height = body.height
    if (body.rotation !== undefined) updateData.rotation = body.rotation
    if (body.zIndex !== undefined) updateData.z_index = body.zIndex
    
    // Appearance
    if (body.opacity !== undefined) updateData.opacity = body.opacity
    if (body.borderWidth !== undefined) updateData.border_width = body.borderWidth
    if (body.borderColor !== undefined) updateData.border_color = body.borderColor
    if (body.borderRadius !== undefined) updateData.border_radius = body.borderRadius
    if (body.shadowEnabled !== undefined) updateData.shadow_enabled = body.shadowEnabled
    if (body.shadowConfig !== undefined) updateData.shadow_config = body.shadowConfig
    
    // Image properties
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl
    if (body.cropConfig !== undefined) updateData.crop_config = body.cropConfig
    
    // Color swatch properties
    if (body.colorId !== undefined) updateData.color_id = body.colorId
    if (body.swatchShape !== undefined) updateData.swatch_shape = body.swatchShape
    if (body.showColorName !== undefined) updateData.show_color_name = body.showColorName
    if (body.showColorCode !== undefined) updateData.show_color_code = body.showColorCode
    
    // Text properties
    if (body.textContent !== undefined) updateData.text_content = body.textContent
    if (body.fontFamily !== undefined) updateData.font_family = body.fontFamily
    if (body.fontSize !== undefined) updateData.font_size = body.fontSize
    if (body.fontWeight !== undefined) updateData.font_weight = body.fontWeight
    if (body.fontStyle !== undefined) updateData.font_style = body.fontStyle
    if (body.textColor !== undefined) updateData.text_color = body.textColor
    if (body.textAlign !== undefined) updateData.text_align = body.textAlign
    if (body.lineHeight !== undefined) updateData.line_height = body.lineHeight
    
    // Material properties
    if (body.materialId !== undefined) updateData.material_id = body.materialId
    if (body.showMaterialName !== undefined) updateData.show_material_name = body.showMaterialName
    if (body.showMaterialSpecs !== undefined) updateData.show_material_specs = body.showMaterialSpecs
    
    // Shape properties
    if (body.shapeType !== undefined) updateData.shape_type = body.shapeType
    if (body.fillColor !== undefined) updateData.fill_color = body.fillColor
    if (body.strokeColor !== undefined) updateData.stroke_color = body.strokeColor
    if (body.strokeWidth !== undefined) updateData.stroke_width = body.strokeWidth
    
    // Linking
    if (body.linkedScopeItemId !== undefined) updateData.linked_scope_item_id = body.linkedScopeItemId
    if (body.linkedColorSelectionId !== undefined) updateData.linked_color_selection_id = body.linkedColorSelectionId
    if (body.linkedMaterialSelectionId !== undefined) updateData.linked_material_selection_id = body.linkedMaterialSelectionId
    
    // Lock and visibility
    if (body.isLocked !== undefined) updateData.is_locked = body.isLocked
    if (body.isVisible !== undefined) updateData.is_visible = body.isVisible
    
    // Notes and tags
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.tags !== undefined) updateData.tags = body.tags

    const { data, error } = await supabase
      .from("moodboard_elements")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update element"
    console.error("Error updating moodboard element:", message)
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
      .from("moodboard_elements")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Element deleted" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete element"
    console.error("Error deleting moodboard element:", message)
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}

