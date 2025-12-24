"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Plus,
  Trash2,
  Palette,
  ChevronDown,
  GripVertical,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ColorSwatch } from "./color-swatch"
import { ColorLibrarySheet } from "./color-library-browser"
import { ColorDetailDialog } from "./color-detail-dialog"
import { toast } from "sonner"
import type { Color, ProjectColorSelection } from "@/types/design"

// Application surfaces
const APPLICATION_SURFACES = [
  { value: "walls", label: "Walls" },
  { value: "ceiling", label: "Ceiling" },
  { value: "trim", label: "Trim & Molding" },
  { value: "doors", label: "Doors" },
  { value: "cabinets", label: "Cabinets" },
  { value: "accent", label: "Accent Wall" },
  { value: "exterior-body", label: "Exterior Body" },
  { value: "exterior-trim", label: "Exterior Trim" },
  { value: "exterior-door", label: "Front Door" },
  { value: "shutters", label: "Shutters" },
  { value: "other", label: "Other" },
]

// Room types
const ROOM_TYPES = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "master-bedroom", label: "Master Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "master-bath", label: "Master Bathroom" },
  { value: "dining-room", label: "Dining Room" },
  { value: "office", label: "Home Office" },
  { value: "laundry", label: "Laundry Room" },
  { value: "garage", label: "Garage" },
  { value: "hallway", label: "Hallway" },
  { value: "foyer", label: "Foyer/Entry" },
  { value: "basement", label: "Basement" },
  { value: "exterior", label: "Exterior" },
  { value: "whole-house", label: "Whole House" },
]

// Paint finishes
const FINISH_TYPES = [
  { value: "flat", label: "Flat/Matte" },
  { value: "eggshell", label: "Eggshell" },
  { value: "satin", label: "Satin" },
  { value: "semi-gloss", label: "Semi-Gloss" },
  { value: "high-gloss", label: "High Gloss" },
]

interface ColorSelectionCardProps {
  selection: ProjectColorSelection & { color?: Color }
  onUpdate: (id: string, updates: Partial<ProjectColorSelection>) => void
  onDelete: (id: string) => void
  onViewColor: (color: Color) => void
  colors: Color[]
}

function ColorSelectionCard({
  selection,
  onUpdate,
  onDelete,
  onViewColor,
  colors,
}: ColorSelectionCardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedNotes, setEditedNotes] = React.useState(selection.notes || "")
  const [isOpen, setIsOpen] = React.useState(true)

  const color = selection.color || colors.find((c) => c.id === selection.colorId)

  if (!color) {
    return null
  }

  const handleSaveNotes = () => {
    onUpdate(selection.id, { notes: editedNotes })
    setIsEditing(false)
  }

  const roomLabel = ROOM_TYPES.find((r) => r.value === selection.roomName)?.label || selection.roomName
  const surfaceLabel = APPLICATION_SURFACES.find((s) => s.value === selection.applicationSurface)?.label || selection.applicationSurface
  const finishLabel = FINISH_TYPES.find((f) => f.value === selection.recommendedFinish)?.label || selection.recommendedFinish

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <div
                className="w-10 h-10 rounded-md border shadow-sm flex-shrink-0"
                style={{ backgroundColor: color.hexCode }}
              />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{color.colorName}</CardTitle>
                <CardDescription className="text-sm">
                  {roomLabel} • {surfaceLabel}
                </CardDescription>
              </div>
              <Badge variant="outline" className="hidden sm:flex">
                {color.colorCode}
              </Badge>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Room selection */}
              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={selection.roomName || ""}
                  onValueChange={(value) => onUpdate(selection.id, { roomName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Surface selection */}
              <div className="space-y-2">
                <Label>Surface</Label>
                <Select
                  value={selection.applicationSurface || ""}
                  onValueChange={(value) => onUpdate(selection.id, { applicationSurface: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select surface" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_SURFACES.map((surface) => (
                      <SelectItem key={surface.value} value={surface.value}>
                        {surface.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Finish selection */}
              <div className="space-y-2">
                <Label>Finish</Label>
                <Select
                  value={selection.recommendedFinish || ""}
                  onValueChange={(value) => onUpdate(selection.id, { recommendedFinish: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent>
                    {FINISH_TYPES.map((finish) => (
                      <SelectItem key={finish.value} value={finish.value}>
                        {finish.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estimated gallons */}
              <div className="space-y-2">
                <Label>Estimated Gallons</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={selection.estimatedGallons || ""}
                  onChange={(e) =>
                    onUpdate(selection.id, { estimatedGallons: parseFloat(e.target.value) || null })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Notes</Label>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-6 px-2"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveNotes}
                      className="h-6 px-2"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditedNotes(selection.notes || "")
                        setIsEditing(false)
                      }}
                      className="h-6 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <Input
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add notes about this color selection..."
                  autoFocus
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {selection.notes || "No notes added"}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewColor(color)}
              >
                <Palette className="h-4 w-4 mr-2" />
                View Color Details
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove color selection?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {color.colorName} from your project color plan.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(selection.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

interface ProjectColorPlannerProps {
  projectId: string
  selections: (ProjectColorSelection & { color?: Color })[]
  colors: Color[]
  loading?: boolean
  onAddSelection: (colorId: string, roomName?: string, surface?: string) => Promise<void>
  onUpdateSelection: (id: string, updates: Partial<ProjectColorSelection>) => Promise<void>
  onDeleteSelection: (id: string) => Promise<void>
  className?: string
}

export function ProjectColorPlanner({
  projectId,
  selections,
  colors,
  loading = false,
  onAddSelection,
  onUpdateSelection,
  onDeleteSelection,
  className,
}: ProjectColorPlannerProps) {
  const [detailColor, setDetailColor] = React.useState<Color | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([])

  const selectedColorIds = selections.map((s) => s.colorId)

  const handleColorSelect = async (color: Color) => {
    if (selectedColorIds.includes(color.id)) {
      toast.info("Color already added", {
        description: `${color.colorName} is already in your color plan`,
      })
      return
    }

    try {
      await onAddSelection(color.id)
      toast.success("Color added", {
        description: `${color.colorName} has been added to your color plan`,
      })
    } catch (error) {
      toast.error("Failed to add color", {
        description: "Please try again",
      })
    }
  }

  const handleColorFavorite = (color: Color) => {
    setFavoriteIds((prev) =>
      prev.includes(color.id)
        ? prev.filter((id) => id !== color.id)
        : [...prev, color.id]
    )
  }

  const handleViewColor = (color: Color) => {
    setDetailColor(color)
    setDetailOpen(true)
  }

  const handleUpdateSelection = async (id: string, updates: Partial<ProjectColorSelection>) => {
    try {
      await onUpdateSelection(id, updates)
    } catch (error) {
      toast.error("Failed to update", {
        description: "Please try again",
      })
    }
  }

  const handleDeleteSelection = async (id: string) => {
    try {
      await onDeleteSelection(id)
      toast.success("Color removed from plan")
    } catch (error) {
      toast.error("Failed to remove color", {
        description: "Please try again",
      })
    }
  }

  // Group selections by room
  const selectionsByRoom = React.useMemo(() => {
    const grouped: Record<string, (ProjectColorSelection & { color?: Color })[]> = {}
    
    selections.forEach((selection) => {
      const room = selection.roomName || "unassigned"
      if (!grouped[room]) {
        grouped[room] = []
      }
      grouped[room].push(selection)
    })

    return grouped
  }, [selections])

  const roomOrder = ["whole-house", ...ROOM_TYPES.map(r => r.value).filter(r => r !== "whole-house"), "unassigned"]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Color Plan</h2>
          <p className="text-muted-foreground">
            {selections.length} color{selections.length !== 1 ? "s" : ""} selected
          </p>
        </div>
        <ColorLibrarySheet
          colors={colors}
          loading={loading}
          selectedColorIds={selectedColorIds}
          favoriteColorIds={favoriteIds}
          onColorSelect={handleColorSelect}
          onColorFavorite={handleColorFavorite}
          onColorInfo={handleViewColor}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Color
            </Button>
          }
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : selections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No colors selected</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Start building your color plan by adding colors from the
              Sherwin Williams library.
            </p>
            <ColorLibrarySheet
              colors={colors}
              selectedColorIds={selectedColorIds}
              favoriteColorIds={favoriteIds}
              onColorSelect={handleColorSelect}
              onColorFavorite={handleColorFavorite}
              onColorInfo={handleViewColor}
              trigger={
                <Button className="gap-2">
                  <Palette className="h-4 w-4" />
                  Browse Color Library
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-6 pr-4">
            {roomOrder
              .filter((room) => selectionsByRoom[room]?.length > 0)
              .map((room) => {
                const roomLabel =
                  room === "unassigned"
                    ? "Unassigned"
                    : ROOM_TYPES.find((r) => r.value === room)?.label || room

                return (
                  <div key={room} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {roomLabel}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {selectionsByRoom[room].length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {selectionsByRoom[room].map((selection) => (
                        <ColorSelectionCard
                          key={selection.id}
                          selection={selection}
                          onUpdate={handleUpdateSelection}
                          onDelete={handleDeleteSelection}
                          onViewColor={handleViewColor}
                          colors={colors}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </ScrollArea>
      )}

      {/* Color detail dialog */}
      <ColorDetailDialog
        color={detailColor}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSelect={handleColorSelect}
        onFavorite={handleColorFavorite}
        isFavorite={detailColor ? favoriteIds.includes(detailColor.id) : false}
        isSelected={detailColor ? selectedColorIds.includes(detailColor.id) : false}
      />
    </div>
  )
}

