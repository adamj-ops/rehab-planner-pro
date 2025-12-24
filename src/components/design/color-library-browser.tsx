"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Filter, X, Loader2, Palette, Star } from "lucide-react"
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
import { ColorSwatchGrid } from "./color-swatch"
import type { Color } from "@/types/design"

// Color families for filtering
const COLOR_FAMILIES = [
  { value: "all", label: "All Colors" },
  { value: "neutral", label: "Neutrals" },
  { value: "white", label: "Whites" },
  { value: "gray", label: "Grays" },
  { value: "beige", label: "Beiges" },
  { value: "brown", label: "Browns" },
  { value: "red", label: "Reds" },
  { value: "orange", label: "Oranges" },
  { value: "yellow", label: "Yellows" },
  { value: "green", label: "Greens" },
  { value: "blue", label: "Blues" },
  { value: "purple", label: "Purples" },
  { value: "pink", label: "Pinks" },
]

// Rooms for filtering
const ROOM_TYPES = [
  { value: "all", label: "All Rooms" },
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "dining-room", label: "Dining Room" },
  { value: "office", label: "Home Office" },
  { value: "exterior", label: "Exterior" },
]

interface ColorLibraryBrowserProps {
  colors: Color[]
  loading?: boolean
  selectedColorIds?: string[]
  favoriteColorIds?: string[]
  onColorSelect?: (color: Color) => void
  onColorFavorite?: (color: Color) => void
  onColorInfo?: (color: Color) => void
  maxSelections?: number
  className?: string
}

export function ColorLibraryBrowser({
  colors,
  loading = false,
  selectedColorIds = [],
  favoriteColorIds = [],
  onColorSelect,
  onColorFavorite,
  onColorInfo,
  maxSelections,
  className,
}: ColorLibraryBrowserProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFamily, setSelectedFamily] = React.useState("all")
  const [selectedRoom, setSelectedRoom] = React.useState("all")
  const [viewMode, setViewMode] = React.useState<"all" | "popular" | "favorites">("all")
  const [sortBy, setSortBy] = React.useState<"name" | "family" | "lrv">("name")

  // Filter and sort colors
  const filteredColors = React.useMemo(() => {
    let result = [...colors]

    // Filter by view mode
    if (viewMode === "popular") {
      result = result.filter((c) => c.popular)
    } else if (viewMode === "favorites") {
      result = result.filter((c) => favoriteColorIds.includes(c.id))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.colorName.toLowerCase().includes(query) ||
          c.colorCode.toLowerCase().includes(query) ||
          c.hexCode.toLowerCase().includes(query)
      )
    }

    // Filter by color family
    if (selectedFamily !== "all") {
      result = result.filter((c) => c.colorFamily === selectedFamily)
    }

    // Filter by room (if room recommendations exist)
    if (selectedRoom !== "all") {
      result = result.filter((c) => 
        c.roomRecommendations?.includes(selectedRoom)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.colorName.localeCompare(b.colorName)
        case "family":
          return (a.colorFamily || "").localeCompare(b.colorFamily || "")
        case "lrv":
          return (b.lrv || 0) - (a.lrv || 0)
        default:
          return 0
      }
    })

    return result
  }, [colors, viewMode, searchQuery, selectedFamily, selectedRoom, sortBy, favoriteColorIds])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedFamily("all")
    setSelectedRoom("all")
    setViewMode("all")
  }

  const hasActiveFilters =
    searchQuery || selectedFamily !== "all" || selectedRoom !== "all" || viewMode !== "all"

  const selectionInfo = maxSelections
    ? `${selectedColorIds.length}/${maxSelections} selected`
    : `${selectedColorIds.length} selected`

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with search and filters */}
      <div className="flex-shrink-0 space-y-4 pb-4 border-b">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search colors by name or code..."
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
              <Palette className="h-4 w-4" />
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
          <Select value={selectedFamily} onValueChange={setSelectedFamily}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Color family" />
            </SelectTrigger>
            <SelectContent>
              {COLOR_FAMILIES.map((family) => (
                <SelectItem key={family.value} value={family.value}>
                  {family.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Room type" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((room) => (
                <SelectItem key={room.value} value={room.value}>
                  {room.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="family">By Family</SelectItem>
              <SelectItem value="lrv">By LRV</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Selection info and active filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredColors.length} colors</Badge>
            {selectedColorIds.length > 0 && (
              <Badge variant="outline">{selectionInfo}</Badge>
            )}
          </div>

          {/* Active filter badges */}
          <div className="flex flex-wrap gap-1">
            {selectedFamily !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {COLOR_FAMILIES.find((f) => f.value === selectedFamily)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedFamily("all")}
                />
              </Badge>
            )}
            {selectedRoom !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {ROOM_TYPES.find((r) => r.value === selectedRoom)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedRoom("all")}
                />
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Color grid */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredColors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No colors found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "No colors available in the library"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="py-4">
            <ColorSwatchGrid
              colors={filteredColors}
              selectedIds={selectedColorIds}
              favoriteIds={favoriteColorIds}
              onSelect={onColorSelect}
              onFavorite={onColorFavorite}
              onInfo={onColorInfo}
              size="lg"
              shape="rounded"
              showNames
              showCodes
              showActions
              columns={6}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Sheet wrapper for mobile-friendly color library access
interface ColorLibrarySheetProps extends ColorLibraryBrowserProps {
  trigger?: React.ReactNode
  title?: string
  description?: string
}

export function ColorLibrarySheet({
  trigger,
  title = "Color Library",
  description = "Browse and select colors from the Sherwin Williams collection",
  ...browserProps
}: ColorLibrarySheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Browse Colors
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 h-[calc(100vh-10rem)]">
          <ColorLibraryBrowser {...browserProps} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

