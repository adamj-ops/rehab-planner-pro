"use client";

import { StepNavigation } from "@/components/wizard/step-navigation";
import { WizardProvider, useWizard } from "@/components/wizard/wizard-context";
import { Card, CardContent } from "@/components/ui/card";

function WizardLayoutContent({ children }: { children: React.ReactNode }) {
  const { completedSteps } = useWizard();
  
  return (
    <div className="space-y-6">
      {/* Step Navigation Header */}
      <Card>
        <CardContent className="pt-6">
          <StepNavigation completedSteps={completedSteps} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[calc(100vh-300px)]">
        {children}
      </div>
    </div>
  );
}

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WizardProvider>
      <WizardLayoutContent>{children}</WizardLayoutContent>
    </WizardProvider>
  );
}

