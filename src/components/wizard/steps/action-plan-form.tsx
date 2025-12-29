"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  IconCalendarEvent, 
  IconClock,
  IconCurrencyDollar,
  IconUsers,
  IconArrowRight,
  IconPlayerPlay,
  IconFlag,
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import {
  actionPlanSchema,
  ActionPlanFormData,
  PriorityMatrixFormData,
  StrategyFormData,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";

// Phase colors for timeline
const PHASE_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

interface TimelinePhase {
  id: string;
  name: string;
  items: Array<{
    name: string;
    cost: number;
    days: number;
    priority: string;
  }>;
  totalCost: number;
  totalDays: number;
  startDay: number;
  endDay: number;
}

export function ActionPlanForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();

  // Get data from previous steps
  const step3Data = getStepData<StrategyFormData>(3);
  const step5Data = getStepData<PriorityMatrixFormData>(5);
  const storedData = getStepData<ActionPlanFormData>(6);

  // Generate timeline phases from scope items
  const phases = useMemo<TimelinePhase[]>(() => {
    const scopeItems = step5Data?.scope_items?.filter((item) => item.is_included) || [];
    
    // Group by priority for phasing
    const mustHave = scopeItems.filter((item) => item.priority === "must");
    const shouldHave = scopeItems.filter((item) => item.priority === "should");
    const couldHave = scopeItems.filter((item) => item.priority === "could");
    const niceToHave = scopeItems.filter((item) => item.priority === "nice_to_have");

    const allPhases: TimelinePhase[] = [];
    let currentDay = 1;

    // Phase 1: Must Have items
    if (mustHave.length > 0) {
      const phaseDays = Math.max(...mustHave.map((i) => i.estimated_duration_days || 1));
      const phaseCost = mustHave.reduce((sum, i) => sum + (i.total_cost || 0), 0);
      allPhases.push({
        id: "phase-1",
        name: "Phase 1: Critical Items",
        items: mustHave.map((i) => ({
          name: i.item_name,
          cost: i.total_cost || 0,
          days: i.estimated_duration_days || 1,
          priority: i.priority || "must",
        })),
        totalCost: phaseCost,
        totalDays: phaseDays,
        startDay: currentDay,
        endDay: currentDay + phaseDays - 1,
      });
      currentDay += phaseDays;
    }

    // Phase 2: Should Have items
    if (shouldHave.length > 0) {
      const phaseDays = Math.max(...shouldHave.map((i) => i.estimated_duration_days || 1));
      const phaseCost = shouldHave.reduce((sum, i) => sum + (i.total_cost || 0), 0);
      allPhases.push({
        id: "phase-2",
        name: "Phase 2: High Priority",
        items: shouldHave.map((i) => ({
          name: i.item_name,
          cost: i.total_cost || 0,
          days: i.estimated_duration_days || 1,
          priority: i.priority || "should",
        })),
        totalCost: phaseCost,
        totalDays: phaseDays,
        startDay: currentDay,
        endDay: currentDay + phaseDays - 1,
      });
      currentDay += phaseDays;
    }

    // Phase 3: Could Have items
    if (couldHave.length > 0) {
      const phaseDays = Math.max(...couldHave.map((i) => i.estimated_duration_days || 1));
      const phaseCost = couldHave.reduce((sum, i) => sum + (i.total_cost || 0), 0);
      allPhases.push({
        id: "phase-3",
        name: "Phase 3: Enhancements",
        items: couldHave.map((i) => ({
          name: i.item_name,
          cost: i.total_cost || 0,
          days: i.estimated_duration_days || 1,
          priority: i.priority || "could",
        })),
        totalCost: phaseCost,
        totalDays: phaseDays,
        startDay: currentDay,
        endDay: currentDay + phaseDays - 1,
      });
      currentDay += phaseDays;
    }

    // Phase 4: Nice to Have items
    if (niceToHave.length > 0) {
      const phaseDays = Math.max(...niceToHave.map((i) => i.estimated_duration_days || 1));
      const phaseCost = niceToHave.reduce((sum, i) => sum + (i.total_cost || 0), 0);
      allPhases.push({
        id: "phase-4",
        name: "Phase 4: Optional",
        items: niceToHave.map((i) => ({
          name: i.item_name,
          cost: i.total_cost || 0,
          days: i.estimated_duration_days || 1,
          priority: i.priority || "nice_to_have",
        })),
        totalCost: phaseCost,
        totalDays: phaseDays,
        startDay: currentDay,
        endDay: currentDay + phaseDays - 1,
      });
    }

    return allPhases;
  }, [step5Data]);

  const totalDays = phases.length > 0 ? phases[phases.length - 1]?.endDay || 0 : 0;
  const totalCost = phases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);

  const form = useForm<ActionPlanFormData>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      tasks: [],
      total_duration_days: totalDays,
      start_date: step3Data?.start_date || "",
      target_completion_date: step3Data?.target_completion_date || "",
      ...storedData,
    },
    mode: "onBlur",
  });

  // Auto-save on changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      setStepData(6, data as Partial<ActionPlanFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepData]);

  const onSubmit = async (data: ActionPlanFormData) => {
    setStepData(6, { ...data, total_duration_days: totalDays });
    markStepComplete(6);
    await goToNextStep();
  };

  const handleSave = async () => {
    const data = form.getValues();
    setStepData(6, data);
    await saveDraft();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Action Plan</h1>
          <p className="text-muted-foreground">
            Review your project timeline and phases based on prioritized scope items.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconCalendarEvent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                  <p className="text-2xl font-bold">{totalDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <IconCurrencyDollar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <IconFlag className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <IconUsers className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phases</p>
                  <p className="text-2xl font-bold">{phases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              Project Timeline
            </CardTitle>
            <CardDescription>
              Visual representation of your renovation phases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {phases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconCalendarEvent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scope items found. Go back to Step 5 to add items.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline bar */}
                <div className="relative">
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    {phases.map((phase, index) => {
                      const width = totalDays > 0 ? (phase.totalDays / totalDays) * 100 : 0;
                      return (
                        <div
                          key={phase.id}
                          className={cn(
                            "relative flex items-center justify-center text-xs font-medium text-white",
                            PHASE_COLORS[index % PHASE_COLORS.length]
                          )}
                          style={{ width: `${width}%` }}
                        >
                          <span className="truncate px-2">
                            {phase.totalDays}d
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Day 1</span>
                    <span>Day {totalDays}</span>
                  </div>
                </div>

                {/* Phase details */}
                <div className="space-y-4">
                  {phases.map((phase, phaseIndex) => (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            PHASE_COLORS[phaseIndex % PHASE_COLORS.length]
                          )} />
                          <h3 className="font-semibold">{phase.name}</h3>
                          <Badge variant="outline" className="font-mono">
                            Days {phase.startDay}-{phase.endDay}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <IconClock className="h-4 w-4" />
                            {phase.totalDays} days
                          </span>
                          <span className="flex items-center gap-1">
                            <IconCurrencyDollar className="h-4 w-4" />
                            ${phase.totalCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        {phase.items.map((item, itemIndex) => (
                          <div 
                            key={itemIndex}
                            className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <IconArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{item.days} days</span>
                              <span>${item.cost.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPlayerPlay className="h-5 w-5" />
              Project Schedule
            </CardTitle>
            <CardDescription>
              Set your project start and target completion dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      When do you plan to begin renovations?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_completion_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Completion Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Based on {totalDays} days of work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <WizardFooter
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={phases.length > 0}
          form={form}
        />
      </form>
    </Form>
  );
}
