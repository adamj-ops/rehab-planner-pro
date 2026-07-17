"use client";

/**
 * React-query hooks that back the /scheduler feature with real Supabase data.
 *
 * The generated Supabase types don't yet know about `project_phases` or the new
 * `project_tasks` columns (`phase_id`, `trade`, `estimated_cost`), so scheduler
 * queries run through an untyped client (`schedulerClient()` -> the browser
 * client cast to a loose shape). Row results are typed locally via `db-types`.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  DbDependency,
  DbPhase,
  DbProject,
  DbTask,
  DbVendor,
} from "@/lib/scheduler/db-types";
import type {
  Person,
  Phase,
  Project,
  Task,
  TaskStatus,
} from "@/lib/scheduler/types";
import {
  makeUnphasedPhase,
  mapPhase,
  mapProject,
  mapTask,
  mapVendor,
  toDbStatus,
  unphasedId,
} from "@/lib/scheduler/map";

/* ------------------------------------------------------------------ */
/* Untyped client for the not-yet-generated table/columns.            */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseClient = any;

/** Browser Supabase client cast loose for scheduler queries only. */
function schedulerClient(): LooseClient {
  return createClient() as unknown as LooseClient;
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Resolve vendors -> people. The `vendors` table/columns may not exist in every
 * environment; on ANY error we degrade gracefully to an empty roster rather
 * than failing the whole query.
 */
async function fetchPeople(supabase: LooseClient): Promise<Person[]> {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("id, name, company_name");
    if (error || !data) return [];
    return (data as DbVendor[]).map((v, i) => mapVendor(v, i));
  } catch {
    return [];
  }
}

function latestDue(tasks: DbTask[]): string | null {
  return tasks.reduce<string | null>(
    (acc, t) => (t.due_date && (!acc || t.due_date > acc) ? t.due_date : acc),
    null
  );
}

/* ------------------------------------------------------------------ */
/* Portfolio: all projects + their tasks + people                     */
/* ------------------------------------------------------------------ */

export interface SchedulerPortfolio {
  projects: Project[];
  tasks: Task[];
  people: Person[];
}

async function fetchSchedulerProjects(): Promise<SchedulerPortfolio> {
  const supabase = schedulerClient();

  const { data: projectData, error: projectError } = await supabase
    .from("rehab_projects")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (projectError) throw projectError;

  const projectRows = (projectData ?? []) as DbProject[];
  const projectIds = projectRows.map((p) => p.id);

  let taskRows: DbTask[] = [];
  if (projectIds.length > 0) {
    const { data: taskData, error: taskError } = await supabase
      .from("project_tasks")
      .select("*")
      .in("project_id", projectIds);
    if (taskError) throw taskError;
    taskRows = (taskData ?? []) as DbTask[];
  }

  const maxDueByProject = new Map<string, string | null>();
  for (const t of taskRows) {
    if (!t.due_date) continue;
    const cur = maxDueByProject.get(t.project_id);
    if (!cur || t.due_date > cur) maxDueByProject.set(t.project_id, t.due_date);
  }

  const people = await fetchPeople(supabase);

  return {
    projects: projectRows.map((row, i) =>
      mapProject(row, i, maxDueByProject.get(row.id) ?? null)
    ),
    // deps aren't needed for portfolio metrics — pass empty.
    tasks: taskRows.map((row) => mapTask(row, [])),
    people,
  };
}

export function useSchedulerProjects() {
  return useQuery({
    queryKey: ["scheduler", "projects"],
    queryFn: fetchSchedulerProjects,
  });
}

/* ------------------------------------------------------------------ */
/* Single project: project + phases + tasks + people                  */
/* ------------------------------------------------------------------ */

export interface SchedulerProject {
  project: Project | null;
  phases: Phase[];
  tasks: Task[];
  people: Person[];
}

async function fetchSchedulerProject(
  projectId: string
): Promise<SchedulerProject> {
  const supabase = schedulerClient();

  const [projectRes, phaseRes, taskRes] = await Promise.all([
    supabase
      .from("rehab_projects")
      .select("*")
      .eq("id", projectId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("project_phases")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
  ]);

  if (projectRes.error) throw projectRes.error;
  if (phaseRes.error) throw phaseRes.error;
  if (taskRes.error) throw taskRes.error;

  const projectRow = (projectRes.data ?? null) as DbProject | null;
  const phaseRows = (phaseRes.data ?? []) as DbPhase[];
  const taskRows = (taskRes.data ?? []) as DbTask[];

  // dependencies for these tasks
  const taskIds = taskRows.map((t) => t.id);
  const depsByTask = new Map<string, string[]>();
  if (taskIds.length > 0) {
    const { data: depData, error: depError } = await supabase
      .from("task_dependencies")
      .select("task_id, depends_on_task_id")
      .in("task_id", taskIds);
    if (depError) throw depError;
    for (const d of (depData ?? []) as DbDependency[]) {
      const list = depsByTask.get(d.task_id);
      if (list) list.push(d.depends_on_task_id);
      else depsByTask.set(d.task_id, [d.depends_on_task_id]);
    }
  }

  const phases: Phase[] = phaseRows.map(mapPhase);
  const tasks = taskRows.map((row) => mapTask(row, depsByTask.get(row.id) ?? []));

  // synthesize a trailing "Unphased" phase only if needed
  const unphased = unphasedId(projectId);
  if (tasks.some((t) => t.phaseId === unphased)) {
    const nextOrder = phases.length
      ? Math.max(...phases.map((p) => p.order)) + 1
      : 0;
    phases.push(makeUnphasedPhase(projectId, nextOrder));
  }

  const people = await fetchPeople(supabase);

  return {
    project: projectRow ? mapProject(projectRow, 0, latestDue(taskRows)) : null,
    phases,
    tasks,
    people,
  };
}

export function useSchedulerProject(projectId: string) {
  return useQuery({
    queryKey: ["scheduler", "project", projectId],
    queryFn: () => fetchSchedulerProject(projectId),
    enabled: !!projectId,
  });
}

/* ------------------------------------------------------------------ */
/* Mutations                                                          */
/* ------------------------------------------------------------------ */

interface SetStatusVars {
  taskId: string;
  projectId: string;
  status: TaskStatus;
}

/** Write `project_tasks.status` (with optimistic update + invalidate). */
export function useSetTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: SetStatusVars) => {
      const supabase = schedulerClient();
      const dbStatus = toDbStatus(status);
      const updates: Record<string, unknown> = { status: dbStatus };
      updates.completed_at =
        dbStatus === "done" ? new Date().toISOString() : null;

      const { error } = await supabase
        .from("project_tasks")
        .update(updates)
        .eq("id", taskId);
      if (error) throw error;
    },
    onMutate: async ({ taskId, projectId, status }: SetStatusVars) => {
      const projectKey = ["scheduler", "project", projectId];
      const portfolioKey = ["scheduler", "projects"];
      await Promise.all([
        queryClient.cancelQueries({ queryKey: projectKey }),
        queryClient.cancelQueries({ queryKey: portfolioKey }),
      ]);

      const prevProject = queryClient.getQueryData<SchedulerProject>(projectKey);
      const prevPortfolio =
        queryClient.getQueryData<SchedulerPortfolio>(portfolioKey);

      const patch = (t: Task) => (t.id === taskId ? { ...t, status } : t);

      if (prevProject) {
        queryClient.setQueryData<SchedulerProject>(projectKey, {
          ...prevProject,
          tasks: prevProject.tasks.map(patch),
        });
      }
      if (prevPortfolio) {
        queryClient.setQueryData<SchedulerPortfolio>(portfolioKey, {
          ...prevPortfolio,
          tasks: prevPortfolio.tasks.map(patch),
        });
      }

      return { prevProject, prevPortfolio, projectId };
    },
    onError: (error, { projectId }, context) => {
      if (context?.prevProject) {
        queryClient.setQueryData(
          ["scheduler", "project", projectId],
          context.prevProject
        );
      }
      if (context?.prevPortfolio) {
        queryClient.setQueryData(["scheduler", "projects"], context.prevPortfolio);
      }
      toast.error("Failed to update status", {
        description: (error as Error).message,
      });
    },
    onSettled: (_data, _error, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["scheduler", "project", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["scheduler", "projects"] });
    },
  });
}

interface ShiftDatesVars {
  taskId: string;
  projectId: string;
  /** ISO `yyyy-MM-dd` (or null to clear). */
  startDate: string | null;
  endDate: string | null;
}

/** Write `project_tasks.start_date` / `due_date` (optimistic + invalidate). */
export function useShiftTaskDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, startDate, endDate }: ShiftDatesVars) => {
      const supabase = schedulerClient();
      const { error } = await supabase
        .from("project_tasks")
        .update({ start_date: startDate, due_date: endDate })
        .eq("id", taskId);
      if (error) throw error;
    },
    onMutate: async ({ taskId, projectId, startDate, endDate }: ShiftDatesVars) => {
      const projectKey = ["scheduler", "project", projectId];
      await queryClient.cancelQueries({ queryKey: projectKey });
      const prevProject = queryClient.getQueryData<SchedulerProject>(projectKey);

      if (prevProject) {
        queryClient.setQueryData<SchedulerProject>(projectKey, {
          ...prevProject,
          tasks: prevProject.tasks.map((t) =>
            t.id === taskId
              ? { ...t, startDate: startDate ?? "", endDate: endDate ?? "" }
              : t
          ),
        });
      }

      return { prevProject, projectId };
    },
    onError: (error, { projectId }, context) => {
      if (context?.prevProject) {
        queryClient.setQueryData(
          ["scheduler", "project", projectId],
          context.prevProject
        );
      }
      toast.error("Failed to move task", {
        description: (error as Error).message,
      });
    },
    onSettled: (_data, _error, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["scheduler", "project", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["scheduler", "projects"] });
    },
  });
}
