-- ============================================================================
-- MULTI-PROJECT WORKSPACES + PHASE 3 FOUNDATION
-- ============================================================================
-- This migration adds workspace-style project management with phase-based
-- dashboards, task management, photo documentation, and planning features.
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE rehab_projects WITH WORKSPACE FIELDS
-- ============================================================================

-- Phase tracking (determines which dashboard to show)
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS phase VARCHAR(20) DEFAULT 'planning';
-- Values: 'planning', 'construction', 'paused', 'completed', 'archived'

-- Visual customization for sidebar
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS emoji VARCHAR(10) DEFAULT '🏠';
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS color VARCHAR(7); -- Hex color
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Cached aggregates for sidebar indicators (updated via triggers/app logic)
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS tasks_total INT DEFAULT 0;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS tasks_completed INT DEFAULT 0;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS days_ahead_behind INT DEFAULT 0;

-- Phase transition timestamps
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS planning_started_at TIMESTAMPTZ;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS construction_started_at TIMESTAMPTZ;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Set planning_started_at for existing projects
UPDATE rehab_projects 
SET planning_started_at = created_at 
WHERE planning_started_at IS NULL;

-- Index for phase-based queries
CREATE INDEX IF NOT EXISTS idx_rehab_projects_phase ON rehab_projects(phase);
CREATE INDEX IF NOT EXISTS idx_rehab_projects_user_phase ON rehab_projects(user_id, phase) WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. USER PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Active project selection
  active_project_id UUID REFERENCES rehab_projects(id) ON DELETE SET NULL,
  
  -- Sidebar state
  sidebar_collapsed BOOLEAN DEFAULT false,
  active_section_expanded BOOLEAN DEFAULT true,
  planning_section_expanded BOOLEAN DEFAULT true,
  completed_section_expanded BOOLEAN DEFAULT false,
  
  -- View preferences
  default_task_view VARCHAR(20) DEFAULT 'kanban', -- 'kanban', 'list'
  photo_grid_size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large'
  
  -- Notifications (future)
  daily_report_reminder BOOLEAN DEFAULT true,
  task_deadline_alerts BOOLEAN DEFAULT true,
  budget_alert_threshold INT DEFAULT 90,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT ALL ON user_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;

-- ============================================================================
-- 3. PROJECT MEMBERS (Future-proofing for collaboration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role VARCHAR(20) DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
  
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(project_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);

-- RLS for project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Users can see members of projects they own or are members of
CREATE POLICY "Users can view project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Only project owners can manage members
CREATE POLICY "Owners can manage project members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- Grants
GRANT ALL ON project_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_members TO authenticated;

-- ============================================================================
-- 4. WIZARD PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS wizard_progress (
  project_id UUID PRIMARY KEY REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  last_completed_step INT DEFAULT 0,
  
  step_1_completed BOOLEAN DEFAULT false,
  step_1_completed_at TIMESTAMPTZ,
  
  step_2_completed BOOLEAN DEFAULT false,
  step_2_completed_at TIMESTAMPTZ,
  
  step_3_completed BOOLEAN DEFAULT false,
  step_3_completed_at TIMESTAMPTZ,
  
  step_4_completed BOOLEAN DEFAULT false,
  step_4_completed_at TIMESTAMPTZ,
  
  step_5_completed BOOLEAN DEFAULT false,
  step_5_completed_at TIMESTAMPTZ,
  
  step_6_completed BOOLEAN DEFAULT false,
  step_6_completed_at TIMESTAMPTZ,
  
  step_7_completed BOOLEAN DEFAULT false,
  step_7_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for wizard_progress
ALTER TABLE wizard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view wizard progress for their projects"
  ON wizard_progress FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage wizard progress for their projects"
  ON wizard_progress FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_wizard_progress_updated_at
  BEFORE UPDATE ON wizard_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT ALL ON wizard_progress TO service_role;
GRANT SELECT, INSERT, UPDATE ON wizard_progress TO authenticated;

-- ============================================================================
-- 5. PLANNING NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS planning_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  title VARCHAR(200),
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general', -- 'budget', 'scope', 'contractor', 'permit', 'general'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_planning_notes_project ON planning_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_planning_notes_category ON planning_notes(project_id, category);

-- RLS for planning_notes
ALTER TABLE planning_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view planning notes for their projects"
  ON planning_notes FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage planning notes for their projects"
  ON planning_notes FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_planning_notes_updated_at
  BEFORE UPDATE ON planning_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT ALL ON planning_notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON planning_notes TO authenticated;

-- ============================================================================
-- 6. PROJECT TASKS (Phase 3 MVP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status workflow
  status VARCHAR(20) DEFAULT 'to_do', -- 'to_do', 'in_progress', 'blocked', 'done'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Assignments
  assigned_vendor_id UUID, -- References vendors table (if exists)
  
  -- Linking to scope
  room_id UUID, -- References project_rooms (if exists)
  scope_item_id UUID, -- References scope_items (if exists)
  
  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Ordering
  sort_order INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due ON project_tasks(project_id, due_date) WHERE status != 'done';

-- Task dependencies (join table for many-to-many)
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends ON task_dependencies(depends_on_task_id);

-- RLS for project_tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks for their projects"
  ON project_tasks FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tasks for their projects"
  ON project_tasks FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- RLS for task_dependencies
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task dependencies for their projects"
  ON task_dependencies FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM project_tasks WHERE project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage task dependencies for their projects"
  ON task_dependencies FOR ALL
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM project_tasks WHERE project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT ALL ON project_tasks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_tasks TO authenticated;
GRANT ALL ON task_dependencies TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON task_dependencies TO authenticated;

-- ============================================================================
-- 7. PROJECT PHOTOS (Phase 3 MVP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Storage
  storage_path TEXT NOT NULL, -- e.g., 'project-id/original/photo-id.jpg'
  
  -- Metadata
  room_id UUID, -- References project_rooms (if exists)
  category VARCHAR(20) DEFAULT 'during', -- 'planning', 'before', 'during', 'after', 'issue'
  tags TEXT[], -- ['plumbing', 'master-bath', 'leak']
  caption TEXT,
  
  -- Dates
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Upload info
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- File metadata
  file_size_bytes INT,
  width_px INT,
  height_px INT,
  mime_type VARCHAR(50),
  original_filename TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_photos_project ON project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_category ON project_photos(project_id, category);
CREATE INDEX IF NOT EXISTS idx_project_photos_taken ON project_photos(project_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_photos_tags ON project_photos USING GIN(tags);

-- RLS for project_photos
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos for their projects"
  ON project_photos FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage photos for their projects"
  ON project_photos FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- Grants
GRANT ALL ON project_photos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_photos TO authenticated;

-- ============================================================================
-- 8. ACTIVITY LOG (For activity feed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Activity info
  action VARCHAR(50) NOT NULL, -- 'task_created', 'task_completed', 'photo_uploaded', 'report_filed', etc.
  entity_type VARCHAR(50), -- 'task', 'photo', 'report', 'note'
  entity_id UUID,
  
  -- Actor
  user_id UUID REFERENCES auth.users(id),
  
  -- Details (JSON for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_activity_project ON project_activity(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_activity_action ON project_activity(project_id, action);

-- RLS for project_activity
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity for their projects"
  ON project_activity FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity for their projects"
  ON project_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- Grants
GRANT ALL ON project_activity TO service_role;
GRANT SELECT, INSERT ON project_activity TO authenticated;

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to update project task counts
CREATE OR REPLACE FUNCTION update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the project's task counts
  UPDATE rehab_projects
  SET 
    tasks_total = (SELECT COUNT(*) FROM project_tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)),
    tasks_completed = (SELECT COUNT(*) FROM project_tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'done')
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update counts on task changes
CREATE TRIGGER trigger_update_task_counts
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_task_counts();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
