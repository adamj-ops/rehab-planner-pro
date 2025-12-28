"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import type { RoomType, SurfaceType, PaintFinish } from "@/types/design";

interface ColorData {
  id: string;
  color_code: string;
  name: string;
  hex_code: string;
  color_family?: string;
  lrv?: number;
}

interface ColorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color: ColorData | null;
  onSave: (selection: ColorSelectionData) => Promise<void>;
}

export interface ColorSelectionData {
  colorId: string;
  colorName: string;
  hexCode: string;
  roomType: RoomType;
  roomName?: string;
  surfaceType: SurfaceType;
  finish: PaintFinish;
  notes?: string;
  isPrimary?: boolean;
}

const roomTypes: { value: RoomType; label: string }[] = [
  { value: "living_room", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "primary_bedroom", label: "Primary Bedroom" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "primary_bathroom", label: "Primary Bathroom" },
  { value: "dining_room", label: "Dining Room" },
  { value: "office", label: "Office" },
  { value: "laundry", label: "Laundry" },
  { value: "garage", label: "Garage" },
  { value: "basement", label: "Basement" },
  { value: "exterior", label: "Exterior" },
  { value: "entryway", label: "Entryway" },
  { value: "hallway", label: "Hallway" },
];

const surfaceTypes: { value: SurfaceType; label: string }[] = [
  { value: "walls", label: "Walls" },
  { value: "ceiling", label: "Ceiling" },
  { value: "trim", label: "Trim & Moldings" },
  { value: "cabinets", label: "Cabinets" },
  { value: "doors", label: "Doors" },
  { value: "accent_wall", label: "Accent Wall" },
  { value: "exterior_body", label: "Exterior Body" },
  { value: "exterior_trim", label: "Exterior Trim" },
  { value: "exterior_accent", label: "Exterior Accent" },
];

const paintFinishes: { value: PaintFinish; label: string; description: string }[] = [
  { value: "flat", label: "Flat", description: "No sheen, hides imperfections" },
  { value: "matte", label: "Matte", description: "Very low sheen, easy touch-ups" },
  { value: "eggshell", label: "Eggshell", description: "Slight sheen, easy to clean" },
  { value: "satin", label: "Satin", description: "Soft sheen, durable" },
  { value: "semi-gloss", label: "Semi-Gloss", description: "Moderate sheen, very durable" },
  { value: "high-gloss", label: "High-Gloss", description: "Mirror-like, maximum durability" },
];

export function ColorSelectionDialog({
  open,
  onOpenChange,
  color,
  onSave,
}: ColorSelectionDialogProps) {
  const [roomType, setRoomType] = useState<RoomType>("living_room");
  const [surfaceType, setSurfaceType] = useState<SurfaceType>("walls");
  const [finish, setFinish] = useState<PaintFinish>("eggshell");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!color) return;

    setSaving(true);
    try {
      await onSave({
        colorId: color.id,
        colorName: color.name,
        hexCode: color.hex_code,
        roomType,
        surfaceType,
        finish,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setRoomType("living_room");
      setSurfaceType("walls");
      setFinish("eggshell");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save color selection:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!color) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-8 h-8 border border-zinc-300 dark:border-zinc-600"
              style={{ backgroundColor: color.hex_code }}
            />
            <span>Add {color.name} to Project</span>
          </DialogTitle>
          <DialogDescription>
            Assign this color to a specific room and surface in your project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Color Preview */}
          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div
              className="w-16 h-16 border border-zinc-300 dark:border-zinc-600"
              style={{ backgroundColor: color.hex_code }}
            />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {color.name}
              </p>
              <p className="text-sm font-mono text-zinc-500">
                {color.color_code} • {color.hex_code}
              </p>
              {color.color_family && (
                <p className="text-xs text-zinc-400 capitalize mt-1">
                  {color.color_family} Family
                  {color.lrv !== undefined && ` • LRV: ${color.lrv}`}
                </p>
              )}
            </div>
          </div>

          {/* Room Selection */}
          <div className="grid gap-2">
            <Label htmlFor="room-type">Room</Label>
            <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
              <SelectTrigger id="room-type" className="rounded-none">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {roomTypes.map((room) => (
                  <SelectItem key={room.value} value={room.value} className="rounded-none">
                    {room.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Surface Selection */}
          <div className="grid gap-2">
            <Label htmlFor="surface-type">Surface</Label>
            <Select value={surfaceType} onValueChange={(v) => setSurfaceType(v as SurfaceType)}>
              <SelectTrigger id="surface-type" className="rounded-none">
                <SelectValue placeholder="Select a surface" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {surfaceTypes.map((surface) => (
                  <SelectItem key={surface.value} value={surface.value} className="rounded-none">
                    {surface.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Finish Selection */}
          <div className="grid gap-2">
            <Label htmlFor="finish">Paint Finish</Label>
            <Select value={finish} onValueChange={(v) => setFinish(v as PaintFinish)}>
              <SelectTrigger id="finish" className="rounded-none">
                <SelectValue placeholder="Select a finish" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {paintFinishes.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="rounded-none">
                    <div className="flex flex-col">
                      <span>{f.label}</span>
                      <span className="text-xs text-zinc-500">{f.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Use with SW Extra White trim..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-none min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-none" disabled={saving}>
            {saving ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                Add to Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
