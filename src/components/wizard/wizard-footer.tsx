"use client";

import { usePathname, useRouter } from "next/navigation";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { AnimatedButton } from "@/components/animation";
import { IconChevronLeft, IconChevronRight, IconDeviceFloppy, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { wizardSteps } from "@/lib/navigation";

interface WizardFooterProps<T extends FieldValues = FieldValues> {
  onSave?: () => void;
  isSaving?: boolean;
  canProceed?: boolean;
  form?: UseFormReturn<T>;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function WizardFooter<T extends FieldValues = FieldValues>({ 
  onSave, 
  isSaving = false, 
  canProceed = true,
  form,
  onSubmit,
  isSubmitting = false,
}: WizardFooterProps<T>) {
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

  const handleSave = () => {
    onSave?.();
  };

  // If form is provided, the Next button submits the form
  // Otherwise, it directly navigates (for non-form steps like Step 4)
  const isFormStep = !!form;
  const formIsSubmitting = form?.formState?.isSubmitting || isSubmitting;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700 mt-6">
      {/* Back button */}
      <AnimatedButton
        type="button"
        variant="outline"
        onClick={handleBack}
        disabled={!prevStep}
        className="rounded-none"
      >
        <IconChevronLeft className="mr-2 h-4 w-4" />
        Back
      </AnimatedButton>

      <div className="flex items-center gap-2">
        {/* Save Draft button */}
        <AnimatedButton
          type="button"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-none"
        >
          {isSaving ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              Save Draft
            </>
          )}
        </AnimatedButton>

        {/* Next / Complete button */}
        {isLastStep ? (
          <AnimatedButton
            type={isFormStep ? "submit" : "button"}
            disabled={!canProceed || formIsSubmitting}
            onClick={!isFormStep ? onSubmit : undefined}
            className="rounded-none min-w-[180px]"
          >
            {formIsSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Complete & Export
              </>
            )}
          </AnimatedButton>
        ) : (
          <AnimatedButton
            type={isFormStep ? "submit" : "button"}
            onClick={!isFormStep ? () => nextStep && router.push(nextStep.path) : undefined}
            disabled={!canProceed || !nextStep || formIsSubmitting}
            className="rounded-none min-w-[120px]"
          >
            {formIsSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                {nextStep?.shortTitle || "Next"}
                <IconChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </AnimatedButton>
        )}
      </div>
    </div>
  );
}
