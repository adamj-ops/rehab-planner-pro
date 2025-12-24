"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight, IconDeviceFloppy } from "@tabler/icons-react";
import { wizardSteps } from "@/lib/navigation";

interface WizardFooterProps {
  onSave?: () => void;
  isSaving?: boolean;
  canProceed?: boolean;
}

export function WizardFooter({ onSave, isSaving = false, canProceed = true }: WizardFooterProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Find current step
  const currentStep = wizardSteps.find((step) => pathname.startsWith(step.path));
  const currentIndex = currentStep ? wizardSteps.indexOf(currentStep) : 0;
  
  const prevStep = currentIndex > 0 ? wizardSteps[currentIndex - 1] : null;
  const nextStep = currentIndex < wizardSteps.length - 1 ? wizardSteps[currentIndex + 1] : null;
  const isLastStep = currentIndex === wizardSteps.length - 1;

  const handleBack = () => {
    if (prevStep) {
      router.push(prevStep.path);
    }
  };

  const handleNext = () => {
    if (nextStep) {
      router.push(nextStep.path);
    }
  };

  const handleSave = () => {
    onSave?.();
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700 mt-6">
      {/* All buttons with rounded-none for Mira theme */}
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={!prevStep}
        className="rounded-none"
      >
        <IconChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-none"
        >
          <IconDeviceFloppy className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>

        {isLastStep ? (
          <Button disabled={!canProceed} className="rounded-none">
            Complete & Export
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            disabled={!canProceed || !nextStep}
            className="rounded-none"
          >
            {nextStep?.shortTitle || "Next"}
            <IconChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
