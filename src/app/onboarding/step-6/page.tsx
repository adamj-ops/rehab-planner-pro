"use client";

import { useId, useState } from "react";
import { User, Building2, Phone, MapPin } from "lucide-react";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OnboardingLayout,
  OnboardingMarketingPanel,
  useOnboarding,
} from "@/components/onboarding";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export default function OnboardingStep6Page() {
  const {
    data,
    updateProfile,
    goToPreviousStep,
    completeOnboarding,
    completedSteps,
    isLoading,
    error,
  } = useOnboarding();

  const [localError, setLocalError] = useState<string | null>(null);

  // Generate unique IDs for form inputs
  const firstNameId = useId();
  const lastNameId = useId();
  const companyId = useId();
  const phoneId = useId();
  const cityId = useId();
  const stateId = useId();

  const handleComplete = async () => {
    setLocalError(null);
    try {
      await completeOnboarding();
    } catch {
      setLocalError("Failed to complete onboarding. Please try again.");
    }
  };

  return (
    <OnboardingLayout
      currentStep={6}
      completedSteps={completedSteps}
      marketingContent={<OnboardingMarketingPanel step={6} />}
      onBack={goToPreviousStep}
    >
      <div className="space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Complete your profile
          </h1>
          <p className="text-muted-foreground">
            Almost done! Add a few more details to personalize your experience.
          </p>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error || localError}
          </div>
        )}

        {/* Profile Form */}
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={firstNameId}>First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id={firstNameId}
                  placeholder="John"
                  value={data.firstName}
                  onChange={(e) => updateProfile({ firstName: e.target.value })}
                  className="pl-10"
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={lastNameId}>Last name</Label>
              <Input
                id={lastNameId}
                placeholder="Doe"
                value={data.lastName}
                onChange={(e) => updateProfile({ lastName: e.target.value })}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Company Field */}
          <div className="space-y-2">
            <Label htmlFor={companyId}>Company (optional)</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={companyId}
                placeholder="Your company name"
                value={data.company}
                onChange={(e) => updateProfile({ company: e.target.value })}
                className="pl-10"
                autoComplete="organization"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor={phoneId}>Phone (optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={phoneId}
                type="tel"
                placeholder="(555) 123-4567"
                value={data.phone}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                className="pl-10"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={cityId}>City (optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id={cityId}
                  placeholder="Austin"
                  value={data.city}
                  onChange={(e) => updateProfile({ city: e.target.value })}
                  className="pl-10"
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={stateId}>State (optional)</Label>
              <Select
                value={data.state}
                onValueChange={(value) => updateProfile({ state: value })}
              >
                <SelectTrigger id={stateId}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <Button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium h-12"
        >
          {isLoading ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            "Complete & Get Started"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          You can update these details anytime in your settings
        </p>
      </div>
    </OnboardingLayout>
  );
}
