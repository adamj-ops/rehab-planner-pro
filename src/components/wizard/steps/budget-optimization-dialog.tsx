"use client";

import { useState, useMemo } from "react";
import {
  IconCheck,
  IconPlus,
  IconMinus,
  IconTrendingUp,
  IconCurrencyDollar,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BudgetOptimizer,
  type OptimizableItem,
  type OptimizationResult,
} from "@/lib/priority-engine";

// =============================================================================
// TYPES
// =============================================================================

interface BudgetOptimizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OptimizableItem[];
  budget: number;
  currentSelection: OptimizableItem[];
  onApplyOptimization: (selectedIds: string[]) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BudgetOptimizationDialog({
  open,
  onOpenChange,
  items,
  budget,
  currentSelection,
  onApplyOptimization,
}: BudgetOptimizationDialogProps) {
  const [isApplying, setIsApplying] = useState(false);

  // Calculate current state
  const currentResult = useMemo<OptimizationResult>(() => {
    const selectedIds = new Set(currentSelection.map((i) => i.id));
    const selected = items.filter((i) => selectedIds.has(i.id));
    const unselected = items.filter((i) => !selectedIds.has(i.id));

    return {
      selectedItems: selected,
      totalCost: selected.reduce((sum, i) => sum + i.cost, 0),
      totalValue: selected.reduce((sum, i) => sum + i.value, 0),
      unselectedItems: unselected,
      summary: {
        itemCount: selected.length,
        budgetUsed: selected.reduce((sum, i) => sum + i.cost, 0),
        budgetRemaining: budget - selected.reduce((sum, i) => sum + i.cost, 0),
        averageROI:
          selected.length > 0
            ? selected.reduce((sum, i) => sum + i.value, 0) / selected.length
            : 0,
        mustHavesCovered: items
          .filter((i) => i.priority === "must")
          .every((must) => selected.some((s) => s.id === must.id)),
      },
    };
  }, [items, currentSelection, budget]);

  // Run optimization
  const optimizedResult = useMemo(() => {
    return BudgetOptimizer.optimize(items, {
      budget,
      prioritizeMustHaves: true,
      respectDependencies: true,
    });
  }, [items, budget]);

  // Compare results
  const comparison = useMemo(() => {
    return BudgetOptimizer.compareOptimizations(currentResult, optimizedResult);
  }, [currentResult, optimizedResult]);

  // Get budget suggestions
  const budgetSuggestions = useMemo(() => {
    return BudgetOptimizer.suggestBudgetAdjustments(items, budget);
  }, [items, budget]);

  const handleApply = () => {
    setIsApplying(true);
    const selectedIds = optimizedResult.selectedItems.map((i) => i.id);
    onApplyOptimization(selectedIds);
    setIsApplying(false);
    onOpenChange(false);
  };

  const hasImprovements =
    comparison.valueDifference > 0 || comparison.costDifference < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            Budget Optimization
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis to maximize your ROI within budget constraints
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Before/After Comparison */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Current Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Current Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Cost
                    </span>
                    <span className="font-mono font-medium">
                      ${currentResult.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Value Score
                    </span>
                    <span className="font-mono font-medium">
                      {currentResult.totalValue.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="font-mono">
                      {currentResult.summary.itemCount}
                    </span>
                  </div>
                  <Progress
                    value={(currentResult.totalCost / budget) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {((currentResult.totalCost / budget) * 100).toFixed(0)}% of
                    budget
                  </p>
                </CardContent>
              </Card>

              {/* Optimized Selection */}
              <Card className={cn(hasImprovements && "border-primary")}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    Optimized Selection
                    {hasImprovements && (
                      <Badge variant="default" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Cost
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        ${optimizedResult.totalCost.toLocaleString()}
                      </span>
                      {comparison.costDifference !== 0 && (
                        <Badge
                          variant={
                            comparison.costDifference < 0
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {comparison.costDifference > 0 ? "+" : ""}$
                          {comparison.costDifference.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Value Score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {optimizedResult.totalValue.toFixed(0)}
                      </span>
                      {comparison.valueDifference !== 0 && (
                        <Badge
                          variant={
                            comparison.valueDifference > 0
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {comparison.valueDifference > 0 ? "+" : ""}
                          {comparison.valueDifference.toFixed(0)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="font-mono">
                      {optimizedResult.summary.itemCount}
                    </span>
                  </div>
                  <Progress
                    value={(optimizedResult.totalCost / budget) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {((optimizedResult.totalCost / budget) * 100).toFixed(0)}%
                    of budget
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IconInfoCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Recommendation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {comparison.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Changes */}
            {(comparison.addedItems.length > 0 ||
              comparison.removedItems.length > 0) && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Proposed Changes</h4>

                {comparison.addedItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <IconPlus className="h-3 w-3 text-green-500" />
                      Items to add
                    </p>
                    <div className="space-y-1">
                      {comparison.addedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-1.5 px-3 bg-green-500/10 rounded border border-green-500/20"
                        >
                          <span className="text-sm">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              ${item.cost.toLocaleString()}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                              +{item.value.toFixed(0)} value
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {comparison.removedItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <IconMinus className="h-3 w-3 text-red-500" />
                      Items to remove
                    </p>
                    <div className="space-y-1">
                      {comparison.removedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-1.5 px-3 bg-red-500/10 rounded border border-red-500/20"
                        >
                          <span className="text-sm">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              ${item.cost.toLocaleString()}
                            </Badge>
                            <Badge className="bg-red-500/20 text-red-700 dark:text-red-300">
                              -{item.value.toFixed(0)} value
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Budget Suggestions */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <IconCurrencyDollar className="h-4 w-4" />
                Budget Suggestions
              </h4>

              <div className="grid gap-3 md:grid-cols-3">
                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Minimal</p>
                    <p className="text-lg font-bold">
                      ${budgetSuggestions.minimal.budget.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budgetSuggestions.minimal.description}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Optimal
                      <IconTrendingUp className="h-3 w-3 text-primary" />
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${budgetSuggestions.optimal.budget.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budgetSuggestions.optimal.description}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Max Value</p>
                    <p className="text-lg font-bold">
                      ${budgetSuggestions.maxValue.budget.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budgetSuggestions.maxValue.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={
              isApplying ||
              (comparison.addedItems.length === 0 &&
                comparison.removedItems.length === 0)
            }
          >
            {isApplying ? (
              "Applying..."
            ) : (
              <>
                <IconCheck className="h-4 w-4 mr-1" />
                Apply Optimization
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
