"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectPageHeader, useProject } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorGrid, ColorSelectionDialog, ColorSelectionsSummary } from "@/components/design/ColorLibrary";
import type { ColorSelectionData, ColorSelection } from "@/components/design/ColorLibrary";
import { supabase } from "@/lib/supabase/client";
import { IconColorPicker, IconLoader2, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import type { ColorLibrary } from "@/types/database";

export default function ColorsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading: projectLoading } = useProject();

  const [selectedColorId, setSelectedColorId] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<ColorLibrary | null>(null);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [colorSelections, setColorSelections] = useState<ColorSelection[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");

  // Load existing color selections for this project
  useEffect(() => {
    if (projectId) {
      loadColorSelections();
    }
  }, [projectId]);

  const loadColorSelections = async () => {
    try {
      setLoadingSelections(true);
      const { data, error } = await supabase
        .from("project_color_selections")
        .select(`
          *,
          color_library (*)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to ColorSelection format
      const selections: ColorSelection[] = (data || []).map((sel) => ({
        id: sel.id,
        projectId: sel.project_id,
        roomType: sel.room_type,
        roomName: sel.room_name,
        surfaceType: sel.surface_type,
        colorId: sel.color_id,
        finish: sel.finish,
        notes: sel.notes,
        color: sel.color_library,
      }));

      setColorSelections(selections);
    } catch (err) {
      console.error("Error loading color selections:", err);
      toast.error("Failed to load color selections");
    } finally {
      setLoadingSelections(false);
    }
  };

  const handleColorSelect = async (colorId: string) => {
    // Fetch the full color data
    const { data, error } = await supabase
      .from("color_library")
      .select("*")
      .eq("id", colorId)
      .single();

    if (error) {
      toast.error("Failed to load color details");
      return;
    }

    setSelectedColorId(colorId);
    setSelectedColor(data);
    setShowSelectionDialog(true);
  };

  const handleSelectionSave = async (selectionData: ColorSelectionData) => {
    try {
      const { error } = await supabase.from("project_color_selections").insert({
        project_id: projectId,
        room_type: selectionData.roomType,
        room_name: selectionData.roomName || null,
        surface_type: selectionData.surfaceType,
        color_id: selectedColorId,
        finish: selectionData.finish || null,
        notes: selectionData.notes || null,
      });

      if (error) throw error;

      toast.success("Color selection saved!");
      setShowSelectionDialog(false);
      setSelectedColorId(undefined);
      setSelectedColor(null);
      loadColorSelections();
      setActiveTab("selections");
    } catch (err) {
      console.error("Error saving color selection:", err);
      toast.error("Failed to save color selection");
    }
  };

  const handleDeleteSelection = async (selectionId: string) => {
    try {
      const { error } = await supabase
        .from("project_color_selections")
        .delete()
        .eq("id", selectionId);

      if (error) throw error;

      toast.success("Color selection removed");
      loadColorSelections();
    } catch (err) {
      console.error("Error deleting color selection:", err);
      toast.error("Failed to remove color selection");
    }
  };

  if (projectLoading) {
    return (
      <>
        <ProjectPageHeader section="Design" subsection="Colors" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <ProjectPageHeader section="Design" subsection="Colors" />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <IconColorPicker className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Color Selection</h1>
              <p className="text-muted-foreground">
                Choose colors for each room and surface in{" "}
                <span className="font-medium">{project?.project_name || "this project"}</span>
              </p>
            </div>
          </div>

          {/* Tabs for Browse vs Selections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="browse">Browse Colors</TabsTrigger>
              <TabsTrigger value="selections">
                My Selections ({colorSelections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sherwin-Williams Color Library</CardTitle>
                  <CardDescription>
                    Browse and select colors for your project. Click a color to assign it to a room/surface.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorGrid
                    selectedColorId={selectedColorId}
                    onColorSelect={handleColorSelect}
                    maxSelections={1}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="selections" className="mt-6">
              {loadingSelections ? (
                <div className="flex items-center justify-center h-48">
                  <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : colorSelections.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <IconColorPicker className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No colors selected yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Browse the color library and assign colors to rooms and surfaces
                    </p>
                    <Button onClick={() => setActiveTab("browse")}>
                      <IconPlus className="mr-2 h-4 w-4" />
                      Browse Colors
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ColorSelectionsSummary
                  selections={colorSelections}
                  onDelete={handleDeleteSelection}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Color Selection Dialog */}
      {selectedColor && (
        <ColorSelectionDialog
          open={showSelectionDialog}
          onOpenChange={setShowSelectionDialog}
          color={selectedColor}
          onSave={handleSelectionSave}
        />
      )}
    </>
  );
}
