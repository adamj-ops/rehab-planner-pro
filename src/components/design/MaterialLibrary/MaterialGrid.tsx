"use client";

import { useState, useEffect } from "react";
import { MaterialCard } from "./MaterialCard";
import { supabase } from "@/lib/supabase/client";
import {
  IconLoader2,
  IconAlertCircle,
  IconBox,
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

interface Material {
  id: string;
  product_name: string;
  brand: string | null;
  material_type: string;
  material_category: string | null;
  color_description: string | null;
  finish: string | null;
  avg_cost_per_unit: number | null;
  unit_type: string | null;
  image_url: string | null;
  swatch_image_url: string | null;
}

interface MaterialGridProps {
  onMaterialSelect?: (materialId: string, material: Material) => void;
  selectedMaterialId?: string;
}

// Material types for filtering
const materialTypes = [
  "All",
  "Countertop",
  "Flooring",
  "Tile",
  "Backsplash",
  "Cabinet",
  "Hardware",
  "Fixture",
  "Appliance",
  "Lighting",
];

export function MaterialGrid({
  onMaterialSelect,
  selectedMaterialId,
}: MaterialGridProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const { data, error: fetchError } = await supabase
          .from("material_library")
          .select(
            "id, product_name, brand, material_type, material_category, color_description, finish, avg_cost_per_unit, unit_type, image_url, swatch_image_url"
          )
          .eq("is_active", true)
          .order("material_type", { ascending: true })
          .order("product_name", { ascending: true });

        if (fetchError) throw fetchError;

        setMaterials(data || []);
        setFilteredMaterials(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load materials");
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  // Filter materials when search or type changes
  useEffect(() => {
    let result = materials;

    // Filter by type
    if (selectedType !== "All") {
      result = result.filter(
        (m) => m.material_type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.product_name.toLowerCase().includes(query) ||
          m.brand?.toLowerCase().includes(query) ||
          m.material_category?.toLowerCase().includes(query) ||
          m.color_description?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(result);
  }, [materials, searchQuery, selectedType]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
          <IconLoader2 className="w-5 h-5 animate-spin" />
          <span>Loading materials...</span>
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
              Failed to load materials
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
  if (materials.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconBox className="w-12 h-12 text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              No materials in library
            </p>
            <p className="text-sm text-zinc-500">
              Add materials to the material_library table to get started.
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
            placeholder="Search by name, brand, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-none"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4 text-zinc-400" />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[160px] rounded-none">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {materialTypes.map((type) => (
                <SelectItem key={type} value={type} className="rounded-none">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {filteredMaterials.length} of {materials.length} materials
        </p>
        {selectedMaterialId && (
          <p className="text-sm text-primary font-medium">1 material selected</p>
        )}
      </div>

      {/* No Results */}
      {filteredMaterials.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <IconSearch className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-zinc-600 dark:text-zinc-400">
              No materials match your search
            </p>
            <Button
              variant="link"
              className="mt-2 text-primary"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Material Grid */}
      {filteredMaterials.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              selected={selectedMaterialId === material.id}
              onSelect={(id) => onMaterialSelect?.(id, material)}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
