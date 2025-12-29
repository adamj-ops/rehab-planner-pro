"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFileCheck } from "@tabler/icons-react";

export default function ReviewPage() {
  return (
    <>
      <ProjectPageHeader section="Review" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconFileCheck className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Project Review</h1>
              <p className="text-muted-foreground">
                Summary dashboard with key metrics and charts
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Final Review</CardTitle>
              <CardDescription>
                See total cost breakdown, ROI projection, timeline summary,
                and verify all sections are complete before export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page aggregates data from all sections to give you
                a complete picture of your renovation plan.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
