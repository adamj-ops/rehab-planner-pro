"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { LayoutGrid } from "lucide-react";

export default function Step4Moodboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Moodboard Builder
          </CardTitle>
          <CardDescription>
            Create visual design boards for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg text-muted-foreground">
            <div className="text-center">
              <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Moodboard Canvas</p>
              <p className="text-sm">Drag and drop colors, materials, and images here</p>
              <p className="text-xs mt-2 text-muted-foreground">
                Coming soon - Full drag-and-drop moodboard builder
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WizardFooter />
    </div>
  );
}

