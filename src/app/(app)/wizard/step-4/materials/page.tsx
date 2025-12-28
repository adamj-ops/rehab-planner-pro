"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import {
  MaterialGrid,
  MaterialSelectionDialog,
  MaterialSelectionsSummary,
  type MaterialSelectionData,
  type MaterialSelection,
} from "@/components/design/MaterialLibrary";
import { IconBuildingWarehouse, IconPlus, IconLoader2, IconBox } from "@tabler/icons-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useRehabStore } from "@/hooks/use-rehab-store";

interface SelectedMaterial {
  id: string;
  product_name: string;
  brand: string | null;
  material_type: string;
  material_category: string | null;
  color_description: string | null;
  finish: string | null;
  avg_cost_per_unit: number | null;
  unit_type: string | null;
  image_url: string | null;
  swatch_image_url: string | null;
}

const MAX_SELECTIONS = 20;

export default function Step4Materials() {
  const { project } = useRehabStore();
  const projectId = project?.id;

  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null);
  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load existing material selections from the database
  const loadMaterialSelections = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("project_material_selections")
        .select(`
          id,
          material_id,
          room_type,
          room_name,
          application,
          quantity,
          unit_type,
          cost_per_unit,
          total_cost,
          notes,
          material_library (
            id,
            product_name,
            brand,
            material_type,
            material_category,
            image_url,
            swatch_image_url
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Transform database records to MaterialSelection type
      const selections: MaterialSelection[] = (data || []).map((record) => ({
        id: record.id,
        materialId: record.material_id || "",
        materialName: record.material_library?.product_name || "Custom Material",
        materialType: record.material_library?.material_type || "other",
        materialCategory: record.material_library?.material_category || undefined,
        brand: record.material_library?.brand || undefined,
        roomType: record.room_type as MaterialSelection["roomType"],
        roomName: record.room_name || undefined,
        application: record.application,
        quantity: record.quantity || undefined,
        unitType: record.unit_type || undefined,
        costPerUnit: record.cost_per_unit || undefined,
        totalCost: record.total_cost || undefined,
        imageUrl: record.material_library?.swatch_image_url || record.material_library?.image_url || undefined,
        notes: record.notes || undefined,
      }));

      setMaterialSelections(selections);
    } catch (err) {
      console.error("Failed to load material selections:", err);
      toast.error("Failed to load saved materials");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadMaterialSelections();
  }, [loadMaterialSelections]);

  const handleMaterialSelect = (materialId: string, material: SelectedMaterial) => {
    setSelectedMaterial(material);
  };

  const handleAddToProject = () => {
    if (!selectedMaterial) return;

    if (materialSelections.length >= MAX_SELECTIONS) {
      toast.warning(`Maximum ${MAX_SELECTIONS} material selections allowed`);
      return;
    }

    // Open the dialog to assign room and application
    setDialogOpen(true);
  };

  const handleSaveSelection = async (selectionData: MaterialSelectionData) => {
    if (!projectId) {
      // If no project yet, save to local state only
      const totalCost =
        selectionData.quantity && selectionData.costPerUnit
          ? selectionData.quantity * selectionData.costPerUnit
          : undefined;

      const newSelection: MaterialSelection = {
        id: crypto.randomUUID(),
        materialId: selectionData.materialId,
        materialName: selectionData.materialName,
        materialType: selectionData.materialType,
        materialCategory: selectedMaterial?.material_category || undefined,
        brand: selectedMaterial?.brand || undefined,
        roomType: selectionData.roomType,
        roomName: selectionData.roomName,
        application: selectionData.application,
        quantity: selectionData.quantity,
        unitType: selectionData.unitType,
        costPerUnit: selectionData.costPerUnit,
        totalCost,
        imageUrl: selectedMaterial?.swatch_image_url || selectedMaterial?.image_url || undefined,
        notes: selectionData.notes,
      };

      setMaterialSelections((prev) => [...prev, newSelection]);
      setSelectedMaterial(null);
      toast.success(`Added ${selectionData.materialName} to your project`);
      return;
    }

    // Calculate total cost
    const totalCost =
      selectionData.quantity && selectionData.costPerUnit
        ? selectionData.quantity * selectionData.costPerUnit
        : null;

    // Save to database
    try {
      const { data, error } = await supabase
        .from("project_material_selections")
        .insert({
          project_id: projectId,
          material_id: selectionData.materialId,
          room_type: selectionData.roomType,
          room_name: selectionData.roomName || null,
          application: selectionData.application,
          quantity: selectionData.quantity || null,
          unit_type: selectionData.unitType || null,
          cost_per_unit: selectionData.costPerUnit || null,
          total_cost: totalCost,
          notes: selectionData.notes || null,
          is_approved: false,
          is_ordered: false,
          is_received: false,
        })
        .select(`
          id,
          material_id,
          room_type,
          room_name,
          application,
          quantity,
          unit_type,
          cost_per_unit,
          total_cost,
          notes,
          material_library (
            id,
            product_name,
            brand,
            material_type,
            material_category,
            image_url,
            swatch_image_url
          )
        `)
        .single();

      if (error) throw error;

      // Add to local state
      const newSelection: MaterialSelection = {
        id: data.id,
        materialId: data.material_id || "",
        materialName: data.material_library?.product_name || selectionData.materialName,
        materialType: data.material_library?.material_type || selectionData.materialType,
        materialCategory: data.material_library?.material_category || undefined,
        brand: data.material_library?.brand || undefined,
        roomType: data.room_type as MaterialSelection["roomType"],
        roomName: data.room_name || undefined,
        application: data.application,
        quantity: data.quantity || undefined,
        unitType: data.unit_type || undefined,
        costPerUnit: data.cost_per_unit || undefined,
        totalCost: data.total_cost || undefined,
        imageUrl: data.material_library?.swatch_image_url || data.material_library?.image_url || undefined,
        notes: data.notes || undefined,
      };

      setMaterialSelections((prev) => [...prev, newSelection]);
      setSelectedMaterial(null);
      toast.success(`Added ${selectionData.materialName} to your project`);
    } catch (err) {
      console.error("Failed to save material selection:", err);
      toast.error("Failed to save material selection");
      throw err;
    }
  };

  const handleRemoveSelection = async (selectionId: string) => {
    const selection = materialSelections.find((s) => s.id === selectionId);
    if (!selection) return;

    if (projectId) {
      try {
        const { error } = await supabase
          .from("project_material_selections")
          .delete()
          .eq("id", selectionId);

        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete material selection:", err);
        toast.error("Failed to remove material");
        return;
      }
    }

    setMaterialSelections((prev) => prev.filter((s) => s.id !== selectionId));
    toast.info(`Removed ${selection.materialName}`);
  };

  // Check if the selected material is already used somewhere
  const isMaterialAlreadyUsed = selectedMaterial
    ? materialSelections.some((s) => s.materialId === selectedMaterial.id)
    : false;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-zinc-600 dark:text-zinc-400">
            Loading saved materials...
          </span>
        </div>
      )}

      {/* Material Selections Summary */}
      {!loading && (
        <MaterialSelectionsSummary
          selections={materialSelections}
          onRemove={handleRemoveSelection}
          maxSelections={MAX_SELECTIONS}
        />
      )}

      {/* Main Material Library Card */}
      <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <IconBuildingWarehouse className="h-5 w-5" />
            Material Library
          </CardTitle>
          <CardDescription className="text-zinc-600 dark:text-zinc-400">
            Browse countertops, flooring, tile, fixtures, and more. Assign materials to specific rooms and applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Material Grid */}
          <MaterialGrid
            selectedMaterialId={selectedMaterial?.id}
            onMaterialSelect={handleMaterialSelect}
          />
        </CardContent>
      </Card>

      {/* Selected Material Preview + Action */}
      {selectedMaterial && (
        <Card className="rounded-none border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Material Image */}
              <div className="w-16 h-16 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {(selectedMaterial.swatch_image_url || selectedMaterial.image_url) ? (
                  <img
                    src={selectedMaterial.swatch_image_url || selectedMaterial.image_url || ""}
                    alt={selectedMaterial.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconBox className="w-8 h-8 text-zinc-400" />
                )}
              </div>

              {/* Material Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedMaterial.product_name}
                </p>
                <p className="text-sm text-zinc-500">
                  {selectedMaterial.brand && `${selectedMaterial.brand} • `}
                  <span className="capitalize">
                    {selectedMaterial.material_category || selectedMaterial.material_type}
                  </span>
                </p>
                {selectedMaterial.avg_cost_per_unit !== null && (
                  <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    ${selectedMaterial.avg_cost_per_unit.toFixed(2)}/{selectedMaterial.unit_type || "unit"}
                  </p>
                )}
                {isMaterialAlreadyUsed && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    This material is already assigned to a room
                  </p>
                )}
              </div>

              {/* Add to Project Button */}
              <Button
                onClick={handleAddToProject}
                disabled={materialSelections.length >= MAX_SELECTIONS}
                className="rounded-none shrink-0"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Assign to Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Material Selection Dialog */}
      <MaterialSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        material={selectedMaterial}
        onSave={handleSaveSelection}
      />

      <WizardFooter />
    </div>
  );
}
