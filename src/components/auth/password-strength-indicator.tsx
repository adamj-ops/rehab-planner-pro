"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconX } from "@tabler/icons-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface StrengthLevel {
  level: number;
  label: string;
  color: string;
  bgColor: string;
}

const strengthLevels: StrengthLevel[] = [
  { level: 0, label: "Too weak", color: "text-red-600", bgColor: "bg-red-500" },
  { level: 1, label: "Weak", color: "text-red-500", bgColor: "bg-red-400" },
  { level: 2, label: "Fair", color: "text-amber-500", bgColor: "bg-amber-400" },
  { level: 3, label: "Good", color: "text-emerald-500", bgColor: "bg-emerald-400" },
  { level: 4, label: "Strong", color: "text-emerald-600", bgColor: "bg-emerald-500" },
];

const requirements = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordStrengthIndicator({
  password,
  showRequirements = false,
}: PasswordStrengthIndicatorProps) {
  const { strength, passedRequirements } = useMemo(() => {
    if (!password) {
      return { strength: 0, passedRequirements: [] as string[] };
    }

    const passed = requirements
      .filter((req) => req.test(password))
      .map((req) => req.key);

    // Calculate strength based on requirements met
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    return { strength: score, passedRequirements: passed };
  }, [password]);

  const currentLevel = strengthLevels[strength] || strengthLevels[0];

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bars */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                level <= strength
                  ? currentLevel.bgColor
                  : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className={cn("text-xs font-medium", currentLevel.color)}>
          {currentLevel.label}
        </p>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((req) => {
            const passed = passedRequirements.includes(req.key);
            return (
              <div
                key={req.key}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}
              >
                {passed ? (
                  <IconCheck className="h-3.5 w-3.5" />
                ) : (
                  <IconX className="h-3.5 w-3.5" />
                )}
                <span>{req.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Hook for getting password strength
export function usePasswordStrength(password: string) {
  return useMemo(() => {
    if (!password) return 0;
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    return score;
  }, [password]);
}
