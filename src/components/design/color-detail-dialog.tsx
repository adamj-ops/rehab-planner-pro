"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, ExternalLink, Heart, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Color } from "@/types/design"

interface ColorDetailDialogProps {
  color: Color | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (color: Color) => void
  onFavorite?: (color: Color) => void
  isFavorite?: boolean
  isSelected?: boolean
}

export function ColorDetailDialog({
  color,
  open,
  onOpenChange,
  onSelect,
  onFavorite,
  isFavorite = false,
  isSelected = false,
}: ColorDetailDialogProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  if (!color) return null

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      toast.success("Copied to clipboard", { description: value })
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
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

  const colorValues = [
    { label: "HEX", value: color.hexCode },
    { label: "RGB", value: color.rgb || `rgb(${parseInt(color.hexCode.slice(1, 3), 16)}, ${parseInt(color.hexCode.slice(3, 5), 16)}, ${parseInt(color.hexCode.slice(5, 7), 16)})` },
    { label: "Code", value: color.colorCode },
    ...(color.lrv ? [{ label: "LRV", value: color.lrv.toString() }] : []),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{color.colorName}</DialogTitle>
          <DialogDescription>
            Sherwin Williams {color.colorCode}
          </DialogDescription>
        </DialogHeader>

        {/* Large color preview */}
        <div
          className={cn(
            "relative w-full h-40 rounded-lg flex items-end justify-between p-4",
            contrastClass
          )}
          style={{ backgroundColor: color.hexCode }}
        >
          <div>
            <p className="font-medium text-lg">{color.colorName}</p>
            <p className="text-sm opacity-80">{color.hexCode}</p>
          </div>
          {color.popular && (
            <Badge className={cn("bg-white/20 backdrop-blur-sm", contrastClass)}>
              Popular
            </Badge>
          )}
        </div>

        {/* Color values */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Color Values</h4>
          <div className="grid grid-cols-2 gap-2">
            {colorValues.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => copyToClipboard(value, label)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md",
                  "bg-muted hover:bg-muted/80 transition-colors",
                  "text-left group"
                )}
              >
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-mono">{value}</p>
                </div>
                {copiedField === label ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Color family and info */}
        {(color.colorFamily || color.undertone || color.roomRecommendations?.length) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Color Information</h4>
              <div className="space-y-2">
                {color.colorFamily && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Color Family</span>
                    <Badge variant="secondary" className="capitalize">
                      {color.colorFamily}
                    </Badge>
                  </div>
                )}
                {color.undertone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Undertone</span>
                    <Badge variant="outline" className="capitalize">
                      {color.undertone}
                    </Badge>
                  </div>
                )}
                {color.lrv && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Light Reflectance</span>
                    <span className="text-sm font-medium">{color.lrv}%</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Room recommendations */}
        {color.roomRecommendations && color.roomRecommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recommended For</h4>
              <div className="flex flex-wrap gap-1">
                {color.roomRecommendations.map((room) => (
                  <Badge key={room} variant="outline" className="capitalize">
                    {room.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex items-center gap-2">
          {onSelect && (
            <Button
              className="flex-1"
              onClick={() => {
                onSelect(color)
                onOpenChange(false)
              }}
              variant={isSelected ? "secondary" : "default"}
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Project
                </>
              )}
            </Button>
          )}
          {onFavorite && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFavorite(color)}
              className={cn(isFavorite && "text-red-500")}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          )}
          {color.sourceUrl && (
            <Button variant="outline" size="icon" asChild>
              <a href={color.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

