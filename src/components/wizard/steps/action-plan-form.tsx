"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  IconChartBar,
  IconList,
  IconAlertTriangle,
  IconRefresh,
  IconHandMove,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  type ActionPlanFormData,
  type PriorityMatrixFormData,
  type StrategyFormData,
  type ScopeItemFormData,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";
import { GanttChart } from "@/components/timeline/gantt-chart";
import { SchedulingEngine } from "@/lib/timeline/scheduler";
import type { TimelineTask, TimelineConfig, ScheduleResult } from "@/lib/timeline/types";

// Type for manual override storage
interface ManualOverride {
  taskId: string;
  originalStartDate: Date;
  originalEndDate: Date;
  manualStartDate: Date;
  manualEndDate: Date;
  appliedAt: string;
  // Legacy fields for backward compatibility
  start_date?: string;
  end_date?: string;
  modified_at?: string;
}

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

// Helper to convert ScopeItemFormData to TimelineTask format
function convertToTimelineTasks(
  scopeItems: ScopeItemFormData[]
): Omit<TimelineTask, "startDate" | "endDate">[] {
  // Get included items
  const includedItems = scopeItems.filter((item) => item.is_included);
  
  // Build a set of included item IDs for filtering dependencies
  const includedItemIds = new Set(
    includedItems.map((item) => item.id || `item-${scopeItems.indexOf(item)}`)
  );

  return includedItems.map((item, index) => {
    // Map priority to phase number
    const phaseMap: Record<string, number> = {
      must: 1,
      should: 2,
      could: 3,
      nice_to_have: 4,
    };

    // Get the original index in the full scopeItems array for consistent ID
    const originalIndex = scopeItems.indexOf(item);
    const itemId = item.id || `item-${originalIndex}`;

    // Filter dependencies to only include items that are also included in the project
    const dependencies = (item.depends_on || []).filter((depId) =>
      includedItemIds.has(depId)
    );

    return {
      id: itemId,
      name: item.item_name || `Task ${index + 1}`,
      description: item.description,
      category: item.category || "other",
      phase: phaseMap[item.priority || "should"] || 2,
      durationDays: item.estimated_duration_days || 1,
      dependencies,
      dependents: [],
      assignedVendorId: undefined,
      status: "pending" as const,
      progress: 0,
      estimatedCost: item.total_cost,
      priority: item.priority === "nice_to_have" ? "nice" : (item.priority as "must" | "should" | "could" | "nice"),
    };
  });
}

export function ActionPlanForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();
  const [viewMode, setViewMode] = useState<"simple" | "gantt">("simple");
  const [isDragging, setIsDragging] = useState(false);
  
  // Manual overrides state - persists user's drag-and-drop changes
  const [manualOverrides, setManualOverrides] = useState<Record<string, ManualOverride>>({});
  
  // Undo/redo state for drag operations
  const [undoStack, setUndoStack] = useState<ManualOverride[]>([]);
  const [redoStack, setRedoStack] = useState<ManualOverride[]>([]);

  // Get data from previous steps
  const step3Data = getStepData<StrategyFormData>(3);
  const step5Data = getStepData<PriorityMatrixFormData>(5);
  const storedData = getStepData<ActionPlanFormData>(6);
  
  // Initialize manual overrides from stored data
  useEffect(() => {
    if (storedData?.manual_overrides) {
      setManualOverrides(storedData.manual_overrides);
    }
  }, [storedData?.manual_overrides]);

  // Get the project start date (default to today)
  const projectStartDate = useMemo(() => {
    if (step3Data?.start_date) {
      return new Date(step3Data.start_date);
    }
    return new Date();
  }, [step3Data?.start_date]);

  // Calculate end date (default to 6 months from start)
  const projectEndDate = useMemo(() => {
    const endDate = new Date(projectStartDate);
    endDate.setMonth(endDate.getMonth() + 6);
    return endDate;
  }, [projectStartDate]);

  // Auto-schedule using SchedulingEngine, applying manual overrides
  const scheduleResult = useMemo<ScheduleResult | null>(() => {
    const scopeItems = step5Data?.scope_items || [];
    if (scopeItems.length === 0) return null;

    const tasks = convertToTimelineTasks(scopeItems);
    if (tasks.length === 0) return null;

    const config: TimelineConfig = {
      projectStartDate,
      projectEndDate,
      workingDaysPerWeek: 5,
      holidayDates: [],
      bufferDays: 7,
    };

    try {
      // First, run the scheduler
      const result = SchedulingEngine.scheduleProject(tasks, config);
      
      // Then apply manual overrides to scheduled tasks
      const tasksWithOverrides = result.tasks.map((task) => {
        const override = manualOverrides[task.id];
        if (override) {
          return {
            ...task,
            startDate: override.manualStartDate || (override.start_date ? new Date(override.start_date) : task.startDate),
            endDate: override.manualEndDate || (override.end_date ? new Date(override.end_date) : task.endDate),
          };
        }
        return task;
      });
      
      return {
        ...result,
        tasks: tasksWithOverrides,
      };
    } catch {
      return null;
    }
  }, [step5Data, projectStartDate, projectEndDate, manualOverrides]);
  
  // Handle task drag start with enhanced feedback
  const handleTaskDragStart = useCallback((task: TimelineTask) => {
    setIsDragging(true);
    toast.info(`Dragging "${task.name}"...`, { 
      duration: 1000,
      description: "Move horizontally to reschedule",
    });
  }, []);
  
  // Track drag state for UI feedback
  const handleDragStart = useCallback((taskId: string) => {
    setIsDragging(true);
    const task = scheduleResult?.tasks.find(t => t.id === taskId);
    if (task) {
      toast.info(`Dragging "${task.name}"...`, { 
        duration: 1000,
        description: "Move horizontally to reschedule",
      });
    }
  }, [scheduleResult]);
  
  const handleDragEnd = useCallback((taskId: string, cancelled: boolean) => {
    setIsDragging(false);
    if (cancelled) {
      const task = scheduleResult?.tasks.find(t => t.id === taskId);
      if (task) {
        toast.warning(`"${task.name}" move cancelled`, {
          description: "Task returned to original position",
        });
      }
    }
  }, [scheduleResult]);

  // Generate legacy timeline phases from scope items (for simple view)
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

  const totalDays = scheduleResult?.metrics.totalDays || (phases.length > 0 ? phases[phases.length - 1]?.endDay || 0 : 0);
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
  
  // Enhanced task update handler with validation
  const handleTaskUpdate = useCallback((
    task: TimelineTask,
    updates?: { startDate: Date; endDate: Date }
  ) => {
    const { startDate, endDate } = updates || {
      startDate: task.startDate,
      endDate: task.endDate,
    };
    
    // Store the previous state for undo (if it exists)
    const previousOverride = manualOverrides[task.id];
    if (previousOverride) {
      setUndoStack(prev => [...prev.slice(-9), previousOverride]); // Keep only last 10
    }

    // Clear redo stack on new action
    setRedoStack([]);
    
    // Store manual override with enhanced data
    const override: ManualOverride = {
      taskId: task.id,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate,
      manualStartDate: startDate,
      manualEndDate: endDate,
      appliedAt: new Date().toISOString(),
      // Legacy compatibility
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      modified_at: new Date().toISOString(),
    };
    
    setManualOverrides(prev => ({
      ...prev,
      [task.id]: override,
    }));
    
    // Update wizard data immediately
    const currentData = form.getValues();
    setStepData(6, {
      ...currentData,
      total_duration_days: scheduleResult?.metrics.totalDays || 0,
      manual_overrides: {
        ...manualOverrides,
        [task.id]: override,
      }
    });
    
    toast.success(`"${task.name}" rescheduled`, {
      description: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      duration: 2000,
      action: {
        label: "Undo",
        onClick: () => handleUndoLastDrag(),
      },
    });
    
    setIsDragging(false);
  }, [manualOverrides, scheduleResult, setStepData, form, handleUndoLastDrag]);

  // Handle undo last drag operation
  const handleUndoLastDrag = useCallback(() => {
    const lastOverride = undoStack[undoStack.length - 1];
    if (!lastOverride) return;
    
    // Get the taskId from the override
    const taskId = lastOverride.taskId || Object.keys(manualOverrides).find(
      id => manualOverrides[id] === lastOverride
    );
    
    if (!taskId) {
      toast.error('Unable to undo: task not found');
      return;
    }
    
    const newOverrides = { ...manualOverrides };
    
    // If this was the first override for this task, remove it entirely
    // Otherwise, restore the previous override
    if (undoStack.filter(o => o.taskId === taskId).length === 1) {
      delete newOverrides[taskId];
    } else {
      // Find the previous override for this task
      const previousOverrides = undoStack
        .filter(o => o.taskId === taskId)
        .slice(0, -1); // Remove the last one
      const previousOverride = previousOverrides[previousOverrides.length - 1];
      if (previousOverride) {
        newOverrides[taskId] = previousOverride;
      } else {
        delete newOverrides[taskId];
      }
    }
    
    setManualOverrides(newOverrides);
    setUndoStack(prev => prev.slice(0, -1));
    
    const currentData = form.getValues();
    setStepData(6, { 
      ...currentData, 
      manual_overrides: newOverrides 
    });
    
    // Add the undone action to redo stack
    setRedoStack(prev => [...prev, manualOverrides[taskId]].filter(Boolean));

    const task = scheduleResult?.tasks.find(t => t.id === taskId);
    toast.success('Drag operation undone', {
      description: task ? `"${task.name}" restored` : undefined,
    });
  }, [undoStack, manualOverrides, setStepData, form, scheduleResult]);

  // Handle redo operation
  const handleRedo = useCallback(() => {
    const lastRedo = redoStack[redoStack.length - 1];
    if (!lastRedo) return;

    const taskId = lastRedo.taskId;
    if (!taskId) return;

    // Apply the redo action
    setManualOverrides(prev => ({
      ...prev,
      [taskId]: lastRedo,
    }));

    // Remove from redo stack and add to undo stack
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, manualOverrides[taskId]].filter(Boolean));

    const currentData = form.getValues();
    setStepData(6, {
      ...currentData,
      manual_overrides: {
        ...manualOverrides,
        [taskId]: lastRedo,
      }
    });

    const task = scheduleResult?.tasks.find(t => t.id === taskId);
    toast.success('Drag operation redone', {
      description: task ? `"${task.name}" rescheduled` : undefined,
    });
  }, [redoStack, manualOverrides, setStepData, form, scheduleResult]);
  
  // Clear all manual overrides and revert to auto-scheduled
  const handleClearOverrides = useCallback(() => {
    setManualOverrides({});
    setUndoStack([]);
    setRedoStack([]);
    const currentData = form.getValues();
    setStepData(6, { ...currentData, manual_overrides: {} });
    toast.info("Schedule reset to auto-calculated dates", {
      description: "All manual changes cleared"
    });
  }, [form, setStepData]);

  // Get schedule conflicts
  const scheduleConflicts = scheduleResult?.conflicts || [];
  const hasErrors = scheduleConflicts.some((c) => c.severity === "error");

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input elements
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (undoStack.length > 0) {
          handleUndoLastDrag();
        }
      }

      // Ctrl+Shift+Z or Ctrl+Y for redo
      if ((event.ctrlKey || event.metaKey) && (
        (event.key === 'z' && event.shiftKey) ||
        (event.key === 'y' && !event.shiftKey)
      )) {
        event.preventDefault();
        if (redoStack.length > 0) {
          handleRedo();
        }
      }

      // Escape to cancel current drag
      if (event.key === 'Escape' && isDragging) {
        // This would be handled by the Gantt chart component
        toast.info('Drag cancelled');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack.length, redoStack.length, isDragging, handleUndoLastDrag, handleRedo]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Action Plan</h1>
          <p className="text-muted-foreground">
            Review your project timeline and phases based on prioritized scope items.
          </p>
        </div>

        {/* Schedule Conflicts Alert */}
        {scheduleConflicts.length > 0 && (
          <Alert variant={hasErrors ? "destructive" : "default"}>
            <IconAlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {hasErrors ? "Schedule Conflicts Detected" : "Schedule Warnings"}
            </AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {scheduleConflicts.slice(0, 3).map((conflict, index) => (
                  <li key={`conflict-${conflict.type}-${index}`} className="text-sm">
                    • {conflict.description}
                    {conflict.suggestedFix && (
                      <span className="text-muted-foreground ml-1">
                        ({conflict.suggestedFix})
                      </span>
                    )}
                  </li>
                ))}
                {scheduleConflicts.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    ...and {scheduleConflicts.length - 3} more issues
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconClock className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>
                  Visual representation of your renovation phases
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === "simple" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("simple")}
                >
                  <IconList className="h-4 w-4 mr-1" />
                  Simple
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "gantt" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("gantt")}
                  disabled={!scheduleResult}
                >
                  <IconChartBar className="h-4 w-4 mr-1" />
                  Gantt
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {phases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconCalendarEvent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scope items found. Go back to Step 5 to add items.</p>
              </div>
            ) : viewMode === "gantt" && scheduleResult ? (
              /* Gantt Chart View */
              <div className="space-y-4">
                {/* Info Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {/* Manual Override Controls */}
                    {Object.keys(manualOverrides).length > 0 && (
                      <div className="flex items-center gap-2">
                        {undoStack.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUndoLastDrag}
                            className="h-7 text-xs flex items-center gap-1"
                            title="Undo last drag operation (Ctrl+Z)"
                          >
                            <IconArrowBackUp className="h-3 w-3" />
                            Undo ({undoStack.length})
                          </Button>
                        )}
                        {redoStack.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRedo}
                            className="h-7 text-xs flex items-center gap-1"
                            title="Redo last undone operation (Ctrl+Shift+Z)"
                          >
                            <IconArrowForwardUp className="h-3 w-3" />
                            Redo ({redoStack.length})
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearOverrides}
                          className="h-7 text-xs flex items-center gap-1"
                        >
                          <IconRefresh className="h-3 w-3" />
                          Reset Schedule
                        </Button>
                      </div>
                    )}
                    
                    {/* Critical Path Info */}
                    {scheduleResult.metrics.criticalPath.length > 0 && (
                      <>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          Critical Path: {scheduleResult.metrics.criticalPathDays} days
                        </span>
                        <span>•</span>
                        <span>
                          {scheduleResult.metrics.criticalPath.length} critical tasks
                        </span>
                      </>
                    )}
                    
                    {/* Manual Overrides Indicator */}
                    {Object.keys(manualOverrides).length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-500">
                          <IconHandMove className="h-3 w-3" />
                          {Object.keys(manualOverrides).length} manually scheduled
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Reset Button */}
                  {Object.keys(manualOverrides).length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearOverrides}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <IconRefresh className="h-4 w-4 mr-1" />
                      Reset Schedule
                    </Button>
                  )}
                </div>
                
                {/* Drag Instructions */}
                {isDragging && (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <IconHandMove className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      Drag horizontally to reschedule. Release to confirm or move back to cancel.
                    </AlertDescription>
                  </Alert>
                )}
                
                <GanttChart
                  tasks={scheduleResult.tasks}
                  phases={scheduleResult.phases}
                  milestones={scheduleResult.milestones}
                  projectStartDate={projectStartDate}
                  projectEndDate={projectEndDate}
                  criticalPath={scheduleResult.metrics.criticalPath}
                  onTaskClick={(task) => {
                    // TODO: Open task detail sheet
                    console.log("Task clicked:", task);
                  }}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDragStart={handleTaskDragStart}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ) : (
              /* Simple Timeline View */
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
                        {phase.items.map((item) => (
                          <div 
                            key={item.name}
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
