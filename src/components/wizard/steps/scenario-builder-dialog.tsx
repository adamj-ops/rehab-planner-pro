/**
 * @file scenario-builder-dialog.tsx
 * @description Dialog for creating and editing budget optimization scenarios
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  IconSparkles as IconSpark,
  IconCurrencyDollar,
  IconTrendingUp,
  IconClock,
  IconListNumbers,
  IconTarget,
  IconRefresh,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle as IconInfo
} from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  CreateScenarioParams,
  ScenarioBuilderProps,
  ScenarioStrategy,
  SCENARIO_STRATEGIES,
  STRATEGY_LABELS,
  STRATEGY_DESCRIPTIONS,
  ScenarioResult
} from "@/types/scenario";
import { OptimizableItem } from "@/lib/priority-engine/budget-optimizer";
import { ScenarioEngine } from "@/lib/priority-engine/scenario-engine";

// =============================================================================
// FORM SCHEMA
// =============================================================================

const scenarioBuilderSchema = z.object({
  name: z.string().min(1, "Scenario name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  budgetAmount: z.number().min(1000, "Minimum budget is $1,000").max(10000000, "Maximum budget is $10M"),
  priorityStrategy: z.enum([
    SCENARIO_STRATEGIES.MAXIMIZE_ROI,
    SCENARIO_STRATEGIES.FASTEST_TIMELINE, 
    SCENARIO_STRATEGIES.ALL_MUST_HAVES,
    SCENARIO_STRATEGIES.BALANCED,
    SCENARIO_STRATEGIES.CUSTOM
  ]),
  customItemIds: z.array(z.string()).optional(),
});

type ScenarioBuilderFormData = z.infer<typeof scenarioBuilderSchema>;

// =============================================================================
// LIVE PREVIEW COMPONENT
// =============================================================================

function LivePreview({ 
  items, 
  budget, 
  strategy, 
  customItemIds,
  isGenerating 
}: {
  items: OptimizableItem[];
  budget: number;
  strategy: ScenarioStrategy;
  customItemIds?: string[];
  isGenerating: boolean;
}) {
  const [preview, setPreview] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate preview when parameters change
  useEffect(() => {
    if (budget < 1000 || items.length === 0) {
      setPreview(null);
      return;
    }

    const generatePreview = async () => {
      try {
        setError(null);
        const result = ScenarioEngine.generateScenario({
          budgetAmount: budget,
          strategy,
          items,
          customItemIds,
          respectDependencies: true
        });
        setPreview(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate preview');
        setPreview(null);
      }
    };

    const debounceTimeout = setTimeout(generatePreview, 300);
    return () => clearTimeout(debounceTimeout);
  }, [budget, strategy, customItemIds, items]);

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <IconRefresh className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Generating preview...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!preview) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <IconTarget className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Adjust parameters to see preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const budgetUsed = (preview.totalCost / preview.budgetAmount) * 100;
  const isBudgetExceeded = budgetUsed > 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconSpark className="h-4 w-4" />
          Preview Results
          {preview.metadata.warnings.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {preview.metadata.warnings.length} warning(s)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Usage</span>
            <span className={cn(
              "font-mono",
              isBudgetExceeded ? "text-red-500" : "text-green-500"
            )}>
              {budgetUsed.toFixed(0)}%
            </span>
          </div>
          <Progress value={Math.min(budgetUsed, 100)} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconCurrencyDollar className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Cost</span>
            </div>
            <p className="text-sm font-mono font-medium">
              ${preview.totalCost.toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconTrendingUp className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Value Score</span>
            </div>
            <p className="text-sm font-mono font-medium">
              {preview.totalValue.toFixed(0)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconListNumbers className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Items</span>
            </div>
            <p className="text-sm font-mono font-medium">
              {preview.selectedItems.length}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconClock className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Timeline</span>
            </div>
            <p className="text-sm font-mono font-medium">
              {preview.timelineDays} days
            </p>
          </div>
        </div>

        {/* Warnings */}
        {preview.metadata.warnings.length > 0 && (
          <Alert>
            <IconInfo className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {preview.metadata.warnings.map((warning, index) => (
                  <p key={index} className="text-xs">{warning}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Strategy Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">{STRATEGY_LABELS[strategy]}:</span>{' '}
            {preview.selectedItems.length} items selected from {items.length} available
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// CUSTOM ITEM SELECTOR
// =============================================================================

function CustomItemSelector({
  items,
  selectedIds = [],
  onSelectionChange,
  disabled = false
}: {
  items: OptimizableItem[];
  selectedIds?: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const toggleItem = (itemId: string) => {
    if (disabled) return;
    
    const isSelected = selectedIds.includes(itemId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  const toggleAll = () => {
    if (disabled) return;
    
    if (selectedIds.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  if (disabled) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Custom Item Selection</CardTitle>
          <Button variant="outline" size="sm" onClick={toggleAll}>
            {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <CardDescription>
          Choose specific items to include in this scenario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded border cursor-pointer transition-colors",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.cost.toLocaleString()} • {item.category}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.priority === 'must' ? 'default' : 'outline'}>
                    {item.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScenarioBuilderDialog({
  open,
  onOpenChange,
  onSave,
  items,
  currentBudget,
  existingScenario,
  investmentStrategy
}: ScenarioBuilderProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEditing = !!existingScenario;
  
  // Calculate budget range
  const minBudget = Math.min(1000, currentBudget * 0.5);
  const maxBudget = currentBudget * 2;
  
  const form = useForm<ScenarioBuilderFormData>({
    resolver: zodResolver(scenarioBuilderSchema),
    defaultValues: {
      name: existingScenario?.name || '',
      description: existingScenario?.description || '',
      budgetAmount: existingScenario?.budgetAmount || currentBudget,
      priorityStrategy: existingScenario?.priorityStrategy || SCENARIO_STRATEGIES.BALANCED,
      customItemIds: existingScenario?.selectedItemIds || []
    }
  });

  const watchedValues = form.watch();
  const isCustomStrategy = watchedValues.priorityStrategy === SCENARIO_STRATEGIES.CUSTOM;

  // Reset form when existingScenario changes
  useEffect(() => {
    if (existingScenario) {
      form.reset({
        name: existingScenario.name,
        description: existingScenario.description || '',
        budgetAmount: existingScenario.budgetAmount,
        priorityStrategy: existingScenario.priorityStrategy,
        customItemIds: existingScenario.selectedItemIds
      });
    } else {
      form.reset({
        name: '',
        description: '',
        budgetAmount: currentBudget,
        priorityStrategy: SCENARIO_STRATEGIES.BALANCED,
        customItemIds: []
      });
    }
  }, [existingScenario, currentBudget, form]);

  // Generate suggested name based on strategy
  useEffect(() => {
    if (!isEditing && watchedValues.priorityStrategy && !watchedValues.name) {
      const strategyName = STRATEGY_LABELS[watchedValues.priorityStrategy];
      const budgetSuffix = watchedValues.budgetAmount !== currentBudget 
        ? ` ($${(watchedValues.budgetAmount / 1000).toFixed(0)}K)`
        : '';
      form.setValue('name', `${strategyName}${budgetSuffix}`);
    }
  }, [watchedValues.priorityStrategy, watchedValues.budgetAmount, currentBudget, isEditing, form]);

  const onSubmit = async (data: ScenarioBuilderFormData) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const params: CreateScenarioParams = {
        name: data.name,
        description: data.description,
        budgetAmount: data.budgetAmount,
        priorityStrategy: data.priorityStrategy,
        customItemIds: data.customItemIds
      };
      
      await onSave(params);
      onOpenChange(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save scenario');
      console.error('Failed to save scenario:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Scenario' : 'Create New Scenario'}
          </DialogTitle>
          <DialogDescription>
            Configure parameters to generate an optimized budget scenario
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              {/* Left Column - Configuration */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scenario Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Maximum ROI Strategy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Optional description of this scenario..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Budget Configuration */}
                <FormField
                  control={form.control}
                  name="budgetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Budget Amount: ${field.value?.toLocaleString() || 0}
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            value={[field.value || currentBudget]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={maxBudget}
                            min={minBudget}
                            step={1000}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>${minBudget.toLocaleString()}</span>
                            <span>Current: ${currentBudget.toLocaleString()}</span>
                            <span>${maxBudget.toLocaleString()}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Adjust the budget to see how it affects item selection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Strategy Selection */}
                <FormField
                  control={form.control}
                  name="priorityStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optimization Strategy *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select optimization strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                <div className="space-y-1">
                                  <div className="font-medium">{label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {STRATEGY_DESCRIPTIONS[key as ScenarioStrategy]}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Item Selection */}
                {isCustomStrategy && (
                  <FormField
                    control={form.control}
                    name="customItemIds"
                    render={({ field }) => (
                      <FormItem>
                        <CustomItemSelector
                          items={items}
                          selectedIds={field.value || []}
                          onSelectionChange={field.onChange}
                          disabled={!isCustomStrategy}
                        />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Right Column - Live Preview */}
              <div>
                <LivePreview
                  items={items}
                  budget={watchedValues.budgetAmount}
                  strategy={watchedValues.priorityStrategy}
                  customItemIds={watchedValues.customItemIds}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col gap-2 w-full">
                {saveError && (
                  <Alert variant="destructive">
                    <IconAlertTriangle className="h-4 w-4" />
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <IconRefresh className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 h-4 w-4" />
                        {isEditing ? 'Update Scenario' : 'Create Scenario'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ScenarioBuilderDialog;