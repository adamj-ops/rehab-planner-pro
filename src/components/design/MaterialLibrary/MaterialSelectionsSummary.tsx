"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconTrash,
  IconHome,
  IconBox,
  IconTags,
} from "@tabler/icons-react";
import type { RoomType } from "@/types/design";

export interface MaterialSelection {
  id: string;
  materialId: string;
  materialName: string;
  materialType: string;
  materialCategory?: string;
  brand?: string;
  roomType: RoomType;
  roomName?: string;
  application: string;
  quantity?: number;
  unitType?: string;
  costPerUnit?: number;
  totalCost?: number;
  imageUrl?: string;
  notes?: string;
}

interface MaterialSelectionsSummaryProps {
  selections: MaterialSelection[];
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

// Format application values to display labels
const formatApplication = (application: string): string => {
  return application
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function MaterialSelectionsSummary({
  selections,
  onRemove,
  maxSelections = 20,
}: MaterialSelectionsSummaryProps) {
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
  }, {} as Record<string, MaterialSelection[]>);

  // Calculate total estimated cost
  const totalCost = selections.reduce((sum, s) => sum + (s.totalCost || 0), 0);

  return (
    <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCheck className="h-4 w-4 text-primary" />
            Project Material Selections ({selections.length}/{maxSelections})
          </div>
          <div className="flex items-center gap-2">
            {totalCost > 0 && (
              <Badge variant="secondary" className="rounded-none text-xs font-mono">
                ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Badge>
            )}
            <Badge variant="outline" className="rounded-none text-xs font-normal">
              {Object.keys(groupedByRoom).length} room{Object.keys(groupedByRoom).length !== 1 ? "s" : ""}
            </Badge>
          </div>
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

            {/* Room Materials */}
            <div className="grid gap-2 pl-6">
              {roomSelections.map((selection) => (
                <div
                  key={selection.id}
                  className="group flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 border border-zinc-200 dark:border-zinc-700"
                >
                  {/* Material Image */}
                  <div className="w-10 h-10 border border-zinc-300 dark:border-zinc-600 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {selection.imageUrl ? (
                      <img
                        src={selection.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IconBox className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>

                  {/* Material Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {selection.materialName}
                      </span>
                      {selection.brand && (
                        <span className="text-xs text-zinc-500 hidden sm:inline">
                          {selection.brand}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <IconTags className="h-3 w-3" />
                        {formatApplication(selection.application)}
                      </div>
                      {selection.quantity !== undefined && selection.unitType && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-600">•</span>
                          <span className="text-xs text-zinc-500">
                            {selection.quantity} {selection.unitType}
                          </span>
                        </>
                      )}
                      {selection.totalCost !== undefined && selection.totalCost > 0 && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-600">•</span>
                          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                            ${selection.totalCost.toFixed(2)}
                          </span>
                        </>
                      )}
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
                    aria-label={`Remove ${selection.materialName}`}
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
