"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MoodboardElement as MoodboardElementType, Color, Material } from "@/types/design"

interface MoodboardElementProps {
  element: MoodboardElementType
  color?: Color
  material?: Material
  isSelected?: boolean
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<MoodboardElementType>) => void
  onDelete?: (id: string) => void
  onDuplicate?: (element: MoodboardElementType) => void
  className?: string
}

export function MoodboardElement({
  element,
  color,
  material,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  className,
}: MoodboardElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    disabled: element.isLocked,
  })

  const style: React.CSSProperties = {
    position: "absolute",
    left: element.positionX,
    top: element.positionY,
    width: element.width,
    height: element.height,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : element.zIndex,
    opacity: element.isVisible ? element.opacity : 0.3,
    borderRadius: element.borderRadius,
    border: element.borderWidth
      ? `${element.borderWidth}px solid ${element.borderColor || "transparent"}`
      : undefined,
    boxShadow: element.shadowEnabled && element.shadowConfig
      ? `${element.shadowConfig.offsetX}px ${element.shadowConfig.offsetY}px ${element.shadowConfig.blur}px ${element.shadowConfig.spread}px ${element.shadowConfig.color}`
      : undefined,
    rotate: `${element.rotation}deg`,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(element.id)
  }

  const handleToggleLock = () => {
    onUpdate?.(element.id, { isLocked: !element.isLocked })
  }

  const handleToggleVisibility = () => {
    onUpdate?.(element.id, { isVisible: !element.isVisible })
  }

  // Render content based on element type
  const renderContent = () => {
    switch (element.elementType) {
      case "image":
        return element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Moodboard image"
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )

      case "color_swatch":
        return (
          <div
            className="w-full h-full flex flex-col"
            style={{ backgroundColor: color?.hexCode || "#CCCCCC" }}
          >
            {element.showColorName && color && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs text-center">
                {color.colorName}
              </div>
            )}
            {element.showColorCode && color && (
              <div className="absolute top-0 left-0 bg-black/50 text-white px-1 py-0.5 text-xs font-mono">
                {color.hexCode}
              </div>
            )}
          </div>
        )

      case "material_sample":
        return material?.imageUrl ? (
          <div className="w-full h-full relative">
            <img
              src={material.imageUrl}
              alt={material.productName}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {element.showMaterialName && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs text-center">
                {material.productName}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No material
          </div>
        )

      case "text":
        return (
          <div
            className="w-full h-full p-2 overflow-hidden"
            style={{
              fontFamily: element.fontFamily,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              color: element.textColor,
              textAlign: element.textAlign,
              lineHeight: element.lineHeight,
            }}
          >
            {element.textContent || "Double-click to edit"}
          </div>
        )

      case "shape":
        if (element.shapeType === "circle") {
          return (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: element.fillColor || "transparent",
                border: element.strokeWidth
                  ? `${element.strokeWidth}px solid ${element.strokeColor || "#000"}`
                  : undefined,
              }}
            />
          )
        }
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.fillColor || "transparent",
              border: element.strokeWidth
                ? `${element.strokeWidth}px solid ${element.strokeColor || "#000"}`
                : undefined,
            }}
          />
        )

      default:
        return (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            Unknown element
          </div>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-pointer overflow-hidden",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isDragging && "opacity-50 cursor-grabbing",
        element.isLocked && "cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      {...attributes}
    >
      {/* Content */}
      {renderContent()}

      {/* Controls overlay - visible on hover or when selected */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Resize handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full pointer-events-auto cursor-nwse-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full pointer-events-auto cursor-nesw-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full pointer-events-auto cursor-nesw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full pointer-events-auto cursor-nwse-resize" />
        </div>
      )}

      {/* Drag handle and menu - visible on hover */}
      <div
        className={cn(
          "absolute top-1 right-1 flex items-center gap-1",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
      >
        {!element.isLocked && (
          <button
            {...listeners}
            className="p-1 rounded bg-black/50 text-white hover:bg-black/70 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded bg-black/50 text-white hover:bg-black/70">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleToggleLock}>
              {element.isLocked ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleVisibility}>
              {element.isVisible ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show
                </>
              )}
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(element)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(element.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lock indicator */}
      {element.isLocked && (
        <div className="absolute bottom-1 left-1">
          <Lock className="h-3 w-3 text-white drop-shadow-md" />
        </div>
      )}
    </div>
  )
}

