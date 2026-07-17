/**
 * Local row types for the Supabase tables the scheduler reads.
 *
 * The generated `@/types/supabase` does NOT yet include `project_phases` or the
 * additive `phase_id` / `trade` / `estimated_cost` columns on `project_tasks`
 * (added by 20260716000000_scheduler_phases.sql). Rather than rely on the typed
 * client for those, we type the query results here and cast the client where it
 * rejects the new table/columns (see `use-scheduler.ts`).
 */

/** Row from `rehab_projects` (subset the scheduler reads). */
export interface DbProject {
  id: string;
  project_name: string;
  address_formatted: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  status: string | null;
  phase: string | null;
  max_budget: number | null;
  total_estimated_cost: number | null;
  total_actual_cost: number | null;
  estimated_days: number | null;
  color: string | null;
  planning_started_at: string | null;
  construction_started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  user_id: string;
}

/** Row from `project_tasks`, including the new scheduler columns. */
export interface DbTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  assigned_vendor_id: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  /** new columns — not in generated types yet */
  phase_id: string | null;
  trade: string | null;
  estimated_cost: number | null;
}

/** Row from the new `project_phases` table. */
export interface DbPhase {
  id: string;
  project_id: string;
  name: string;
  sort_order: number | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Row from `task_dependencies`. */
export interface DbDependency {
  task_id: string;
  depends_on_task_id: string;
}

/** Row from `vendors` (only the columns needed to build a Person). */
export interface DbVendor {
  id: string;
  name: string | null;
  company_name: string | null;
}
