"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  MousePointer2,
  Hand,
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Palette,
  Package,
  Layers,
  Settings,
  Trash2,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Distribute,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toggle } from "@/components/ui/toggle"
import type { MoodboardElement } from "@/types/design"

type Tool = "select" | "pan" | "image" | "text" | "rectangle" | "circle" | "line" | "arrow" | "color" | "material"

interface MoodboardToolbarProps {
  activeTool?: Tool
  selectedElements?: MoodboardElement[]
  canUndo?: boolean
  canRedo?: boolean
  onToolChange?: (tool: Tool) => void
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onAlignLeft?: () => void
  onAlignCenter?: () => void
  onAlignRight?: () => void
  onAlignTop?: () => void
  onAlignMiddle?: () => void
  onAlignBottom?: () => void
  onDistributeHorizontal?: () => void
  onDistributeVertical?: () => void
  onBringForward?: () => void
  onSendBackward?: () => void
  onBringToFront?: () => void
  onSendToBack?: () => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function MoodboardToolbar({
  activeTool = "select",
  selectedElements = [],
  canUndo = false,
  canRedo = false,
  onToolChange,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onCopy,
  onPaste,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  orientation = "vertical",
  className,
}: MoodboardToolbarProps) {
  const hasSelection = selectedElements.length > 0
  const hasMultipleSelection = selectedElements.length > 1

  const tools: { tool: Tool; icon: React.ElementType; label: string }[] = [
    { tool: "select", icon: MousePointer2, label: "Select" },
    { tool: "pan", icon: Hand, label: "Pan" },
    { tool: "image", icon: ImageIcon, label: "Add Image" },
    { tool: "color", icon: Palette, label: "Add Color Swatch" },
    { tool: "material", icon: Package, label: "Add Material" },
    { tool: "text", icon: Type, label: "Add Text" },
    { tool: "rectangle", icon: Square, label: "Rectangle" },
    { tool: "circle", icon: Circle, label: "Circle" },
  ]

  const isVertical = orientation === "vertical"

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex gap-1 p-2 bg-background border rounded-lg shadow-sm",
          isVertical ? "flex-col" : "flex-row",
          className
        )}
      >
        {/* Tool selection */}
        {tools.map(({ tool, icon: Icon, label }) => (
          <Tooltip key={tool}>
            <TooltipTrigger asChild>
              <Toggle
                pressed={activeTool === tool}
                onPressedChange={() => onToolChange?.(tool)}
                className="h-9 w-9 p-0"
              >
                <Icon className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side={isVertical ? "right" : "bottom"}>
              {label}
            </TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation={isVertical ? "horizontal" : "vertical"} className={isVertical ? "my-2" : "mx-2"} />

        {/* History */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={!canUndo}
              onClick={onUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={!canRedo}
              onClick={onRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Redo</TooltipContent>
        </Tooltip>

        <Separator orientation={isVertical ? "horizontal" : "vertical"} className={isVertical ? "my-2" : "mx-2"} />

        {/* Clipboard */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={!hasSelection}
              onClick={onCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onPaste}
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Paste</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={!hasSelection}
              onClick={onDuplicate}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Duplicate</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              disabled={!hasSelection}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Delete</TooltipContent>
        </Tooltip>

        {/* Alignment - only show when multiple elements selected */}
        {hasMultipleSelection && (
          <>
            <Separator orientation={isVertical ? "horizontal" : "vertical"} className={isVertical ? "my-2" : "mx-2"} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onAlignLeft}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "bottom"}>Align Left</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onAlignCenter}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "bottom"}>Align Center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onAlignRight}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "bottom"}>Align Right</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onAlignTop}
                >
                  <AlignStartVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "bottom"}>Align Top</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onAlignMiddle}
                >
                  <AlignCenterVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "bottom"}>Align Middle</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onAlignBottom}
                >
                  <AlignEndVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVertical ? "right" : "bottom"}>Align Bottom</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

