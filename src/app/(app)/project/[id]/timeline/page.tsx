"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCalendar } from "@tabler/icons-react";

export default function TimelinePage() {
  return (
    <>
      <ProjectPageHeader section="Timeline" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconCalendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Project Timeline</h1>
              <p className="text-muted-foreground">
                Plan your renovation schedule and dependencies
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visual Scheduling</CardTitle>
              <CardDescription>
                See your scope items organized into phases with dependencies.
                Drag to reschedule, connect items to show what must happen first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page will use React Flow to visualize your project timeline
                with critical path highlighting.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
