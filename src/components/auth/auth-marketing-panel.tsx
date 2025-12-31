"use client";

import { 
  IconShieldCheck, 
  IconChartBar, 
  IconClock 
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AuthMarketingPanelProps {
  variant?: "login" | "signup" | "reset";
}

const features = [
  {
    icon: IconShieldCheck,
    title: "Secure & Private",
    description: "Your project data is encrypted and never shared",
  },
  {
    icon: IconChartBar,
    title: "Data-Driven ROI",
    description: "Make informed decisions with accurate cost estimates",
  },
  {
    icon: IconClock,
    title: "Save Time",
    description: "Generate comprehensive scopes in minutes, not hours",
  },
];

export function AuthMarketingPanel({ variant = "login" }: AuthMarketingPanelProps) {
  const getContent = () => {
    switch (variant) {
      case "signup":
        return {
          headline: "Start planning with confidence",
          subheadline: "Join thousands of real estate investors who trust Rehab Planner Pro for accurate renovation estimates.",
        };
      case "reset":
        return {
          headline: "Reset your password",
          subheadline: "Secure your account with a new password. Your projects and data are safe and waiting for you.",
        };
      default:
        return {
          headline: "Welcome back",
          subheadline: "Your renovation projects are waiting. Sign in to continue where you left off.",
        };
    }
  };

  const { headline, subheadline } = getContent();

  return (
    <div className="w-full max-w-lg space-y-8">
      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-3xl xl:text-4xl font-bold tracking-tight">
          {headline}
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          {subheadline}
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-5 pt-4">
        {features.map((feature) => (
          <div 
            key={feature.title}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <feature.icon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-slate-800",
                  "bg-gradient-to-br",
                  i === 1 && "from-blue-400 to-blue-600",
                  i === 2 && "from-emerald-400 to-emerald-600",
                  i === 3 && "from-amber-400 to-amber-600",
                  i === 4 && "from-purple-400 to-purple-600"
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

      {/* Dashboard Preview Mockup */}
      <div className="relative mt-8">
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-slate-500">Rehab Planner Pro</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700/50 rounded w-3/4" />
            <div className="h-3 bg-slate-700/50 rounded w-1/2" />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="h-16 bg-emerald-500/20 rounded-lg border border-emerald-500/30" />
              <div className="h-16 bg-blue-500/20 rounded-lg border border-blue-500/30" />
              <div className="h-16 bg-amber-500/20 rounded-lg border border-amber-500/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
