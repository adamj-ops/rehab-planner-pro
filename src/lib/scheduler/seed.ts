import { addDays, format } from "date-fns";
import { TODAY } from "./dates";
import type { Person, Phase, Project, ProjectData, Task } from "./types";

/**
 * Deterministic seed data so the scheduler is fully explorable with zero config.
 * Dates are anchored to `TODAY` so the calendar and timeline always read as the
 * current few weeks.
 */

const anchor = new Date(`${TODAY}T00:00:00`);
/** days relative to the fixed anchor -> ISO date string */
const d = (offset: number) => format(addDays(anchor, offset), "yyyy-MM-dd");

/* ---------------- People ---------------- */

const people: Person[] = [
  { id: "p-ellie", name: "Ellie Fontaine", role: "Lead Designer", kind: "crew", company: "Everyday", color: "#b5623f", initials: "EF" },
  { id: "p-adam", name: "Adam", role: "Owner / PM", kind: "crew", company: "Everyday", color: "#2b2723", initials: "A" },
  { id: "p-marcus", name: "Marcus Reed", role: "Site Superintendent", kind: "crew", company: "Everyday", color: "#4f7cac", initials: "MR" },
  { id: "p-rivera", name: "Rivera Plumbing", role: "Plumbing sub", kind: "vendor", company: "Rivera Plumbing", color: "#5b8a8a", initials: "RP" },
  { id: "p-brightspark", name: "Bright Spark Electric", role: "Electrical sub", kind: "vendor", company: "Bright Spark", color: "#c98a2b", initials: "BS" },
  { id: "p-cedar", name: "Cedar & Co", role: "Cabinetry", kind: "vendor", company: "Cedar & Co", color: "#8a5a3a", initials: "CC" },
  { id: "p-stonehill", name: "Stonehill Tile", role: "Tile & stone", kind: "vendor", company: "Stonehill", color: "#4a8a86", initials: "ST" },
  { id: "p-propaint", name: "ProPaint Crew", role: "Painting", kind: "vendor", company: "ProPaint", color: "#6f7d5f", initials: "PP" },
  { id: "p-greenleaf", name: "GreenLeaf", role: "Landscape", kind: "vendor", company: "GreenLeaf", color: "#5c8a5a", initials: "GL" },
];

/* ---------------- Projects ---------------- */

const projects: Project[] = [
  {
    id: "proj-maple",
    name: "Maple Street Flip",
    address: "418 Maple St, Bloomfield",
    type: "flip",
    status: "active",
    startDate: d(-28),
    targetDate: d(46),
    budget: 142000,
    spent: 61400,
    accent: "#b5623f",
    leadId: "p-marcus",
    notes: "3bd/2ba cosmetic-plus flip. Kitchen and both baths to the studs.",
  },
  {
    id: "proj-linden",
    name: "Linden Ave Full Gut",
    address: "27 Linden Ave, Rosewood",
    type: "flip",
    status: "active",
    startDate: d(-54),
    targetDate: d(22),
    budget: 236000,
    spent: 158900,
    accent: "#4f7cac",
    leadId: "p-marcus",
    notes: "Full gut. Finishes phase now — punch list forming.",
  },
  {
    id: "proj-bev",
    name: "Bev's Garden Cottage",
    address: "9 Willow Ln, Bev's Garden Co.",
    type: "renovation",
    status: "planning",
    startDate: d(12),
    targetDate: d(74),
    budget: 88000,
    spent: 4200,
    accent: "#6f7d5f",
    leadId: "p-ellie",
    notes: "Cottage refresh + garden room addition. Design in progress.",
  },
];

/* ---------------- Phases ---------------- */

const phase = (id: string, projectId: string, name: string, order: number, color: string): Phase => ({
  id,
  projectId,
  name,
  order,
  color,
});

const phases: Phase[] = [
  // Maple
  phase("ph-maple-design", "proj-maple", "Design & Permits", 0, "#8a6db0"),
  phase("ph-maple-demo", "proj-maple", "Demo", 1, "#a05a4a"),
  phase("ph-maple-rough", "proj-maple", "Rough-in", 2, "#4f7cac"),
  phase("ph-maple-finish", "proj-maple", "Finishes", 3, "#6f7d5f"),
  phase("ph-maple-close", "proj-maple", "Punch & List", 4, "#b5623f"),
  // Linden
  phase("ph-linden-rough", "proj-linden", "Rough-in", 0, "#4f7cac"),
  phase("ph-linden-finish", "proj-linden", "Finishes", 1, "#6f7d5f"),
  phase("ph-linden-close", "proj-linden", "Punch & List", 2, "#b5623f"),
  // Bev
  phase("ph-bev-design", "proj-bev", "Design & Permits", 0, "#8a6db0"),
  phase("ph-bev-demo", "proj-bev", "Demo & Prep", 1, "#a05a4a"),
  phase("ph-bev-build", "proj-bev", "Build", 2, "#4f7cac"),
];

/* ---------------- Tasks ---------------- */

let n = 0;
const t = (task: Omit<Task, "id" | "dependsOn"> & { dependsOn?: string[] }): Task => ({
  id: `task-${++n}`,
  dependsOn: task.dependsOn ?? [],
  ...task,
});

const tasks: Task[] = [
  /* ===== Maple Street Flip ===== */
  t({ projectId: "proj-maple", phaseId: "ph-maple-design", title: "Finalize kitchen layout", status: "done", trade: "design", priority: "high", assigneeId: "p-ellie", startDate: d(-28), endDate: d(-22), cost: 0 }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-design", title: "Pull building permit", status: "done", trade: "inspection", priority: "high", assigneeId: "p-adam", startDate: d(-21), endDate: d(-16), cost: 850 }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-demo", title: "Gut kitchen & hall bath", status: "done", trade: "demo", priority: "high", assigneeId: "p-marcus", startDate: d(-15), endDate: d(-9), cost: 6200 }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-demo", title: "Haul debris + dumpster swap", status: "done", trade: "general", priority: "medium", assigneeId: "p-marcus", startDate: d(-9), endDate: d(-8), cost: 1100 }),

  t({ projectId: "proj-maple", phaseId: "ph-maple-rough", title: "Plumbing rough-in", status: "in_progress", trade: "plumbing", priority: "high", assigneeId: "p-rivera", startDate: d(-4), endDate: d(2), cost: 8400 }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-rough", title: "Electrical rough-in", status: "in_progress", trade: "electrical", priority: "high", assigneeId: "p-brightspark", startDate: d(-2), endDate: d(4), cost: 7300, dependsOn: [] }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-rough", title: "HVAC duct adjustments", status: "scheduled", trade: "hvac", priority: "medium", assigneeId: "p-marcus", startDate: d(3), endDate: d(6), cost: 3200 }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-rough", title: "Rough inspection", status: "blocked", trade: "inspection", priority: "high", assigneeId: "p-adam", startDate: d(7), endDate: d(7), cost: 0, dependsOn: ["task-5", "task-6", "task-7"], notes: "Can't schedule until plumbing + electrical rough pass." }),

  t({ projectId: "proj-maple", phaseId: "ph-maple-finish", title: "Hang & finish drywall", status: "planned", trade: "drywall", priority: "high", assigneeId: "p-marcus", startDate: d(8), endDate: d(14), cost: 5600, dependsOn: ["task-8"] }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-finish", title: "Cabinet install", status: "planned", trade: "cabinetry", priority: "high", assigneeId: "p-cedar", startDate: d(16), endDate: d(19), cost: 14200, dependsOn: ["task-9"], notes: "Cedar & Co lead time — order confirmed." }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-finish", title: "Tile kitchen backsplash + baths", status: "planned", trade: "tile", priority: "medium", assigneeId: "p-stonehill", startDate: d(20), endDate: d(25), cost: 6800, dependsOn: ["task-10"] }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-finish", title: "Interior paint", status: "planned", trade: "paint", priority: "medium", assigneeId: "p-propaint", startDate: d(21), endDate: d(27), cost: 4900, dependsOn: ["task-9"] }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-finish", title: "LVP flooring throughout", status: "planned", trade: "flooring", priority: "medium", assigneeId: "p-marcus", startDate: d(28), endDate: d(33), cost: 7400, dependsOn: ["task-12"] }),
  t({ projectId: "proj-maple", phaseId: "ph-maple-close", title: "Punch list walk with Ellie", status: "planned", trade: "design", priority: "high", assigneeId: "p-ellie", startDate: d(40), endDate: d(41), cost: 0, dependsOn: ["task-13"] }),

  /* ===== Linden Ave Full Gut ===== */
  t({ projectId: "proj-linden", phaseId: "ph-linden-rough", title: "Final electrical trim", status: "done", trade: "electrical", priority: "high", assigneeId: "p-brightspark", startDate: d(-12), endDate: d(-8), cost: 5200 }),
  t({ projectId: "proj-linden", phaseId: "ph-linden-finish", title: "Countertop template & install", status: "in_progress", trade: "countertops", priority: "high", assigneeId: "p-stonehill", startDate: d(-3), endDate: d(3), cost: 9100 }),
  t({ projectId: "proj-linden", phaseId: "ph-linden-finish", title: "Primary bath tile", status: "in_progress", trade: "tile", priority: "high", assigneeId: "p-stonehill", startDate: d(-1), endDate: d(5), cost: 7600 }),
  t({ projectId: "proj-linden", phaseId: "ph-linden-finish", title: "Trim & interior doors", status: "scheduled", trade: "general", priority: "medium", assigneeId: "p-marcus", startDate: d(4), endDate: d(9), cost: 6300 }),
  t({ projectId: "proj-linden", phaseId: "ph-linden-finish", title: "Final paint touch-ups", status: "planned", trade: "paint", priority: "low", assigneeId: "p-propaint", startDate: d(10), endDate: d(12), cost: 2100, dependsOn: ["task-18"] }),
  t({ projectId: "proj-linden", phaseId: "ph-linden-close", title: "Final inspection", status: "planned", trade: "inspection", priority: "high", assigneeId: "p-adam", startDate: d(15), endDate: d(15), cost: 0, dependsOn: ["task-19"] }),
  t({ projectId: "proj-linden", phaseId: "ph-linden-close", title: "Staging & listing photos", status: "planned", trade: "design", priority: "medium", assigneeId: "p-ellie", startDate: d(18), endDate: d(20), cost: 3400, dependsOn: ["task-20"] }),

  /* ===== Bev's Garden Cottage ===== */
  t({ projectId: "proj-bev", phaseId: "ph-bev-design", title: "Concept & moodboard", status: "in_progress", trade: "design", priority: "high", assigneeId: "p-ellie", startDate: d(-2), endDate: d(6), cost: 0 }),
  t({ projectId: "proj-bev", phaseId: "ph-bev-design", title: "Garden room drawings", status: "scheduled", trade: "design", priority: "high", assigneeId: "p-ellie", startDate: d(7), endDate: d(13), cost: 0, dependsOn: ["task-22"] }),
  t({ projectId: "proj-bev", phaseId: "ph-bev-design", title: "Permit submission", status: "planned", trade: "inspection", priority: "high", assigneeId: "p-adam", startDate: d(14), endDate: d(18), cost: 1200, dependsOn: ["task-23"] }),
  t({ projectId: "proj-bev", phaseId: "ph-bev-demo", title: "Clear & prep garden site", status: "planned", trade: "landscape", priority: "medium", assigneeId: "p-greenleaf", startDate: d(20), endDate: d(24), cost: 3800, dependsOn: ["task-24"] }),
  t({ projectId: "proj-bev", phaseId: "ph-bev-build", title: "Garden room framing", status: "planned", trade: "framing", priority: "high", assigneeId: "p-marcus", startDate: d(26), endDate: d(34), cost: 15400, dependsOn: ["task-25"] }),
];

export const seedData: ProjectData = { projects, phases, tasks, people };
