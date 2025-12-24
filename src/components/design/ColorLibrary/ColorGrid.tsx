"use client";

import { useState, useEffect } from "react";
import { ColorCard } from "./ColorCard";
import { supabase } from "@/lib/supabase/client";
import { 
  IconLoader2, 
  IconAlertCircle, 
  IconPalette,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Color {
  id: string;
  color_code: string;
  name: string;
  hex_code: string;
  color_family?: string;
  lrv?: number;
}

interface ColorGridProps {
  onColorSelect?: (colorId: string, color: Color) => void;
  selectedColorId?: string;
  maxSelections?: number;
}

// Sherwin-Williams color families
const colorFamilies = [
  "All",
  "White",
  "Gray",
  "Beige",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Red",
  "Purple",
  "Brown",
  "Black",
];

export function ColorGrid({ 
  onColorSelect, 
  selectedColorId,
  maxSelections = 5,
}: ColorGridProps) {
  const [colors, setColors] = useState<Color[]>([]);
  const [filteredColors, setFilteredColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("All");

  useEffect(() => {
    async function fetchColors() {
      try {
        const { data, error: fetchError } = await supabase
          .from("color_library")
          .select("id, color_code, name, hex_code, color_family, lrv")
          .order("color_family", { ascending: true })
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        setColors(data || []);
        setFilteredColors(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load colors");
      } finally {
        setLoading(false);
      }
    }

    fetchColors();
  }, []);

  // Filter colors when search or family changes
  useEffect(() => {
    let result = colors;

    // Filter by family
    if (selectedFamily !== "All") {
      result = result.filter(
        (c) => c.color_family?.toLowerCase() === selectedFamily.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.color_code.toLowerCase().includes(query)
      );
    }

    setFilteredColors(result);
  }, [colors, searchQuery, selectedFamily]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
          <IconLoader2 className="w-5 h-5 animate-spin" />
          <span>Loading Sherwin-Williams colors...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconAlertCircle className="w-10 h-10 text-red-500" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Failed to load colors
            </p>
            <p className="text-sm text-zinc-500">{error}</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-none mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty State
  if (colors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconPalette className="w-12 h-12 text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              No colors in library
            </p>
            <p className="text-sm text-zinc-500">
              Add colors to the color_library table to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-none"
          />
        </div>

        {/* Family Filter */}
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4 text-zinc-400" />
          <Select value={selectedFamily} onValueChange={setSelectedFamily}>
            <SelectTrigger className="w-[160px] rounded-none">
              <SelectValue placeholder="Filter by family" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {colorFamilies.map((family) => (
                <SelectItem key={family} value={family} className="rounded-none">
                  {family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {filteredColors.length} of {colors.length} colors
        </p>
        {selectedColorId && (
          <p className="text-sm text-primary font-medium">
            1 color selected
          </p>
        )}
      </div>

      {/* No Results */}
      {filteredColors.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <IconSearch className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-zinc-600 dark:text-zinc-400">
              No colors match your search
            </p>
            <Button
              variant="link"
              className="mt-2 text-primary"
              onClick={() => {
                setSearchQuery("");
                setSelectedFamily("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Color Grid */}
      {filteredColors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredColors.map((color) => (
            <ColorCard
              key={color.id}
              color={color}
              selected={selectedColorId === color.id}
              onSelect={(id) => onColorSelect?.(id, color)}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
}

