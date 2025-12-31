"use client";

import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/types/onboarding";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  totalSteps?: number;
  completedSteps?: OnboardingStep[];
}

export function OnboardingProgress({
  currentStep,
  totalSteps = 6,
  completedSteps = [],
}: OnboardingProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1) as OnboardingStep[];

  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden sm:flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep && !isCompleted;

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && "bg-emerald-500 text-white",
                  isCurrent && "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-offset-2 ring-slate-900 dark:ring-white",
                  isUpcoming && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 lg:w-12 h-0.5 mx-1 transition-all duration-300",
                    step < currentStep || isCompleted
                      ? "bg-emerald-500"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
