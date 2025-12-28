"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import {
  MoodboardCanvas,
  AddElementDialog,
  type MoodboardNode,
} from "@/components/design/Moodboard";
import { IconPhoto, IconPlus, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useRehabStore } from "@/hooks/use-rehab-store";
import { Edge } from "@xyflow/react";

interface Color {
  id: string;
  color_code: string;
  color_name: string;
  hex_code: string;
}

interface Material {
  id: string;
  product_name: string;
  brand: string | null;
  material_type: string;
  image_url: string | null;
  swatch_image_url: string | null;
}

export default function Step4Moodboard() {
  const { project } = useRehabStore();
  const projectId = project?.id;

  const [nodes, setNodes] = useState<MoodboardNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moodboardId, setMoodboardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing moodboard
  useEffect(() => {
    loadMoodboard();
  }, [projectId]);

  const loadMoodboard = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      // Get or create the primary moodboard for this project
      const { data: moodboards, error: mbError } = await supabase
        .from("moodboards")
        .select("id")
        .eq("project_id", projectId)
        .eq("is_primary", true)
        .limit(1);

      if (mbError) throw mbError;

      let mbId: string;

      if (moodboards && moodboards.length > 0) {
        mbId = moodboards[0].id;
      } else {
        // Create a new moodboard
        const { data: newMb, error: createError } = await supabase
          .from("moodboards")
          .insert({
            project_id: projectId,
            name: "Design Moodboard",
            moodboard_type: "custom",
            is_primary: true,
            layout_type: "free",
            canvas_width: 1920,
            canvas_height: 1080,
            background_color: "#FFFFFF",
            show_grid: true,
            grid_size: 20,
            snap_to_grid: true,
          })
          .select("id")
          .single();

        if (createError) throw createError;
        mbId = newMb.id;
      }

      setMoodboardId(mbId);

      // Load elements
      const { data: elements, error: elemError } = await supabase
        .from("moodboard_elements")
        .select("*")
        .eq("moodboard_id", mbId)
        .order("z_index", { ascending: true });

      if (elemError) throw elemError;

      // Convert database elements to React Flow nodes
      const loadedNodes: MoodboardNode[] = (elements || []).map((el) => ({
        id: el.id,
        type: mapElementTypeToNodeType(el.element_type),
        position: { x: el.position_x, y: el.position_y },
        data: extractNodeData(el),
        style: { width: el.width, height: el.height },
      }));

      setNodes(loadedNodes);
    } catch (err) {
      console.error("Failed to load moodboard:", err);
      toast.error("Failed to load moodboard");
    } finally {
      setLoading(false);
    }
  };

  // Handle nodes update
  const handleNodesUpdate = useCallback((updatedNodes: MoodboardNode[]) => {
    setNodes(updatedNodes);
    setHasChanges(true);
  }, []);

  // Handle edges update
  const handleEdgesUpdate = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
    setHasChanges(true);
  }, []);

  // Add color swatch from library
  const handleAddColor = useCallback(
    (color: Color) => {
      const newNode: MoodboardNode = {
        id: `color-${Date.now()}`,
        type: "colorSwatch",
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          colorId: color.id,
          colorName: color.color_name,
          colorCode: color.color_code,
          hexCode: color.hex_code,
          showName: true,
          showCode: true,
        },
        style: { width: 120, height: 150 },
      };

      setNodes((prev) => [...prev, newNode]);
      setHasChanges(true);
      toast.success(`Added ${color.color_name} to moodboard`);
    },
    []
  );

  // Add material sample from library
  const handleAddMaterial = useCallback(
    (material: Material) => {
      const newNode: MoodboardNode = {
        id: `material-${Date.now()}`,
        type: "materialSample",
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          materialId: material.id,
          materialName: material.product_name,
          materialType: material.material_type,
          brand: material.brand,
          imageUrl: material.swatch_image_url || material.image_url,
          showName: true,
          showType: true,
        },
        style: { width: 150, height: 180 },
      };

      setNodes((prev) => [...prev, newNode]);
      setHasChanges(true);
      toast.success(`Added ${material.product_name} to moodboard`);
    },
    []
  );

  // Add image
  const handleAddImage = useCallback(
    (imageUrl: string, caption?: string) => {
      const newNode: MoodboardNode = {
        id: `image-${Date.now()}`,
        type: "image",
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          imageUrl,
          caption,
          showCaption: !!caption,
        },
        style: { width: 200, height: 200 },
      };

      setNodes((prev) => [...prev, newNode]);
      setHasChanges(true);
      toast.success("Added image to moodboard");
    },
    []
  );

  // Add text
  const handleAddText = useCallback(
    (text: string) => {
      const newNode: MoodboardNode = {
        id: `text-${Date.now()}`,
        type: "text",
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          text,
          fontSize: 14,
          fontWeight: "normal",
          textAlign: "left",
        },
        style: { width: 200, height: 80 },
      };

      setNodes((prev) => [...prev, newNode]);
      setHasChanges(true);
      toast.success("Added text to moodboard");
    },
    []
  );

  // Save moodboard to database
  const handleSave = async () => {
    if (!moodboardId) {
      toast.error("No moodboard to save");
      return;
    }

    setSaving(true);
    try {
      // Delete existing elements
      const { error: deleteError } = await supabase
        .from("moodboard_elements")
        .delete()
        .eq("moodboard_id", moodboardId);

      if (deleteError) throw deleteError;

      // Insert new elements
      if (nodes.length > 0) {
        const elementsToInsert = nodes.map((node, index) => ({
          moodboard_id: moodboardId,
          element_type: mapNodeTypeToElementType(node.type),
          position_x: Math.round(node.position.x),
          position_y: Math.round(node.position.y),
          width: (node.style?.width as number) || 150,
          height: (node.style?.height as number) || 150,
          z_index: index,
          // Color swatch data
          color_id: node.data?.colorId || null,
          show_color_name: node.data?.showName ?? true,
          show_color_code: node.data?.showCode ?? true,
          // Material data
          material_id: node.data?.materialId || null,
          show_material_name: node.data?.showName ?? true,
          show_material_specs: node.data?.showType ?? false,
          material_sample_image_url: node.type === "materialSample" ? node.data?.imageUrl : null,
          // Image data
          image_url: node.type === "image" ? node.data?.imageUrl : null,
          // Text data
          text_content: node.type === "text" ? node.data?.text : null,
          font_size: node.data?.fontSize || 14,
          font_weight: node.data?.fontWeight || "normal",
          text_align: node.data?.textAlign || "left",
          text_color: node.data?.textColor || "#18181b",
          // Common
          is_visible: true,
          is_locked: false,
        }));

        const { error: insertError } = await supabase
          .from("moodboard_elements")
          .insert(elementsToInsert);

        if (insertError) throw insertError;
      }

      setHasChanges(false);
      toast.success("Moodboard saved successfully");
    } catch (err) {
      console.error("Failed to save moodboard:", err);
      toast.error("Failed to save moodboard");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
          <CardContent className="flex items-center justify-center h-[600px]">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-zinc-600 dark:text-zinc-400">
              Loading moodboard...
            </span>
          </CardContent>
        </Card>
        <WizardFooter />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <IconPhoto className="h-5 w-5" />
              Moodboard Builder
            </CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-400">
              Drag and drop colors, materials, and images to create your design vision.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="rounded-none"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Element
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="rounded-none"
            >
              {saving ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] border-t border-zinc-200 dark:border-zinc-700">
            <MoodboardCanvas
              initialNodes={nodes}
              initialEdges={edges}
              onNodesUpdate={handleNodesUpdate}
              onEdgesUpdate={handleEdgesUpdate}
              showMiniMap={true}
              showControls={true}
              showBackground={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Element Dialog */}
      <AddElementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddColor={handleAddColor}
        onAddMaterial={handleAddMaterial}
        onAddImage={handleAddImage}
        onAddText={handleAddText}
      />

      <WizardFooter />
    </div>
  );
}

// Helper functions
function mapElementTypeToNodeType(elementType: string): MoodboardNode["type"] {
  switch (elementType) {
    case "color_swatch":
      return "colorSwatch";
    case "material_sample":
      return "materialSample";
    case "image":
      return "image";
    case "text":
      return "text";
    default:
      return "image";
  }
}

function mapNodeTypeToElementType(nodeType: string): string {
  switch (nodeType) {
    case "colorSwatch":
      return "color_swatch";
    case "materialSample":
      return "material_sample";
    case "image":
      return "image";
    case "text":
      return "text";
    default:
      return "image";
  }
}

function extractNodeData(element: Record<string, unknown>): Record<string, unknown> {
  const elementType = element.element_type as string;

  switch (elementType) {
    case "color_swatch":
      return {
        colorId: element.color_id,
        colorName: "Color", // Would need to join with color_library
        hexCode: "#6366f1", // Default, would need to join
        showName: element.show_color_name ?? true,
        showCode: element.show_color_code ?? true,
      };
    case "material_sample":
      return {
        materialId: element.material_id,
        materialName: "Material", // Would need to join
        imageUrl: element.material_sample_image_url,
        showName: element.show_material_name ?? true,
        showType: element.show_material_specs ?? false,
      };
    case "image":
      return {
        imageUrl: element.image_url,
        caption: element.notes,
        showCaption: !!element.notes,
      };
    case "text":
      return {
        text: element.text_content || "",
        fontSize: element.font_size || 14,
        fontWeight: element.font_weight || "normal",
        textAlign: element.text_align || "left",
        textColor: element.text_color || "#18181b",
      };
    default:
      return {};
  }
}
