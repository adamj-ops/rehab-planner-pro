"use client";

import {
  IconHome2,
  IconBuilding,
  IconBuildingSkyscraper,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  OnboardingLayout,
  OnboardingMarketingPanel,
  SelectionCard,
  SelectionCardGroup,
  useOnboarding,
} from "@/components/onboarding";
import { propertyTypeOptions, type PropertyType } from "@/types/onboarding";

const icons: Record<PropertyType, React.ReactNode> = {
  single_family: <IconHome2 className="h-6 w-6" />,
  multi_family: <IconBuilding className="h-6 w-6" />,
  commercial: <IconBuildingSkyscraper className="h-6 w-6" />,
  mixed: <IconBuildingCommunity className="h-6 w-6" />,
};

export default function OnboardingStep3Page() {
  const {
    data,
    togglePropertyType,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    completedSteps,
    canProceed,
  } = useOnboarding();

  const handleContinue = () => {
    completeStep(3);
    goToNextStep();
  };

  return (
    <OnboardingLayout
      currentStep={3}
      completedSteps={completedSteps}
      marketingContent={<OnboardingMarketingPanel step={3} />}
      onBack={goToPreviousStep}
    >
      <div className="space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            What types of properties do you focus on?
          </h1>
          <p className="text-muted-foreground">
            Select all that apply
          </p>
        </div>

        {/* Options - Multi-select */}
        <SelectionCardGroup>
          {propertyTypeOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={icons[option.value]}
              selected={data.propertyTypes.includes(option.value)}
              onSelect={() => togglePropertyType(option.value)}
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
