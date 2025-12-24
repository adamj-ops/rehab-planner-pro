"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut, Maximize2, Download, ExternalLink, Palette, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PublicMoodboardViewerProps {
  moodboard: Record<string, unknown>
  elements: Record<string, unknown>[]
  colors: Record<string, unknown>[]
  materials: Record<string, unknown>[]
}

export function PublicMoodboardViewer({
  moodboard,
  elements,
  colors,
  materials,
}: PublicMoodboardViewerProps) {
  const [zoom, setZoom] = React.useState(1)

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))
  const handleZoomReset = () => setZoom(1)

  // Get color by ID
  const getColor = (colorId: string) => colors.find((c) => c.id === colorId)
  
  // Get material by ID
  const getMaterial = (materialId: string) => materials.find((m) => m.id === materialId)

  // Render element content
  const renderElement = (element: Record<string, unknown>) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: element.position_x as number,
      top: element.position_y as number,
      width: element.width as number,
      height: element.height as number,
      opacity: element.is_visible ? (element.opacity as number) : 0.3,
      borderRadius: element.border_radius as number,
      border: element.border_width
        ? `${element.border_width}px solid ${element.border_color || "transparent"}`
        : undefined,
      transform: `rotate(${element.rotation || 0}deg)`,
      zIndex: element.z_index as number,
      overflow: "hidden",
    }

    switch (element.element_type) {
      case "image":
        return (
          <div key={element.id as string} style={style}>
            {element.image_url ? (
              <img
                src={element.image_url as string}
                alt="Moodboard image"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        )

      case "color_swatch": {
        const color = getColor(element.color_id as string)
        return (
          <div
            key={element.id as string}
            style={{
              ...style,
              backgroundColor: (color?.hex_code as string) || "#CCCCCC",
            }}
            className="flex flex-col justify-end"
          >
            {element.show_color_name && color && (
              <div className="bg-black/50 text-white p-1 text-xs text-center">
                {color.color_name as string}
              </div>
            )}
          </div>
        )
      }

      case "material_sample": {
        const material = getMaterial(element.material_id as string)
        return (
          <div key={element.id as string} style={style}>
            {material?.image_url ? (
              <div className="w-full h-full relative">
                <img
                  src={material.image_url as string}
                  alt={material.product_name as string}
                  className="w-full h-full object-cover"
                />
                {element.show_material_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs text-center">
                    {material.product_name as string}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        )
      }

      case "text":
        return (
          <div
            key={element.id as string}
            style={{
              ...style,
              fontFamily: element.font_family as string,
              fontSize: element.font_size as number,
              fontWeight: element.font_weight as string,
              fontStyle: element.font_style as string,
              color: element.text_color as string,
              textAlign: element.text_align as "left" | "center" | "right" | "justify",
              lineHeight: element.line_height as number,
              padding: 8,
            }}
          >
            {element.text_content as string}
          </div>
        )

      case "shape":
        return (
          <div
            key={element.id as string}
            style={{
              ...style,
              backgroundColor: (element.fill_color as string) || "transparent",
              borderRadius: element.shape_type === "circle" ? "50%" : element.border_radius as number,
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-semibold text-lg leading-tight">
                  {moodboard.name as string}
                </h1>
                {moodboard.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {moodboard.description as string}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 mr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.25}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom out</TooltipContent>
                </Tooltip>

                <Badge variant="outline" className="min-w-[60px] justify-center">
                  {Math.round(zoom * 100)}%
                </Badge>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom in</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleZoomReset}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset view</TooltipContent>
                </Tooltip>
              </div>

              <Badge variant="secondary">
                {elements.length} elements
              </Badge>
            </div>
          </div>
        </header>

        {/* Canvas area */}
        <main className="flex-1 overflow-auto bg-muted/30 p-8">
          <div
            className="mx-auto shadow-xl rounded-lg overflow-hidden"
            style={{
              width: (moodboard.canvas_width as number) * zoom,
              height: (moodboard.canvas_height as number) * zoom,
            }}
          >
            <div
              className="relative w-full h-full"
              style={{
                backgroundColor: moodboard.background_color as string,
                backgroundImage: moodboard.background_image_url
                  ? `url(${moodboard.background_image_url})`
                  : undefined,
                backgroundSize: "cover",
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              {elements.map((element) => renderElement(element))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-4">
          <div className="container flex items-center justify-between px-4 text-sm text-muted-foreground">
            <span>
              Canvas: {moodboard.canvas_width as number} × {moodboard.canvas_height as number}px
            </span>
            <span>
              Viewed {(moodboard.view_count as number) || 0} times
            </span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}

