import { cn } from '@/lib/utils'

interface ChargingProgressProps {
  currentStep: number
  totalSteps: number
}

export function ChargingProgressCompact({ currentStep, totalSteps }: ChargingProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)
  const segments = 20 // Fewer segments for compact view
  const filledSegments = Math.floor((currentStep / totalSteps) * segments)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">{percentage}%</span>
        <span className="text-xs text-muted-foreground">
          Step {currentStep}/{totalSteps}
        </span>
      </div>
      
      <div className="relative bg-gray-100 rounded p-0.5">
        <div className="flex gap-[1px]">
          {Array.from({ length: segments }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-4 flex-1 rounded-[2px] transition-all duration-200",
                index < filledSegments
                  ? percentage === 100
                    ? "bg-green-500"
                    : "bg-gray-700"
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
