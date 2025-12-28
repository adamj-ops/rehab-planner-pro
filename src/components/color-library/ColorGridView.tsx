"use client";

import { ColorCard } from "./ColorCard";
import type { Color } from "@/types/color";

interface ColorGridViewProps {
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
 * ColorGridView - Responsive grid of larger color cards
 * 
 * Features:
 * - Responsive columns: 2 on mobile, up to 6 on xl screens
 * - Larger cards with more visible information
 * - Wraps ColorCard components
 */
export function ColorGridView({ 
  colors, 
  onSelectColor, 
  favorites, 
  onToggleFavorite 
}: ColorGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-w-[1400px] mx-auto p-4">
      {colors.map((color) => (
        <ColorCard
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
