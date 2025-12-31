"use client";

import { useMemo } from "react";
import {
  IconTrendingUp,
  IconAlertTriangle,
  IconClock,
  IconLink,
  IconSun,
  IconSettings,
} from "@tabler/icons-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PriorityScore } from "@/lib/priority-engine/types";

// =============================================================================
// TYPES
// =============================================================================

interface PriorityScoreCardProps {
  itemName: string;
  score: PriorityScore;
  compact?: boolean;
}

// =============================================================================
// SCORE DIMENSION CONFIG
// =============================================================================

const DIMENSION_CONFIG = {
  urgency: {
    label: "Urgency",
    icon: IconClock,
    color: "text-red-500",
    bgColor: "bg-red-500",
    description: "How critical is this item to do now?",
  },
  roiImpact: {
    label: "ROI Impact",
    icon: IconTrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500",
    description: "Return on investment potential",
  },
  riskMitigation: {
    label: "Risk",
    icon: IconAlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    description: "Risk reduction from completing this item",
  },
  dependencies: {
    label: "Dependencies",
    icon: IconLink,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    description: "Does this block other work?",
  },
  marketTiming: {
    label: "Timing",
    icon: IconSun,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    description: "Seasonal and market conditions",
  },
  complexity: {
    label: "Simplicity",
    icon: IconSettings,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500",
    description: "Ease of execution (higher = simpler)",
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-blue-600 dark:text-blue-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-green-500 to-emerald-500";
  if (score >= 60) return "from-blue-500 to-cyan-500";
  if (score >= 40) return "from-amber-500 to-yellow-500";
  return "from-red-500 to-orange-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "High Priority";
  if (score >= 60) return "Medium-High";
  if (score >= 40) return "Medium";
  return "Low Priority";
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PriorityScoreCard({ itemName, score, compact = false }: PriorityScoreCardProps) {
  const dimensions = useMemo(() => {
    return Object.entries(DIMENSION_CONFIG).map(([key, config]) => ({
      key,
      ...config,
      value: score.components[key as keyof typeof score.components] || 0,
    }));
  }, [score.components]);

  if (compact) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br",
                getScoreGradient(score.overall)
              )}
            >
              {score.overall}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="left">
          <PriorityScoreCardExpanded itemName={itemName} score={score} dimensions={dimensions} />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Overall Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br",
              getScoreGradient(score.overall)
            )}
          >
            {score.overall}
          </div>
          <div>
            <p className="font-medium">{itemName}</p>
            <p className={cn("text-sm", getScoreColor(score.overall))}>
              {getScoreLabel(score.overall)}
            </p>
          </div>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {dimensions.map((dim) => (
          <div key={dim.key} className="flex items-center gap-2">
            <dim.icon className={cn("h-3.5 w-3.5", dim.color)} />
            <span className="text-xs text-muted-foreground flex-1">{dim.label}</span>
            <span className="text-xs font-medium">{dim.value}</span>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      {score.reasoning.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2">Key Factors:</p>
          <div className="flex flex-wrap gap-1.5">
            {score.reasoning.slice(0, 3).map((reason) => (
              <Badge key={reason} variant="secondary" className="text-xs font-normal">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXPANDED VIEW (FOR HOVER CARD)
// =============================================================================

interface ExpandedProps {
  itemName: string;
  score: PriorityScore;
  dimensions: Array<{
    key: string;
    label: string;
    color: string;
    bgColor: string;
    value: number;
  }>;
}

function PriorityScoreCardExpanded({ itemName, score, dimensions }: ExpandedProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{itemName}</p>
          <p className={cn("text-xs", getScoreColor(score.overall))}>
            {getScoreLabel(score.overall)}
          </p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br",
            getScoreGradient(score.overall)
          )}
        >
          {score.overall}
        </div>
      </div>

      {/* Visual Bars */}
      <div className="space-y-1.5">
        {dimensions.map((dim) => (
          <div key={dim.key} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">{dim.label}</span>
            <Progress
              value={dim.value}
              className="h-1.5 flex-1"
            />
            <span className="text-xs font-mono w-6 text-right">{dim.value}</span>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      {score.reasoning.length > 0 && (
        <div className="border-t pt-2">
          <ul className="text-xs text-muted-foreground space-y-1">
            {score.reasoning.map((reason) => (
              <li key={reason} className="flex items-start gap-1">
                <span className="text-primary">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MINI SCORE BADGE (For table cells)
// =============================================================================

interface PriorityScoreBadgeProps {
  score: number;
  showLabel?: boolean;
}

export function PriorityScoreBadge({ score, showLabel = false }: PriorityScoreBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br",
          getScoreGradient(score)
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn("text-xs", getScoreColor(score))}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// SCORE COMPARISON (For optimization dialogs)
// =============================================================================

interface ScoreComparisonProps {
  before: number;
  after: number;
  label?: string;
}

export function ScoreComparison({ before, after, label }: ScoreComparisonProps) {
  const diff = after - before;
  const isPositive = diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-1">
        <span className="text-sm font-mono">{before}</span>
        <span className="text-muted-foreground">→</span>
        <span className="text-sm font-mono">{after}</span>
        {!isNeutral && (
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className="text-xs px-1.5"
          >
            {isPositive ? "+" : ""}{diff}
          </Badge>
        )}
      </div>
    </div>
  );
}
