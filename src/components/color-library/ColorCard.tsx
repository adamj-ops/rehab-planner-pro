"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconHeart, IconHeartFilled, IconSparkles } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import type { Color } from "@/types/color";

interface ColorCardProps {
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
 * ColorCard - A rich card component for the grid view
 * 
 * Features:
 * - 3:4 aspect ratio swatch
 * - Hover: scale 105%, large shadow
 * - Popular badge (top-left, sparkle icon)
 * - Favorite heart (top-right, always visible)
 * - LRV indicator (bottom of swatch, on hover)
 * - Color info below swatch
 * - Undertones badges
 */
export function ColorCard({ 
  color, 
  onClick, 
  isFavorite, 
  onToggleFavorite 
}: ColorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine if color is light or dark for text contrast
  const isLightColor = (color.lrv ?? 50) > 50;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex w-full flex-col text-left transition-all duration-200 cursor-pointer",
        "hover:scale-105 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
      {/* Color Swatch - 3:4 aspect ratio */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden"
        style={{ backgroundColor: color.hex_code }}
      >
        {/* Popular Badge */}
        {color.popular && (
          <div className="absolute left-2 top-2">
            <Badge 
              variant="secondary" 
              className="gap-1 bg-background/90 backdrop-blur-sm text-xs"
            >
              <IconSparkles className="h-3 w-3" />
              Popular
            </Badge>
          </div>
        )}

        {/* Favorite Button - always visible in grid view */}
        <div className="absolute right-2 top-2">
          <button
            onClick={onToggleFavorite}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-all",
              "bg-background/80 backdrop-blur-sm hover:bg-background",
              "hover:scale-110 active:scale-95"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <IconHeartFilled className="h-4 w-4 text-red-500" />
            ) : (
              <IconHeart className="h-4 w-4 text-foreground" />
            )}
          </button>
        </div>

        {/* LRV Indicator - appears on hover */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 transition-opacity duration-150",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          {color.lrv !== null && color.lrv !== undefined && (
            <div 
              className={cn(
                "bg-background/90 px-2 py-1.5 text-center text-sm font-medium backdrop-blur-sm",
                "text-foreground"
              )}
            >
              LRV {color.lrv}
            </div>
          )}
        </div>
      </div>

      {/* Color Info */}
      <div className="space-y-1 bg-card p-3 border border-t-0 border-border">
        <p className="font-medium text-sm leading-tight text-foreground line-clamp-1">
          {color.color_name}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {color.color_code}
        </p>
        
        {/* Undertones */}
        {color.undertones && color.undertones.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {color.undertones.slice(0, 2).map((undertone) => (
              <Badge 
                key={undertone} 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-5 capitalize"
              >
                {undertone}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
