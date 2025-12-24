"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Move,
  Maximize2,
  RotateCw,
  Palette,
  Type,
  Image as ImageIcon,
  Eye,
  Lock,
  Layers,
  ChevronDown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
import type { MoodboardElement, Color, Material } from "@/types/design"

interface PropertySectionProps {
  title: string
  icon?: React.ElementType
  defaultOpen?: boolean
  children: React.ReactNode
}

function PropertySection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: PropertySectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 hover:bg-muted/50 rounded-md transition-colors">
        <div className="flex items-center gap-2 text-sm font-medium">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 pt-1 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface MoodboardElementInspectorProps {
  element: MoodboardElement | null
  color?: Color | null
  material?: Material | null
  colors?: Color[]
  materials?: Material[]
  onUpdate?: (updates: Partial<MoodboardElement>) => void
  className?: string
}

export function MoodboardElementInspector({
  element,
  color,
  material,
  colors = [],
  materials = [],
  onUpdate,
  className,
}: MoodboardElementInspectorProps) {
  if (!element) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full p-6 text-center", className)}>
        <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Select an element to view and edit its properties
        </p>
      </div>
    )
  }

  const handleNumberChange = (field: keyof MoodboardElement, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      onUpdate?.({ [field]: numValue })
    }
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-1 p-2">
        {/* Position & Size */}
        <PropertySection title="Position & Size" icon={Move}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(element.positionX)}
                onChange={(e) => handleNumberChange("positionX", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(element.positionY)}
                onChange={(e) => handleNumberChange("positionY", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handleNumberChange("width", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handleNumberChange("height", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Rotation</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[element.rotation]}
                onValueChange={([v]) => onUpdate?.({ rotation: v })}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {element.rotation}°
              </span>
            </div>
          </div>
        </PropertySection>

        <Separator />

        {/* Appearance */}
        <PropertySection title="Appearance" icon={Palette}>
          <div className="space-y-2">
            <Label className="text-xs">Opacity</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[element.opacity * 100]}
                onValueChange={([v]) => onUpdate?.({ opacity: v / 100 })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {Math.round(element.opacity * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Border Radius</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[element.borderRadius]}
                onValueChange={([v]) => onUpdate?.({ borderRadius: v })}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {element.borderRadius}px
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Border Width</Label>
              <Input
                type="number"
                value={element.borderWidth}
                onChange={(e) => handleNumberChange("borderWidth", e.target.value)}
                min={0}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Border Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.borderColor || "#000000"}
                  onChange={(e) => onUpdate?.({ borderColor: e.target.value })}
                  className="h-8 w-8 rounded border cursor-pointer"
                />
                <Input
                  value={element.borderColor || ""}
                  onChange={(e) => onUpdate?.({ borderColor: e.target.value })}
                  placeholder="#000000"
                  className="h-8 flex-1"
                />
              </div>
            </div>
          </div>
        </PropertySection>

        <Separator />

        {/* Type-specific properties */}
        {element.elementType === "text" && (
          <>
            <PropertySection title="Text" icon={Type}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Content</Label>
                  <Textarea
                    value={element.textContent || ""}
                    onChange={(e) => onUpdate?.({ textContent: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Font Size</Label>
                    <Input
                      type="number"
                      value={element.fontSize}
                      onChange={(e) => handleNumberChange("fontSize", e.target.value)}
                      min={8}
                      max={200}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Font Weight</Label>
                    <Select
                      value={element.fontWeight}
                      onValueChange={(v) => onUpdate?.({ fontWeight: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="semibold">Semibold</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={element.textColor || "#000000"}
                      onChange={(e) => onUpdate?.({ textColor: e.target.value })}
                      className="h-8 w-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={element.textColor || ""}
                      onChange={(e) => onUpdate?.({ textColor: e.target.value })}
                      className="h-8 flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Text Align</Label>
                  <Select
                    value={element.textAlign}
                    onValueChange={(v) => onUpdate?.({ textAlign: v as "left" | "center" | "right" | "justify" })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PropertySection>
            <Separator />
          </>
        )}

        {element.elementType === "color_swatch" && (
          <>
            <PropertySection title="Color Swatch" icon={Palette}>
              <div className="space-y-3">
                {color && (
                  <div className="flex items-center gap-3 p-2 rounded-md bg-muted">
                    <div
                      className="w-10 h-10 rounded-md border shadow-sm"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <div>
                      <p className="text-sm font-medium">{color.colorName}</p>
                      <p className="text-xs text-muted-foreground">{color.hexCode}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">Select Color</Label>
                  <Select
                    value={element.colorId || ""}
                    onValueChange={(v) => onUpdate?.({ colorId: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Choose a color" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {colors.slice(0, 50).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: c.hexCode }}
                            />
                            {c.colorName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Swatch Shape</Label>
                  <Select
                    value={element.swatchShape}
                    onValueChange={(v) => onUpdate?.({ swatchShape: v as "square" | "circle" | "rounded" })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Color Name</Label>
                  <Switch
                    checked={element.showColorName}
                    onCheckedChange={(v) => onUpdate?.({ showColorName: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Color Code</Label>
                  <Switch
                    checked={element.showColorCode}
                    onCheckedChange={(v) => onUpdate?.({ showColorCode: v })}
                  />
                </div>
              </div>
            </PropertySection>
            <Separator />
          </>
        )}

        {element.elementType === "image" && (
          <>
            <PropertySection title="Image" icon={ImageIcon}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    value={element.imageUrl || ""}
                    onChange={(e) => onUpdate?.({ imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="h-8"
                  />
                </div>

                {element.imageUrl && (
                  <div className="aspect-video rounded-md overflow-hidden bg-muted">
                    <img
                      src={element.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </PropertySection>
            <Separator />
          </>
        )}

        {/* Layer controls */}
        <PropertySection title="Layer" icon={Layers}>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Z-Index</Label>
              <Input
                type="number"
                value={element.zIndex}
                onChange={(e) => handleNumberChange("zIndex", e.target.value)}
                min={0}
                className="h-8"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Lock className="h-3 w-3" />
                Lock Element
              </Label>
              <Switch
                checked={element.isLocked}
                onCheckedChange={(v) => onUpdate?.({ isLocked: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Visible
              </Label>
              <Switch
                checked={element.isVisible}
                onCheckedChange={(v) => onUpdate?.({ isVisible: v })}
              />
            </div>
          </div>
        </PropertySection>

        <Separator />

        {/* Notes */}
        <PropertySection title="Notes" defaultOpen={false}>
          <div className="space-y-1">
            <Textarea
              value={element.notes || ""}
              onChange={(e) => onUpdate?.({ notes: e.target.value })}
              placeholder="Add notes about this element..."
              rows={3}
            />
          </div>
        </PropertySection>
      </div>
    </ScrollArea>
  )
}

