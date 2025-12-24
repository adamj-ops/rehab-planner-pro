'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Lightbulb, 
  TrendingUp,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStep {
  id: number
  name: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  progress: number
  proTip: string
  estimatedTime: string
  icon?: React.ComponentType<{ className?: string }>
}

interface ProgressStepsProps {
  steps: ProgressStep[]
  currentStep: number
  onStepClick?: (stepId: number) => void
  showDetails?: boolean
}

export function ProgressSteps({ 
  steps, 
  currentStep, 
  onStepClick,
  showDetails = true 
}: ProgressStepsProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(currentStep)

  const getStepIcon = (step: ProgressStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (step.status === 'current') {
      return <Circle className="w-5 h-5 text-blue-600 fill-current" />
    } else {
      return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepColor = (step: ProgressStep) => {
    if (step.status === 'completed') return 'text-green-600'
    if (step.status === 'current') return 'text-blue-600'
    return 'text-gray-400'
  }

  const getProgressColor = (step: ProgressStep) => {
    if (step.status === 'completed') return 'bg-green-600'
    if (step.status === 'current') return 'bg-blue-600'
    return 'bg-gray-300'
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">builds</Badge>
          <Badge variant="outline" className="text-xs">backlog</Badge>
          <Badge variant="outline" className="text-xs">agile</Badge>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="border-b pb-2">
        <h2 className="text-xl font-bold">Sprint</h2>
      </div>

      {/* Progress Status */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          You are on track to reach the goal in {steps.length - currentStep} steps.
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{Math.round((currentStep / steps.length) * 100)}%
          </Badge>
          <span className="text-xs text-muted-foreground">since you last checked</span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="flex space-x-1">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "h-2 flex-1 rounded-sm transition-all duration-300",
              step.status === 'completed' && "bg-green-600",
              step.status === 'current' && "bg-blue-600",
              step.status === 'upcoming' && "bg-gray-300"
            )}
          />
        ))}
      </div>

      {/* Step Details */}
      {showDetails && (
        <div className="space-y-3">
          {steps.map((step) => (
            <Card 
              key={step.id}
              className={cn(
                "transition-all duration-200 cursor-pointer hover:shadow-md",
                step.status === 'current' && "ring-2 ring-blue-500",
                step.status === 'completed' && "opacity-75"
              )}
              onClick={() => {
                if (onStepClick) onStepClick(step.id)
                setExpandedStep(expandedStep === step.id ? null : step.id)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={cn("font-medium", getStepColor(step))}>
                          {step.name}
                        </h3>
                        {step.status === 'current' && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      
                      {/* Step Progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(step))}
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedStep === step.id && (
                        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Estimated time: {step.estimatedTime}
                            </span>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-800 mb-1">
                                  Pro Tip
                                </p>
                                <p className="text-sm text-blue-700">
                                  {step.proTip}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {step.status === 'current' && (
                      <Button size="sm" variant="outline">
                        Continue
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedStep(expandedStep === step.id ? null : step.id)
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
