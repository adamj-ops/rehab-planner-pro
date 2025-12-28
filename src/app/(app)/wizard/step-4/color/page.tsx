"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import {
  ColorGrid,
  ColorSelectionDialog,
  ColorSelectionsSummary,
  type ColorSelectionData,
  type ColorSelection,
} from "@/components/design/ColorLibrary";
import { IconPalette, IconPlus, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useRehabStore } from "@/hooks/use-rehab-store";

interface SelectedColor {
  id: string;
  color_code: string;
  name: string;
  hex_code: string;
  color_family?: string;
  lrv?: number;
}

const MAX_SELECTIONS = 10;

export default function Step4Colors() {
  const { project } = useRehabStore();
  const projectId = project?.id;

  const [selectedColor, setSelectedColor] = useState<SelectedColor | null>(null);
  const [colorSelections, setColorSelections] = useState<ColorSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load existing color selections from the database
  const loadColorSelections = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("project_color_selections")
        .select(`
          id,
          color_id,
          room_type,
          room_name,
          surface_type,
          finish,
          notes,
          is_primary,
          color_library (
            id,
            color_code,
            color_name,
            hex_code
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Transform database records to ColorSelection type
      const selections: ColorSelection[] = (data || []).map((record) => ({
        id: record.id,
        colorId: record.color_id || "",
        colorName: record.color_library?.color_name || "Custom Color",
        colorCode: record.color_library?.color_code || undefined,
        hexCode: record.color_library?.hex_code || "#CCCCCC",
        roomType: record.room_type as ColorSelection["roomType"],
        roomName: record.room_name || undefined,
        surfaceType: record.surface_type as ColorSelection["surfaceType"],
        finish: record.finish as ColorSelection["finish"],
        notes: record.notes || undefined,
        isPrimary: record.is_primary || false,
      }));

      setColorSelections(selections);
    } catch (err) {
      console.error("Failed to load color selections:", err);
      toast.error("Failed to load saved colors");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadColorSelections();
  }, [loadColorSelections]);

  const handleColorSelect = (colorId: string, color: SelectedColor) => {
    setSelectedColor(color);
  };

  const handleAddToProject = () => {
    if (!selectedColor) return;

    if (colorSelections.length >= MAX_SELECTIONS) {
      toast.warning(`Maximum ${MAX_SELECTIONS} color selections allowed`);
      return;
    }

    // Open the dialog to assign room and surface
    setDialogOpen(true);
  };

  const handleSaveSelection = async (selectionData: ColorSelectionData) => {
    if (!projectId) {
      // If no project yet, save to local state only
      const newSelection: ColorSelection = {
        id: crypto.randomUUID(),
        colorId: selectionData.colorId,
        colorName: selectionData.colorName,
        colorCode: selectedColor?.color_code,
        hexCode: selectionData.hexCode,
        roomType: selectionData.roomType,
        roomName: selectionData.roomName,
        surfaceType: selectionData.surfaceType,
        finish: selectionData.finish,
        notes: selectionData.notes,
        isPrimary: selectionData.isPrimary,
      };

      setColorSelections((prev) => [...prev, newSelection]);
      setSelectedColor(null);
      toast.success(`Added ${selectionData.colorName} to your project`);
      return;
    }

    // Save to database
    try {
      const { data, error } = await supabase
        .from("project_color_selections")
        .insert({
          project_id: projectId,
          color_id: selectionData.colorId,
          room_type: selectionData.roomType,
          room_name: selectionData.roomName || null,
          surface_type: selectionData.surfaceType,
          finish: selectionData.finish,
          notes: selectionData.notes || null,
          is_primary: selectionData.isPrimary || false,
          coats: 2,
          primer_needed: false,
        })
        .select(`
          id,
          color_id,
          room_type,
          room_name,
          surface_type,
          finish,
          notes,
          is_primary,
          color_library (
            id,
            color_code,
            color_name,
            hex_code
          )
        `)
        .single();

      if (error) throw error;

      // Add to local state
      const newSelection: ColorSelection = {
        id: data.id,
        colorId: data.color_id || "",
        colorName: data.color_library?.color_name || selectionData.colorName,
        colorCode: data.color_library?.color_code || undefined,
        hexCode: data.color_library?.hex_code || selectionData.hexCode,
        roomType: data.room_type as ColorSelection["roomType"],
        roomName: data.room_name || undefined,
        surfaceType: data.surface_type as ColorSelection["surfaceType"],
        finish: data.finish as ColorSelection["finish"],
        notes: data.notes || undefined,
        isPrimary: data.is_primary || false,
      };

      setColorSelections((prev) => [...prev, newSelection]);
      setSelectedColor(null);
      toast.success(`Added ${selectionData.colorName} to your project`);
    } catch (err) {
      console.error("Failed to save color selection:", err);
      toast.error("Failed to save color selection");
      throw err;
    }
  };

  const handleRemoveSelection = async (selectionId: string) => {
    const selection = colorSelections.find((s) => s.id === selectionId);
    if (!selection) return;

    if (projectId) {
      try {
        const { error } = await supabase
          .from("project_color_selections")
          .delete()
          .eq("id", selectionId);

        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete color selection:", err);
        toast.error("Failed to remove color");
        return;
      }
    }

    setColorSelections((prev) => prev.filter((s) => s.id !== selectionId));
    toast.info(`Removed ${selection.colorName}`);
  };

  // Check if the selected color is already used for any surface
  const isColorAlreadyUsed = selectedColor
    ? colorSelections.some((s) => s.colorId === selectedColor.id)
    : false;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-zinc-600 dark:text-zinc-400">
            Loading saved colors...
          </span>
        </div>
      )}

      {/* Color Selections Summary */}
      {!loading && (
        <ColorSelectionsSummary
          selections={colorSelections}
          onRemove={handleRemoveSelection}
          maxSelections={MAX_SELECTIONS}
        />
      )}

      {/* Main Color Library Card */}
      <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <IconPalette className="h-5 w-5" />
            Color Library
          </CardTitle>
          <CardDescription className="text-zinc-600 dark:text-zinc-400">
            Browse Sherwin-Williams colors and assign them to specific rooms and surfaces in your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Grid */}
          <ColorGrid
            selectedColorId={selectedColor?.id}
            onColorSelect={handleColorSelect}
            maxSelections={MAX_SELECTIONS}
          />
        </CardContent>
      </Card>

      {/* Selected Color Preview + Action */}
      {selectedColor && (
        <Card className="rounded-none border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Color Swatch */}
              <div
                className="w-16 h-16 border border-zinc-200 dark:border-zinc-700 shrink-0"
                style={{ backgroundColor: selectedColor.hex_code }}
              />

              {/* Color Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedColor.name}
                </p>
                <p className="text-sm font-mono text-zinc-500">
                  {selectedColor.color_code} • {selectedColor.hex_code}
                </p>
                {selectedColor.color_family && (
                  <p className="text-sm text-zinc-500 capitalize">
                    {selectedColor.color_family} Family
                    {selectedColor.lrv !== undefined && ` • LRV: ${selectedColor.lrv}`}
                  </p>
                )}
                {isColorAlreadyUsed && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    This color is already assigned to a surface
                  </p>
                )}
              </div>

              {/* Add to Project Button */}
              <Button
                onClick={handleAddToProject}
                disabled={colorSelections.length >= MAX_SELECTIONS}
                className="rounded-none shrink-0"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Assign to Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Selection Dialog */}
      <ColorSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        color={selectedColor}
        onSave={handleSaveSelection}
      />

      <WizardFooter />
    </div>
  );
}
