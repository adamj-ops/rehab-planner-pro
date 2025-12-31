"use client";

import {
  IconUser,
  IconTarget,
  IconHome2,
  IconCurrencyDollar,
  IconChartBar,
  IconCheck,
  IconShieldCheck,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/types/onboarding";

interface OnboardingMarketingPanelProps {
  step: OnboardingStep;
}

interface StepContent {
  headline: string;
  subheadline: string;
  features: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }[];
}

const stepContent: Record<OnboardingStep, StepContent> = {
  1: {
    headline: "Welcome to Rehab Planner Pro",
    subheadline: "Let's personalize your experience. Tell us about your investment background to get started.",
    features: [
      {
        icon: IconShieldCheck,
        title: "Tailored Experience",
        description: "We'll customize recommendations based on your experience level",
      },
      {
        icon: IconTrendingUp,
        title: "Grow Your Skills",
        description: "Access resources matched to your investment journey",
      },
      {
        icon: IconClock,
        title: "Save Time",
        description: "Skip the learning curve with personalized guidance",
      },
    ],
  },
  2: {
    headline: "Investment strategies that work",
    subheadline: "Whether you flip, rent, or wholesale, we have the tools to maximize your returns.",
    features: [
      {
        icon: IconTarget,
        title: "Strategy-Specific Tools",
        description: "Templates and calculators designed for your approach",
      },
      {
        icon: IconChartBar,
        title: "ROI Analysis",
        description: "Track performance metrics that matter for your strategy",
      },
      {
        icon: IconClock,
        title: "Timeline Planning",
        description: "Project schedules optimized for your investment style",
      },
    ],
  },
  3: {
    headline: "Property types we support",
    subheadline: "From single-family homes to commercial buildings, we've got you covered.",
    features: [
      {
        icon: IconHome2,
        title: "Comprehensive Coverage",
        description: "Scope templates for every property type",
      },
      {
        icon: IconShieldCheck,
        title: "Market-Specific Data",
        description: "Cost estimates tailored to property characteristics",
      },
      {
        icon: IconTrendingUp,
        title: "Portfolio Growth",
        description: "Track all your properties in one place",
      },
    ],
  },
  4: {
    headline: "Budget planning made easy",
    subheadline: "Get accurate cost estimates and stay within budget with our planning tools.",
    features: [
      {
        icon: IconCurrencyDollar,
        title: "Accurate Estimates",
        description: "Data-driven cost projections you can trust",
      },
      {
        icon: IconChartBar,
        title: "Budget Tracking",
        description: "Monitor spending against your plan in real-time",
      },
      {
        icon: IconShieldCheck,
        title: "Contingency Planning",
        description: "Built-in buffers to handle unexpected costs",
      },
    ],
  },
  5: {
    headline: "Scale your business",
    subheadline: "Manage multiple projects efficiently with our project management tools.",
    features: [
      {
        icon: IconChartBar,
        title: "Multi-Project Dashboard",
        description: "See all your projects at a glance",
      },
      {
        icon: IconClock,
        title: "Time Management",
        description: "Optimize schedules across your portfolio",
      },
      {
        icon: IconTrendingUp,
        title: "Performance Analytics",
        description: "Track trends and improve over time",
      },
    ],
  },
  6: {
    headline: "You're almost done!",
    subheadline: "Complete your profile to unlock the full power of Rehab Planner Pro.",
    features: [
      {
        icon: IconUser,
        title: "Personalized Dashboard",
        description: "Your home base for all renovation projects",
      },
      {
        icon: IconCheck,
        title: "Ready to Start",
        description: "Create your first project in minutes",
      },
      {
        icon: IconShieldCheck,
        title: "Secure & Private",
        description: "Your data is encrypted and protected",
      },
    ],
  },
};

export function OnboardingMarketingPanel({ step }: OnboardingMarketingPanelProps) {
  const content = stepContent[step];

  return (
    <div className="w-full max-w-lg space-y-8">
      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-3xl xl:text-4xl font-bold tracking-tight">
          {content.headline}
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          {content.subheadline}
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-5 pt-4">
        {content.features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <feature.icon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["blue", "emerald", "amber", "purple"].map((color) => (
              <div
                key={color}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-slate-800",
                  "bg-gradient-to-br",
                  color === "blue" && "from-blue-400 to-blue-600",
                  color === "emerald" && "from-emerald-400 to-emerald-600",
                  color === "amber" && "from-amber-400 to-amber-600",
                  color === "purple" && "from-purple-400 to-purple-600"
                )}
              />
            ))}
          </div>
          <div className="text-sm">
            <span className="font-semibold text-white">500+</span>
            <span className="text-slate-400"> investors trust us</span>
          </div>
        </div>
      </div>
    </div>
  );
}
