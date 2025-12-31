'use client'

import type { ArvMethod } from '@/hooks/use-deals-store'
import { cn } from '@/lib/utils'

interface MethodTabsProps {
  value: ArvMethod
  onChange: (value: ArvMethod) => void
  className?: string
}

const METHOD_TABS = [
  { value: 'comp_based' as const, label: 'Comp-Based', icon: '📊' },
  { value: 'sqft_based' as const, label: '$/SF-Based', icon: '📐' },
  { value: 'hybrid' as const, label: 'Hybrid', icon: '⚖️' }
]

export function MethodTabs({ value, onChange, className }: MethodTabsProps) {
  return (
    <div className={cn("flex rounded-lg bg-muted p-1", className)}>
      {METHOD_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
            "hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            value === tab.value 
              ? "bg-background shadow-sm text-foreground ring-1 ring-border" 
              : "text-muted-foreground hover:text-foreground"
          )}
          type="button"
        >
          <span className="text-base">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.value === 'comp_based' ? 'Comp' : tab.value === 'sqft_based' ? '$/SF' : 'Hybrid'}</span>
        </button>
      ))}
    </div>
  )
}