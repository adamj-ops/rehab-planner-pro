import type { Project, Task } from "./types";
import { TODAY, daysBetween, pct } from "./dates";

export interface ProjectMetrics {
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  progress: number; // 0-100 by task count
  budgetPct: number;
  overdue: number;
  daysToTarget: number;
}

export function projectMetrics(project: Project, tasks: Task[]): ProjectMetrics {
  const ptasks = tasks.filter((t) => t.projectId === project.id);
  const total = ptasks.length;
  const done = ptasks.filter((t) => t.status === "done").length;
  const inProgress = ptasks.filter((t) => t.status === "in_progress").length;
  const blocked = ptasks.filter((t) => t.status === "blocked").length;
  const overdue = ptasks.filter(
    (t) => t.status !== "done" && daysBetween(t.endDate, TODAY) > 0
  ).length;

  return {
    total,
    done,
    inProgress,
    blocked,
    progress: pct(done, total),
    budgetPct: pct(project.spent, project.budget),
    overdue,
    daysToTarget: daysBetween(TODAY, project.targetDate),
  };
}

/** Tasks whose window includes TODAY, across all projects. */
export function activeToday(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) =>
      daysBetween(t.startDate, TODAY) >= 0 &&
      daysBetween(TODAY, t.endDate) >= 0 &&
      t.status !== "done"
  );
}
