"use client";

import { useState, useEffect, useId } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus } from "@/lib/icons";
import type { Color } from "@/types/color";
import type { 
  SurfaceType, 
  RoomType, 
  PaintFinish 
} from "@/types/design";

// ============================================================================
// CONSTANTS
// ============================================================================

const SURFACE_OPTIONS: { value: SurfaceType; label: string }[] = [
  { value: "walls", label: "Walls" },
  { value: "ceiling", label: "Ceiling" },
  { value: "trim", label: "Trim" },
  { value: "cabinets", label: "Cabinets" },
  { value: "doors", label: "Doors" },
  { value: "accent_wall", label: "Accent Wall" },
  { value: "exterior_body", label: "Exterior Body" },
  { value: "exterior_trim", label: "Exterior Trim" },
  { value: "exterior_accent", label: "Exterior Accent" },
];

const ROOM_OPTIONS: { value: RoomType; label: string }[] = [
  { value: "living_room", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "primary_bedroom", label: "Primary Bedroom" },
  { value: "bedroom", label: "Bedroom" },
  { value: "primary_bathroom", label: "Primary Bathroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "dining_room", label: "Dining Room" },
  { value: "office", label: "Office" },
  { value: "laundry", label: "Laundry" },
  { value: "garage", label: "Garage" },
  { value: "basement", label: "Basement" },
  { value: "entryway", label: "Entryway" },
  { value: "hallway", label: "Hallway" },
  { value: "exterior", label: "Exterior" },
];

const FINISH_OPTIONS: { value: PaintFinish; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "matte", label: "Matte" },
  { value: "eggshell", label: "Eggshell" },
  { value: "satin", label: "Satin" },
  { value: "semi-gloss", label: "Semi-Gloss" },
  { value: "high-gloss", label: "High-Gloss" },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the recommended paint finish based on surface type
 */
function getDefaultFinish(surface: SurfaceType): PaintFinish {
  switch (surface) {
    case "walls":
    case "ceiling":
      return "eggshell";
    case "trim":
    case "doors":
    case "exterior_trim":
      return "semi-gloss";
    case "cabinets":
      return "semi-gloss";
    case "accent_wall":
      return "satin";
    case "exterior_body":
    case "exterior_accent":
      return "satin";
    default:
      return "eggshell";
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface AddToProjectConfig {
  surfaceType: SurfaceType;
  roomType: RoomType;
  roomName?: string;
  finish?: PaintFinish;
  notes?: string;
}

interface AddToProjectDialogProps {
  /** The color being added to the project */
  color: Color;
  /** Whether the dialog is open */
  open: boolean;
  /** Handler for dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Handler called when user confirms the selection */
  onConfirm: (config: AddToProjectConfig) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AddToProjectDialog - Dialog for configuring color selection before adding to project
 * 
 * Features:
 * - Color preview with name and code
 * - Surface type selection (required)
 * - Room type selection (required)
 * - Custom room name (optional)
 * - Finish selection with auto-suggest based on surface
 * - Notes field (optional)
 */
export function AddToProjectDialog({
  color,
  open,
  onOpenChange,
  onConfirm,
}: AddToProjectDialogProps) {
  // Generate unique IDs for form fields
  const formId = useId();
  const surfaceId = `${formId}-surface`;
  const roomId = `${formId}-room`;
  const roomNameId = `${formId}-room-name`;
  const finishId = `${formId}-finish`;
  const notesId = `${formId}-notes`;

  // Form state
  const [surfaceType, setSurfaceType] = useState<SurfaceType | "">("");
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [roomName, setRoomName] = useState("");
  const [finish, setFinish] = useState<PaintFinish | "">("");
  const [notes, setNotes] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSurfaceType("");
      setRoomType("");
      setRoomName("");
      setFinish("");
      setNotes("");
    }
  }, [open]);

  // Auto-suggest finish when surface type changes
  useEffect(() => {
    if (surfaceType) {
      setFinish(getDefaultFinish(surfaceType));
    }
  }, [surfaceType]);

  // Validation
  const isValid = surfaceType !== "" && roomType !== "";

  // Handle form submission
  const handleSubmit = () => {
    if (!isValid) return;

    onConfirm({
      surfaceType: surfaceType as SurfaceType,
      roomType: roomType as RoomType,
      roomName: roomName.trim() || undefined,
      finish: finish as PaintFinish || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Project</DialogTitle>
          <DialogDescription>
            Configure where this color will be used in your project.
          </DialogDescription>
        </DialogHeader>

        {/* Color Preview */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
          <div
            className="w-12 h-12 rounded border border-border shrink-0"
            style={{ backgroundColor: color.hex_code }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{color.color_name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {color.color_code}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 py-2">
          {/* Surface Type */}
          <div className="grid gap-2">
            <Label htmlFor={surfaceId}>
              Surface Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={surfaceType}
              onValueChange={(value) => setSurfaceType(value as SurfaceType)}
            >
              <SelectTrigger id={surfaceId}>
                <SelectValue placeholder="Select surface..." />
              </SelectTrigger>
              <SelectContent>
                {SURFACE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Type */}
          <div className="grid gap-2">
            <Label htmlFor={roomId}>
              Room <span className="text-destructive">*</span>
            </Label>
            <Select
              value={roomType}
              onValueChange={(value) => setRoomType(value as RoomType)}
            >
              <SelectTrigger id={roomId}>
                <SelectValue placeholder="Select room..." />
              </SelectTrigger>
              <SelectContent>
                {ROOM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Room Name */}
          <div className="grid gap-2">
            <Label htmlFor={roomNameId}>
              Custom Room Name{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id={roomNameId}
              placeholder="e.g., Guest Bathroom, Jack's Room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          {/* Finish */}
          <div className="grid gap-2">
            <Label htmlFor={finishId}>
              Paint Finish{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Select
              value={finish}
              onValueChange={(value) => setFinish(value as PaintFinish)}
            >
              <SelectTrigger id={finishId}>
                <SelectValue placeholder="Select finish..." />
              </SelectTrigger>
              <SelectContent>
                {FINISH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {surfaceType && (
              <p className="text-xs text-muted-foreground">
                Suggested: {FINISH_OPTIONS.find(f => f.value === getDefaultFinish(surfaceType))?.label}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor={notesId}>
              Notes{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id={notesId}
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
