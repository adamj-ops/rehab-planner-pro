"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Plus,
  Trash2,
  Package,
  ChevronDown,
  GripVertical,
  Edit2,
  Save,
  X,
  Loader2,
  DollarSign,
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
import { MaterialLibrarySheet } from "./material-library-browser"
import { MaterialDetailDialog } from "./material-detail-dialog"
import { toast } from "sonner"
import type { Material, ProjectMaterialSelection } from "@/types/design"

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

// Installation status
const INSTALLATION_STATUS = [
  { value: "planned", label: "Planned" },
  { value: "ordered", label: "Ordered" },
  { value: "delivered", label: "Delivered" },
  { value: "installed", label: "Installed" },
]

interface MaterialSelectionCardProps {
  selection: ProjectMaterialSelection & { material?: Material }
  onUpdate: (id: string, updates: Partial<ProjectMaterialSelection>) => void
  onDelete: (id: string) => void
  onViewMaterial: (material: Material) => void
  materials: Material[]
}

function MaterialSelectionCard({
  selection,
  onUpdate,
  onDelete,
  onViewMaterial,
  materials,
}: MaterialSelectionCardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedNotes, setEditedNotes] = React.useState(selection.notes || "")
  const [isOpen, setIsOpen] = React.useState(true)

  const material = selection.material || materials.find((m) => m.id === selection.materialId)

  if (!material) {
    return null
  }

  const handleSaveNotes = () => {
    onUpdate(selection.id, { notes: editedNotes })
    setIsEditing(false)
  }

  const roomLabel = ROOM_TYPES.find((r) => r.value === selection.roomName)?.label || selection.roomName
  const statusLabel = INSTALLATION_STATUS.find((s) => s.value === selection.installationStatus)?.label || selection.installationStatus

  // Calculate total cost
  const totalCost = selection.quantity && material.pricePerUnit
    ? selection.quantity * material.pricePerUnit
    : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <div className="w-12 h-12 rounded-md border overflow-hidden bg-muted flex-shrink-0">
                {material.imageUrl ? (
                  <img
                    src={material.imageUrl}
                    alt={material.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{material.productName}</CardTitle>
                <CardDescription className="text-sm">
                  {roomLabel} • {material.category}
                </CardDescription>
              </div>
              {totalCost && (
                <Badge variant="outline" className="hidden sm:flex">
                  {formatCurrency(totalCost)}
                </Badge>
              )}
              <Badge
                variant={selection.installationStatus === "installed" ? "default" : "secondary"}
                className="hidden sm:flex"
              >
                {statusLabel}
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

              {/* Installation status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selection.installationStatus || "planned"}
                  onValueChange={(value) => onUpdate(selection.id, { installationStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTALLATION_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={selection.quantity || ""}
                  onChange={(e) =>
                    onUpdate(selection.id, { quantity: parseFloat(e.target.value) || null })
                  }
                  placeholder="0"
                />
                {material.pricingUnit && (
                  <p className="text-xs text-muted-foreground">
                    Measured in: {material.pricingUnit}
                  </p>
                )}
              </div>

              {/* Total cost display */}
              <div className="space-y-2">
                <Label>Estimated Cost</Label>
                <div className="flex items-center h-9 px-3 rounded-md border bg-muted/50">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="font-medium">
                    {totalCost ? formatCurrency(totalCost) : "—"}
                  </span>
                </div>
                {material.pricePerUnit && (
                  <p className="text-xs text-muted-foreground">
                    @ {formatCurrency(material.pricePerUnit)}/{material.pricingUnit || "unit"}
                  </p>
                )}
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
                  placeholder="Add notes about this material selection..."
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
                onClick={() => onViewMaterial(material)}
              >
                <Package className="h-4 w-4 mr-2" />
                View Material Details
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
                    <AlertDialogTitle>Remove material selection?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {material.productName} from your project materials.
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

interface ProjectMaterialSelectorProps {
  projectId: string
  selections: (ProjectMaterialSelection & { material?: Material })[]
  materials: Material[]
  loading?: boolean
  onAddSelection: (materialId: string, roomName?: string) => Promise<void>
  onUpdateSelection: (id: string, updates: Partial<ProjectMaterialSelection>) => Promise<void>
  onDeleteSelection: (id: string) => Promise<void>
  className?: string
}

export function ProjectMaterialSelector({
  projectId,
  selections,
  materials,
  loading = false,
  onAddSelection,
  onUpdateSelection,
  onDeleteSelection,
  className,
}: ProjectMaterialSelectorProps) {
  const [detailMaterial, setDetailMaterial] = React.useState<Material | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([])

  const selectedMaterialIds = selections.map((s) => s.materialId)

  // Calculate totals
  const totalCost = React.useMemo(() => {
    return selections.reduce((sum, sel) => {
      const mat = sel.material || materials.find((m) => m.id === sel.materialId)
      if (!mat || !sel.quantity || !mat.pricePerUnit) return sum
      return sum + sel.quantity * mat.pricePerUnit
    }, 0)
  }, [selections, materials])

  const handleMaterialSelect = async (material: Material) => {
    if (selectedMaterialIds.includes(material.id)) {
      toast.info("Material already added", {
        description: `${material.productName} is already in your selections`,
      })
      return
    }

    try {
      await onAddSelection(material.id)
      toast.success("Material added", {
        description: `${material.productName} has been added to your project`,
      })
    } catch (error) {
      toast.error("Failed to add material", {
        description: "Please try again",
      })
    }
  }

  const handleMaterialFavorite = (material: Material) => {
    setFavoriteIds((prev) =>
      prev.includes(material.id)
        ? prev.filter((id) => id !== material.id)
        : [...prev, material.id]
    )
  }

  const handleViewMaterial = (material: Material) => {
    setDetailMaterial(material)
    setDetailOpen(true)
  }

  const handleUpdateSelection = async (id: string, updates: Partial<ProjectMaterialSelection>) => {
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
      toast.success("Material removed from project")
    } catch (error) {
      toast.error("Failed to remove material", {
        description: "Please try again",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Group selections by room
  const selectionsByRoom = React.useMemo(() => {
    const grouped: Record<string, (ProjectMaterialSelection & { material?: Material })[]> = {}
    
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
          <h2 className="text-2xl font-bold tracking-tight">Materials</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">
              {selections.length} material{selections.length !== 1 ? "s" : ""} selected
            </p>
            {totalCost > 0 && (
              <Badge variant="outline" className="font-semibold">
                Total: {formatCurrency(totalCost)}
              </Badge>
            )}
          </div>
        </div>
        <MaterialLibrarySheet
          materials={materials}
          loading={loading}
          selectedMaterialIds={selectedMaterialIds}
          favoriteMaterialIds={favoriteIds}
          onMaterialSelect={handleMaterialSelect}
          onMaterialFavorite={handleMaterialFavorite}
          onMaterialInfo={handleViewMaterial}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Material
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
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No materials selected</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Start building your material list by adding items from the
              material library.
            </p>
            <MaterialLibrarySheet
              materials={materials}
              selectedMaterialIds={selectedMaterialIds}
              favoriteMaterialIds={favoriteIds}
              onMaterialSelect={handleMaterialSelect}
              onMaterialFavorite={handleMaterialFavorite}
              onMaterialInfo={handleViewMaterial}
              trigger={
                <Button className="gap-2">
                  <Package className="h-4 w-4" />
                  Browse Material Library
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

                // Calculate room total
                const roomTotal = selectionsByRoom[room].reduce((sum, sel) => {
                  const mat = sel.material || materials.find((m) => m.id === sel.materialId)
                  if (!mat || !sel.quantity || !mat.pricePerUnit) return sum
                  return sum + sel.quantity * mat.pricePerUnit
                }, 0)

                return (
                  <div key={room} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          {roomLabel}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {selectionsByRoom[room].length}
                        </Badge>
                      </div>
                      {roomTotal > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(roomTotal)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {selectionsByRoom[room].map((selection) => (
                        <MaterialSelectionCard
                          key={selection.id}
                          selection={selection}
                          onUpdate={handleUpdateSelection}
                          onDelete={handleDeleteSelection}
                          onViewMaterial={handleViewMaterial}
                          materials={materials}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </ScrollArea>
      )}

      {/* Material detail dialog */}
      <MaterialDetailDialog
        material={detailMaterial}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSelect={handleMaterialSelect}
        onFavorite={handleMaterialFavorite}
        isFavorite={detailMaterial ? favoriteIds.includes(detailMaterial.id) : false}
        isSelected={detailMaterial ? selectedMaterialIds.includes(detailMaterial.id) : false}
      />
    </div>
  )
}

