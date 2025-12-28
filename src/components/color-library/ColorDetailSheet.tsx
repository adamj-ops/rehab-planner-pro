"use client";

import { useState } from "react";
import { IconHeart, IconHeartFilled, IconPlus, IconLayoutGrid } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AddToProjectDialog, type AddToProjectConfig } from "./AddToProjectDialog";
import type { Color } from "@/types/color";

interface ColorDetailSheetProps {
  /** Color to display (null when sheet is closed) */
  color: Color | null;
  /** Whether the sheet is open */
  open: boolean;
  /** Handler for open state changes */
  onOpenChange: (open: boolean) => void;
  /** Whether this color is favorited */
  isFavorite: boolean;
  /** Handler for toggling favorite status */
  onToggleFavorite: () => void;
  /** Handler for adding color to project with configuration */
  onAddToProject: (color: Color, config: AddToProjectConfig) => void;
  /** Whether palette is full (disable add button) */
  isPaletteFull?: boolean;
}

/**
 * ColorDetailSheet - Rich slide-in panel showing full color details
 * 
 * Features:
 * - Large color swatch (h-64)
 * - Color specs overlay (HEX, RGB, LRV) with backdrop blur
 * - Undertones badges
 * - Design styles badges
 * - Recommended rooms badges
 * - Recommended surfaces badges
 * - "Add to Project" button
 * - "Add to Moodboard" button (disabled, coming soon)
 * - Favorite toggle in header
 */
export function ColorDetailSheet({
  color,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite,
  onAddToProject,
  isPaletteFull = false,
}: ColorDetailSheetProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  if (!color) return null;

  const handleAddToProjectConfirm = (config: AddToProjectConfig) => {
    onAddToProject(color, config);
    setAddDialogOpen(false);
    onOpenChange(false); // Close the detail sheet
  };

  // Format design style labels
  const formatLabel = (str: string) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl truncate">{color.color_name}</SheetTitle>
              <SheetDescription className="font-mono">{color.color_code}</SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="shrink-0 hover:scale-110 transition-transform"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <IconHeartFilled className="h-5 w-5 text-red-500" />
              ) : (
                <IconHeart className="h-5 w-5" />
              )}
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Large Color Swatch */}
          <div
            className="relative h-64 w-full overflow-hidden"
            style={{ backgroundColor: color.hex_code }}
          >
            {/* Color Specs Overlay - bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-4 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">HEX</p>
                  <p className="font-mono text-sm font-medium mt-0.5">{color.hex_code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">RGB</p>
                  <p className="font-mono text-sm font-medium mt-0.5">
                    {color.rgb_values.r}, {color.rgb_values.g}, {color.rgb_values.b}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">LRV</p>
                  <p className="font-mono text-sm font-medium mt-0.5">
                    {color.lrv ?? 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Undertones */}
          {color.undertones && color.undertones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Undertones</h4>
              <div className="flex flex-wrap gap-2">
                {color.undertones.map((undertone) => (
                  <Badge key={undertone} variant="secondary" className="capitalize">
                    {undertone}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Design Styles */}
          {color.design_styles && color.design_styles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Design Styles</h4>
              <div className="flex flex-wrap gap-2">
                {color.design_styles.map((style) => (
                  <Badge key={style} variant="outline">
                    {formatLabel(style)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Rooms */}
          {color.recommended_rooms && color.recommended_rooms.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommended Rooms</h4>
              <div className="flex flex-wrap gap-2">
                {color.recommended_rooms.map((room) => (
                  <Badge key={room} variant="outline">
                    {formatLabel(room)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Surfaces */}
          {color.recommended_surfaces && color.recommended_surfaces.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Best For</h4>
              <div className="flex flex-wrap gap-2">
                {color.recommended_surfaces.map((surface) => (
                  <Badge key={surface} variant="outline">
                    {formatLabel(surface)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              className="w-full"
              onClick={() => setAddDialogOpen(true)}
              disabled={isPaletteFull}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              {isPaletteFull ? "Palette Full (5/5)" : "Add to Project"}
            </Button>
            <Button variant="outline" className="w-full" disabled>
              <IconLayoutGrid className="h-4 w-4 mr-2" />
              Add to Moodboard
              <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
            </Button>
          </div>
        </div>

        {/* Add to Project Dialog */}
        <AddToProjectDialog
          color={color}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onConfirm={handleAddToProjectConfirm}
        />
      </SheetContent>
    </Sheet>
  );
}

export type { AddToProjectConfig };
