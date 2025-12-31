"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { wizardSteps } from "@/lib/navigation";
import {
  WizardData,
  PropertyDetailsFormData,
  ConditionAssessmentFormData,
  StrategyFormData,
  DesignSelectionsFormData,
  PriorityMatrixFormData,
  ActionPlanFormData,
  FinalReviewFormData,
  propertyDetailsSchema,
  conditionAssessmentSchema,
  strategySchema,
  designSelectionsSchema,
  priorityMatrixSchema,
  actionPlanSchema,
  finalReviewSchema,
} from "@/lib/validations/project-wizard";
import { useRehabStore } from "@/hooks/use-rehab-store";

// =============================================================================
// TYPES
// =============================================================================

type StepFormData = 
  | PropertyDetailsFormData 
  | ConditionAssessmentFormData 
  | StrategyFormData
  | DesignSelectionsFormData
  | PriorityMatrixFormData
  | ActionPlanFormData
  | FinalReviewFormData;

interface WizardContextValue {
  // Current state
  currentStepNumber: number;
  currentStep: typeof wizardSteps[number] | undefined;
  completedSteps: number[];
  isFirstStep: boolean;
  isLastStep: boolean;
  
  // Modal state
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  
  // Wizard data
  wizardData: WizardData;
  
  // Navigation
  goToStep: (stepNumber: number) => void;
  goToNextStep: () => Promise<boolean>;
  goToPreviousStep: () => void;
  
  // Data management
  getStepData: <T extends StepFormData>(stepNumber: number) => Partial<T> | undefined;
  setStepData: (stepNumber: number, data: Partial<StepFormData>) => void;
  markStepComplete: (stepNumber: number) => void;
  markStepIncomplete: (stepNumber: number) => void;
  
  // Form helpers
  validateCurrentStep: () => Promise<boolean>;
  saveCurrentStep: (data: Partial<StepFormData>) => void;
  
  // Project actions
  saveDraft: () => Promise<void>;
  submitProject: () => Promise<void>;
  resetWizard: () => void;
  
  // Loading state
  isSaving: boolean;
  isSubmitting: boolean;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultWizardData: WizardData = {
  currentStep: 1,
  completedSteps: [],
};

const defaultStep1Data: Partial<PropertyDetailsFormData> = {
  project_name: "",
  address_street: "",
  address_city: "",
  address_state: undefined,
  address_zip: "",
  property_type: undefined,
  square_footage: undefined,
  year_built: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  purchase_price: undefined,
};

const defaultStep2Data: Partial<ConditionAssessmentFormData> = {
  overall_condition: undefined,
  condition_notes: "",
  rooms: [
    { room_type: "kitchen", room_name: "Kitchen", needs_renovation: false },
    { room_type: "living_room", room_name: "Living Room", needs_renovation: false },
    { room_type: "bathroom", room_name: "Primary Bathroom", needs_renovation: false },
    { room_type: "bedroom", room_name: "Primary Bedroom", needs_renovation: false },
  ],
};

const defaultStep3Data: Partial<StrategyFormData> = {
  investment_strategy: undefined,
  target_market: undefined,
  design_style: undefined,
  arv: undefined,
  max_budget: undefined,
  target_roi_percentage: 20,
  contingency_percentage: 15,
};

// =============================================================================
// CONTEXT
// =============================================================================

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface WizardProviderProps {
  children: React.ReactNode;
}

export function WizardProvider({ children }: WizardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get Zustand store
  const {
    project,
    currentStep: storeCurrentStep,
    steps,
    loading,
    updateProject,
    setCurrentStep: setStoreCurrentStep,
    completeStep,
    goToNextStep: storeGoToNext,
    goToPreviousStep: storeGoToPrevious,
    resetProject,
    saveProject,
  } = useRehabStore();

  // Local state for saving/submitting
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsDirty(false);
  }, []);
  
  // Wizard data stored in component state, synced with Zustand
  const [wizardData, setWizardData] = React.useState<WizardData>(() => {
    // Initialize from store if available
    const storedData = project as unknown as WizardData;
    return {
      step1: storedData?.step1 || defaultStep1Data,
      step2: storedData?.step2 || defaultStep2Data,
      step3: storedData?.step3 || defaultStep3Data,
      step4: storedData?.step4 || {},
      step5: storedData?.step5 || { scope_items: [] },
      step6: storedData?.step6 || { tasks: [] },
      step7: storedData?.step7 || { scenarios: [] },
      currentStep: storeCurrentStep || 1,
      completedSteps: steps.filter(s => s.completed).map(s => s.id) || [],
    };
  });

  // Determine current step from pathname
  const currentStepNumber = useMemo(() => {
    const step = wizardSteps.find((s) => pathname.startsWith(s.path));
    return step?.number ?? 1;
  }, [pathname]);

  const currentStep = wizardSteps.find((s) => s.number === currentStepNumber);
  const isFirstStep = currentStepNumber === 1;
  const isLastStep = currentStepNumber === wizardSteps.length;

  // Sync current step with store
  useEffect(() => {
    if (currentStepNumber !== storeCurrentStep) {
      setStoreCurrentStep(currentStepNumber);
    }
  }, [currentStepNumber, storeCurrentStep, setStoreCurrentStep]);

  // =============================================================================
  // DATA MANAGEMENT
  // =============================================================================

  const getStepData = useCallback(<T extends StepFormData>(stepNumber: number): Partial<T> | undefined => {
    const key = `step${stepNumber}` as keyof WizardData;
    return wizardData[key] as Partial<T> | undefined;
  }, [wizardData]);

  const setStepData = useCallback((stepNumber: number, data: Partial<StepFormData>) => {
    const key = `step${stepNumber}` as keyof WizardData;
    setWizardData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as object || {}), ...data },
    }));
    
    // Also update Zustand store
    updateProject({ [key]: data });
  }, [updateProject]);

  const markStepComplete = useCallback((stepNumber: number) => {
    setWizardData((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(stepNumber)
        ? prev.completedSteps
        : [...prev.completedSteps, stepNumber],
    }));
    completeStep(stepNumber, {});
  }, [completeStep]);

  const markStepIncomplete = useCallback((stepNumber: number) => {
    setWizardData((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.filter((s) => s !== stepNumber),
    }));
  }, []);

  // =============================================================================
  // NAVIGATION
  // =============================================================================

  const goToStep = useCallback((stepNumber: number) => {
    const step = wizardSteps.find((s) => s.number === stepNumber);
    if (step) {
      router.push(step.path);
    }
  }, [router]);

  const goToNextStep = useCallback(async (): Promise<boolean> => {
    // Mark current step complete and navigate
    markStepComplete(currentStepNumber);
    
    if (!isLastStep) {
      const nextStep = wizardSteps.find((s) => s.number === currentStepNumber + 1);
      if (nextStep) {
        router.push(nextStep.path);
        return true;
      }
    }
    return false;
  }, [currentStepNumber, isLastStep, markStepComplete, router]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = wizardSteps.find((s) => s.number === currentStepNumber - 1);
      if (prevStep) {
        router.push(prevStep.path);
      }
    }
  }, [currentStepNumber, isFirstStep, router]);

  // =============================================================================
  // FORM HELPERS
  // =============================================================================

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    // Get the appropriate schema for current step
    const schemas: Record<number, typeof propertyDetailsSchema> = {
      1: propertyDetailsSchema,
      2: conditionAssessmentSchema,
      3: strategySchema,
      4: designSelectionsSchema,
      5: priorityMatrixSchema,
      6: actionPlanSchema,
      7: finalReviewSchema,
    };

    const schema = schemas[currentStepNumber];
    if (!schema) return true;

    const stepData = getStepData(currentStepNumber);
    const result = schema.safeParse(stepData);
    
    return result.success;
  }, [currentStepNumber, getStepData]);

  const saveCurrentStep = useCallback((data: Partial<StepFormData>) => {
    setStepData(currentStepNumber, data);
  }, [currentStepNumber, setStepData]);

  // =============================================================================
  // PROJECT ACTIONS
  // =============================================================================

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      // Aggregate all step data
      const projectData = {
        ...wizardData,
        status: "draft" as const,
      };
      
      updateProject(projectData as unknown as Record<string, unknown>);
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  }, [wizardData, updateProject]);

  const submitProject = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Validate all required steps
      const requiredSteps = [1, 2, 3];
      for (const stepNum of requiredSteps) {
        if (!wizardData.completedSteps.includes(stepNum)) {
          toast.error(`Please complete Step ${stepNum} before submitting`);
          goToStep(stepNum);
          return;
        }
      }

      // Save to Supabase via store
      const result = await saveProject("temp-user-id"); // TODO: Get actual user ID
      
      if (result) {
        toast.success("Project created successfully!");
        resetProject();
        router.push(`/project/${result.id}`);
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Failed to submit project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  }, [wizardData, saveProject, resetProject, router, goToStep]);

  const resetWizard = useCallback(() => {
    setWizardData(defaultWizardData);
    resetProject();
    router.push("/wizard/step-1");
  }, [resetProject, router]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const value = useMemo<WizardContextValue>(() => ({
    currentStepNumber,
    currentStep,
    completedSteps: wizardData.completedSteps,
    isFirstStep,
    isLastStep,
    // Modal state
    isModalOpen,
    openModal,
    closeModal,
    isDirty,
    setIsDirty,
    // Data
    wizardData,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    getStepData,
    setStepData,
    markStepComplete,
    markStepIncomplete,
    validateCurrentStep,
    saveCurrentStep,
    saveDraft,
    submitProject,
    resetWizard,
    isSaving,
    isSubmitting,
  }), [
    currentStepNumber,
    currentStep,
    wizardData,
    isFirstStep,
    isLastStep,
    isModalOpen,
    openModal,
    closeModal,
    isDirty,
    setIsDirty,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    getStepData,
    setStepData,
    markStepComplete,
    markStepIncomplete,
    validateCurrentStep,
    saveCurrentStep,
    saveDraft,
    submitProject,
    resetWizard,
    isSaving,
    isSubmitting,
  ]);

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

// =============================================================================
// STEP-SPECIFIC HOOKS
// =============================================================================

export function useWizardStep1Form() {
  const { getStepData, setStepData, markStepComplete } = useWizard();
  
  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: getStepData<PropertyDetailsFormData>(1) || defaultStep1Data,
    mode: "onBlur",
  });

  const onSubmit = useCallback((data: PropertyDetailsFormData) => {
    setStepData(1, data);
    markStepComplete(1);
  }, [setStepData, markStepComplete]);

  return { form, onSubmit };
}

export function useWizardStep2Form() {
  const { getStepData, setStepData, markStepComplete } = useWizard();
  
  const form = useForm<ConditionAssessmentFormData>({
    resolver: zodResolver(conditionAssessmentSchema),
    defaultValues: getStepData<ConditionAssessmentFormData>(2) || defaultStep2Data,
    mode: "onBlur",
  });

  const onSubmit = useCallback((data: ConditionAssessmentFormData) => {
    setStepData(2, data);
    markStepComplete(2);
  }, [setStepData, markStepComplete]);

  return { form, onSubmit };
}

export function useWizardStep3Form() {
  const { getStepData, setStepData, markStepComplete } = useWizard();
  
  const form = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: getStepData<StrategyFormData>(3) || defaultStep3Data,
    mode: "onBlur",
  });

  const onSubmit = useCallback((data: StrategyFormData) => {
    setStepData(3, data);
    markStepComplete(3);
  }, [setStepData, markStepComplete]);

  return { form, onSubmit };
}
