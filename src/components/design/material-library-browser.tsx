"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X, Loader2, Package, Star, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MaterialGrid } from "./material-card"
import type { Material } from "@/types/design"

// Material categories
const MATERIAL_CATEGORIES = [
  { value: "all", label: "All Materials" },
  { value: "flooring", label: "Flooring" },
  { value: "tile", label: "Tile" },
  { value: "countertops", label: "Countertops" },
  { value: "cabinets", label: "Cabinets" },
  { value: "lighting", label: "Lighting" },
  { value: "plumbing", label: "Plumbing Fixtures" },
  { value: "hardware", label: "Hardware" },
  { value: "appliances", label: "Appliances" },
  { value: "backsplash", label: "Backsplash" },
  { value: "paint", label: "Paint & Finishes" },
  { value: "windows", label: "Windows & Doors" },
  { value: "roofing", label: "Roofing" },
  { value: "siding", label: "Siding" },
]

// Price ranges
const PRICE_RANGES = [
  { value: "all", label: "All Prices" },
  { value: "budget", label: "Budget ($)" },
  { value: "mid", label: "Mid-Range ($$)" },
  { value: "premium", label: "Premium ($$$)" },
  { value: "luxury", label: "Luxury ($$$$)" },
]

// Quality tiers
const QUALITY_TIERS = [
  { value: "all", label: "All Quality" },
  { value: "builder", label: "Builder Grade" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
]

interface MaterialLibraryBrowserProps {
  materials: Material[]
  loading?: boolean
  selectedMaterialIds?: string[]
  favoriteMaterialIds?: string[]
  onMaterialSelect?: (material: Material) => void
  onMaterialFavorite?: (material: Material) => void
  onMaterialInfo?: (material: Material) => void
  maxSelections?: number
  className?: string
}

export function MaterialLibraryBrowser({
  materials,
  loading = false,
  selectedMaterialIds = [],
  favoriteMaterialIds = [],
  onMaterialSelect,
  onMaterialFavorite,
  onMaterialInfo,
  maxSelections,
  className,
}: MaterialLibraryBrowserProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = React.useState("all")
  const [selectedQuality, setSelectedQuality] = React.useState("all")
  const [viewMode, setViewMode] = React.useState<"all" | "popular" | "favorites">("all")
  const [sortBy, setSortBy] = React.useState<"name" | "price-low" | "price-high" | "category">("name")

  // Filter and sort materials
  const filteredMaterials = React.useMemo(() => {
    let result = [...materials]

    // Filter by view mode
    if (viewMode === "popular") {
      result = result.filter((m) => m.popular)
    } else if (viewMode === "favorites") {
      result = result.filter((m) => favoriteMaterialIds.includes(m.id))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.productName.toLowerCase().includes(query) ||
          m.manufacturer?.toLowerCase().includes(query) ||
          m.modelNumber?.toLowerCase().includes(query) ||
          m.category?.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((m) => m.category === selectedCategory)
    }

    // Filter by price range
    if (selectedPriceRange !== "all") {
      result = result.filter((m) => {
        if (!m.pricePerUnit) return false
        const price = m.pricePerUnit
        switch (selectedPriceRange) {
          case "budget":
            return price < 10
          case "mid":
            return price >= 10 && price < 50
          case "premium":
            return price >= 50 && price < 150
          case "luxury":
            return price >= 150
          default:
            return true
        }
      })
    }

    // Filter by quality tier
    if (selectedQuality !== "all") {
      result = result.filter((m) => m.qualityTier === selectedQuality)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.productName.localeCompare(b.productName)
        case "price-low":
          return (a.pricePerUnit || 0) - (b.pricePerUnit || 0)
        case "price-high":
          return (b.pricePerUnit || 0) - (a.pricePerUnit || 0)
        case "category":
          return (a.category || "").localeCompare(b.category || "")
        default:
          return 0
      }
    })

    return result
  }, [materials, viewMode, searchQuery, selectedCategory, selectedPriceRange, selectedQuality, sortBy, favoriteMaterialIds])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedPriceRange("all")
    setSelectedQuality("all")
    setViewMode("all")
  }

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedPriceRange !== "all" ||
    selectedQuality !== "all" ||
    viewMode !== "all"

  const selectionInfo = maxSelections
    ? `${selectedMaterialIds.length}/${maxSelections} selected`
    : `${selectedMaterialIds.length} selected`

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with search and filters */}
      <div className="flex-shrink-0 space-y-4 pb-4 border-b">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials by name, manufacturer, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View mode tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Package className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-2">
              <Star className="h-4 w-4" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Star className="h-4 w-4 fill-current" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedQuality} onValueChange={setSelectedQuality}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_TIERS.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Selection info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredMaterials.length} materials</Badge>
            {selectedMaterialIds.length > 0 && (
              <Badge variant="outline">{selectionInfo}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Material grid */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No materials found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "No materials available in the library"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="py-4">
            <MaterialGrid
              materials={filteredMaterials}
              selectedIds={selectedMaterialIds}
              favoriteIds={favoriteMaterialIds}
              onSelect={onMaterialSelect}
              onFavorite={onMaterialFavorite}
              onInfo={onMaterialInfo}
              columns={4}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Sheet wrapper for mobile-friendly material library access
interface MaterialLibrarySheetProps extends MaterialLibraryBrowserProps {
  trigger?: React.ReactNode
  title?: string
  description?: string
}

export function MaterialLibrarySheet({
  trigger,
  title = "Material Library",
  description = "Browse and select materials for your project",
  ...browserProps
}: MaterialLibrarySheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            Browse Materials
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 h-[calc(100vh-10rem)]">
          <MaterialLibraryBrowser {...browserProps} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

