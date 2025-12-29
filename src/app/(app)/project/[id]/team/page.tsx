"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers } from "@tabler/icons-react";

export default function TeamPage() {
  return (
    <>
      <ProjectPageHeader section="Team" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconUsers className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Project Team</h1>
              <p className="text-muted-foreground">
                Assign contractors to scope items
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contractor Assignment</CardTitle>
              <CardDescription>
                Select contractors from your Rolodex and assign them to specific
                scope items. Track contracts, payments, and progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page integrates with your contractor Rolodex from Settings
                to assign team members to this project.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
