-- Scheduler feature: Project -> Phase -> Task grouping layer.
--
-- Adds a `project_phases` table and three additive, nullable scheduling columns
-- to `project_tasks` so the /scheduler views can group by phase, tag a trade,
-- and roll up estimated cost — without disturbing the existing kanban/task flow.
-- Mirrors the project-scoped RLS + grants + updated_at conventions used by
-- project_tasks (see 20241229000000_workspaces_phase3.sql).

-- 1. Phases ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_phases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  color       VARCHAR(7),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_phases_project
  ON project_phases (project_id, sort_order);

-- 2. Scheduling columns on project_tasks (all additive + nullable) -----------
ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL;
ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS trade VARCHAR(40);
ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2);
CREATE INDEX IF NOT EXISTS idx_project_tasks_phase ON project_tasks (phase_id);

-- 3. Row Level Security (project-scoped, mirrors project_tasks) ---------------
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view phases for their projects" ON project_phases;
CREATE POLICY "Users can view phases for their projects"
  ON project_phases FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM rehab_projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage phases for their projects" ON project_phases;
CREATE POLICY "Users can manage phases for their projects"
  ON project_phases FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM rehab_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM rehab_projects WHERE user_id = auth.uid()));

-- 4. Grants ------------------------------------------------------------------
GRANT ALL ON project_phases TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_phases TO authenticated;

-- 5. updated_at trigger (reuses existing helper) -----------------------------
DROP TRIGGER IF EXISTS update_project_phases_updated_at ON project_phases;
CREATE TRIGGER update_project_phases_updated_at
  BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
