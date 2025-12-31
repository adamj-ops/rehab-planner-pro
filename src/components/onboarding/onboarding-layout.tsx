"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingSaveIndicator } from "./onboarding-save-indicator";
import type { OnboardingStep } from "@/types/onboarding";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  marketingContent?: React.ReactNode;
  currentStep: OnboardingStep;
  totalSteps?: number;
  completedSteps?: OnboardingStep[];
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingLayout({
  children,
  marketingContent,
  currentStep,
  totalSteps = 6,
  completedSteps = [],
  onBack,
  showBackButton = true,
}: OnboardingLayoutProps) {
  const canGoBack = currentStep > 1 && showBackButton;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            <Home className="h-5 w-5 text-primary" />
            <span>Rehab Planner Pro</span>
          </Link>
          
          {/* Progress Indicator - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSteps={completedSteps}
            />
          </div>

          {/* Step Counter & Save Indicator */}
          <div className="flex items-center gap-4">
            <OnboardingSaveIndicator />
            <div className="lg:hidden text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden border-b bg-card/50 px-4 py-3">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
        />
      </div>

      {/* Main Content - Split Screen */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Marketing (Dark) */}
        <div
          className={cn(
            "hidden lg:flex lg:w-[40%] xl:w-[45%]",
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            "text-white p-8 xl:p-12",
            "flex-col justify-center items-center"
          )}
        >
          {marketingContent}
        </div>

        {/* Right Panel - Form (Light) */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            "bg-background p-4 sm:p-6 lg:p-8 xl:p-12"
          )}
        >
          {/* Back Button */}
          {canGoBack && (
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rehab Planner Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
