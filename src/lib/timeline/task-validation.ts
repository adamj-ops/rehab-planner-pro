/**
 * Task Validation Utilities for Gantt Chart Drag-and-Drop
 *
 * Provides functions for validating task moves, detecting conflicts,
 * and calculating valid date ranges based on dependencies.
 */

import type { TimelineTask, ScheduleConflict } from "./types";

// =============================================================================
// TYPES
// =============================================================================

export interface TaskMoveValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dependencyViolations: Array<{
    dependencyId: string;
    dependencyName: string;
    dependencyEndDate: Date;
    reason: string;
  }>;
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: Array<{
    taskId: string;
    taskName: string;
    type: "overlap" | "resource" | "phase";
    severity: "error" | "warning";
    description: string;
  }>;
}

export interface ValidDateRange {
  earliestStart: Date;
  latestEnd: Date | null;
  constrainedBy: Array<{
    taskId: string;
    taskName: string;
    type: "dependency" | "dependent";
    date: Date;
  }>;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates if a task can be moved to a new start date.
 * Checks dependencies to ensure the task doesn't start before its dependencies complete.
 */
export function validateTaskMove(
  task: TimelineTask,
  newStartDate: Date,
  allTasks: TimelineTask[]
): TaskMoveValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dependencyViolations: TaskMoveValidation["dependencyViolations"] = [];

  // Check each dependency
  for (const depId of task.dependencies) {
    const depTask = allTasks.find((t) => t.id === depId);
    if (!depTask) {
      warnings.push(`Dependency "${depId}" not found in task list`);
      continue;
    }

    // Task cannot start before its dependency ends
    if (newStartDate < depTask.endDate) {
      dependencyViolations.push({
        dependencyId: depTask.id,
        dependencyName: depTask.name,
        dependencyEndDate: depTask.endDate,
        reason: `Task cannot start before "${depTask.name}" completes on ${formatDate(depTask.endDate)}`,
      });
      errors.push(
        `Cannot start before "${depTask.name}" completes (${formatDate(depTask.endDate)})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    dependencyViolations,
  };
}

/**
 * Detects schedule conflicts when moving a task to new dates.
 * Checks for overlapping tasks in the same phase or with the same vendor.
 */
export function detectScheduleConflicts(
  task: TimelineTask,
  newStartDate: Date,
  newEndDate: Date,
  allTasks: TimelineTask[],
  options: {
    checkPhaseConflicts?: boolean;
    checkVendorConflicts?: boolean;
    checkCategoryConflicts?: boolean;
  } = {}
): ConflictResult {
  const {
    checkPhaseConflicts = false, // Disabled by default - overlapping phases are common
    checkVendorConflicts = true,
    checkCategoryConflicts = false,
  } = options;

  const conflicts: ConflictResult["conflicts"] = [];

  for (const otherTask of allTasks) {
    // Skip self
    if (otherTask.id === task.id) continue;

    // Check for date overlap
    const hasOverlap =
      newStartDate < otherTask.endDate && newEndDate > otherTask.startDate;

    if (!hasOverlap) continue;

    // Check vendor conflict (same vendor assigned to overlapping tasks)
    if (
      checkVendorConflicts &&
      task.assignedVendorId &&
      otherTask.assignedVendorId &&
      task.assignedVendorId === otherTask.assignedVendorId
    ) {
      conflicts.push({
        taskId: otherTask.id,
        taskName: otherTask.name,
        type: "resource",
        severity: "warning",
        description: `Overlaps with "${otherTask.name}" which has the same vendor assigned`,
      });
    }

    // Check phase conflict (same phase with overlapping dates)
    if (checkPhaseConflicts && task.phase === otherTask.phase) {
      conflicts.push({
        taskId: otherTask.id,
        taskName: otherTask.name,
        type: "phase",
        severity: "warning",
        description: `Overlaps with "${otherTask.name}" in the same phase`,
      });
    }

    // Check category conflict (same category with overlapping dates)
    if (checkCategoryConflicts && task.category === otherTask.category) {
      conflicts.push({
        taskId: otherTask.id,
        taskName: otherTask.name,
        type: "overlap",
        severity: "warning",
        description: `Overlaps with "${otherTask.name}" in the same category`,
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Calculates the valid date range for a task based on its dependencies and dependents.
 * Returns the earliest possible start date and latest possible end date.
 */
export function calculateValidDateRange(
  task: TimelineTask,
  allTasks: TimelineTask[],
  projectStartDate: Date,
  projectEndDate: Date
): ValidDateRange {
  const constrainedBy: ValidDateRange["constrainedBy"] = [];

  // Find earliest start based on dependencies
  let earliestStart = projectStartDate;

  for (const depId of task.dependencies) {
    const depTask = allTasks.find((t) => t.id === depId);
    if (depTask && depTask.endDate > earliestStart) {
      earliestStart = depTask.endDate;
      constrainedBy.push({
        taskId: depTask.id,
        taskName: depTask.name,
        type: "dependency",
        date: depTask.endDate,
      });
    }
  }

  // Find latest end based on dependents (tasks that depend on this task)
  let latestEnd: Date | null = projectEndDate;

  for (const otherTask of allTasks) {
    if (otherTask.dependencies.includes(task.id)) {
      // This task is a dependency of otherTask
      // So this task must end before otherTask starts
      if (latestEnd === null || otherTask.startDate < latestEnd) {
        latestEnd = otherTask.startDate;
        constrainedBy.push({
          taskId: otherTask.id,
          taskName: otherTask.name,
          type: "dependent",
          date: otherTask.startDate,
        });
      }
    }
  }

  return {
    earliestStart,
    latestEnd,
    constrainedBy,
  };
}

/**
 * Checks if moving a task would create a cascade of required changes to dependents.
 * Returns the list of tasks that would need to be moved.
 */
export function getCascadeEffects(
  task: TimelineTask,
  newEndDate: Date,
  allTasks: TimelineTask[]
): Array<{
  taskId: string;
  taskName: string;
  currentStart: Date;
  requiredStart: Date;
  daysPushed: number;
}> {
  const effects: ReturnType<typeof getCascadeEffects> = [];

  // Find all tasks that depend on this task
  for (const otherTask of allTasks) {
    if (otherTask.dependencies.includes(task.id)) {
      // If the new end date is after the dependent's start date, it needs to move
      if (newEndDate > otherTask.startDate) {
        const daysPushed = Math.ceil(
          (newEndDate.getTime() - otherTask.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        effects.push({
          taskId: otherTask.id,
          taskName: otherTask.name,
          currentStart: otherTask.startDate,
          requiredStart: newEndDate,
          daysPushed,
        });
      }
    }
  }

  return effects;
}

/**
 * Validates a complete schedule for conflicts and issues.
 * Used after drag operations to provide comprehensive validation.
 */
export function validateSchedule(
  tasks: TimelineTask[],
  projectStartDate: Date,
  projectEndDate: Date
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (const task of tasks) {
    // Check if task starts before project
    if (task.startDate < projectStartDate) {
      conflicts.push({
        type: "impossible_date",
        severity: "error",
        affectedTaskIds: [task.id],
        description: `"${task.name}" starts before project start date`,
        suggestedFix: "Move task to start on or after project start date",
      });
    }

    // Check if task ends after project
    if (task.endDate > projectEndDate) {
      conflicts.push({
        type: "impossible_date",
        severity: "warning",
        affectedTaskIds: [task.id],
        description: `"${task.name}" ends after project target end date`,
        suggestedFix: "Reduce task duration or extend project timeline",
      });
    }

    // Check dependency violations
    for (const depId of task.dependencies) {
      const depTask = tasks.find((t) => t.id === depId);
      if (depTask && task.startDate < depTask.endDate) {
        conflicts.push({
          type: "dependency_violation",
          severity: "error",
          affectedTaskIds: [task.id, depId],
          description: `"${task.name}" starts before its dependency "${depTask.name}" completes`,
          suggestedFix: `Move "${task.name}" to start after ${formatDate(depTask.endDate)}`,
        });
      }
    }
  }

  return conflicts;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Formats a date as a short string (e.g., "Jan 15")
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Calculates new end date based on start date and duration
 */
export function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
}

/**
 * Calculates day offset between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adds days to a date and returns a new date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Snaps a date to the nearest day boundary
 */
export function snapToDay(date: Date): Date {
  const snapped = new Date(date);
  snapped.setHours(0, 0, 0, 0);
  return snapped;
}
