"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IconCheck, IconBox } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface MaterialCardProps {
  material: {
    id: string;
    product_name: string;
    brand?: string | null;
    material_type: string;
    material_category?: string | null;
    color_description?: string | null;
    finish?: string | null;
    avg_cost_per_unit?: number | null;
    unit_type?: string | null;
    image_url?: string | null;
    swatch_image_url?: string | null;
  };
  selected?: boolean;
  onSelect?: (materialId: string) => void;
  size?: "sm" | "md" | "lg";
}

export function MaterialCard({ material, selected, onSelect, size = "md" }: MaterialCardProps) {
  const imageSizes = {
    sm: "h-16",
    md: "h-20",
    lg: "h-24",
  };

  const imageUrl = material.swatch_image_url || material.image_url;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg group",
        "rounded-none", // CRITICAL: No rounded corners per Mira theme
        "border-zinc-200 dark:border-zinc-700",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onSelect?.(material.id)}
    >
      <CardContent className="p-4">
        {/* Material Image/Swatch */}
        <div className="relative">
          <div
            className={cn(
              imageSizes[size],
              "w-full",
              "border border-zinc-200 dark:border-zinc-700",
              "transition-transform group-hover:scale-105",
              "overflow-hidden bg-zinc-100 dark:bg-zinc-800",
              "flex items-center justify-center"
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={material.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <IconBox className="w-8 h-8 text-zinc-400" />
            )}
          </div>

          {/* Selected Check Icon */}
          {selected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-primary p-1.5">
                <IconCheck className="w-5 h-5 text-white" stroke={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* Material Type Badge */}
        <span className="inline-block mt-3 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 capitalize">
          {material.material_category || material.material_type}
        </span>

        {/* Product Name */}
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-2 line-clamp-2">
          {material.product_name}
        </p>

        {/* Brand */}
        {material.brand && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {material.brand}
          </p>
        )}

        {/* Color/Finish Description */}
        {(material.color_description || material.finish) && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-1">
            {material.color_description || material.finish}
          </p>
        )}

        {/* Price */}
        {material.avg_cost_per_unit !== null && material.avg_cost_per_unit !== undefined && (
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 mt-2">
            ${material.avg_cost_per_unit.toFixed(2)}/{material.unit_type || "unit"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
