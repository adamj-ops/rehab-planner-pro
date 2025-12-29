"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconEye } from "@tabler/icons-react";

export default function ConditionPage() {
  return (
    <>
      <ProjectPageHeader section="Condition" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconEye className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Property Condition</h1>
              <p className="text-muted-foreground">
                Assess the current state of each room
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Room-by-Room Assessment</CardTitle>
              <CardDescription>
                Add rooms and rate the condition of each component (flooring, walls,
                ceiling, electrical, plumbing, etc.) on a 5-point scale.
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
