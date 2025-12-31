/**
 * @file scenario-comparison-dialog.tsx
 * @description Dialog for detailed comparison between scenarios
 */

"use client";

import React from "react";
import { 
  IconGitCompare as IconCompare,
  IconTrendingUp,
  IconCurrencyDollar,
  IconClock,
  IconListNumbers,
  IconCheck
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ScenarioComparison,
  ScenarioItemComparison
} from "@/types/scenario";

interface ScenarioComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: ScenarioComparison;
  itemDetails: ScenarioItemComparison[];
  onApplyScenario: (scenarioId: string) => void;
}

export default function ScenarioComparisonDialog({
  open,
  onOpenChange,
  comparison,
  itemDetails,
  onApplyScenario
}: ScenarioComparisonDialogProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  
  const bestValueScenario = comparison.scenarios.find(s => s.id === comparison.recommendations.bestValue);
  const bestCostScenario = comparison.scenarios.find(s => s.id === comparison.recommendations.bestCost);
  const bestBalanceScenario = comparison.scenarios.find(s => s.id === comparison.recommendations.bestBalance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCompare className="h-5 w-5" />
            Scenario Comparison
          </DialogTitle>
          <DialogDescription>
            Detailed comparison of {comparison.scenarios.length} scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Summary Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Timeline</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.scenarios.map((scenario) => {
                    const efficiency = scenario.totalCost > 0 ? scenario.totalValue / scenario.totalCost : 0;
                    return (
                      <TableRow key={scenario.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {scenario.priorityStrategy.replace('_', ' ')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(scenario.totalCost)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {scenario.totalValue.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {scenario.itemCount}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {scenario.timelineDays ? `${scenario.timelineDays}d` : 'TBD'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {efficiency.toFixed(2)}x
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApplyScenario(scenario.id)}
                          >
                            <IconCheck className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <IconTrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium text-sm">Best Value</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {bestValueScenario?.name}
                  </div>
                  <Badge variant="outline">
                    {bestValueScenario?.totalValue.toFixed(0)} points
                  </Badge>
                </div>

                <div className="text-center p-3 border rounded-lg">
                  <IconCurrencyDollar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium text-sm">Lowest Cost</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {bestCostScenario?.name}
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(bestCostScenario?.totalCost || 0)}
                  </Badge>
                </div>

                <div className="text-center p-3 border rounded-lg">
                  <IconListNumbers className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium text-sm">Best Balance</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {bestBalanceScenario?.name}
                  </div>
                  <Badge variant="outline">
                    {((bestBalanceScenario?.totalCost || 0) > 0 ? 
                      (bestBalanceScenario?.totalValue || 0) / (bestBalanceScenario?.totalCost || 1) : 0
                    ).toFixed(2)}x efficiency
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item-Level Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item-Level Analysis</CardTitle>
              <CardDescription>
                Items with high impact on scenario differences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Inclusion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemDetails.slice(0, 20).map((item) => (
                      <TableRow key={item.itemId}>
                        <TableCell className="font-medium">
                          {item.itemName}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.cost)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.value.toFixed(0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            item.impact === 'high' ? 'default' :
                            item.impact === 'medium' ? 'secondary' : 'outline'
                          }>
                            {item.impact}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="text-green-600">
                              In: {item.includedIn.length} scenarios
                            </div>
                            {item.excludedFrom.length > 0 && (
                              <div className="text-red-600">
                                Out: {item.excludedFrom.length} scenarios
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close Comparison
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}