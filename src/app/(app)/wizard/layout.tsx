"use client";

import { StepNavigation } from "@/components/wizard/step-navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Step Navigation Header */}
      <Card>
        <CardContent className="pt-6">
          <StepNavigation />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[calc(100vh-300px)]">
        {children}
      </div>
    </div>
  );
}

