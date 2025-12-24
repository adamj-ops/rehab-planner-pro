"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { CalendarDays } from "lucide-react";

export default function Step6Action() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Action Plan</h1>
        <p className="text-muted-foreground">
          Create timeline and assign tasks to vendors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Project Timeline
          </CardTitle>
          <CardDescription>
            Coming soon - Timeline and task management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Step 6: Action plan and timeline will be built here
          </div>
        </CardContent>
      </Card>

      <WizardFooter />
    </div>
  );
}

