"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconHeart, IconHeartFilled } from "@/lib/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Color } from "@/types/color";

interface ColorSwatchProps {
  /** Color data from color_library */
  color: Color;
  /** Click handler for opening detail sheet */
  onClick: () => void;
  /** Whether this color is favorited */
  isFavorite: boolean;
  /** Handler for toggling favorite status */
  onToggleFavorite: (e: React.MouseEvent) => void;
}

/**
 * ColorSwatch - A small, interactive color swatch for the wall view
 * 
 * Features:
 * - Aspect-square layout
 * - Hover: scale 110%, z-index bump, shadow
 * - Tooltip showing name + code
 * - Favorite heart button (appears on hover)
 * - LRV indicator (appears on hover)
 */
export function ColorSwatch({ 
  color, 
  onClick, 
  isFavorite, 
  onToggleFavorite 
}: ColorSwatchProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if color is light or dark for LRV badge text contrast
  const isLightColor = (color.lrv ?? 50) > 50;

  // Handle keyboard navigation for the main swatch
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "group relative aspect-square w-full overflow-hidden transition-all duration-200 cursor-pointer",
            "hover:z-10 hover:scale-110 hover:shadow-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          )}
          style={{ backgroundColor: color.hex_code }}
          aria-label={`${color.color_name} - ${color.color_code}`}
        >
          {/* Favorite Button - appears on hover */}
          <div
            className={cn(
              "absolute right-0.5 top-0.5 transition-opacity duration-150",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <button
              onClick={onToggleFavorite}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                "bg-background/80 backdrop-blur-sm hover:bg-background",
                "hover:scale-110 active:scale-95"
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <IconHeartFilled className="h-3 w-3 text-red-500" />
              ) : (
                <IconHeart className="h-3 w-3 text-foreground" />
              )}
            </button>
          </div>

          {/* LRV Indicator - appears on hover */}
          {isHovered && color.lrv !== null && color.lrv !== undefined && (
            <div className="absolute bottom-0 left-0 right-0">
              <div 
                className={cn(
                  "bg-background/90 px-1 py-0.5 text-center text-[10px] font-medium backdrop-blur-sm",
                  "text-foreground"
                )}
              >
                {color.lrv}
              </div>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="space-y-0.5">
          <p className="font-medium text-sm">{color.color_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{color.color_code}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
