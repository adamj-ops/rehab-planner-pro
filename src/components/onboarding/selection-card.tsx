"use client";

import { cn } from "@/lib/utils";
import { IconCheck } from "@tabler/icons-react";

interface SelectionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

export function SelectionCard({
  title,
  description,
  icon,
  selected,
  onSelect,
  disabled = false,
  className,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full p-5 rounded-xl border-2 text-left transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50"
          : "border-border hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Selected Checkmark */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
          <IconCheck className="h-4 w-4 text-white dark:text-slate-900" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
              selected
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "bg-muted text-muted-foreground"
            )}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-semibold text-base transition-colors",
              selected ? "text-slate-900 dark:text-white" : "text-foreground"
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface SelectionCardGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectionCardGroup({
  children,
  className,
}: SelectionCardGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
}
