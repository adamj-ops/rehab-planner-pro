"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  OnboardingData,
  OnboardingStep,
  InvestorType,
  InvestmentStrategy,
  PropertyType,
  TypicalBudget,
  ProjectsPerYear,
} from "@/types/onboarding";
import { defaultOnboardingData } from "@/types/onboarding";

// Debounce delay for auto-save (in milliseconds)
const SAVE_DEBOUNCE_MS = 500;

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

// Helper: exponential backoff delay
const getRetryDelay = (attempt: number) =>
  INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);

interface OnboardingContextValue {
  // State
  currentStep: OnboardingStep;
  data: OnboardingData;
  completedSteps: OnboardingStep[];
  isLoading: boolean;
  error: string | null;

  // Save State
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;

  // Navigation
  goToStep: (step: OnboardingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Data Updates
  setInvestorType: (type: InvestorType) => void;
  setInvestmentStrategy: (strategy: InvestmentStrategy) => void;
  togglePropertyType: (type: PropertyType) => void;
  setTypicalBudget: (budget: TypicalBudget) => void;
  setProjectsPerYear: (count: ProjectsPerYear) => void;
  updateProfile: (profile: Partial<OnboardingData>) => void;

  // Actions
  completeStep: (step: OnboardingStep) => void;
  completeOnboarding: () => Promise<void>;

  // Validation
  canProceed: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
  initialData?: Partial<OnboardingData>;
  initialStep?: OnboardingStep;
}

export function OnboardingProvider({
  children,
  initialData = {},
  initialStep = 1,
}: OnboardingProviderProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [data, setData] = useState<OnboardingData>({
    ...defaultOnboardingData,
    ...initialData,
  });
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track pending save data
  const pendingSaveRef = useRef<Partial<OnboardingData> | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Save progress to API with retry logic (internal function)
  const performSave = useCallback(
    async (dataToSave: Partial<OnboardingData>, step?: OnboardingStep) => {
      setIsSaving(true);
      setSaveError(null);

      let lastError: Error | null = null;

      for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          const response = await fetch("/api/onboarding/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: dataToSave,
              currentStep: step,
            }),
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Failed to save progress");
          }

          // Success - update state and exit
          setLastSavedAt(new Date());
          pendingSaveRef.current = null;
          setIsSaving(false);
          return;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Failed to save progress");
          
          // Don't retry on authentication errors
          if (lastError.message === "Not authenticated") {
            break;
          }

          // Wait before retrying (exponential backoff)
          if (attempt < MAX_RETRY_ATTEMPTS - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, getRetryDelay(attempt))
            );
          }
        }
      }

      // All retries failed
      const errorMessage = lastError?.message || "Failed to save progress";
      setSaveError(errorMessage);
      console.error("Error saving onboarding progress after retries:", lastError);
      setIsSaving(false);
    },
    []
  );

  // Debounced save function for data changes
  const saveProgress = useCallback(
    (dataToSave: Partial<OnboardingData>) => {
      // Merge with any pending save data
      pendingSaveRef.current = {
        ...pendingSaveRef.current,
        ...dataToSave,
      };

      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new debounce timer
      saveTimerRef.current = setTimeout(() => {
        if (pendingSaveRef.current) {
          performSave(pendingSaveRef.current);
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [performSave]
  );

  // Save step change immediately (no debounce)
  const saveStepProgress = useCallback(
    (step: OnboardingStep) => {
      // Clear any pending debounce
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Save immediately with pending data + step
      performSave(pendingSaveRef.current || {}, step);
    },
    [performSave]
  );

  // Navigation
  const goToStep = useCallback(
    (step: OnboardingStep) => {
      if (step >= 1 && step <= 6) {
        setCurrentStep(step);
        // Save step progress immediately (no debounce)
        saveStepProgress(step);
        router.push(`/onboarding/step-${step}`);
      }
    },
    [router, saveStepProgress]
  );

  const goToNextStep = useCallback(() => {
    if (currentStep < 6) {
      const nextStep = (currentStep + 1) as OnboardingStep;
      goToStep(nextStep);
    }
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as OnboardingStep;
      goToStep(prevStep);
    }
  }, [currentStep, goToStep]);

  // Data Updates
  const setInvestorType = useCallback(
    (type: InvestorType) => {
      setData((prev) => ({ ...prev, investorType: type }));
      saveProgress({ investorType: type });
    },
    [saveProgress]
  );

  const setInvestmentStrategy = useCallback(
    (strategy: InvestmentStrategy) => {
      setData((prev) => ({ ...prev, investmentStrategy: strategy }));
      saveProgress({ investmentStrategy: strategy });
    },
    [saveProgress]
  );

  const togglePropertyType = useCallback(
    (type: PropertyType) => {
      setData((prev) => {
        const types = prev.propertyTypes.includes(type)
          ? prev.propertyTypes.filter((t) => t !== type)
          : [...prev.propertyTypes, type];
        // Schedule save with new types
        saveProgress({ propertyTypes: types });
        return { ...prev, propertyTypes: types };
      });
    },
    [saveProgress]
  );

  const setTypicalBudget = useCallback(
    (budget: TypicalBudget) => {
      setData((prev) => ({ ...prev, typicalBudget: budget }));
      saveProgress({ typicalBudget: budget });
    },
    [saveProgress]
  );

  const setProjectsPerYear = useCallback(
    (count: ProjectsPerYear) => {
      setData((prev) => ({ ...prev, projectsPerYear: count }));
      saveProgress({ projectsPerYear: count });
    },
    [saveProgress]
  );

  const updateProfile = useCallback(
    (profile: Partial<OnboardingData>) => {
      setData((prev) => ({ ...prev, ...profile }));
      saveProgress(profile);
    },
    [saveProgress]
  );

  // Actions
  const completeStep = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
  }, []);

  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to complete onboarding");
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data, router]);

  // Validation - check if current step can proceed
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return data.investorType !== null;
      case 2:
        return data.investmentStrategy !== null;
      case 3:
        return data.propertyTypes.length > 0;
      case 4:
        return data.typicalBudget !== null;
      case 5:
        return data.projectsPerYear !== null;
      case 6:
        // Profile step - always can proceed (fields are optional)
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const value = useMemo(
    () => ({
      currentStep,
      data,
      completedSteps,
      isLoading,
      error,
      isSaving,
      lastSavedAt,
      saveError,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      setInvestorType,
      setInvestmentStrategy,
      togglePropertyType,
      setTypicalBudget,
      setProjectsPerYear,
      updateProfile,
      completeStep,
      completeOnboarding,
      canProceed,
    }),
    [
      currentStep,
      data,
      completedSteps,
      isLoading,
      error,
      isSaving,
      lastSavedAt,
      saveError,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      setInvestorType,
      setInvestmentStrategy,
      togglePropertyType,
      setTypicalBudget,
      setProjectsPerYear,
      updateProfile,
      completeStep,
      completeOnboarding,
      canProceed,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
