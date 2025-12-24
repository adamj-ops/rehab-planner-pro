import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ChargingProgressProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ChargingProgress({ currentStep, totalSteps, className }: ChargingProgressProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const percentage = Math.round((currentStep / totalSteps) * 100)
  const segments = 30 // Number of segments in the battery
  const filledSegments = Math.floor((currentStep / totalSteps) * segments)
  
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [currentStep])

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">Progress</h3>
        <div className="flex items-center gap-2">
          {percentage === 100 ? (
            <span className="text-xs text-green-600 font-medium">Complete!</span>
          ) : (
            <span className="text-xs text-gray-500">
              {currentStep} of {totalSteps} steps
            </span>
          )}
        </div>
      </div>

      {/* Main progress text */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight">
            {percentage}%
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>+{Math.round(100 / totalSteps)}%</span>
            <span className="text-xs">since last step</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {percentage < 100 
            ? "You are on track to complete your estimate in " + (totalSteps - currentStep) + " more steps."
            : "Your rehab estimate is ready for review!"}
        </p>
      </div>

      {/* Battery/Charging Container */}
      <div className="relative">
        {/* Battery outline */}
        <div className="relative bg-gray-100 rounded-lg p-1 overflow-hidden">
          {/* Segments */}
          <div className="flex gap-[2px]">
            {Array.from({ length: segments }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-8 flex-1 rounded-sm transition-all duration-300",
                  index < filledSegments
                    ? percentage === 100
                      ? "bg-green-500"
                      : percentage > 66
                      ? "bg-blue-500"
                      : percentage > 33
                      ? "bg-blue-400"
                      : "bg-gray-400"
                    : "bg-gray-200",
                  isAnimating && index === filledSegments - 1 && "animate-pulse"
                )}
                style={{
                  transitionDelay: `${index * 10}ms`
                }}
              />
            ))}
          </div>

          {/* Charging animation overlay */}
          {isAnimating && percentage < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>

        {/* Battery terminal */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-4 bg-gray-300 rounded-r-sm" />
      </div>

      {/* Step labels below */}
      <div className="flex justify-between mt-4 px-1">
        <span className="text-xs text-gray-400">Start</span>
        {percentage === 100 ? (
          <span className="text-xs text-green-600 font-medium">Complete</span>
        ) : (
          <span className="text-xs text-gray-400">Finish</span>
        )}
      </div>
    </div>
  )
}
