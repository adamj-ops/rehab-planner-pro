"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Copy, Heart, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import type { Color } from "@/types/design"

interface ColorSwatchProps {
  color: Color
  size?: "sm" | "md" | "lg" | "xl"
  shape?: "square" | "rounded" | "circle"
  selected?: boolean
  showName?: boolean
  showCode?: boolean
  showActions?: boolean
  isFavorite?: boolean
  onSelect?: (color: Color) => void
  onFavorite?: (color: Color) => void
  onInfo?: (color: Color) => void
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
}

const shapeClasses = {
  square: "rounded-none",
  rounded: "rounded-md",
  circle: "rounded-full",
}

export function ColorSwatch({
  color,
  size = "md",
  shape = "rounded",
  selected = false,
  showName = false,
  showCode = false,
  showActions = false,
  isFavorite = false,
  onSelect,
  onFavorite,
  onInfo,
  className,
}: ColorSwatchProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(color.hexCode)
      setCopied(true)
      toast.success("Color copied!", {
        description: `${color.colorName} (${color.hexCode})`,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy color code")
    }
  }

  const handleClick = () => {
    onSelect?.(color)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite?.(color)
  }

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInfo?.(color)
  }

  // Calculate text color based on luminance
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return 0.299 * r + 0.587 * g + 0.114 * b
  }

  const isLightColor = getLuminance(color.hexCode) > 0.5
  const contrastClass = isLightColor ? "text-black" : "text-white"

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={cn(
                "relative transition-all duration-200 group",
                "border-2 shadow-sm hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                sizeClasses[size],
                shapeClasses[shape],
                selected
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-transparent hover:border-muted-foreground/30",
                onSelect && "cursor-pointer"
              )}
              style={{ backgroundColor: color.hexCode }}
              aria-label={`${color.colorName} - ${color.hexCode}`}
            >
              {/* Selected checkmark */}
              {selected && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    contrastClass
                  )}
                >
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Hover actions */}
              {showActions && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center gap-1",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "bg-black/20"
                  )}
                >
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "p-1 rounded-full bg-white/80 hover:bg-white transition-colors",
                      "text-black"
                    )}
                    aria-label="Copy color code"
                  >
                    {copied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  {onFavorite && (
                    <button
                      onClick={handleFavorite}
                      className={cn(
                        "p-1 rounded-full bg-white/80 hover:bg-white transition-colors",
                        isFavorite ? "text-red-500" : "text-black"
                      )}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart
                        className={cn("w-3 h-3", isFavorite && "fill-current")}
                      />
                    </button>
                  )}
                  {onInfo && (
                    <button
                      onClick={handleInfo}
                      className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors text-black"
                      aria-label="View color details"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-center">
            <p className="font-medium">{color.colorName}</p>
            <p className="text-xs text-muted-foreground">
              {color.colorCode} • {color.hexCode}
            </p>
            {color.colorFamily && (
              <p className="text-xs text-muted-foreground capitalize">
                {color.colorFamily}
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Color name and code labels */}
        {(showName || showCode) && (
          <div className="text-center max-w-full">
            {showName && (
              <p className="text-xs font-medium truncate" title={color.colorName}>
                {color.colorName}
              </p>
            )}
            {showCode && (
              <p className="text-xs text-muted-foreground">
                {color.colorCode}
              </p>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Grid of color swatches
interface ColorSwatchGridProps {
  colors: Color[]
  selectedIds?: string[]
  onSelect?: (color: Color) => void
  onFavorite?: (color: Color) => void
  onInfo?: (color: Color) => void
  favoriteIds?: string[]
  size?: ColorSwatchProps["size"]
  shape?: ColorSwatchProps["shape"]
  showNames?: boolean
  showCodes?: boolean
  showActions?: boolean
  columns?: 4 | 5 | 6 | 8 | 10 | 12
  className?: string
}

const columnClasses = {
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  8: "grid-cols-8",
  10: "grid-cols-10",
  12: "grid-cols-12",
}

export function ColorSwatchGrid({
  colors,
  selectedIds = [],
  onSelect,
  onFavorite,
  onInfo,
  favoriteIds = [],
  size = "md",
  shape = "rounded",
  showNames = false,
  showCodes = false,
  showActions = true,
  columns = 6,
  className,
}: ColorSwatchGridProps) {
  return (
    <div className={cn("grid gap-3", columnClasses[columns], className)}>
      {colors.map((color) => (
        <ColorSwatch
          key={color.id}
          color={color}
          size={size}
          shape={shape}
          selected={selectedIds.includes(color.id)}
          showName={showNames}
          showCode={showCodes}
          showActions={showActions}
          isFavorite={favoriteIds.includes(color.id)}
          onSelect={onSelect}
          onFavorite={onFavorite}
          onInfo={onInfo}
        />
      ))}
    </div>
  )
}

