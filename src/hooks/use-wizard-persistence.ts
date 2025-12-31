'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useDebounce } from './use-debounce';

// =============================================================================
// TYPES
// =============================================================================

interface WizardDraftData {
  step1?: Record<string, unknown>;
  step2?: Record<string, unknown>;
  step3?: Record<string, unknown>;
  step4?: Record<string, unknown>;
  step5?: Record<string, unknown>;
  step6?: Record<string, unknown>;
  step7?: Record<string, unknown>;
}

interface WizardProgress {
  id: string;
  wizard_current_step: number;
  wizard_completed_steps: number[];
  wizard_draft_data: WizardDraftData;
  wizard_started_at: string | null;
  wizard_completed_at: string | null;
  status: string;
}

interface UseWizardPersistenceOptions {
  projectId?: string;
  autoSave?: boolean;
  autoSaveDelayMs?: number;
}

interface UseWizardPersistenceReturn {
  // State
  projectId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  lastSaved: Date | null;
  
  // Data
  currentStep: number;
  completedSteps: number[];
  draftData: WizardDraftData;
  
  // Actions
  createProject: () => Promise<string>;
  saveProgress: (data: Partial<WizardProgress>) => Promise<void>;
  saveStepData: (stepNumber: number, data: Record<string, unknown>) => Promise<void>;
  markStepComplete: (stepNumber: number) => Promise<void>;
  completeWizard: () => Promise<void>;
  
  // Auto-save
  queueAutoSave: (data: Record<string, unknown>) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useWizardPersistence({
  projectId: initialProjectId,
  autoSave = true,
  autoSaveDelayMs = 2000,
}: UseWizardPersistenceOptions = {}): UseWizardPersistenceReturn {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingData, setPendingData] = useState<Record<string, unknown> | null>(null);
  
  // Debounce pending data for auto-save
  const debouncedPendingData = useDebounce(pendingData, autoSaveDelayMs);
  
  // =============================================================================
  // FETCH EXISTING PROJECT
  // =============================================================================
  
  const {
    data: project,
    isLoading,
    error: fetchError,
  } = useQuery<WizardProgress | null, Error>({
    queryKey: ['wizard_project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('rehab_projects')
        .select('id, wizard_current_step, wizard_completed_steps, wizard_draft_data, wizard_started_at, wizard_completed_at, status')
        .eq('id', projectId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Project not found
          return null;
        }
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // =============================================================================
  // CREATE PROJECT MUTATION
  // =============================================================================
  
  const createProjectMutation = useMutation<string, Error>({
    mutationFn: async () => {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }
      
      // Create new project in draft status
      const { data, error } = await supabase
        .from('rehab_projects')
        .insert({
          user_id: user.id,
          status: 'draft',
          wizard_current_step: 1,
          wizard_completed_steps: [],
          wizard_draft_data: {},
          wizard_started_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.id;
    },
    onSuccess: (newProjectId) => {
      setProjectId(newProjectId);
      queryClient.invalidateQueries({ queryKey: ['wizard_project'] });
      toast.success('Project created!');
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
  
  // =============================================================================
  // SAVE PROGRESS MUTATION
  // =============================================================================
  
  const saveProgressMutation = useMutation<void, Error, Partial<WizardProgress>>({
    mutationFn: async (updates) => {
      if (!projectId) {
        throw new Error('No project ID');
      }
      
      const { error } = await supabase
        .from('rehab_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['wizard_project', projectId] });
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });
  
  // =============================================================================
  // SAVE STEP DATA
  // =============================================================================
  
  const saveStepData = useCallback(async (stepNumber: number, data: Record<string, unknown>) => {
    if (!projectId) return;
    
    // Merge with existing draft data
    const currentDraftData = project?.wizard_draft_data || {};
    const updatedDraftData = {
      ...currentDraftData,
      [`step${stepNumber}`]: {
        ...(currentDraftData[`step${stepNumber}` as keyof WizardDraftData] || {}),
        ...data,
      },
    };
    
    await saveProgressMutation.mutateAsync({
      wizard_draft_data: updatedDraftData,
      wizard_current_step: stepNumber,
    });
  }, [projectId, project?.wizard_draft_data, saveProgressMutation]);
  
  // =============================================================================
  // MARK STEP COMPLETE
  // =============================================================================
  
  const markStepComplete = useCallback(async (stepNumber: number) => {
    if (!projectId) return;
    
    const currentCompleted = project?.wizard_completed_steps || [];
    if (currentCompleted.includes(stepNumber)) return;
    
    await saveProgressMutation.mutateAsync({
      wizard_completed_steps: [...currentCompleted, stepNumber],
    });
  }, [projectId, project?.wizard_completed_steps, saveProgressMutation]);
  
  // =============================================================================
  // COMPLETE WIZARD
  // =============================================================================
  
  const completeWizard = useCallback(async () => {
    if (!projectId) return;
    
    await saveProgressMutation.mutateAsync({
      status: 'planning',
      wizard_completed_at: new Date().toISOString(),
      wizard_completed_steps: [1, 2, 3, 4, 5, 6, 7],
    });
    
    toast.success('Wizard completed! Project is now in planning phase.');
  }, [projectId, saveProgressMutation]);
  
  // =============================================================================
  // AUTO-SAVE
  // =============================================================================
  
  const queueAutoSave = useCallback((data: Record<string, unknown>) => {
    if (autoSave) {
      setPendingData(data);
    }
  }, [autoSave]);
  
  // Effect to handle debounced auto-save
  useEffect(() => {
    if (debouncedPendingData && projectId && autoSave) {
      // Determine step from the data or use current step
      const currentStep = project?.wizard_current_step || 1;
      saveStepData(currentStep, debouncedPendingData);
      setPendingData(null);
    }
  }, [debouncedPendingData, projectId, autoSave, project?.wizard_current_step, saveStepData]);
  
  // =============================================================================
  // RETURN
  // =============================================================================
  
  return {
    // State
    projectId,
    isLoading,
    isSaving: saveProgressMutation.isPending || createProjectMutation.isPending,
    error: fetchError || saveProgressMutation.error || createProjectMutation.error || null,
    lastSaved,
    
    // Data
    currentStep: project?.wizard_current_step || 1,
    completedSteps: project?.wizard_completed_steps || [],
    draftData: project?.wizard_draft_data || {},
    
    // Actions
    createProject: async () => {
      if (projectId) return projectId;
      return await createProjectMutation.mutateAsync();
    },
    saveProgress: saveProgressMutation.mutateAsync,
    saveStepData,
    markStepComplete,
    completeWizard,
    
    // Auto-save
    queueAutoSave,
  };
}

export type { WizardDraftData, WizardProgress, UseWizardPersistenceOptions, UseWizardPersistenceReturn };
