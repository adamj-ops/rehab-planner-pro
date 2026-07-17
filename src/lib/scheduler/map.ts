/**
 * Pure mappers: Supabase rows -> scheduler view models.
 *
 * These functions never touch the network. They translate DB shapes
 * (`db-types.ts`) into the `Project` / `Phase` / `Task` / `Person` view models
 * the scheduler views already render.
 */

import { addDays, format } from "date-fns";
import { TODAY, toDate } from "./dates";
import {
  TRADE_META,
  type Person,
  type Phase,
  type Priority,
  type Project,
  type ProjectStatus,
  type Task,
  type TaskStatus,
  type Trade,
} from "./types";
import type { DbPhase, DbProject, DbTask, DbVendor } from "./db-types";

/* ---------------- palettes ---------------- */

const ACCENT_PALETTE = [
  "#b5623f",
  "#4f7cac",
  "#6f7d5f",
  "#8a6db0",
  "#c98a2b",
  "#5b8a8a",
  "#a05a4a",
  "#4a8a86",
];

const PERSON_PALETTE = [
  "#4f7cac",
  "#b5623f",
  "#5b8a8a",
  "#c98a2b",
  "#8a5a3a",
  "#6f7d5f",
  "#8a6db0",
  "#4a8a86",
  "#a05a4a",
  "#5c8a5a",
];

const UNPHASED_COLOR = "#9a9284";

/* ---------------- date helpers ---------------- */

/** ISO timestamp/date -> `yyyy-MM-dd` (or null). */
export function datePart(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  return format(addDays(toDate(iso), days), "yyyy-MM-dd");
}

/* ---------------- project ---------------- */

function mapProjectStatus(
  phase: string | null,
  status: string | null
): ProjectStatus {
  switch (phase) {
    case "planning":
      return "planning";
    case "construction":
      return "active";
    case "paused":
      return "on_hold";
    case "completed":
    case "archived":
      return "complete";
  }
  switch (status) {
    case "active":
    case "in_progress":
      return "active";
    case "completed":
      return "complete";
    case "on_hold":
      return "on_hold";
    case "archived":
      return "complete";
    default:
      return "planning";
  }
}

/**
 * Map a project row. `index` seeds the accent-color fallback; `maxTaskDue` is
 * the latest task `due_date` for the project (used as a target-date fallback).
 */
export function mapProject(
  row: DbProject,
  index: number,
  maxTaskDue?: string | null
): Project {
  const address =
    row.address_formatted ||
    [row.address_street, row.address_city, row.address_state]
      .filter(Boolean)
      .join(", ");

  const startDate =
    datePart(row.construction_started_at) ||
    datePart(row.planning_started_at) ||
    datePart(row.created_at) ||
    TODAY;

  let targetDate = datePart(row.completed_at);
  if (!targetDate && row.estimated_days) {
    targetDate = addDaysIso(startDate, row.estimated_days);
  }
  if (!targetDate && maxTaskDue) targetDate = datePart(maxTaskDue);
  if (!targetDate) targetDate = startDate;

  return {
    id: row.id,
    name: row.project_name,
    address,
    type: "renovation",
    status: mapProjectStatus(row.phase, row.status),
    startDate,
    targetDate,
    budget: row.max_budget ?? row.total_estimated_cost ?? 0,
    spent: row.total_actual_cost ?? 0,
    accent: row.color || ACCENT_PALETTE[index % ACCENT_PALETTE.length],
    leadId: undefined,
  };
}

/* ---------------- task ---------------- */

function mapTaskStatus(status: string | null): TaskStatus {
  switch (status) {
    case "in_progress":
      return "in_progress";
    case "blocked":
      return "blocked";
    case "done":
      return "done";
    case "to_do":
    default:
      return "planned";
  }
}

/** view-model status -> DB `project_tasks.status`. */
export function toDbStatus(status: TaskStatus): string {
  switch (status) {
    case "in_progress":
      return "in_progress";
    case "blocked":
      return "blocked";
    case "done":
      return "done";
    case "planned":
    case "scheduled":
    default:
      return "to_do";
  }
}

function mapPriority(priority: string | null): Priority {
  switch (priority) {
    case "low":
      return "low";
    case "high":
    case "urgent":
      return "high";
    case "medium":
    default:
      return "medium";
  }
}

function coerceTrade(trade: string | null): Trade {
  const key = (trade ?? "").toLowerCase().trim();
  return (key in TRADE_META ? key : "general") as Trade;
}

/** Stable synthetic phase id holding a project's unphased tasks. */
export function unphasedId(projectId: string): string {
  return `unphased-${projectId}`;
}

export function mapTask(row: DbTask, dependsOn: string[]): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    phaseId: row.phase_id ?? unphasedId(row.project_id),
    title: row.title,
    status: mapTaskStatus(row.status),
    trade: coerceTrade(row.trade),
    priority: mapPriority(row.priority),
    assigneeId: row.assigned_vendor_id ?? undefined,
    // null dates -> "" (unscheduled). `isScheduled` gates timeline/calendar.
    startDate: row.start_date ?? "",
    endDate: row.due_date ?? "",
    cost: row.estimated_cost ?? undefined,
    dependsOn,
    notes: row.description ?? undefined,
  };
}

/** A task is schedulable (timeline/calendar) only with both endpoints. */
export function isScheduled(task: Task): boolean {
  return Boolean(task.startDate) && Boolean(task.endDate);
}

/* ---------------- phase ---------------- */

export function mapPhase(row: DbPhase): Phase {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    order: row.sort_order ?? 0,
    color: row.color || UNPHASED_COLOR,
  };
}

/** Trailing "Unphased" phase to group tasks with a null `phase_id`. */
export function makeUnphasedPhase(projectId: string, order: number): Phase {
  return {
    id: unphasedId(projectId),
    projectId,
    name: "Unphased",
    order,
    color: UNPHASED_COLOR,
  };
}

/* ---------------- person (vendor) ---------------- */

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function mapVendor(row: DbVendor, index: number): Person {
  const name = row.name || row.company_name || "Vendor";
  const company = row.company_name ?? undefined;
  return {
    id: row.id,
    name,
    role: company && company !== name ? company : "Vendor",
    kind: "vendor",
    company,
    color: PERSON_PALETTE[index % PERSON_PALETTE.length],
    initials: initialsFrom(name),
  };
}
