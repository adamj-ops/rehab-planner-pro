import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  RehabProject, 
  ScopeItem, 
  PropertyAssessment, 
  StrategyConfig,
  EstimateSummary,
  EstimatorStep,
  PriorityMatrixItem,
  ActionPlanPhase
} from '@/types/rehab'
import type { WizardData } from '@/lib/validations/project-wizard'

interface RehabStore {
  // Project state
  project: Partial<RehabProject>
  
  // Wizard step data (new typed structure)
  wizardData: Partial<WizardData>
  
  // Step management
  currentStep: number
  steps: EstimatorStep[]
  
  // UI state
  loading: boolean
  error: string | null
  
  // Computed data
  estimateSummary: EstimateSummary | null
  priorityMatrix: PriorityMatrixItem[]
  actionPlan: ActionPlanPhase[]
  
  // Actions
  updateProject: (updates: Partial<RehabProject>) => void
  setCurrentStep: (step: number) => void
  completeStep: (stepId: number, data: Record<string, unknown>) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  resetProject: () => void
  
  // Wizard-specific actions
  setWizardStepData: (step: number, data: Record<string, unknown>) => void
  getWizardStepData: (step: number) => Record<string, unknown> | undefined
  getCompletedSteps: () => number[]
  
  // Project actions
  saveProject: (userId: string) => Promise<RehabProject | null>
  loadProject: (projectId: string) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  
  // Scope management
  addScopeItem: (item: ScopeItem) => void
  updateScopeItem: (itemId: string, updates: Partial<ScopeItem>) => void
  removeScopeItem: (itemId: string) => void
  toggleScopeItem: (itemId: string) => void
  
  // Assessment management
  updateAssessment: (roomType: string, assessment: PropertyAssessment) => void
  getAssessment: (roomType: string) => PropertyAssessment | null
  
  // Calculations
  calculateEstimate: () => void
  calculatePriorityMatrix: () => void
  generateActionPlan: () => void
  
  // Utility
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const defaultSteps: EstimatorStep[] = [
  { id: 1, name: 'Property Details', component: 'PropertyDetailsForm', completed: false },
  { id: 2, name: 'Condition Assessment', component: 'PropertyAssessment', completed: false },
  { id: 3, name: 'Strategy & Goals', component: 'StrategySelector', completed: false },
  { id: 4, name: 'Scope Building', component: 'ScopeBuilder', completed: false },
  { id: 5, name: 'Priority Analysis', component: 'PriorityMatrix', completed: false },
  { id: 6, name: 'Action Plan', component: 'ActionPlanGenerator', completed: false },
  { id: 7, name: 'Final Review', component: 'FinalReview', completed: false }
]

const defaultEstimateSummary: EstimateSummary = {
  totalCost: 0,
  materialCost: 0,
  laborCost: 0,
  contingency: 0,
  timeline: 0,
  roiImpact: 0,
  budgetUsage: 0,
  categoryBreakdown: {}
}

export const useRehabStore = create<RehabStore>()(
  persist(
    (set, get) => ({
      // Initial state
      project: {},
      wizardData: { currentStep: 1, completedSteps: [] },
      currentStep: 1,
      steps: defaultSteps,
      loading: false,
      error: null,
      estimateSummary: defaultEstimateSummary,
      priorityMatrix: [],
      actionPlan: [],
      
      // Step management
      updateProject: (updates) => {
        set((state) => ({
          project: { ...state.project, ...updates }
        }))
      },
      
      setCurrentStep: (step) => {
        set((state) => ({ 
          currentStep: step,
          wizardData: { ...state.wizardData, currentStep: step }
        }))
      },
      
      completeStep: (stepId, data) => {
        set((state) => {
          const completedSteps = state.wizardData?.completedSteps || []
          const newCompletedSteps = completedSteps.includes(stepId) 
            ? completedSteps 
            : [...completedSteps, stepId]
          
          return {
            steps: state.steps.map(step => 
              step.id === stepId 
                ? { ...step, completed: true, data }
                : step
            ),
            project: { ...state.project, ...data },
            wizardData: {
              ...state.wizardData,
              completedSteps: newCompletedSteps,
              [`step${stepId}`]: data,
            }
          }
        })
      },
      
      goToNextStep: () => {
        const { currentStep, steps } = get()
        if (currentStep < steps.length) {
          set({ currentStep: currentStep + 1 })
        }
      },
      
      goToPreviousStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },
      
      resetProject: () => {
        set({
          project: {},
          wizardData: { currentStep: 1, completedSteps: [] },
          currentStep: 1,
          steps: defaultSteps,
          estimateSummary: defaultEstimateSummary,
          priorityMatrix: [],
          actionPlan: [],
          error: null
        })
      },
      
      // Wizard-specific actions
      setWizardStepData: (step, data) => {
        set((state) => ({
          wizardData: {
            ...state.wizardData,
            [`step${step}`]: { 
              ...(state.wizardData?.[`step${step}` as keyof typeof state.wizardData] as Record<string, unknown> || {}),
              ...data 
            }
          }
        }))
      },
      
      getWizardStepData: (step) => {
        const { wizardData } = get()
        return wizardData?.[`step${step}` as keyof typeof wizardData] as Record<string, unknown> | undefined
      },
      
      getCompletedSteps: () => {
        const { wizardData, steps } = get()
        // Combine both sources for completed steps
        const fromWizardData = wizardData?.completedSteps || []
        const fromSteps = steps.filter(s => s.completed).map(s => s.id)
        return [...new Set([...fromWizardData, ...fromSteps])]
      },
      
      // Project actions
      saveProject: async (userId: string) => {
        const { project } = get()
        set({ loading: true, error: null })
        
        try {
          // Import the project service
          const { projectService, scopeItemService, assessmentService } = await import('@/lib/supabase/database')
          
          let savedProject: RehabProject | null
          
          if (project.id) {
            // Update existing project
            savedProject = await projectService.update(project.id, { ...project, userId })
          } else {
            // Create new project
            savedProject = await projectService.create({ ...project, userId })
          }
          
          if (savedProject) {
            // Save scope items if they exist
            if (project.scopeItems && project.scopeItems.length > 0) {
              for (const item of project.scopeItems) {
                if (item.id) {
                  await scopeItemService.update(item.id, item)
                } else {
                  await scopeItemService.create(savedProject.id, item)
                }
              }
            }
            
            // Save assessments if they exist
            if (project.assessments && Array.isArray(project.assessments)) {
              for (const assessment of project.assessments) {
                if (assessment) {
                  await assessmentService.upsert(savedProject.id, assessment)
                }
              }
            }
            
            // Reload the project with all related data
            const fullProject = await projectService.getById(savedProject.id)
            if (fullProject) {
              set({ project: fullProject })
              return fullProject
            }
            
            return savedProject
          } else {
            throw new Error('Failed to save project')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save project'
          set({ error: errorMessage })
          return null
        } finally {
          set({ loading: false })
        }
      },
      
      loadProject: async (projectId: string) => {
        set({ loading: true, error: null })
        
        try {
          // Import the project service
          const { projectService } = await import('@/lib/supabase/database')
          
          const project = await projectService.getById(projectId)
          
          if (project) {
            set({ project })
          } else {
            throw new Error('Project not found')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load project'
          set({ error: errorMessage })
        } finally {
          set({ loading: false })
        }
      },
      
      deleteProject: async (projectId: string) => {
        set({ loading: true, error: null })
        
        try {
          // Import the project service
          const { projectService } = await import('@/lib/supabase/database')
          
          const success = await projectService.delete(projectId)
          
          if (success) {
            set({ project: {} })
          } else {
            throw new Error('Failed to delete project')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
          set({ error: errorMessage })
        } finally {
          set({ loading: false })
        }
      },
      
      // Scope management
      addScopeItem: (item) => {
        set((state) => ({
          project: {
            ...state.project,
            scopeItems: [...(state.project.scopeItems || []), item]
          }
        }))
        get().calculateEstimate()
      },
      
      updateScopeItem: (itemId, updates) => {
        set((state) => ({
          project: {
            ...state.project,
            scopeItems: state.project.scopeItems?.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            ) || []
          }
        }))
        get().calculateEstimate()
      },
      
      removeScopeItem: (itemId) => {
        set((state) => ({
          project: {
            ...state.project,
            scopeItems: state.project.scopeItems?.filter(item => item.id !== itemId) || []
          }
        }))
        get().calculateEstimate()
      },
      
      toggleScopeItem: (itemId) => {
        set((state) => ({
          project: {
            ...state.project,
            scopeItems: state.project.scopeItems?.map(item =>
              item.id === itemId ? { ...item, included: !item.included } : item
            ) || []
          }
        }))
        get().calculateEstimate()
      },
      
      // Assessment management
      updateAssessment: (roomType, assessment) => {
        set((state) => ({
          project: {
            ...state.project,
            assessments: {
              ...state.project.assessments,
              [roomType]: assessment
            }
          }
        }))
      },
      
      getAssessment: (roomType) => {
        const { project } = get()
        return project.assessments?.[roomType] || null
      },
      
      // Calculations
      calculateEstimate: () => {
        const { project } = get()
        const scopeItems = project.scopeItems?.filter(item => item.included) || []
        
        const totalCost = scopeItems.reduce((sum, item) => sum + item.totalCost, 0)
        const materialCost = scopeItems.reduce((sum, item) => sum + item.materialCost, 0)
        const laborCost = scopeItems.reduce((sum, item) => sum + item.laborCost, 0)
        const contingency = totalCost * 0.1 // 10% contingency
        const timeline = Math.max(...scopeItems.map(item => item.daysRequired), 0)
        const roiImpact = scopeItems.reduce((sum, item) => sum + item.roiImpact, 0)
        const budgetUsage = project.maxBudget ? (totalCost / project.maxBudget) * 100 : 0
        
        // Calculate category breakdown
        const categoryBreakdown: Record<string, number> = {}
        scopeItems.forEach(item => {
          categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.totalCost
        })
        
        const estimateSummary: EstimateSummary = {
          totalCost,
          materialCost,
          laborCost,
          contingency,
          timeline,
          roiImpact,
          budgetUsage,
          categoryBreakdown
        }
        
        set({ estimateSummary })
      },
      
      calculatePriorityMatrix: () => {
        const { project } = get()
        const scopeItems = project.scopeItems?.filter(item => item.included) || []
        
        const priorityMatrix: PriorityMatrixItem[] = scopeItems.map(item => {
          // Calculate urgency based on priority and dependencies
          let urgency = 50 // Base urgency
          
          if (item.priority === 'must') urgency += 30
          else if (item.priority === 'should') urgency += 15
          else if (item.priority === 'could') urgency -= 10
          else urgency -= 25
          
          // Adjust based on dependencies
          if (item.dependsOn.length > 0) urgency += 10
          
          // Clamp between 0-100
          urgency = Math.max(0, Math.min(100, urgency))
          
          return {
            id: item.id,
            name: item.itemName,
            category: getCategoryFromItem(item),
            roiImpact: item.roiImpact,
            urgency,
            cost: item.totalCost,
            priority: item.priority,
            included: item.included
          }
        })
        
        set({ priorityMatrix })
      },
      
      generateActionPlan: () => {
        const { project, priorityMatrix } = get()
        const scopeItems = project.scopeItems?.filter(item => item.included) || []
        
        // Group items by phase
        const phases: ActionPlanPhase[] = []
        const maxPhase = Math.max(...scopeItems.map(item => item.phase), 0)
        
        for (let i = 1; i <= maxPhase; i++) {
          const phaseItems = scopeItems.filter(item => item.phase === i)
          const phaseCost = phaseItems.reduce((sum, item) => sum + item.totalCost, 0)
          const phaseDays = Math.max(...phaseItems.map(item => item.daysRequired), 0)
          
          const startDay = phases.reduce((sum, phase) => sum + phase.endDay, 0) + 1
          const endDay = startDay + phaseDays - 1
          
          phases.push({
            id: `phase-${i}`,
            name: `Phase ${i}`,
            startDay,
            endDay,
            cost: phaseCost,
            tasks: phaseItems.map(item => ({
              id: item.id,
              name: item.itemName,
              contractor: 'General Contractor',
              duration: item.daysRequired,
              cost: item.totalCost,
              dependencies: item.dependsOn,
              priority: item.priority === 'must' ? 'critical' : 'high'
            })),
            dependencies: [],
            criticalPath: i === 1, // First phase is critical
            warnings: []
          })
        }
        
        set({ actionPlan: phases })
      },
      
      // Utility
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'rehab-estimator-store',
      partialize: (state) => ({
        project: state.project,
        wizardData: state.wizardData,
        currentStep: state.currentStep,
        steps: state.steps
      })
    }
  )
)

// Helper function to determine category from scope item
function getCategoryFromItem(item: ScopeItem): 'safety' | 'structural' | 'systems' | 'cosmetic' | 'optional' {
  const category = item.category.toLowerCase()
  
  if (category.includes('electrical') || category.includes('plumbing') || category.includes('hvac')) {
    return 'systems'
  }
  
  if (category.includes('foundation') || category.includes('roof') || category.includes('structural')) {
    return 'structural'
  }
  
  if (category.includes('safety') || category.includes('code')) {
    return 'safety'
  }
  
  if (category.includes('paint') || category.includes('flooring') || category.includes('cosmetic')) {
    return 'cosmetic'
  }
  
  return 'optional'
}

// Selector hooks for better performance
export const useProject = () => useRehabStore((state) => state.project)
export const useCurrentStep = () => useRehabStore((state) => state.currentStep)
export const useEstimateSummary = () => useRehabStore((state) => state.estimateSummary)
export const usePriorityMatrix = () => useRehabStore((state) => state.priorityMatrix)
export const useActionPlan = () => useRehabStore((state) => state.actionPlan)
export const useLoading = () => useRehabStore((state) => state.loading)
export const useError = () => useRehabStore((state) => state.error)

// Wizard-specific selectors
export const useWizardData = () => useRehabStore((state) => state.wizardData)
export const useCompletedSteps = () => useRehabStore((state) => state.getCompletedSteps())
export const useWizardStepData = (step: number) => useRehabStore((state) => 
  state.wizardData?.[`step${step}` as keyof typeof state.wizardData]
)
