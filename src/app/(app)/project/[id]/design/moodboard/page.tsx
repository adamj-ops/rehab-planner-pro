"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPhoto } from "@tabler/icons-react";

export default function MoodboardPage() {
  return (
    <>
      <ProjectPageHeader section="Design" subsection="Moodboard" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconPhoto className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Moodboard</h1>
              <p className="text-muted-foreground">
                Create visual inspiration boards with colors and materials
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Design Canvas</CardTitle>
              <CardDescription>
                Drag and drop colors, materials, images, and text to create
                your vision. This feature is already built with React Flow
                and will be migrated here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page will integrate the existing moodboard canvas functionality
                from the wizard Step 4.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
