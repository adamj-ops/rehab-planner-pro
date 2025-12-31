"use client";

import {
  IconCalendar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  OnboardingLayout,
  OnboardingMarketingPanel,
  SelectionCard,
  SelectionCardGroup,
  useOnboarding,
} from "@/components/onboarding";
import { projectsPerYearOptions } from "@/types/onboarding";

export default function OnboardingStep5Page() {
  const {
    data,
    setProjectsPerYear,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    completedSteps,
    canProceed,
  } = useOnboarding();

  const handleContinue = () => {
    completeStep(5);
    goToNextStep();
  };

  return (
    <OnboardingLayout
      currentStep={5}
      completedSteps={completedSteps}
      marketingContent={<OnboardingMarketingPanel step={5} />}
      onBack={goToPreviousStep}
    >
      <div className="space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How many projects do you manage per year?
          </h1>
          <p className="text-muted-foreground">
            We&apos;ll optimize your experience for your workload
          </p>
        </div>

        {/* Options */}
        <SelectionCardGroup>
          {projectsPerYearOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={<IconCalendar className="h-6 w-6" />}
              selected={data.projectsPerYear === option.value}
              onSelect={() => setProjectsPerYear(option.value)}
            />
          ))}
        </SelectionCardGroup>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium h-12"
        >
          Continue
        </Button>
      </div>
    </OnboardingLayout>
  );
}
