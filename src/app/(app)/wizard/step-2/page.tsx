"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { ClipboardCheck } from "lucide-react";

export default function Step2Condition() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Current Condition</h1>
        <p className="text-muted-foreground">
          Assess the current state of the property to determine renovation scope.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Property Assessment
          </CardTitle>
          <CardDescription>
            Coming soon - Room-by-room condition assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Step 2: Property condition assessment will be built here
          </div>
        </CardContent>
      </Card>

      <WizardFooter />
    </div>
  );
}

