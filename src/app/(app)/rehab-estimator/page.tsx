'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Home,
  ClipboardCheck,
  Target,
  Hammer,
  ListOrdered,
  Calendar,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Sparkles,
  Palette,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRehabStore, useCurrentStep, useProject, useEstimateSummary, useLoading, useError } from '@/hooks/use-rehab-store'
import { PropertyDetailsForm } from '@/components/rehab-estimator/property-details-form'
import { PropertyAssessment } from '@/components/rehab-estimator/assessment/property-assessment'
import { StrategySelector } from '@/components/rehab-estimator/strategy-selector'
import { ScopeBuilder } from '@/components/rehab-estimator/scope-builder/scope-builder'
import { PriorityMatrix } from '@/components/rehab-estimator/priority-matrix/priority-matrix'
import { ActionPlanGenerator } from '@/components/rehab-estimator/action-plan/action-plan-generator'
import { FinalReview } from '@/components/rehab-estimator/final-review'
import { DesignStep } from '@/components/rehab-estimator/design-step'
import { EstimateSummary } from '@/components/rehab-estimator/estimate-summary'
import { cn } from '@/lib/utils'
import { ChargingProgressCompact } from '@/components/rehab-estimator/charging-progress-compact'

const steps = [
  { 
    id: 1, 
    name: 'Property Details', 
    description: 'Enter basic property information',
    icon: Home,
    component: PropertyDetailsForm 
  },
  { 
    id: 2, 
    name: 'Condition Assessment', 
    description: 'Assess property condition room by room',
    icon: ClipboardCheck,
    component: PropertyAssessment 
  },
  { 
    id: 3, 
    name: 'Strategy & Goals', 
    description: 'Define investment strategy and goals',
    icon: Target,
    component: StrategySelector 
  },
  { 
    id: 4, 
    name: 'Scope Building', 
    description: 'Build renovation scope with smart recommendations',
    icon: Hammer,
    component: ScopeBuilder 
  },
  { 
    id: 5, 
    name: 'Priority Analysis', 
    description: 'Analyze priorities and ROI impact',
    icon: ListOrdered,
    component: PriorityMatrix 
  },
  { 
    id: 6, 
    name: 'Action Plan', 
    description: 'Generate phased execution plan',
    icon: Calendar,
    component: ActionPlanGenerator 
  },
  { 
    id: 7, 
    name: 'Design Selections', 
    description: 'Choose colors, materials, and create moodboards',
    icon: Palette,
    component: DesignStep 
  },
  { 
    id: 8, 
    name: 'Final Review', 
    description: 'Review and finalize your plan',
    icon: FileCheck,
    component: FinalReview 
  }
]

export default function RehabEstimatorPage() {
  const router = useRouter()
  const currentStep = useCurrentStep()
  const project = useProject()
  const estimateSummary = useEstimateSummary()
  const loading = useLoading()
  const error = useError()
  
  const {
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    saveProject,
    resetProject,
    setError
  } = useRehabStore()

  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasShownConfetti, setHasShownConfetti] = useState(false)
  const [showSuccessCard, setShowSuccessCard] = useState(false)

  const CurrentStepComponent = steps[currentStep - 1]?.component
  const progress = (currentStep / steps.length) * 100

  // Trigger confetti when all steps are complete
  useEffect(() => {
    if (currentStep === steps.length && !hasShownConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981']
      })
      setHasShownConfetti(true)
      setShowSuccessCard(true)
    }
  }, [currentStep, hasShownConfetti])

  const handleNext = async (data: any) => {
    try {
      // Complete current step
      completeStep(currentStep, data)
      
      // If this is the last step, save the project
      if (currentStep === steps.length) {
        setIsSaving(true)
        const savedProject = await saveProject()
        if (savedProject) {
          router.push(`/rehab-estimator/${savedProject.id}`)
        }
        setIsSaving(false)
      } else {
        // Go to next step
        goToNextStep()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed to next step')
    }
  }

  const handleBack = () => {
    goToPreviousStep()
  }

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true)
      await saveProject()
      setIsSaving(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
      setIsSaving(false)
    }
  }

  const handleGenerateSmartScope = async () => {
    try {
      setIsGenerating(true)
      // TODO: Implement smart scope generation
      // This would call an AI service to generate recommendations
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      setIsGenerating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate smart scope')
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Error Alert */}
      {error && (
        <div className="px-6 py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Smart Scope Generation Alert */}
      {currentStep === 4 && (
        <div className="px-6 py-4">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Ready to generate smart recommendations based on your property assessment and strategy?
                </span>
                <Button
                  size="sm"
                  onClick={handleGenerateSmartScope}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Smart Scope'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6 p-6 flex-1">
        {/* Step Content - Clean form without duplicate headers */}
        <div className="flex-1">
          {showSuccessCard ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center space-y-6 p-12 bg-white rounded-lg shadow-lg border-2 border-green-200"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, -10, 0]
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-gray-900">Estimate Complete!</h2>
                <p className="text-lg text-gray-600 mt-2">
                  Your detailed rehab plan is ready to review and export
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 justify-center"
              >
                <Button size="lg" className="rounded-none">
                  <Download className="mr-2 h-5 w-5" />
                  Export PDF
                </Button>
                <Button size="lg" variant="outline" className="rounded-none">
                  View Dashboard
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {CurrentStepComponent && (
                  <CurrentStepComponent
                    project={project}
                    onNext={handleNext}
                    onBack={handleBack}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Summary Sidebar - Single source of truth */}
        <div className="w-80">
          <EstimateSummary
            project={project}
            estimateSummary={estimateSummary}
            currentStep={currentStep}
          />
        </div>
      </div>

      {/* Navigation Footer - Single source of truth */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep === steps.length ? (
              <Button
                onClick={() => handleNext({})}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Complete Project'}
              </Button>
            ) : (
              <Button
                onClick={() => handleNext({})}
                disabled={!steps[currentStep - 1]?.component}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
