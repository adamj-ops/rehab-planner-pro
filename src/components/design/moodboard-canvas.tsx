"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Magnet,
  Undo2,
  Redo2,
  Save,
  Download,
  Share2,
  Plus,
  Image as ImageIcon,
  Type,
  Square,
  Palette,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoodboardElement } from "./moodboard-element"
import type {
  Moodboard,
  MoodboardElement as MoodboardElementType,
  Color,
  Material,
} from "@/types/design"

interface MoodboardCanvasProps {
  moodboard: Moodboard
  elements: MoodboardElementType[]
  colors?: Color[]
  materials?: Material[]
  selectedElementId?: string | null
  onElementSelect?: (id: string | null) => void
  onElementUpdate?: (id: string, updates: Partial<MoodboardElementType>) => void
  onElementDelete?: (id: string) => void
  onElementDuplicate?: (element: MoodboardElementType) => void
  onElementCreate?: (type: MoodboardElementType["elementType"], position: { x: number; y: number }) => void
  onMoodboardUpdate?: (updates: Partial<Moodboard>) => void
  onSave?: () => void
  onExport?: () => void
  onShare?: () => void
  className?: string
}

export function MoodboardCanvas({
  moodboard,
  elements,
  colors = [],
  materials = [],
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementCreate,
  onMoodboardUpdate,
  onSave,
  onExport,
  onShare,
  className,
}: MoodboardCanvasProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [showGrid, setShowGrid] = React.useState(moodboard.showGrid)
  const [snapToGrid, setSnapToGrid] = React.useState(moodboard.snapToGrid)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    setActiveId(null)

    if (!delta) return

    const element = elements.find((e) => e.id === active.id)
    if (!element || element.isLocked) return

    let newX = element.positionX + delta.x / zoom
    let newY = element.positionY + delta.y / zoom

    // Snap to grid if enabled
    if (snapToGrid) {
      const gridSize = moodboard.gridSize
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize
    }

    // Constrain to canvas bounds
    newX = Math.max(0, Math.min(newX, moodboard.canvasWidth - element.width))
    newY = Math.max(0, Math.min(newY, moodboard.canvasHeight - element.height))

    onElementUpdate?.(element.id, { positionX: newX, positionY: newY })
  }

  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect?.(null)
    }
  }

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))
  const handleZoomReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Toggle grid
  const handleToggleGrid = () => {
    setShowGrid(!showGrid)
    onMoodboardUpdate?.({ showGrid: !showGrid })
  }

  // Toggle snap
  const handleToggleSnap = () => {
    setSnapToGrid(!snapToGrid)
    onMoodboardUpdate?.({ snapToGrid: !snapToGrid })
  }

  // Add element
  const handleAddElement = (type: MoodboardElementType["elementType"]) => {
    const centerX = moodboard.canvasWidth / 2 - 100
    const centerY = moodboard.canvasHeight / 2 - 100
    onElementCreate?.(type, { x: centerX, y: centerY })
  }

  // Get color and material for element
  const getElementResources = (element: MoodboardElementType) => {
    const color = element.colorId ? colors.find((c) => c.id === element.colorId) : undefined
    const material = element.materialId ? materials.find((m) => m.id === element.materialId) : undefined
    return { color, material }
  }

  // Active element for drag overlay
  const activeElement = activeId ? elements.find((e) => e.id === activeId) : null

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 p-2 border-b bg-muted/30">
          <div className="flex items-center gap-1">
            {/* Add element dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Element
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddElement("image")}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddElement("color_swatch")}>
                  <Palette className="h-4 w-4 mr-2" />
                  Color Swatch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddElement("material_sample")}>
                  <Package className="h-4 w-4 mr-2" />
                  Material Sample
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddElement("text")}>
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddElement("shape")}>
                  <Square className="h-4 w-4 mr-2" />
                  Shape
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* View controls */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleToggleGrid}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle grid</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={snapToGrid ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleToggleSnap}
                  >
                    <Magnet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Snap to grid</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
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
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            {onSave && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save</TooltipContent>
              </Tooltip>
            )}

            {onExport && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
            )}

            {onShare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share moodboard</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div
          className="flex-1 overflow-auto bg-muted/50"
          style={{ minHeight: 400 }}
        >
          <div
            className="relative mx-auto my-8 shadow-lg"
            style={{
              width: moodboard.canvasWidth * zoom,
              height: moodboard.canvasHeight * zoom,
              transform: `translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={elements.map((e) => e.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  ref={canvasRef}
                  className={cn(
                    "relative w-full h-full overflow-hidden",
                    "transition-all duration-200"
                  )}
                  style={{
                    backgroundColor: moodboard.backgroundColor,
                    backgroundImage: moodboard.backgroundImageUrl
                      ? `url(${moodboard.backgroundImageUrl})`
                      : showGrid
                      ? `
                          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                        `
                      : undefined,
                    backgroundSize: showGrid
                      ? `${moodboard.gridSize * zoom}px ${moodboard.gridSize * zoom}px`
                      : moodboard.backgroundImageUrl
                      ? "cover"
                      : undefined,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                  onClick={handleCanvasClick}
                >
                  {elements.map((element) => {
                    const { color, material } = getElementResources(element)
                    return (
                      <MoodboardElement
                        key={element.id}
                        element={element}
                        color={color}
                        material={material}
                        isSelected={selectedElementId === element.id}
                        onSelect={onElementSelect}
                        onUpdate={onElementUpdate}
                        onDelete={onElementDelete}
                        onDuplicate={onElementDuplicate}
                      />
                    )
                  })}
                </div>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {activeElement && (
                  <div
                    className="pointer-events-none"
                    style={{
                      width: activeElement.width,
                      height: activeElement.height,
                      opacity: 0.8,
                    }}
                  >
                    <MoodboardElement
                      element={activeElement}
                      {...getElementResources(activeElement)}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              Canvas: {moodboard.canvasWidth} × {moodboard.canvasHeight}px
            </span>
            <span>Elements: {elements.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {selectedElementId && (
              <span>
                Selected:{" "}
                {elements.find((e) => e.id === selectedElementId)?.elementType || "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

