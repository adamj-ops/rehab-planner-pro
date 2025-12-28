"use client";

import { ColorWall } from "@/components/color-library";
import { toast } from "sonner";
import type { Color } from "@/types/color";

/**
 * Standalone Color Library Page
 * 
 * Accessible from the sidebar navigation.
 * Allows users to browse and explore colors without being in a project context.
 */
export default function ColorsPage() {
  // In standalone mode, we can still allow "Add to Project" but it will
  // just show a toast indicating the color was selected
  const handleAddToProject = (color: Color) => {
    toast.info(`${color.color_name} selected`, {
      description: "Start a new project to add colors to your palette",
      action: {
        label: "New Project",
        onClick: () => {
          window.location.href = "/wizard/step-1";
        },
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div>
            <h1 className="text-lg font-semibold">Color Library</h1>
            <p className="text-sm text-muted-foreground">
              Browse and explore paint colors for your projects
            </p>
          </div>
        </div>
      </div>

      {/* Color Wall - fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ColorWall onAddToProject={handleAddToProject} />
      </div>
    </div>
  );
}
