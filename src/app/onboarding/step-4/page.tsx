"use client";

import {
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  OnboardingLayout,
  OnboardingMarketingPanel,
  SelectionCard,
  SelectionCardGroup,
  useOnboarding,
} from "@/components/onboarding";
import { typicalBudgetOptions } from "@/types/onboarding";

export default function OnboardingStep4Page() {
  const {
    data,
    setTypicalBudget,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    completedSteps,
    canProceed,
  } = useOnboarding();

  const handleContinue = () => {
    completeStep(4);
    goToNextStep();
  };

  return (
    <OnboardingLayout
      currentStep={4}
      completedSteps={completedSteps}
      marketingContent={<OnboardingMarketingPanel step={4} />}
      onBack={goToPreviousStep}
    >
      <div className="space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            What&apos;s your typical project budget?
          </h1>
          <p className="text-muted-foreground">
            This helps us provide relevant cost estimates
          </p>
        </div>

        {/* Options */}
        <SelectionCardGroup>
          {typicalBudgetOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={<IconCurrencyDollar className="h-6 w-6" />}
              selected={data.typicalBudget === option.value}
              onSelect={() => setTypicalBudget(option.value)}
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
