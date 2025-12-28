"use client";

import { cn } from "@/lib/utils";
import { IconX, IconPencil, IconPalette } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProjectColorSelection, SurfaceType, RoomType } from "@/types/design";

// ============================================================================
// CONSTANTS
// ============================================================================

const SURFACE_LABELS: Record<SurfaceType, string> = {
  walls: "Walls",
  ceiling: "Ceiling",
  trim: "Trim",
  cabinets: "Cabinets",
  doors: "Doors",
  accent_wall: "Accent",
  exterior_body: "Ext. Body",
  exterior_trim: "Ext. Trim",
  exterior_accent: "Ext. Accent",
};

const ROOM_LABELS: Record<RoomType, string> = {
  living_room: "Living Room",
  kitchen: "Kitchen",
  primary_bedroom: "Primary Bed",
  bedroom: "Bedroom",
  primary_bathroom: "Primary Bath",
  bathroom: "Bathroom",
  dining_room: "Dining Room",
  office: "Office",
  laundry: "Laundry",
  garage: "Garage",
  basement: "Basement",
  entryway: "Entry",
  hallway: "Hallway",
  exterior: "Exterior",
};

// ============================================================================
// TYPES
// ============================================================================

interface ProjectPaletteBarProps {
  /** Array of color selections in the project */
  selections: ProjectColorSelection[];
  /** Handler for removing a selection */
  onRemove: (id: string) => void;
  /** Handler for editing a selection */
  onEdit: (selection: ProjectColorSelection) => void;
  /** Maximum number of colors allowed (default: 5) */
  maxColors?: number;
  /** Optional className for the container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProjectPaletteBar - Displays the project's selected color palette
 * 
 * Features:
 * - Shows up to maxColors (default 5) color selections
 * - Displays color swatch, name, surface type, and room
 * - Edit and remove buttons for each selection
 * - Empty state when no colors selected
 * - Full state warning when at capacity
 */
export function ProjectPaletteBar({
  selections,
  onRemove,
  onEdit,
  maxColors = 5,
  className,
}: ProjectPaletteBarProps) {
  const isFull = selections.length >= maxColors;
  const isEmpty = selections.length === 0;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <IconPalette className="h-4 w-4 text-primary" />
            Project Color Palette ({selections.length}/{maxColors})
          </span>
          {isFull && (
            <Badge variant="secondary" className="text-xs">
              Palette Full
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap gap-2">
              {selections.map((selection) => (
                <ColorSelectionCard
                  key={selection.id}
                  selection={selection}
                  onRemove={() => onRemove(selection.id)}
                  onEdit={() => onEdit(selection)}
                />
              ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-4 text-center">
      <p className="text-sm text-muted-foreground">
        Select up to 5 colors for your project palette
      </p>
    </div>
  );
}

interface ColorSelectionCardProps {
  selection: ProjectColorSelection;
  onRemove: () => void;
  onEdit: () => void;
}

function ColorSelectionCard({ selection, onRemove, onEdit }: ColorSelectionCardProps) {
  // Get color info - either from library or custom
  const colorName = selection.color?.colorName || selection.customColorName || "Custom Color";
  const colorCode = selection.color?.colorCode || selection.customHexCode || "";
  const hexCode = selection.color?.hexCode || selection.customHexCode || "#cccccc";

  // Get display labels
  const surfaceLabel = SURFACE_LABELS[selection.surfaceType] || selection.surfaceType;
  const roomLabel = selection.roomName || ROOM_LABELS[selection.roomType] || selection.roomType;

  return (
    <div className="group flex items-center gap-2 bg-muted px-3 py-2 rounded-md border border-border hover:border-primary/50 transition-colors">
      {/* Color Swatch */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="w-8 h-8 rounded border border-border shrink-0 cursor-help"
            style={{ backgroundColor: hexCode }}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{colorName}</p>
          <p className="text-xs font-mono">{colorCode}</p>
        </TooltipContent>
      </Tooltip>

      {/* Color Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate leading-tight">
          {colorName}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {surfaceLabel}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {roomLabel}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onEdit}
              aria-label={`Edit ${colorName}`}
            >
              <IconPencil className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
              aria-label={`Remove ${colorName}`}
            >
              <IconX className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Remove</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export { SURFACE_LABELS, ROOM_LABELS };
