"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { wizardSteps } from "@/lib/navigation";
import { motion } from "framer-motion";

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
                    <motion.div
                      className={cn(
                        "h-0.5 flex-1",
                        isCompleted || isActive ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: (isCompleted || isActive) && wizardSteps[index - 1] && (completedSteps.includes(wizardSteps[index - 1].number) || wizardSteps[index - 1].number < activeStep) ? 1 : 0
                      }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3,
                        ease: "easeOut"
                      }}
                      style={{ transformOrigin: "left" }}
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
                    {/* Pulse ring for active step */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 border-2 border-primary"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {isCompleted && !isActive ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                          delay: 0.1
                        }}
                      >
                        <IconCheck className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>

                  {/* Line after */}
                  {index < wizardSteps.length - 1 && (
                    <motion.div
                      className={cn(
                        "h-0.5 flex-1",
                        completedSteps.includes(step.number) ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: completedSteps.includes(step.number) ? 1 : 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3,
                        ease: "easeOut"
                      }}
                      style={{ transformOrigin: "left" }}
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
