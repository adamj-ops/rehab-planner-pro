"use client";

import {
  IconArrowsExchange,
  IconRepeat,
  IconHome2,
  IconBuildingStore,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  OnboardingLayout,
  OnboardingMarketingPanel,
  SelectionCard,
  SelectionCardGroup,
  useOnboarding,
} from "@/components/onboarding";
import { investmentStrategyOptions, type InvestmentStrategy } from "@/types/onboarding";

const icons: Record<InvestmentStrategy, React.ReactNode> = {
  fix_flip: <IconArrowsExchange className="h-6 w-6" />,
  brrrr: <IconRepeat className="h-6 w-6" />,
  buy_hold: <IconHome2 className="h-6 w-6" />,
  wholesale: <IconBuildingStore className="h-6 w-6" />,
};

export default function OnboardingStep2Page() {
  const {
    data,
    setInvestmentStrategy,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    completedSteps,
    canProceed,
  } = useOnboarding();

  const handleContinue = () => {
    completeStep(2);
    goToNextStep();
  };

  return (
    <OnboardingLayout
      currentStep={2}
      completedSteps={completedSteps}
      marketingContent={<OnboardingMarketingPanel step={2} />}
      onBack={goToPreviousStep}
    >
      <div className="space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            What&apos;s your primary investment strategy?
          </h1>
          <p className="text-muted-foreground">
            We&apos;ll tailor tools and templates for your approach
          </p>
        </div>

        {/* Options */}
        <SelectionCardGroup>
          {investmentStrategyOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={icons[option.value]}
              selected={data.investmentStrategy === option.value}
              onSelect={() => setInvestmentStrategy(option.value)}
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
