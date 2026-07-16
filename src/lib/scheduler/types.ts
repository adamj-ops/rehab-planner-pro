/**
 * Domain model for the Scheduler feature.
 *
 * Ported from the standalone scheduler app. Status/trade color hexes are kept
 * as-is — they are semantic data colors that read well in both light and dark.
 */

export type ProjectType = "flip" | "renovation" | "new_build" | "addition";

export type ProjectStatus =
  | "lead"
  | "planning"
  | "active"
  | "on_hold"
  | "punch_list"
  | "complete";

export type TaskStatus =
  | "planned"
  | "scheduled"
  | "in_progress"
  | "blocked"
  | "done";

/** Trades / disciplines — drives color-coding and filtering on the schedule. */
export type Trade =
  | "design"
  | "demo"
  | "framing"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "drywall"
  | "paint"
  | "flooring"
  | "tile"
  | "cabinetry"
  | "countertops"
  | "landscape"
  | "inspection"
  | "procurement"
  | "general";

export type Priority = "low" | "medium" | "high";

export interface Person {
  id: string;
  name: string;
  role: string;
  /** "crew" = internal team, "vendor" = external sub/supplier. */
  kind: "crew" | "vendor";
  company?: string;
  color: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string; // ISO date
  targetDate: string; // ISO date
  budget: number;
  spent: number;
  /** hex used for the project cover accent stripe */
  accent: string;
  leadId?: string;
  notes?: string;
}

/** Ordered stage within a project (Demo, Rough-in, Finishes, ...). */
export interface Phase {
  id: string;
  projectId: string;
  name: string;
  order: number;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  status: TaskStatus;
  trade: Trade;
  priority: Priority;
  assigneeId?: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  cost?: number;
  /** Task ids that must finish before this one can start. */
  dependsOn: string[];
  notes?: string;
}

export interface ProjectData {
  projects: Project[];
  phases: Phase[];
  tasks: Task[];
  people: Person[];
}

/* ---------- Display metadata (shared by every view) ---------- */

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; color: string; dot: string }
> = {
  planned: { label: "Planned", color: "#8b93a1", dot: "#8b93a1" },
  scheduled: { label: "Scheduled", color: "#4f7cac", dot: "#4f7cac" },
  in_progress: { label: "In progress", color: "#c98a2b", dot: "#c98a2b" },
  blocked: { label: "Blocked", color: "#b04a3f", dot: "#b04a3f" },
  done: { label: "Done", color: "#5c8a5a", dot: "#5c8a5a" },
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "planned",
  "scheduled",
  "in_progress",
  "blocked",
  "done",
];

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string }
> = {
  lead: { label: "Lead", color: "#9a9284" },
  planning: { label: "Planning", color: "#4f7cac" },
  active: { label: "Active", color: "#5c8a5a" },
  on_hold: { label: "On hold", color: "#c98a2b" },
  punch_list: { label: "Punch list", color: "#b5623f" },
  complete: { label: "Complete", color: "#6f7d5f" },
};

export const TRADE_META: Record<Trade, { label: string; color: string }> = {
  design: { label: "Design", color: "#8a6db0" },
  demo: { label: "Demo", color: "#a05a4a" },
  framing: { label: "Framing", color: "#b08442" },
  plumbing: { label: "Plumbing", color: "#4f7cac" },
  electrical: { label: "Electrical", color: "#c98a2b" },
  hvac: { label: "HVAC", color: "#5b8a8a" },
  drywall: { label: "Drywall", color: "#9a9284" },
  paint: { label: "Paint", color: "#6f7d5f" },
  flooring: { label: "Flooring", color: "#8a6a4a" },
  tile: { label: "Tile", color: "#4a8a86" },
  cabinetry: { label: "Cabinetry", color: "#8a5a3a" },
  countertops: { label: "Countertops", color: "#6a6a7a" },
  landscape: { label: "Landscape", color: "#5c8a5a" },
  inspection: { label: "Inspection", color: "#b04a3f" },
  procurement: { label: "Procurement", color: "#a08a4a" },
  general: { label: "General", color: "#7a7266" },
};

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  flip: "Flip",
  renovation: "Renovation",
  new_build: "New build",
  addition: "Addition",
};
