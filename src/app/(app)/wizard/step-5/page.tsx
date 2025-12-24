"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { ListOrdered } from "lucide-react";

export default function Step5Priority() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Priority Matrix</h1>
        <p className="text-muted-foreground">
          Prioritize renovations by ROI impact and urgency.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Renovation Priorities
          </CardTitle>
          <CardDescription>
            Coming soon - ROI-based prioritization matrix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Step 5: Priority matrix will be built here
          </div>
        </CardContent>
      </Card>

      <WizardFooter />
    </div>
  );
}

