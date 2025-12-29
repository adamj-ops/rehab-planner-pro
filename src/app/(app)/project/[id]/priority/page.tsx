"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChartBar } from "@tabler/icons-react";

export default function PriorityPage() {
  return (
    <>
      <ProjectPageHeader section="Priority" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconChartBar className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Priority Matrix</h1>
              <p className="text-muted-foreground">
                Prioritize renovations by ROI impact and urgency
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ROI-Based Prioritization</CardTitle>
              <CardDescription>
                View your scope items plotted on a 2D matrix with ROI Impact (x-axis)
                vs Urgency (y-axis). Focus on high-ROI, high-urgency items first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page will visualize scope items and help you decide what to
                tackle first based on return on investment.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
