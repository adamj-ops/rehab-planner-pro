"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { Target } from "lucide-react";

export default function Step3Strategy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investment Strategy</h1>
        <p className="text-muted-foreground">
          Define your investment approach and target buyer profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategy Selection
          </CardTitle>
          <CardDescription>
            Coming soon - Investment strategy configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Step 3: Investment strategy selection will be built here
          </div>
        </CardContent>
      </Card>

      <WizardFooter />
    </div>
  );
}

