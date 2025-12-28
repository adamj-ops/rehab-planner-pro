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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCheck, IconLoader2, IconBox } from "@tabler/icons-react";
import type { RoomType } from "@/types/design";

interface MaterialData {
  id: string;
  product_name: string;
  brand?: string | null;
  material_type: string;
  material_category?: string | null;
  color_description?: string | null;
  finish?: string | null;
  avg_cost_per_unit?: number | null;
  unit_type?: string | null;
  image_url?: string | null;
  swatch_image_url?: string | null;
}

interface MaterialSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialData | null;
  onSave: (selection: MaterialSelectionData) => Promise<void>;
}

export interface MaterialSelectionData {
  materialId: string;
  materialName: string;
  materialType: string;
  roomType: RoomType;
  roomName?: string;
  application: string;
  quantity?: number;
  unitType?: string;
  costPerUnit?: number;
  notes?: string;
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

// Application types based on material type
const applicationsByMaterialType: Record<string, { value: string; label: string }[]> = {
  countertop: [
    { value: "kitchen_counter", label: "Kitchen Countertop" },
    { value: "bathroom_vanity", label: "Bathroom Vanity" },
    { value: "island", label: "Kitchen Island" },
    { value: "bar_top", label: "Bar Top" },
    { value: "laundry_counter", label: "Laundry Counter" },
  ],
  flooring: [
    { value: "main_floor", label: "Main Floor" },
    { value: "bedroom_floor", label: "Bedroom Floor" },
    { value: "bathroom_floor", label: "Bathroom Floor" },
    { value: "kitchen_floor", label: "Kitchen Floor" },
    { value: "basement_floor", label: "Basement Floor" },
    { value: "stairs", label: "Stairs" },
  ],
  tile: [
    { value: "backsplash", label: "Backsplash" },
    { value: "shower_wall", label: "Shower Wall" },
    { value: "shower_floor", label: "Shower Floor" },
    { value: "bathroom_floor", label: "Bathroom Floor" },
    { value: "fireplace_surround", label: "Fireplace Surround" },
    { value: "accent_wall", label: "Accent Wall" },
  ],
  cabinet: [
    { value: "kitchen_uppers", label: "Kitchen Upper Cabinets" },
    { value: "kitchen_lowers", label: "Kitchen Lower Cabinets" },
    { value: "bathroom_vanity", label: "Bathroom Vanity Cabinet" },
    { value: "pantry", label: "Pantry" },
    { value: "laundry_cabinets", label: "Laundry Cabinets" },
    { value: "built_ins", label: "Built-in Storage" },
  ],
  hardware: [
    { value: "cabinet_pulls", label: "Cabinet Pulls" },
    { value: "cabinet_knobs", label: "Cabinet Knobs" },
    { value: "door_handles", label: "Door Handles" },
    { value: "drawer_slides", label: "Drawer Slides" },
    { value: "hinges", label: "Hinges" },
  ],
  fixture: [
    { value: "kitchen_faucet", label: "Kitchen Faucet" },
    { value: "bathroom_faucet", label: "Bathroom Faucet" },
    { value: "shower_head", label: "Shower Head" },
    { value: "toilet", label: "Toilet" },
    { value: "bathtub", label: "Bathtub" },
    { value: "sink", label: "Sink" },
  ],
  lighting: [
    { value: "pendant", label: "Pendant Light" },
    { value: "chandelier", label: "Chandelier" },
    { value: "recessed", label: "Recessed Lighting" },
    { value: "vanity_light", label: "Vanity Light" },
    { value: "sconce", label: "Wall Sconce" },
    { value: "under_cabinet", label: "Under Cabinet Light" },
  ],
  appliance: [
    { value: "refrigerator", label: "Refrigerator" },
    { value: "range", label: "Range/Stove" },
    { value: "dishwasher", label: "Dishwasher" },
    { value: "microwave", label: "Microwave" },
    { value: "washer", label: "Washer" },
    { value: "dryer", label: "Dryer" },
    { value: "hood", label: "Range Hood" },
  ],
};

// Default applications for unknown material types
const defaultApplications = [
  { value: "general", label: "General Use" },
  { value: "accent", label: "Accent Feature" },
  { value: "primary", label: "Primary Material" },
];

export function MaterialSelectionDialog({
  open,
  onOpenChange,
  material,
  onSave,
}: MaterialSelectionDialogProps) {
  const [roomType, setRoomType] = useState<RoomType>("kitchen");
  const [application, setApplication] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Get applications for the material type
  const applications =
    applicationsByMaterialType[material?.material_type?.toLowerCase() || ""] ||
    defaultApplications;

  const handleSave = async () => {
    if (!material || !application) return;

    setSaving(true);
    try {
      await onSave({
        materialId: material.id,
        materialName: material.product_name,
        materialType: material.material_type,
        roomType,
        application,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unitType: material.unit_type || undefined,
        costPerUnit: material.avg_cost_per_unit || undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setRoomType("kitchen");
      setApplication("");
      setQuantity("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save material selection:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!material) return null;

  const imageUrl = material.swatch_image_url || material.image_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 border border-zinc-300 dark:border-zinc-600 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <IconBox className="w-4 h-4 text-zinc-400" />
              )}
            </div>
            <span>Add {material.product_name} to Project</span>
          </DialogTitle>
          <DialogDescription>
            Assign this material to a specific room and application in your project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Material Preview */}
          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="w-16 h-16 border border-zinc-300 dark:border-zinc-600 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={material.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconBox className="w-8 h-8 text-zinc-400" />
              )}
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {material.product_name}
              </p>
              <p className="text-sm text-zinc-500">
                {material.brand && `${material.brand} • `}
                <span className="capitalize">{material.material_category || material.material_type}</span>
              </p>
              {material.avg_cost_per_unit !== null && material.avg_cost_per_unit !== undefined && (
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  ${material.avg_cost_per_unit.toFixed(2)}/{material.unit_type || "unit"}
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

          {/* Application Selection */}
          <div className="grid gap-2">
            <Label htmlFor="application">Application</Label>
            <Select value={application} onValueChange={setApplication}>
              <SelectTrigger id="application" className="rounded-none">
                <SelectValue placeholder="Select an application" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {applications.map((app) => (
                  <SelectItem key={app.value} value={app.value} className="rounded-none">
                    {app.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">
              Quantity {material.unit_type && `(${material.unit_type})`}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-none"
            />
            {quantity && material.avg_cost_per_unit && (
              <p className="text-xs text-zinc-500">
                Estimated cost: ${(parseFloat(quantity) * material.avg_cost_per_unit).toFixed(2)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Match with existing countertops..."
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
          <Button
            onClick={handleSave}
            className="rounded-none"
            disabled={saving || !application}
          >
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
