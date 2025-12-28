"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useFavoriteColors } from "@/hooks/use-favorite-colors";
import { useHydration } from "@/hooks/use-hydration";
import { 
  IconSearch, 
  IconX, 
  IconLayoutGrid, 
  IconLayoutList, 
  IconFilter, 
  IconHeart, 
  IconHeartFilled,
  IconAlertCircle,
  IconPalette,
} from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import { ColorFamilyPills } from "./ColorFamilyPills";
import { ColorWallView } from "./ColorWallView";
import { ColorGridView } from "./ColorGridView";
import { ColorDetailSheet } from "./ColorDetailSheet";
import { FilterSheet } from "./FilterSheet";

import type { Color, ViewMode } from "@/types/color";
import { COLOR_FAMILIES } from "@/types/color";
import type { AddToProjectConfig } from "./AddToProjectDialog";

interface ColorWallProps {
  /** Handler for adding a color to the project with configuration */
  onAddToProject?: (color: Color, config: AddToProjectConfig) => void;
  /** Whether the palette is full (5 colors) */
  isPaletteFull?: boolean;
}

/**
 * ColorWall - Main container for the modernized color library interface
 * 
 * Features:
 * - Dual view modes: Wall (dense spectrum) and Grid (rich cards)
 * - Real-time search with debouncing
 * - Color family filter pills
 * - Design style filters via sheet
 * - Favorites system with localStorage persistence
 * - Color detail sheet with full information
 */
export function ColorWall({ onAddToProject, isPaletteFull = false }: ColorWallProps) {
  // Data state
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("wall");
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Favorites from hook
  const { favorites, toggleFavorite, isFavorite, count: favoritesCount } = useFavoriteColors();
  
  // Hydration state to prevent SSR mismatch with localStorage favorites
  const isHydrated = useHydration();

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch colors from Supabase
  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('color_library')
          .select('*')
          .eq('is_active', true)
          .order('color_family', { ascending: true })
          .order('color_name', { ascending: true });
        
        if (fetchError) throw fetchError;
        setColors(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load colors');
        console.error('Error fetching colors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, []);

  // Filter colors
  const filteredColors = useMemo(() => {
    return colors.filter(color => {
      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesSearch = 
          color.color_name.toLowerCase().includes(query) ||
          (color.color_code?.toLowerCase() || '').includes(query) ||
          color.hex_code.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Family filter
      if (selectedFamily !== "all" && color.color_family !== selectedFamily) {
        return false;
      }

      // Design styles filter
      if (selectedStyles.length > 0) {
        const hasMatchingStyle = selectedStyles.some(style => 
          color.design_styles?.includes(style)
        );
        if (!hasMatchingStyle) return false;
      }

      // Popular filter
      if (showPopularOnly && !color.popular) {
        return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !isFavorite(color.id)) {
        return false;
      }

      return true;
    });
  }, [colors, debouncedSearch, selectedFamily, selectedStyles, showPopularOnly, showFavoritesOnly, isFavorite]);

  // Handle color selection
  const handleSelectColor = useCallback((color: Color) => {
    setSelectedColor(color);
    setDetailSheetOpen(true);
  }, []);

  // Handle add to project
  const handleAddToProject = useCallback((color: Color, config: AddToProjectConfig) => {
    onAddToProject?.(color, config);
    setDetailSheetOpen(false);
  }, [onAddToProject]);

  // Active filter count for badge
  const activeFilterCount = selectedStyles.length + (showPopularOnly ? 1 : 0);

  // Generate descriptive results text with filter context
  const resultsText = useMemo(() => {
    if (loading) return "Loading colors...";
    
    const parts: string[] = [];
    let countText = `${filteredColors.length} ${filteredColors.length === 1 ? 'color' : 'colors'}`;
    
    // Add family context
    if (selectedFamily !== "all") {
      const family = COLOR_FAMILIES.find(f => f.value === selectedFamily);
      countText += ` in ${family?.label || selectedFamily}`;
    }
    parts.push(countText);
    
    // Add active filters
    const filters: string[] = [];
    if (selectedStyles.length > 0) filters.push(selectedStyles.join(', '));
    if (showPopularOnly) filters.push('Popular');
    if (showFavoritesOnly) filters.push('Favorites');
    
    if (filters.length > 0) {
      parts.push(filters.join(' • '));
    }
    
    return parts.join(' • ');
  }, [loading, filteredColors.length, selectedFamily, selectedStyles, showPopularOnly, showFavoritesOnly]);

  // Clear search
  const clearSearch = () => setSearchQuery("");

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full">
        {/* Header - sticky */}
        <div className="sticky top-0 z-20 border-b border-border bg-background">
          <div className="space-y-4 p-4">
            {/* Search + View Toggle + Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search colors by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={clearSearch}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="wall" className="gap-1.5">
                    <IconLayoutList className="h-4 w-4" />
                    <span className="hidden sm:inline">Wall</span>
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="gap-1.5">
                    <IconLayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Filter Sheet Trigger */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterSheetOpen(true)}
                className="relative"
              >
                <IconFilter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -right-2 -top-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Favorites Toggle */}
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="gap-1.5"
              >
                {showFavoritesOnly ? (
                  <IconHeartFilled className="h-4 w-4 text-red-500" />
                ) : (
                  <IconHeart className="h-4 w-4" />
                )}
                {/* Only show count after hydration to prevent SSR mismatch */}
                {isHydrated && favoritesCount > 0 ? (
                  <span className="text-xs">{favoritesCount}</span>
                ) : (
                  <span className="hidden sm:inline">Favorites</span>
                )}
              </Button>
            </div>

            {/* Color Family Pills */}
            <ColorFamilyPills 
              selected={selectedFamily}
              onChange={setSelectedFamily}
            />

            {/* Results count with filter context */}
            <div className="text-sm text-muted-foreground">
              {resultsText}
            </div>
          </div>
        </div>

        {/* Main Content Area - scrollable */}
        <div className="flex-1 overflow-auto">
          {/* Loading State - Skeleton Grid */}
          {loading && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-0.5 max-w-[1400px] mx-auto p-2">
              {/* biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders are static and never reordered */}
              {Array.from({ length: 120 }).map((_, i) => (
                <Skeleton key={`skeleton-${i}`} className="aspect-square" />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <IconAlertCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 font-medium">Failed to load colors</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredColors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <IconPalette className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No colors found</p>
              <p className="text-sm text-muted-foreground">
                {colors.length === 0 
                  ? "No colors in the library yet."
                  : "Try adjusting your filters or search query."
                }
              </p>
              {(searchQuery || selectedFamily !== "all" || selectedStyles.length > 0 || showPopularOnly || showFavoritesOnly) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFamily("all");
                    setSelectedStyles([]);
                    setShowPopularOnly(false);
                    setShowFavoritesOnly(false);
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {/* Color Views */}
          {!loading && !error && filteredColors.length > 0 && (
            <>
              {viewMode === "wall" ? (
                <ColorWallView 
                  colors={filteredColors}
                  onSelectColor={handleSelectColor}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <ColorGridView 
                  colors={filteredColors}
                  onSelectColor={handleSelectColor}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </>
          )}
        </div>

        {/* Color Detail Sheet */}
        <ColorDetailSheet 
          color={selectedColor}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          isFavorite={selectedColor ? isFavorite(selectedColor.id) : false}
          onToggleFavorite={() => selectedColor && toggleFavorite(selectedColor.id)}
          onAddToProject={handleAddToProject}
          isPaletteFull={isPaletteFull}
        />

        {/* Filter Sheet */}
        <FilterSheet 
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          selectedStyles={selectedStyles}
          onStylesChange={setSelectedStyles}
          showPopularOnly={showPopularOnly}
          onPopularChange={setShowPopularOnly}
        />
      </div>
    </TooltipProvider>
  );
}
