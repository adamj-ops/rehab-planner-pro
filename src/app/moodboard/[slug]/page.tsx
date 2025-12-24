import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicMoodboardViewer } from "./public-moodboard-viewer"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: moodboard } = await supabase
    .from("moodboards")
    .select("name, description")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single()

  if (!moodboard) {
    return {
      title: "Moodboard Not Found",
    }
  }

  return {
    title: `${moodboard.name} | Moodboard`,
    description: moodboard.description || "View this design moodboard",
    openGraph: {
      title: moodboard.name,
      description: moodboard.description || "View this design moodboard",
      type: "website",
    },
  }
}

export default async function PublicMoodboardPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the moodboard
  const { data: moodboard, error: moodboardError } = await supabase
    .from("moodboards")
    .select("*")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single()

  if (moodboardError || !moodboard) {
    notFound()
  }

  // Fetch elements
  const { data: elements } = await supabase
    .from("moodboard_elements")
    .select("*")
    .eq("moodboard_id", moodboard.id)
    .order("z_index", { ascending: true })

  // Fetch colors for color swatches
  const colorIds = (elements || [])
    .filter((e) => e.element_type === "color_swatch" && e.color_id)
    .map((e) => e.color_id)

  let colors: Record<string, unknown>[] = []
  if (colorIds.length > 0) {
    const { data } = await supabase
      .from("color_library")
      .select("*")
      .in("id", colorIds)
    colors = data || []
  }

  // Fetch materials for material samples
  const materialIds = (elements || [])
    .filter((e) => e.element_type === "material_sample" && e.material_id)
    .map((e) => e.material_id)

  let materials: Record<string, unknown>[] = []
  if (materialIds.length > 0) {
    const { data } = await supabase
      .from("material_library")
      .select("*")
      .in("id", materialIds)
    materials = data || []
  }

  // Increment view count
  await supabase
    .from("moodboards")
    .update({ view_count: (moodboard.view_count || 0) + 1 })
    .eq("id", moodboard.id)

  return (
    <PublicMoodboardViewer
      moodboard={moodboard}
      elements={elements || []}
      colors={colors}
      materials={materials}
    />
  )
}

