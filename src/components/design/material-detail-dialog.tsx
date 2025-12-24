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
import {
  Copy,
  Check,
  ExternalLink,
  Heart,
  Plus,
  DollarSign,
  Ruler,
  Package,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import type { Material } from "@/types/design"

interface MaterialDetailDialogProps {
  material: Material | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (material: Material) => void
  onFavorite?: (material: Material) => void
  isFavorite?: boolean
  isSelected?: boolean
}

export function MaterialDetailDialog({
  material,
  open,
  onOpenChange,
  onSelect,
  onFavorite,
  isFavorite = false,
  isSelected = false,
}: MaterialDetailDialogProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  if (!material) return null

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

  // Format price display
  const formatPrice = (price: number | null, unit: string | null) => {
    if (!price) return null
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    })
    return `${formatter.format(price)}${unit ? `/${unit}` : ""}`
  }

  const priceDisplay = formatPrice(material.pricePerUnit, material.pricingUnit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{material.productName}</DialogTitle>
          <DialogDescription>
            {material.manufacturer && `${material.manufacturer} • `}
            {material.modelNumber || "Material details"}
          </DialogDescription>
        </DialogHeader>

        {/* Material image */}
        <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-muted">
          {material.imageUrl ? (
            <img
              src={material.imageUrl}
              alt={material.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex gap-2">
            {material.popular && (
              <Badge className="bg-yellow-500/90 text-white border-0">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Popular
              </Badge>
            )}
            {material.category && (
              <Badge variant="secondary" className="capitalize">
                {material.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Price and basic info */}
        <div className="grid grid-cols-2 gap-3">
          {priceDisplay && (
            <div className="p-3 rounded-md bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Price</span>
              </div>
              <p className="font-semibold">{priceDisplay}</p>
            </div>
          )}

          {material.dimensions && (
            <div className="p-3 rounded-md bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Ruler className="h-4 w-4" />
                <span className="text-xs">Dimensions</span>
              </div>
              <p className="font-semibold">{material.dimensions}</p>
            </div>
          )}

          {material.qualityTier && (
            <div className="p-3 rounded-md bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                <span className="text-xs">Quality Tier</span>
              </div>
              <p className="font-semibold capitalize">{material.qualityTier}</p>
            </div>
          )}

          {material.modelNumber && (
            <button
              onClick={() => copyToClipboard(material.modelNumber!, "Model")}
              className="p-3 rounded-md bg-muted text-left hover:bg-muted/80 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Model #</span>
                {copiedField === "Model" ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                )}
              </div>
              <p className="font-mono text-sm">{material.modelNumber}</p>
            </button>
          )}
        </div>

        {/* Description */}
        {material.description && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{material.description}</p>
            </div>
          </>
        )}

        {/* Specifications */}
        {material.specifications && Object.keys(material.specifications).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Specifications</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(material.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Color variants */}
        {material.colorVariants && material.colorVariants.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Available Colors</h4>
              <div className="flex flex-wrap gap-2">
                {material.colorVariants.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-md border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Room recommendations */}
        {material.roomRecommendations && material.roomRecommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommended For</h4>
              <div className="flex flex-wrap gap-1">
                {material.roomRecommendations.map((room) => (
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
                onSelect(material)
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
              onClick={() => onFavorite(material)}
              className={cn(isFavorite && "text-red-500")}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          )}
          {material.sourceUrl && (
            <Button variant="outline" size="icon" asChild>
              <a href={material.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

