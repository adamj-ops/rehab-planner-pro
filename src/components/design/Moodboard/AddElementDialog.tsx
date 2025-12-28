"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import {
  IconSearch,
  IconColorSwatch,
  IconBox,
  IconPhoto,
  IconTypography,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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

type ElementType = "color" | "material" | "image" | "text";

interface AddElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddColor: (color: Color) => void;
  onAddMaterial: (material: Material) => void;
  onAddImage: (imageUrl: string, caption?: string) => void;
  onAddText: (text: string) => void;
}

export function AddElementDialog({
  open,
  onOpenChange,
  onAddColor,
  onAddMaterial,
  onAddImage,
  onAddText,
}: AddElementDialogProps) {
  const [activeTab, setActiveTab] = useState<ElementType>("color");
  const [searchQuery, setSearchQuery] = useState("");

  // Colors
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);

  // Materials
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Image
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  // Text
  const [textContent, setTextContent] = useState("");

  // Load colors
  useEffect(() => {
    if (open && activeTab === "color" && colors.length === 0) {
      loadColors();
    }
  }, [open, activeTab]);

  // Load materials
  useEffect(() => {
    if (open && activeTab === "material" && materials.length === 0) {
      loadMaterials();
    }
  }, [open, activeTab]);

  const loadColors = async () => {
    setLoadingColors(true);
    try {
      const { data, error } = await supabase
        .from("color_library")
        .select("id, color_code, color_name, hex_code")
        .eq("is_active", true)
        .order("color_name");

      if (error) throw error;
      setColors(data || []);
    } catch (err) {
      console.error("Failed to load colors:", err);
    } finally {
      setLoadingColors(false);
    }
  };

  const loadMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const { data, error } = await supabase
        .from("material_library")
        .select("id, product_name, brand, material_type, image_url, swatch_image_url")
        .eq("is_active", true)
        .order("product_name");

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Filter colors by search
  const filteredColors = colors.filter(
    (c) =>
      c.color_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.color_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter materials by search
  const filteredMaterials = materials.filter(
    (m) =>
      m.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.material_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      onAddImage(imageUrl.trim(), imageCaption.trim() || undefined);
      setImageUrl("");
      setImageCaption("");
      onOpenChange(false);
    }
  };

  const handleAddText = () => {
    if (textContent.trim()) {
      onAddText(textContent.trim());
      setTextContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col rounded-none">
        <DialogHeader>
          <DialogTitle>Add to Moodboard</DialogTitle>
          <DialogDescription>
            Add colors, materials, images, or text to your moodboard.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as ElementType);
            setSearchQuery("");
          }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-none">
            <TabsTrigger value="color" className="rounded-none gap-2">
              <IconColorSwatch className="h-4 w-4" />
              <span className="hidden sm:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="material" className="rounded-none gap-2">
              <IconBox className="h-4 w-4" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="rounded-none gap-2">
              <IconPhoto className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="rounded-none gap-2">
              <IconTypography className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="color" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="relative mb-4">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingColors ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {filteredColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        onAddColor(color);
                        onOpenChange(false);
                      }}
                      className="group flex flex-col items-center p-2 border border-zinc-200 dark:border-zinc-700 hover:border-primary transition-colors"
                    >
                      <div
                        className="w-full aspect-square border border-zinc-200 dark:border-zinc-700"
                        style={{ backgroundColor: color.hex_code }}
                      />
                      <p className="text-xs mt-1 text-center truncate w-full text-zinc-700 dark:text-zinc-300">
                        {color.color_name}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 truncate w-full text-center">
                        {color.color_code}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="material" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="relative mb-4">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMaterials ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredMaterials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => {
                        onAddMaterial(material);
                        onOpenChange(false);
                      }}
                      className="group flex flex-col items-center p-2 border border-zinc-200 dark:border-zinc-700 hover:border-primary transition-colors"
                    >
                      <div className="w-full aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {material.swatch_image_url || material.image_url ? (
                          <img
                            src={material.swatch_image_url || material.image_url || ""}
                            alt={material.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IconBox className="w-8 h-8 text-zinc-400" />
                        )}
                      </div>
                      <p className="text-xs mt-1 text-center truncate w-full text-zinc-700 dark:text-zinc-300">
                        {material.product_name}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate w-full text-center capitalize">
                        {material.material_type}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Image Tab */}
          <TabsContent value="image" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-caption">Caption (optional)</Label>
              <Input
                id="image-caption"
                placeholder="Image description..."
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="rounded-none"
              />
            </div>

            {imageUrl && (
              <div className="border border-zinc-200 dark:border-zinc-700 p-4">
                <p className="text-sm text-zinc-500 mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-40 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <Button
              onClick={handleAddImage}
              disabled={!imageUrl.trim()}
              className="w-full rounded-none"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                placeholder="Enter your text..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="rounded-none min-h-[120px]"
              />
            </div>

            <Button
              onClick={handleAddText}
              disabled={!textContent.trim()}
              className="w-full rounded-none"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Text
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
