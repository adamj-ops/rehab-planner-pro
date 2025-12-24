'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, MoreHorizontal } from 'lucide-react'

interface ProgressStepsProps {
  currentStep: number
  totalSteps: number
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  const progress = Math.round((currentStep / totalSteps) * 100)
  const remainingSteps = totalSteps - currentStep

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">rehab</Badge>
          <Badge variant="outline" className="text-xs">estimation</Badge>
          <Badge variant="outline" className="text-xs">project</Badge>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="border-b pb-2">
        <h2 className="text-xl font-bold">Rehab Estimator</h2>
      </div>

      {/* Progress Status */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          You are on track to complete your estimate in {remainingSteps} steps.
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            {progress}%
          </span>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{progress}%
          </Badge>
          <span className="text-xs text-muted-foreground">since you last checked</span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="flex space-x-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-sm transition-all duration-300 ${
              index < currentStep ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
