"use client";

import { cn } from "@/lib/utils";
import { COLOR_FAMILIES } from "@/types/color";

interface ColorFamilyPillsProps {
  /** Currently selected family */
  selected: string;
  /** Handler for family selection */
  onChange: (family: string) => void;
}

/**
 * ColorFamilyPills - Horizontal scrollable filter pills for color families
 * 
 * Features:
 * - Horizontal scroll with hidden scrollbar
 * - Visual gradient backgrounds matching color family
 * - Active state with primary background
 * - "All Colors" option first
 */
export function ColorFamilyPills({ selected, onChange }: ColorFamilyPillsProps) {
  return (
    <div className="relative">
      {/* Left fade indicator */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
      
      <div className="overflow-x-auto scrollbar-hide px-6">
        <div className="flex gap-2 pb-2">
          {COLOR_FAMILIES.map((family) => {
            const isActive = selected === family.value;
            
            return (
              <button
                type="button"
                key={family.value}
                onClick={() => onChange(family.value)}
                className={cn(
                  "shrink-0 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md",
                  "hover:scale-105 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                    : `bg-gradient-to-r ${family.gradient} text-foreground hover:shadow-sm border border-border/50`
                )}
              >
                {family.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Right fade indicator */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
