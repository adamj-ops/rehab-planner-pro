"use client";

import { useEffect } from "react";
import {
  IconUser,
  IconBriefcase,
  IconCrown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  OnboardingLayout,
  OnboardingMarketingPanel,
  SelectionCard,
  SelectionCardGroup,
  useOnboarding,
} from "@/components/onboarding";
import { investorTypeOptions, type InvestorType } from "@/types/onboarding";

const icons: Record<InvestorType, React.ReactNode> = {
  beginner: <IconUser className="h-6 w-6" />,
  experienced: <IconBriefcase className="h-6 w-6" />,
  professional: <IconCrown className="h-6 w-6" />,
};

export default function OnboardingStep1Page() {
  const {
    data,
    setInvestorType,
    goToNextStep,
    completeStep,
    completedSteps,
    canProceed,
  } = useOnboarding();

  // Update current step in context
  useEffect(() => {
    // Mark step 1 as current
  }, []);

  const handleContinue = () => {
    completeStep(1);
    goToNextStep();
  };

  return (
    <OnboardingLayout
      currentStep={1}
      completedSteps={completedSteps}
      marketingContent={<OnboardingMarketingPanel step={1} />}
      showBackButton={false}
    >
      <div className="space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            What type of investor are you?
          </h1>
          <p className="text-muted-foreground">
            This helps us personalize your experience
          </p>
        </div>

        {/* Options */}
        <SelectionCardGroup>
          {investorTypeOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={icons[option.value]}
              selected={data.investorType === option.value}
              onSelect={() => setInvestorType(option.value)}
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
