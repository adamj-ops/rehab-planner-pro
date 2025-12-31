"use client";

import { useEffect, useState, useMemo } from "react";
import { IconCheck, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOnboarding } from "./onboarding-context";

interface OnboardingSaveIndicatorProps {
  className?: string;
}

// Format relative time (e.g., "just now", "2 minutes ago")
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 10) return "just now";
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OnboardingSaveIndicator({
  className,
}: OnboardingSaveIndicatorProps) {
  const { isSaving, lastSavedAt, saveError } = useOnboarding();
  const [showSaved, setShowSaved] = useState(false);
  const [, setTick] = useState(0);

  // Show "Saved" briefly after save completes
  useEffect(() => {
    if (lastSavedAt && !isSaving) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSavedAt, isSaving]);

  // Update relative time every 30 seconds
  useEffect(() => {
    if (!lastSavedAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const tooltipText = useMemo(() => {
    if (saveError) return `Error: ${saveError}`;
    if (lastSavedAt) return `Last saved ${formatRelativeTime(lastSavedAt)}`;
    return "";
  }, [lastSavedAt, saveError]);

  // Don't show anything if no activity
  if (!isSaving && !showSaved && !saveError) {
    return null;
  }

  const indicator = (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-opacity duration-300",
        className
      )}
    >
      {isSaving && (
        <>
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {!isSaving && showSaved && !saveError && (
        <>
          <IconCheck className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}

      {saveError && !isSaving && (
        <>
          <IconAlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive text-xs">Save failed</span>
        </>
      )}
    </div>
  );

  // Wrap in tooltip if we have tooltip text
  if (tooltipText && !isSaving) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{indicator}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return indicator;
}
