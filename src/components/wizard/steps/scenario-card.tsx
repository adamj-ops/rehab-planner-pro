/**
 * @file scenario-card.tsx
 * @description Individual scenario card component with metrics display and actions
 */

"use client";

import React from "react";
import { 
  IconCheck,
  IconEdit,
  IconTrash,
  IconCopy,
  IconCurrencyDollar,
  IconTrendingUp,
  IconClock,
  IconListNumbers,
  IconSparkles as IconSpark,
  IconAlertTriangle
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  BudgetScenario, 
  ScenarioCardProps,
  STRATEGY_LABELS,
  EnrichedScenario
} from "@/types/scenario";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Enrich scenario with computed display properties
 */
function enrichScenario(scenario: BudgetScenario): EnrichedScenario {
  const budgetUsedPercentage = scenario.budgetAmount > 0 
    ? (scenario.totalCost / scenario.budgetAmount) * 100 
    : 0;
  
  const budgetRemaining = scenario.budgetAmount - scenario.totalCost;
  const averageItemValue = scenario.itemCount > 0 
    ? scenario.totalValue / scenario.itemCount 
    : 0;
  const efficiency = scenario.totalCost > 0 
    ? scenario.totalValue / scenario.totalCost 
    : 0;

  return {
    ...scenario,
    budgetUsedPercentage,
    budgetRemaining,
    averageItemValue,
    efficiency,
    strategyLabel: STRATEGY_LABELS[scenario.priorityStrategy] || scenario.priorityStrategy,
    strategyDescription: `${scenario.itemCount} items selected`
  };
}

/**
 * Get budget status color based on usage
 */
function getBudgetStatusColor(percentage: number): string {
  if (percentage > 100) return "text-red-500";
  if (percentage > 90) return "text-orange-500";
  if (percentage > 75) return "text-yellow-500";
  return "text-green-500";
}

/**
 * Format currency values
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format days with proper pluralization
 */
function formatDays(days?: number): string {
  if (!days || days === 0) return "TBD";
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ScenarioCard({
  scenario,
  isActive = false,
  isCompact = false,
  onEdit,
  onDelete,
  onApply,
  onDuplicate
}: ScenarioCardProps) {
  const enriched = enrichScenario(scenario);
  const budgetStatusColor = getBudgetStatusColor(enriched.budgetUsedPercentage);
  
  // Determine if scenario exceeds budget
  const isBudgetExceeded = enriched.budgetUsedPercentage > 100;
  const hasWarnings = isBudgetExceeded;

  return (
    <TooltipProvider>
      <Card className={cn(
        "relative transition-all duration-200 hover:shadow-md",
        isActive && "ring-2 ring-primary border-primary bg-primary/5",
        isCompact ? "min-w-[280px]" : "min-w-[320px]",
        isBudgetExceeded && "border-red-200 dark:border-red-800"
      )}>
        {/* Header */}
        <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "flex items-center gap-2 truncate",
                isCompact ? "text-base" : "text-lg"
              )}>
                {scenario.name}
                {isActive && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
                {scenario.isBaseline && (
                  <Badge variant="outline" className="text-xs">
                    Baseline
                  </Badge>
                )}
                {hasWarnings && (
                  <Tooltip>
                    <TooltipTrigger>
                      <IconAlertTriangle className="h-4 w-4 text-orange-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Budget exceeded</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardTitle>
              
              <CardDescription className="text-xs mt-1">
                {enriched.strategyLabel}
              </CardDescription>
              
              {scenario.description && !isCompact && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {scenario.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isActive && (
                  <>
                    <DropdownMenuItem onClick={() => onApply?.(scenario.id)}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Apply Scenario
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onEdit?.(scenario)}>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(scenario.id)}>
                  <IconCopy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {!scenario.isBaseline && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(scenario.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Metrics */}
        <CardContent className="space-y-4">
          {/* Budget Overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Usage</span>
              <span className={cn("font-mono font-medium", budgetStatusColor)}>
                {enriched.budgetUsedPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={Math.min(enriched.budgetUsedPercentage, 100)} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(scenario.totalCost)} used</span>
              <span>{formatCurrency(enriched.budgetRemaining)} remaining</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className={cn(
            "grid gap-3",
            isCompact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
          )}>
            {/* Total Cost */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconCurrencyDollar className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Cost</span>
              </div>
              <p className="text-sm font-mono font-medium">
                {formatCurrency(scenario.totalCost)}
              </p>
            </div>

            {/* Value Score */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconTrendingUp className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Value</span>
              </div>
              <p className="text-sm font-mono font-medium">
                {scenario.totalValue.toFixed(0)}
              </p>
            </div>

            {/* Item Count */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconListNumbers className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-muted-foreground">Items</span>
              </div>
              <p className="text-sm font-mono font-medium">
                {scenario.itemCount}
              </p>
            </div>

            {/* Timeline */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconClock className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-muted-foreground">Timeline</span>
              </div>
              <p className="text-sm font-mono font-medium">
                {formatDays(scenario.timelineDays)}
              </p>
            </div>
          </div>

          {/* Efficiency Metric */}
          {!isCompact && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <IconSpark className="h-3 w-3" />
                  Efficiency
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="font-mono">
                      {enriched.efficiency.toFixed(2)}x
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Value score per dollar spent</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Apply Button for non-active scenarios */}
          {!isActive && (
            <div className="pt-3 border-t">
              <Button 
                onClick={() => onApply?.(scenario.id)}
                className="w-full"
                size="sm"
              >
                <IconCheck className="mr-2 h-4 w-4" />
                Apply This Scenario
              </Button>
            </div>
          )}
        </CardContent>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] border-l-transparent border-b-primary">
            <IconCheck className="absolute -bottom-4 -right-4 h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}

export default ScenarioCard;