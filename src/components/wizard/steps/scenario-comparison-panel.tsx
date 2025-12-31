/**
 * @file scenario-comparison-panel.tsx
 * @description Panel for comparing multiple budget scenarios side-by-side
 */

"use client";

import React, { useState } from "react";
import { 
  IconPlus,
  IconGitCompare as IconCompare,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles as IconSpark,
  IconRefresh,
  IconAlertCircle
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
  BudgetScenario, 
  ScenarioComparisonProps
} from "@/types/scenario";
import ScenarioCard from "./scenario-card";

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyScenarioState({ onCreateScenario }: { onCreateScenario: () => void }) {
  return (
    <Card className="border-dashed border-2 min-w-[320px] h-[300px] flex items-center justify-center">
      <CardContent className="text-center p-6">
        <IconSpark className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <CardTitle className="text-lg mb-2">No Scenarios Yet</CardTitle>
        <CardDescription className="mb-4">
          Create your first what-if scenario to explore different budget optimizations
        </CardDescription>
        <Button onClick={onCreateScenario} variant="outline">
          <IconPlus className="mr-2 h-4 w-4" />
          Create First Scenario
        </Button>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// COMPARISON INSIGHTS COMPONENT
// =============================================================================

function ComparisonInsights({ 
  scenarios, 
  onCompareScenarios 
}: { 
  scenarios: BudgetScenario[]; 
  onCompareScenarios: (scenarioIds: string[]) => void;
}) {
  if (scenarios.length < 2) return null;

  // Calculate comparison metrics
  const costs = scenarios.map(s => s.totalCost);
  const values = scenarios.map(s => s.totalValue);
  const costRange = Math.max(...costs) - Math.min(...costs);
  const valueRange = Math.max(...values) - Math.min(...values);
  
  // Find best performers
  const bestValue = scenarios.reduce((a, b) => a.totalValue > b.totalValue ? a : b);
  const bestEfficiency = scenarios.reduce((a, b) => {
    const aRatio = a.totalCost > 0 ? a.totalValue / a.totalCost : 0;
    const bRatio = b.totalCost > 0 ? b.totalValue / b.totalCost : 0;
    return aRatio > bRatio ? a : b;
  });

  return (
    <Alert className="mb-4">
      <IconCompare className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Comparison Insights</p>
            <p className="text-xs text-muted-foreground">
              Cost range: ${costRange.toLocaleString()} • 
              Best value: {bestValue.name} • 
              Most efficient: {bestEfficiency.name}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCompareScenarios(scenarios.map(s => s.id))}
          >
            <IconCompare className="mr-1 h-3 w-3" />
            Compare All
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScenarioComparisonPanel({
  scenarios = [],
  onCreateScenario,
  onEditScenario,
  onDeleteScenario,
  onApplyScenario,
  onCompareScenarios,
  maxScenarios = 4
}: ScenarioComparisonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sort scenarios: active first, then baseline, then by creation date
  const sortedScenarios = [...scenarios].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    if (a.isBaseline && !b.isBaseline) return -1;
    if (!a.isBaseline && b.isBaseline) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handle scenario duplication
  const handleDuplicate = async (scenarioId: string) => {
    const originalScenario = scenarios.find(s => s.id === scenarioId);
    if (!originalScenario) return;

    // This would typically create a new scenario
    // For now, we'll just trigger the create dialog with pre-filled data
    onEditScenario({
      ...originalScenario,
      id: '', // Clear ID to indicate it's a new scenario
      name: `${originalScenario.name} (Copy)`,
      isActive: false,
      isBaseline: false
    });
  };

  // Handle refresh (placeholder)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const hasScenarios = sortedScenarios.length > 0;
  const canAddMore = scenarios.length < maxScenarios;
  const activeScenario = scenarios.find(s => s.isActive);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconCompare className="h-5 w-5" />
                What-If Scenarios
                {hasScenarios && (
                  <Badge variant="secondary" className="text-xs">
                    {scenarios.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Compare different budget optimization strategies side-by-side
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {hasScenarios && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <IconRefresh className={cn(
                        "h-4 w-4",
                        isRefreshing && "animate-spin"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh scenarios</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Button 
                onClick={onCreateScenario}
                size="sm"
                disabled={!canAddMore}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                New Scenario
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!hasScenarios ? (
            <EmptyScenarioState onCreateScenario={onCreateScenario} />
          ) : (
            <div className="space-y-4">
              {/* Comparison Insights */}
              <ComparisonInsights 
                scenarios={sortedScenarios}
                onCompareScenarios={onCompareScenarios}
              />

              {/* Scenarios Grid */}
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {sortedScenarios.map((scenario) => (
                    <div key={scenario.id} className="flex-shrink-0">
                      <ScenarioCard
                        scenario={scenario}
                        isActive={scenario.isActive}
                        isCompact={scenarios.length > 2}
                        onEdit={onEditScenario}
                        onDelete={onDeleteScenario}
                        onApply={onApplyScenario}
                        onDuplicate={handleDuplicate}
                      />
                    </div>
                  ))}

                  {/* Add New Scenario Card */}
                  {canAddMore && (
                    <div className="flex-shrink-0">
                      <Card 
                        className={cn(
                          "border-dashed border-2 cursor-pointer transition-colors hover:border-primary/50",
                          scenarios.length > 2 ? "min-w-[280px]" : "min-w-[320px]",
                          "h-full flex items-center justify-center"
                        )}
                        onClick={onCreateScenario}
                      >
                        <CardContent className="text-center p-6">
                          <div className="rounded-full bg-primary/10 p-3 mx-auto mb-3 w-fit">
                            <IconPlus className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium mb-1">Add Scenario</p>
                          <p className="text-xs text-muted-foreground">
                            Create a new what-if scenario
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Max Scenarios Warning */}
              {!canAddMore && (
                <Alert>
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Maximum of {maxScenarios} scenarios can be compared at once. 
                    Delete a scenario to create a new one.
                  </AlertDescription>
                </Alert>
              )}

              {/* Active Scenario Info */}
              {activeScenario && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm font-medium">
                      Currently Applied: {activeScenario.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activeScenario.itemCount} items • {activeScenario.totalCost.toLocaleString()} cost
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default ScenarioComparisonPanel;