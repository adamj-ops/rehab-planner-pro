"use client";

import { useState, useEffect, useCallback, useRef, useId } from "react";
import {
  IconUser,
  IconBriefcase,
  IconCrown,
  IconArrowsExchange,
  IconRepeat,
  IconHome2,
  IconBuildingStore,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SelectionCard, SelectionCardGroup } from "@/components/onboarding/selection-card";
import { toast } from "sonner";
import {
  investorTypeOptions,
  investmentStrategyOptions,
  propertyTypeOptions,
  typicalBudgetOptions,
  projectsPerYearOptions,
  type InvestorType,
  type InvestmentStrategy,
  type PropertyType,
  type TypicalBudget,
  type ProjectsPerYear,
} from "@/types/onboarding";

// Icons for investor types
const investorTypeIcons: Record<InvestorType, React.ReactNode> = {
  beginner: <IconUser className="h-6 w-6" />,
  experienced: <IconBriefcase className="h-6 w-6" />,
  professional: <IconCrown className="h-6 w-6" />,
};

// Icons for investment strategies
const investmentStrategyIcons: Record<InvestmentStrategy, React.ReactNode> = {
  fix_flip: <IconArrowsExchange className="h-6 w-6" />,
  brrrr: <IconRepeat className="h-6 w-6" />,
  buy_hold: <IconHome2 className="h-6 w-6" />,
  wholesale: <IconBuildingStore className="h-6 w-6" />,
};

// Icons for property types
const propertyTypeIcons: Record<PropertyType, React.ReactNode> = {
  single_family: <IconHome2 className="h-5 w-5" />,
  multi_family: <IconBuildingStore className="h-5 w-5" />,
  commercial: <IconBriefcase className="h-5 w-5" />,
  mixed: <IconArrowsExchange className="h-5 w-5" />,
};

export interface InvestmentPreferences {
  investorType: InvestorType | null;
  investmentStrategy: InvestmentStrategy | null;
  propertyTypes: PropertyType[];
  typicalBudget: TypicalBudget | null;
  projectsPerYear: ProjectsPerYear | null;
}

interface InvestmentPreferencesSectionProps {
  className?: string;
}

export function InvestmentPreferencesSection({
  className,
}: InvestmentPreferencesSectionProps) {
  // Generate unique IDs for form elements
  const budgetSelectId = useId();
  const projectsSelectId = useId();

  // State
  const [preferences, setPreferences] = useState<InvestmentPreferences>({
    investorType: null,
    investmentStrategy: null,
    propertyTypes: [],
    typicalBudget: null,
    projectsPerYear: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store initial preferences to detect changes
  const initialPreferencesRef = useRef<InvestmentPreferences | null>(null);

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/profile/investment-preferences");

        if (!response.ok) {
          if (response.status === 401) {
            setError("Please log in to view your preferences");
            return;
          }
          throw new Error("Failed to load preferences");
        }

        const data = await response.json();
        const loadedPreferences: InvestmentPreferences = {
          investorType: data.investorType ?? null,
          investmentStrategy: data.investmentStrategy ?? null,
          propertyTypes: data.propertyTypes ?? [],
          typicalBudget: data.typicalBudget ?? null,
          projectsPerYear: data.projectsPerYear ?? null,
        };

        setPreferences(loadedPreferences);
        initialPreferencesRef.current = { ...loadedPreferences };
      } catch (err) {
        console.error("Error loading preferences:", err);
        setError("Failed to load investment preferences. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, []);

  // Check if preferences have changed
  const checkForChanges = useCallback((newPrefs: InvestmentPreferences) => {
    if (!initialPreferencesRef.current) {
      setHasChanges(false);
      return;
    }

    const initial = initialPreferencesRef.current;
    const changed =
      newPrefs.investorType !== initial.investorType ||
      newPrefs.investmentStrategy !== initial.investmentStrategy ||
      newPrefs.typicalBudget !== initial.typicalBudget ||
      newPrefs.projectsPerYear !== initial.projectsPerYear ||
      JSON.stringify(newPrefs.propertyTypes.sort()) !==
        JSON.stringify(initial.propertyTypes.sort());

    setHasChanges(changed);
  }, []);

  // Update handlers
  const updateInvestorType = (type: InvestorType) => {
    const newPrefs = { ...preferences, investorType: type };
    setPreferences(newPrefs);
    checkForChanges(newPrefs);
  };

  const updateInvestmentStrategy = (strategy: InvestmentStrategy) => {
    const newPrefs = { ...preferences, investmentStrategy: strategy };
    setPreferences(newPrefs);
    checkForChanges(newPrefs);
  };

  const togglePropertyType = (type: PropertyType) => {
    const newTypes = preferences.propertyTypes.includes(type)
      ? preferences.propertyTypes.filter((t) => t !== type)
      : [...preferences.propertyTypes, type];
    const newPrefs = { ...preferences, propertyTypes: newTypes };
    setPreferences(newPrefs);
    checkForChanges(newPrefs);
  };

  const updateTypicalBudget = (budget: TypicalBudget) => {
    const newPrefs = { ...preferences, typicalBudget: budget };
    setPreferences(newPrefs);
    checkForChanges(newPrefs);
  };

  const updateProjectsPerYear = (count: ProjectsPerYear) => {
    const newPrefs = { ...preferences, projectsPerYear: count };
    setPreferences(newPrefs);
    checkForChanges(newPrefs);
  };

  // Save preferences
  const savePreferences = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/investment-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to save your preferences");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      // Update initial ref to current values
      initialPreferencesRef.current = { ...preferences };
      setHasChanges(false);
      toast.success("Investment preferences saved");
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError(err instanceof Error ? err.message : "Failed to save preferences");
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Investor Type Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          What type of investor are you?
        </Label>
        <SelectionCardGroup className="grid gap-3 sm:grid-cols-3">
          {investorTypeOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={investorTypeIcons[option.value]}
              selected={preferences.investorType === option.value}
              onSelect={() => updateInvestorType(option.value)}
              disabled={isSaving}
              className="sm:p-4"
            />
          ))}
        </SelectionCardGroup>
      </div>

      <Separator />

      {/* Investment Strategy Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Primary investment strategy
        </Label>
        <SelectionCardGroup className="grid gap-3 sm:grid-cols-2">
          {investmentStrategyOptions.map((option) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              description={option.description}
              icon={investmentStrategyIcons[option.value]}
              selected={preferences.investmentStrategy === option.value}
              onSelect={() => updateInvestmentStrategy(option.value)}
              disabled={isSaving}
              className="sm:p-4"
            />
          ))}
        </SelectionCardGroup>
      </div>

      <Separator />

      {/* Property Types Section (Multi-select) */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Property types you focus on
        </Label>
        <p className="text-sm text-muted-foreground">
          Select all that apply
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {propertyTypeOptions.map((option) => {
            const isSelected = preferences.propertyTypes.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePropertyType(option.value)}
                disabled={isSaving}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                  ${
                    isSelected
                      ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50"
                      : "border-border hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/50"
                  }
                  ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {propertyTypeIcons[option.value]}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      isSelected ? "text-slate-900 dark:text-white" : ""
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                    <IconCheck className="h-3 w-3 text-white dark:text-slate-900" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Budget and Volume Dropdowns */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Typical Budget */}
        <div className="space-y-2">
          <Label htmlFor={budgetSelectId}>Typical project budget</Label>
          <Select
            value={preferences.typicalBudget || ""}
            onValueChange={(value) => updateTypicalBudget(value as TypicalBudget)}
            disabled={isSaving}
          >
            <SelectTrigger id={budgetSelectId}>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {typicalBudgetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projects Per Year */}
        <div className="space-y-2">
          <Label htmlFor={projectsSelectId}>Projects per year</Label>
          <Select
            value={preferences.projectsPerYear || ""}
            onValueChange={(value) => updateProjectsPerYear(value as ProjectsPerYear)}
            disabled={isSaving}
          >
            <SelectTrigger id={projectsSelectId}>
              <SelectValue placeholder="Select volume" />
            </SelectTrigger>
            <SelectContent>
              {projectsPerYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={savePreferences}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Save preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
