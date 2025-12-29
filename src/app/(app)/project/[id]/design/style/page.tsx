"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconWand } from "@tabler/icons-react";

export default function StylePage() {
  return (
    <>
      <ProjectPageHeader section="Design" subsection="Style" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconWand className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Design Style</h1>
              <p className="text-muted-foreground">
                Select your design style and aesthetic direction
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Style Selection</CardTitle>
              <CardDescription>
                Choose from Modern Farmhouse, Contemporary, Traditional, Transitional,
                and more. This will guide your color and material choices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page is being built as part of the conveyor belt restructure.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
