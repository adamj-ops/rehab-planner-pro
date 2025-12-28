"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconTrash,
  IconHome,
  IconPaint,
  IconPalette,
} from "@tabler/icons-react";
import type { RoomType, SurfaceType, PaintFinish } from "@/types/design";

export interface ColorSelection {
  id: string;
  colorId: string;
  colorName: string;
  colorCode?: string;
  hexCode: string;
  roomType: RoomType;
  roomName?: string;
  surfaceType: SurfaceType;
  finish: PaintFinish;
  notes?: string;
  isPrimary?: boolean;
}

interface ColorSelectionsSummaryProps {
  selections: ColorSelection[];
  onRemove: (selectionId: string) => void;
  maxSelections?: number;
}

const roomLabels: Record<RoomType, string> = {
  living_room: "Living Room",
  kitchen: "Kitchen",
  primary_bedroom: "Primary Bedroom",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  primary_bathroom: "Primary Bathroom",
  dining_room: "Dining Room",
  office: "Office",
  laundry: "Laundry",
  garage: "Garage",
  basement: "Basement",
  exterior: "Exterior",
  entryway: "Entryway",
  hallway: "Hallway",
};

const surfaceLabels: Record<SurfaceType, string> = {
  walls: "Walls",
  ceiling: "Ceiling",
  trim: "Trim",
  cabinets: "Cabinets",
  doors: "Doors",
  accent_wall: "Accent Wall",
  exterior_body: "Exterior Body",
  exterior_trim: "Exterior Trim",
  exterior_accent: "Exterior Accent",
};

const finishLabels: Record<PaintFinish, string> = {
  flat: "Flat",
  matte: "Matte",
  eggshell: "Eggshell",
  satin: "Satin",
  "semi-gloss": "Semi-Gloss",
  "high-gloss": "High-Gloss",
};

export function ColorSelectionsSummary({
  selections,
  onRemove,
  maxSelections = 10,
}: ColorSelectionsSummaryProps) {
  if (selections.length === 0) {
    return null;
  }

  // Group selections by room
  const groupedByRoom = selections.reduce((acc, selection) => {
    const roomKey = selection.roomType;
    if (!acc[roomKey]) {
      acc[roomKey] = [];
    }
    acc[roomKey].push(selection);
    return acc;
  }, {} as Record<string, ColorSelection[]>);

  return (
    <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCheck className="h-4 w-4 text-primary" />
            Project Color Selections ({selections.length}/{maxSelections})
          </div>
          <Badge
            variant="outline"
            className="rounded-none text-xs font-normal"
          >
            {Object.keys(groupedByRoom).length} room{Object.keys(groupedByRoom).length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByRoom).map(([roomType, roomSelections]) => (
          <div key={roomType} className="space-y-2">
            {/* Room Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <IconHome className="h-4 w-4" />
              {roomLabels[roomType as RoomType]}
            </div>

            {/* Room Colors */}
            <div className="grid gap-2 pl-6">
              {roomSelections.map((selection) => (
                <div
                  key={selection.id}
                  className="group flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 border border-zinc-200 dark:border-zinc-700"
                >
                  {/* Color Swatch */}
                  <div
                    className="w-8 h-8 border border-zinc-300 dark:border-zinc-600 shrink-0"
                    style={{ backgroundColor: selection.hexCode }}
                  />

                  {/* Color Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {selection.colorName}
                      </span>
                      {selection.colorCode && (
                        <span className="text-xs font-mono text-zinc-500">
                          {selection.colorCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <IconPaint className="h-3 w-3" />
                        {surfaceLabels[selection.surfaceType]}
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <IconPalette className="h-3 w-3" />
                        {finishLabels[selection.finish]}
                      </div>
                    </div>
                    {selection.notes && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                        {selection.notes}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(selection.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-zinc-400 hover:text-red-500 rounded-none"
                    aria-label={`Remove ${selection.colorName}`}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
