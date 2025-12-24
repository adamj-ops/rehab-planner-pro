"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ColorCardProps {
  color: {
    id: string;
    color_code: string;
    name: string;
    hex_code: string;
    color_family?: string;
    lrv?: number;
  };
  selected?: boolean;
  onSelect?: (colorId: string) => void;
  size?: "sm" | "md" | "lg";
}

export function ColorCard({ color, selected, onSelect, size = "md" }: ColorCardProps) {
  const swatchSizes = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg group",
        "rounded-none", // CRITICAL: No rounded corners per Mira theme
        "border-zinc-200 dark:border-zinc-700",
        selected && "ring-2 ring-primary ring-offset-2" // Blue ring when selected
      )}
      onClick={() => onSelect?.(color.id)}
    >
      <CardContent className="p-4">
        {/* Color Swatch - NO rounded corners */}
        <div className="relative">
          <div
            className={cn(
              swatchSizes[size],
              "border border-zinc-200 dark:border-zinc-700",
              "transition-transform group-hover:scale-105"
            )}
            style={{ backgroundColor: color.hex_code }}
            aria-label={`${color.name} color swatch`}
          />
          
          {/* Selected Check Icon */}
          {selected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-primary p-1.5">
                <IconCheck className="w-5 h-5 text-white" stroke={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* Color Code - Monospace font */}
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-3 uppercase">
          {color.color_code}
        </p>

        {/* Color Name */}
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-1">
          {color.name}
        </p>

        {/* Color Family Badge */}
        {color.color_family && (
          <span className="inline-block mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5">
            {color.color_family}
          </span>
        )}

        {/* LRV (Light Reflectance Value) */}
        {color.lrv !== undefined && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            LRV: {color.lrv}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

