"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Copy, ExternalLink, Heart, Info, Ruler, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import type { Material } from "@/types/design"

interface MaterialCardProps {
  material: Material
  selected?: boolean
  isFavorite?: boolean
  showDetails?: boolean
  onSelect?: (material: Material) => void
  onFavorite?: (material: Material) => void
  onInfo?: (material: Material) => void
  className?: string
}

export function MaterialCard({
  material,
  selected = false,
  isFavorite = false,
  showDetails = true,
  onSelect,
  onFavorite,
  onInfo,
  className,
}: MaterialCardProps) {
  const handleClick = () => {
    onSelect?.(material)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite?.(material)
  }

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInfo?.(material)
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

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-200 cursor-pointer",
          "hover:shadow-md hover:border-muted-foreground/30",
          selected && "ring-2 ring-primary border-primary",
          className
        )}
        onClick={handleClick}
      >
        {/* Material image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {material.imageUrl ? (
            <img
              src={material.imageUrl}
              alt={material.productName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ruler className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Overlay actions */}
          <div
            className={cn(
              "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors",
              "flex items-start justify-end p-2 gap-1"
            )}
          >
            {onFavorite && (
              <button
                onClick={handleFavorite}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  "opacity-0 group-hover:opacity-100",
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/80 hover:bg-white text-black"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={cn("w-4 h-4", isFavorite && "fill-current")}
                />
              </button>
            )}
            {onInfo && (
              <button
                onClick={handleInfo}
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-all"
                aria-label="View material details"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selected indicator */}
          {selected && (
            <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground">
              <Check className="w-4 h-4" />
            </div>
          )}

          {/* Category badge */}
          {material.category && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 left-2 text-xs capitalize"
            >
              {material.category}
            </Badge>
          )}
        </div>

        {/* Material info */}
        {showDetails && (
          <CardContent className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate" title={material.productName}>
                  {material.productName}
                </h3>
                {material.manufacturer && (
                  <p className="text-xs text-muted-foreground truncate">
                    {material.manufacturer}
                  </p>
                )}
              </div>
              {material.popular && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  Popular
                </Badge>
              )}
            </div>

            {/* Price and dimensions */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {material.pricePerUnit && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatPrice(material.pricePerUnit, material.pricingUnit)}
                </span>
              )}
              {material.dimensions && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {material.dimensions}
                </span>
              )}
            </div>

            {/* Available colors */}
            {material.colorVariants && material.colorVariants.length > 0 && (
              <div className="flex items-center gap-1 pt-1">
                {material.colorVariants.slice(0, 5).map((color, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-4 h-4 rounded-full border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{color}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {material.colorVariants.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{material.colorVariants.length - 5}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  )
}

// Grid of material cards
interface MaterialGridProps {
  materials: Material[]
  selectedIds?: string[]
  favoriteIds?: string[]
  onSelect?: (material: Material) => void
  onFavorite?: (material: Material) => void
  onInfo?: (material: Material) => void
  showDetails?: boolean
  columns?: 2 | 3 | 4 | 5 | 6
  className?: string
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
}

export function MaterialGrid({
  materials,
  selectedIds = [],
  favoriteIds = [],
  onSelect,
  onFavorite,
  onInfo,
  showDetails = true,
  columns = 4,
  className,
}: MaterialGridProps) {
  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          selected={selectedIds.includes(material.id)}
          isFavorite={favoriteIds.includes(material.id)}
          showDetails={showDetails}
          onSelect={onSelect}
          onFavorite={onFavorite}
          onInfo={onInfo}
        />
      ))}
    </div>
  )
}

