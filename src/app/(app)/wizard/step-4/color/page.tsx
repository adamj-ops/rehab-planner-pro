"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { ColorGrid } from "@/components/design/ColorLibrary";
import { IconPalette, IconCheck, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

interface SelectedColor {
  id: string;
  color_code: string;
  name: string;
  hex_code: string;
  color_family?: string;
  lrv?: number;
}

export default function Step4Colors() {
  const [selectedColor, setSelectedColor] = useState<SelectedColor | null>(null);
  const [projectColors, setProjectColors] = useState<SelectedColor[]>([]);

  const handleColorSelect = (colorId: string, color: SelectedColor) => {
    setSelectedColor(color);
  };

  const handleAddToProject = () => {
    if (!selectedColor) return;

    // Check if already added
    if (projectColors.some((c) => c.id === selectedColor.id)) {
      toast.info("This color is already in your palette");
      return;
    }

    // Check max limit
    if (projectColors.length >= 5) {
      toast.warning("Maximum 5 colors allowed in your project palette");
      return;
    }

    setProjectColors((prev) => [...prev, selectedColor]);
    toast.success(`Added ${selectedColor.name} to your palette`);
  };

  const handleRemoveFromProject = (colorId: string) => {
    setProjectColors((prev) => prev.filter((c) => c.id !== colorId));
    toast.info("Color removed from palette");
  };

  return (
    <div className="space-y-6">
      {/* Selected Colors Bar */}
      {projectColors.length > 0 && (
        <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-primary" />
              Project Color Palette ({projectColors.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {projectColors.map((color) => (
                <div
                  key={color.id}
                  className="group flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 border border-zinc-200 dark:border-zinc-700"
                >
                  <div
                    className="w-6 h-6 border border-zinc-300 dark:border-zinc-600"
                    style={{ backgroundColor: color.hex_code }}
                  />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {color.name}
                  </span>
                  <span className="text-xs text-zinc-500">{color.color_code}</span>
                  <button
                    onClick={() => handleRemoveFromProject(color.id)}
                    className="ml-2 text-zinc-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${color.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Color Library Card */}
      <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <IconPalette className="h-5 w-5" />
            Color Library
          </CardTitle>
          <CardDescription className="text-zinc-600 dark:text-zinc-400">
            Browse Sherwin-Williams colors and select up to 5 for your project palette.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Grid */}
          <ColorGrid
            selectedColorId={selectedColor?.id}
            onColorSelect={handleColorSelect}
            maxSelections={5}
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
              </div>

              {/* Add to Project Button */}
              <Button
                onClick={handleAddToProject}
                disabled={projectColors.some((c) => c.id === selectedColor.id)}
                className="rounded-none shrink-0"
              >
                {projectColors.some((c) => c.id === selectedColor.id) ? (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    In Palette
                  </>
                ) : (
                  <>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add to Palette
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <WizardFooter />
    </div>
  );
}
