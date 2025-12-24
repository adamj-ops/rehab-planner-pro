"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { wizardSteps } from "@/lib/navigation";

interface StepNavigationProps {
  currentStep?: number;
  completedSteps?: number[];
}

export function StepNavigation({ currentStep, completedSteps = [] }: StepNavigationProps) {
  const pathname = usePathname();
  
  // Determine current step from pathname if not provided
  const activeStep = currentStep ?? wizardSteps.find(
    (step) => pathname.startsWith(step.path)
  )?.number ?? 1;

  return (
    <nav className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {wizardSteps.map((step, index) => {
          const isActive = step.number === activeStep;
          const isCompleted = completedSteps.includes(step.number) || step.number < activeStep;
          const isClickable = isCompleted || step.number <= activeStep;

          return (
            <li key={step.number} className="flex-1">
              <Link
                href={isClickable ? step.path : "#"}
                className={cn(
                  "group flex flex-col items-center gap-2 transition-all",
                  !isClickable && "pointer-events-none opacity-50"
                )}
              >
                {/* Step indicator */}
                <div className="flex items-center w-full">
                  {/* Line before */}
                  {index > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 transition-colors",
                        isCompleted || isActive ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                    />
                  )}
                  
                  {/* Circle - NO rounded-full, using sharp square per Mira theme */}
                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center border-2 transition-all",
                      isActive && "border-primary bg-primary text-primary-foreground shadow-lg scale-110",
                      isCompleted && !isActive && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-zinc-300 dark:border-zinc-600 bg-background text-zinc-500"
                    )}
                  >
                    {isCompleted && !isActive ? (
                      <IconCheck className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>
                  
                  {/* Line after */}
                  {index < wizardSteps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 transition-colors",
                        completedSteps.includes(step.number) ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                    />
                  )}
                </div>
                
                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium transition-colors text-center",
                    isActive && "text-primary",
                    !isActive && "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                  )}
                >
                  {step.shortTitle}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
