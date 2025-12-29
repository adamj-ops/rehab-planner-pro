"use client";

import { ColorSwatch } from "./ColorSwatch";
import type { Color } from "@/types/color";

interface ColorWallViewProps {
  /** Array of colors to display */
  colors: Color[];
  /** Handler for selecting a color */
  onSelectColor: (color: Color) => void;
  /** Set of favorited color IDs */
  favorites: Set<string>;
  /** Handler for toggling a color's favorite status */
  onToggleFavorite: (id: string) => void;
}

/**
 * ColorWallView - Dense grid of small color swatches (Sherwin-Williams style)
 * 
 * Features:
 * - Auto-fill grid with 40px minimum swatch size
 * - Responsive: more columns on larger screens
 * - Wraps ColorSwatch components
 */
export function ColorWallView({ 
  colors, 
  onSelectColor, 
  favorites, 
  onToggleFavorite 
}: ColorWallViewProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-0.5 max-w-[1400px] mx-auto p-2">
      {colors.map((color) => (
        <ColorSwatch
          key={color.id}
          color={color}
          onClick={() => onSelectColor(color)}
          isFavorite={favorites.has(color.id)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite(color.id);
          }}
        />
      ))}
    </div>
  );
}
