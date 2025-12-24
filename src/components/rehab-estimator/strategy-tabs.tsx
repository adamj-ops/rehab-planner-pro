import { cn } from '@/lib/utils'
import { TrendingUp, Home, Package } from 'lucide-react'
import { useState } from 'react'

interface StrategyTab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  metrics: {
    avgTime: string
    avgROI: string
    focus: string
  }
}

const strategies: StrategyTab[] = [
  {
    id: 'flip',
    label: 'Flip',
    icon: TrendingUp,
    description: 'Quick renovation for resale',
    metrics: {
      avgTime: '3-6 months',
      avgROI: '20-30%',
      focus: 'Cosmetic updates'
    }
  },
  {
    id: 'rental',
    label: 'Rental',
    icon: Home,
    description: 'Long-term investment property',
    metrics: {
      avgTime: 'Hold long-term',
      avgROI: '8-12% annual',
      focus: 'Durability'
    }
  },
  {
    id: 'wholesale',
    label: 'Wholesale',
    icon: Package,
    description: 'Minimal updates for quick sale',
    metrics: {
      avgTime: '1-2 months',
      avgROI: '5-10%',
      focus: 'Essential repairs'
    }
  }
]

interface StrategyTabsProps {
  selected: string
  onSelect: (strategy: string) => void
  className?: string
}

export function StrategyTabs({ selected, onSelect, className }: StrategyTabsProps) {
  const selectedStrategy = strategies.find(s => s.id === selected) || strategies[0]

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation - Clean black and white */}
      <div className="border rounded-lg p-1 bg-gray-50">
        <div className="grid grid-cols-3 gap-1">
          {strategies.map((strategy) => {
            const Icon = strategy.icon
            const isSelected = selected === strategy.id

            return (
              <button
                key={strategy.id}
                onClick={() => onSelect(strategy.id)}
                className={cn(
                  "relative p-4 rounded-md transition-all duration-200",
                  "flex flex-col items-center gap-2",
                  isSelected 
                    ? "bg-white shadow-sm border border-gray-200" 
                    : "hover:bg-white/50"
                )}
              >
                {/* Simple black icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  isSelected 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-gray-900" : "text-gray-600"
                )}>
                  {strategy.label}
                </span>

                {/* Description */}
                <span className="text-xs text-gray-500 text-center">
                  {strategy.description}
                </span>

                {/* Simple checkmark for selected */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Strategy Details - Clean metrics display */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Timeline</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {selectedStrategy.metrics.avgTime}
          </span>
        </div>
        
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Target ROI</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {selectedStrategy.metrics.avgROI}
          </span>
        </div>
        
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Focus Area</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {selectedStrategy.metrics.focus}
          </span>
        </div>
      </div>

      {/* Strategy tip - subtle gray box */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Strategy Impact: </span>
          {selected === 'flip' && "Scope will prioritize cosmetic improvements with highest buyer appeal"}
          {selected === 'rental' && "Scope will focus on durable, maintenance-friendly materials"}
          {selected === 'wholesale' && "Scope will include only essential repairs for marketability"}
        </p>
      </div>
    </div>
  )
}
