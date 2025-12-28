"use client";

import { useState, useCallback } from "react";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { ColorWall, ProjectPaletteBar, EditSelectionDialog } from "@/components/color-library";
import type { AddToProjectConfig } from "@/components/color-library/AddToProjectDialog";
import type { EditSelectionConfig } from "@/components/color-library/EditSelectionDialog";
import { useDesignStore } from "@/stores/design-store";
import { toast } from "sonner";
import type { Color } from "@/types/color";
import type { ProjectColorSelection, RoomType, SurfaceType, PaintFinish } from "@/types/design";

const MAX_COLORS = 5;

export default function Step4Colors() {
  // Design store state and actions
  const {
    projectColorSelections,
    addColorSelection,
    removeColorSelection,
    updateColorSelection,
  } = useDesignStore();

  // State for edit dialog
  const [editingSelection, setEditingSelection] = useState<ProjectColorSelection | null>(null);

  // Check if palette is full
  const isPaletteFull = projectColorSelections.length >= MAX_COLORS;

  // Handle adding a color to the project
  const handleAddToProject = useCallback((color: Color, config: AddToProjectConfig) => {
    // Check if this exact color+surface+room combo already exists
    const isDuplicate = projectColorSelections.some(
      (s) =>
        s.colorId === color.id &&
        s.surfaceType === config.surfaceType &&
        s.roomType === config.roomType
    );

    if (isDuplicate) {
      toast.info("This color is already assigned to this surface and room");
      return;
    }

    // Check max limit
    if (isPaletteFull) {
      toast.warning("Maximum 5 colors allowed - remove one to add more");
      return;
    }

    // Create the selection object
    const newSelection: ProjectColorSelection = {
      id: crypto.randomUUID(),
      projectId: "temp", // Will be updated when project is saved
      roomType: config.roomType as RoomType,
      roomName: config.roomName || null,
      surfaceType: config.surfaceType as SurfaceType,
      colorId: color.id,
      customColorName: null,
      customHexCode: null,
      // Store the color object for display purposes
      color: {
        id: color.id,
        brand: color.brand,
        colorCode: color.color_code,
        colorName: color.color_name,
        hexCode: color.hex_code,
        rgbValues: color.rgb_values,
        lrv: color.lrv,
        undertones: (color.undertones || []) as ("warm" | "cool" | "neutral")[],
        colorFamily: color.color_family as import("@/types/design").ColorFamily | null,
        finishOptions: (color.finish_options || []) as PaintFinish[],
        recommendedRooms: (color.recommended_rooms || []) as RoomType[],
        recommendedSurfaces: (color.recommended_surfaces || []) as SurfaceType[],
        imageUrl: color.image_url,
        popular: color.popular || false,
        yearIntroduced: color.year_introduced,
        isActive: color.is_active || true,
        designStyles: (color.design_styles || []) as import("@/types/design").DesignStyle[],
        createdAt: new Date(color.created_at || Date.now()),
        updatedAt: new Date(color.updated_at || Date.now()),
      },
      finish: (config.finish as PaintFinish) || null,
      coats: 2,
      primerNeeded: false,
      linkedScopeItemId: null,
      notes: config.notes || null,
      applicationInstructions: null,
      isPrimary: projectColorSelections.length === 0,
      isApproved: false,
      approvedByClient: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addColorSelection(newSelection);
    toast.success(`Added ${color.color_name} to your palette`);
  }, [projectColorSelections, isPaletteFull, addColorSelection]);

  // Handle removing a color from the project
  const handleRemoveColor = useCallback((id: string) => {
    const selection = projectColorSelections.find((s) => s.id === id);
    removeColorSelection(id);
    if (selection?.color) {
      toast.info(`Removed ${selection.color.colorName} from palette`);
    }
  }, [projectColorSelections, removeColorSelection]);

  // Handle editing a selection
  const handleEditSelection = useCallback((selection: ProjectColorSelection) => {
    setEditingSelection(selection);
  }, []);

  // Handle saving edited selection
  const handleSaveEdit = useCallback((id: string, config: EditSelectionConfig) => {
    updateColorSelection(id, {
      surfaceType: config.surfaceType,
      roomType: config.roomType,
      roomName: config.roomName || null,
      finish: config.finish || null,
      notes: config.notes || null,
      updatedAt: new Date(),
    });
    setEditingSelection(null);
    toast.success("Color selection updated");
  }, [updateColorSelection]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Project Color Palette Bar */}
      <div className="shrink-0">
        <ProjectPaletteBar
          selections={projectColorSelections}
          onRemove={handleRemoveColor}
          onEdit={handleEditSelection}
          maxColors={MAX_COLORS}
        />
      </div>

      {/* Color Wall - takes remaining space */}
      <div className="flex-1 min-h-0 mt-4 border border-border bg-background overflow-hidden">
        <ColorWall
          onAddToProject={handleAddToProject}
          isPaletteFull={isPaletteFull}
        />
      </div>

      {/* Wizard Footer */}
      <div className="shrink-0 mt-4">
        <WizardFooter />
      </div>

      {/* Edit Selection Dialog */}
      {editingSelection && (
        <EditSelectionDialog
          selection={editingSelection}
          open={!!editingSelection}
          onOpenChange={(open) => !open && setEditingSelection(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
