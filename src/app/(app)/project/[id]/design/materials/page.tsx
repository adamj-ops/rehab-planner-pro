"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectPageHeader, useProject } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialGrid, MaterialSelectionDialog, MaterialSelectionsSummary } from "@/components/design/MaterialLibrary";
import type { MaterialSelectionData, MaterialSelection } from "@/components/design/MaterialLibrary";
import { supabase } from "@/lib/supabase/client";
import { IconBuildingWarehouse, IconLoader2, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import type { MaterialLibrary } from "@/types/database";

export default function MaterialsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading: projectLoading } = useProject();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialLibrary | null>(null);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");

  // Load existing material selections for this project
  useEffect(() => {
    if (projectId) {
      loadMaterialSelections();
    }
  }, [projectId]);

  const loadMaterialSelections = async () => {
    try {
      setLoadingSelections(true);
      const { data, error } = await supabase
        .from("project_material_selections")
        .select(`
          *,
          material_library (*)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to MaterialSelection format
      const selections: MaterialSelection[] = (data || []).map((sel) => ({
        id: sel.id,
        projectId: sel.project_id,
        roomType: sel.room_type,
        roomName: sel.room_name,
        application: sel.application,
        materialId: sel.material_id,
        quantity: sel.quantity,
        unitType: sel.unit_type,
        costPerUnit: sel.cost_per_unit,
        totalCost: sel.total_cost,
        notes: sel.notes,
        material: sel.material_library,
      }));

      setMaterialSelections(selections);
    } catch (err) {
      console.error("Error loading material selections:", err);
      toast.error("Failed to load material selections");
    } finally {
      setLoadingSelections(false);
    }
  };

  const handleMaterialSelect = async (materialId: string) => {
    // Fetch the full material data
    const { data, error } = await supabase
      .from("material_library")
      .select("*")
      .eq("id", materialId)
      .single();

    if (error) {
      toast.error("Failed to load material details");
      return;
    }

    setSelectedMaterialId(materialId);
    setSelectedMaterial(data);
    setShowSelectionDialog(true);
  };

  const handleSelectionSave = async (selectionData: MaterialSelectionData) => {
    try {
      const costPerUnit = selectedMaterial?.avg_cost_per_unit || 0;
      const totalCost = selectionData.quantity ? selectionData.quantity * costPerUnit : null;

      const { error } = await supabase.from("project_material_selections").insert({
        project_id: projectId,
        room_type: selectionData.roomType || null,
        room_name: selectionData.roomName || null,
        application: selectionData.application,
        material_id: selectedMaterialId,
        quantity: selectionData.quantity || null,
        unit_type: selectedMaterial?.unit_type || null,
        cost_per_unit: costPerUnit,
        total_cost: totalCost,
        notes: selectionData.notes || null,
      });

      if (error) throw error;

      toast.success("Material selection saved!");
      setShowSelectionDialog(false);
      setSelectedMaterialId(undefined);
      setSelectedMaterial(null);
      loadMaterialSelections();
      setActiveTab("selections");
    } catch (err) {
      console.error("Error saving material selection:", err);
      toast.error("Failed to save material selection");
    }
  };

  const handleDeleteSelection = async (selectionId: string) => {
    try {
      const { error } = await supabase
        .from("project_material_selections")
        .delete()
        .eq("id", selectionId);

      if (error) throw error;

      toast.success("Material selection removed");
      loadMaterialSelections();
    } catch (err) {
      console.error("Error deleting material selection:", err);
      toast.error("Failed to remove material selection");
    }
  };

  // Calculate total cost
  const totalMaterialsCost = materialSelections.reduce(
    (sum, sel) => sum + (sel.totalCost || 0),
    0
  );

  if (projectLoading) {
    return (
      <>
        <ProjectPageHeader section="Design" subsection="Materials" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <ProjectPageHeader section="Design" subsection="Materials" />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBuildingWarehouse className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">Material Selection</h1>
                <p className="text-muted-foreground">
                  Choose materials for{" "}
                  <span className="font-medium">{project?.project_name || "this project"}</span>
                </p>
              </div>
            </div>
            {totalMaterialsCost > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Est. Materials Cost</p>
                <p className="text-2xl font-bold">${totalMaterialsCost.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Tabs for Browse vs Selections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="browse">Browse Materials</TabsTrigger>
              <TabsTrigger value="selections">
                My Selections ({materialSelections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Material Library</CardTitle>
                  <CardDescription>
                    Browse countertops, flooring, tile, fixtures, and more. Click a material to add it to your project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaterialGrid
                    selectedMaterialId={selectedMaterialId}
                    onMaterialSelect={handleMaterialSelect}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="selections" className="mt-6">
              {loadingSelections ? (
                <div className="flex items-center justify-center h-48">
                  <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : materialSelections.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <IconBuildingWarehouse className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No materials selected yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Browse the material library and add materials to your project
                    </p>
                    <Button onClick={() => setActiveTab("browse")}>
                      <IconPlus className="mr-2 h-4 w-4" />
                      Browse Materials
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <MaterialSelectionsSummary
                  selections={materialSelections}
                  onDelete={handleDeleteSelection}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Material Selection Dialog */}
      {selectedMaterial && (
        <MaterialSelectionDialog
          open={showSelectionDialog}
          onOpenChange={setShowSelectionDialog}
          material={selectedMaterial}
          onSave={handleSelectionSave}
        />
      )}
    </>
  );
}
