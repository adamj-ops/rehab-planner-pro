-- =====================================================================================
-- Project Scenarios for What-If Budget Optimization
-- =====================================================================================

-- Create project_scenarios table
CREATE TABLE IF NOT EXISTS project_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES rehab_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Scenario Parameters
  budget_amount DECIMAL(12,2) NOT NULL,
  priority_strategy TEXT NOT NULL CHECK (
    priority_strategy IN ('maximize_roi', 'fastest_timeline', 'all_must_haves', 'balanced', 'custom')
  ),
  
  -- Results (cached for performance)
  selected_item_ids TEXT[] NOT NULL DEFAULT '{}',
  total_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  timeline_days INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT false, -- Currently applied scenario
  is_baseline BOOLEAN DEFAULT false, -- Original/baseline scenario
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_scenarios_project_id ON project_scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_project_scenarios_active ON project_scenarios(project_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_project_scenarios_baseline ON project_scenarios(project_id, is_baseline) WHERE is_baseline = true;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_project_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_project_scenarios_updated_at ON project_scenarios;
CREATE TRIGGER trigger_project_scenarios_updated_at
  BEFORE UPDATE ON project_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_project_scenarios_updated_at();

-- =====================================================================================
-- Row Level Security (RLS)
-- =====================================================================================

-- Enable RLS
ALTER TABLE project_scenarios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view scenarios for projects they have access to
DROP POLICY IF EXISTS "project_scenarios_select_policy" ON project_scenarios;
CREATE POLICY "project_scenarios_select_policy" ON project_scenarios
  FOR SELECT
  USING (
    project_id IN (
      SELECT rp.id 
      FROM rehab_projects rp 
      WHERE rp.user_id = auth.uid()
    )
  );

-- Policy: Users can insert scenarios for their own projects
DROP POLICY IF EXISTS "project_scenarios_insert_policy" ON project_scenarios;
CREATE POLICY "project_scenarios_insert_policy" ON project_scenarios
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT rp.id 
      FROM rehab_projects rp 
      WHERE rp.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy: Users can update scenarios they created for their own projects
DROP POLICY IF EXISTS "project_scenarios_update_policy" ON project_scenarios;
CREATE POLICY "project_scenarios_update_policy" ON project_scenarios
  FOR UPDATE
  USING (
    project_id IN (
      SELECT rp.id 
      FROM rehab_projects rp 
      WHERE rp.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy: Users can delete scenarios they created for their own projects
DROP POLICY IF EXISTS "project_scenarios_delete_policy" ON project_scenarios;
CREATE POLICY "project_scenarios_delete_policy" ON project_scenarios
  FOR DELETE
  USING (
    project_id IN (
      SELECT rp.id 
      FROM rehab_projects rp 
      WHERE rp.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- =====================================================================================
-- Helper Functions
-- =====================================================================================

-- Function to ensure only one active scenario per project
CREATE OR REPLACE FUNCTION ensure_single_active_scenario()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this scenario as active, deactivate all others for the same project
  IF NEW.is_active = true AND (OLD.is_active IS NULL OR OLD.is_active = false) THEN
    UPDATE project_scenarios 
    SET is_active = false 
    WHERE project_id = NEW.project_id 
      AND id != NEW.id 
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_active_scenario ON project_scenarios;
CREATE TRIGGER trigger_ensure_single_active_scenario
  AFTER UPDATE ON project_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_scenario();

-- =====================================================================================
-- Comments
-- =====================================================================================

COMMENT ON TABLE project_scenarios IS 'Stores budget optimization scenarios for what-if analysis';
COMMENT ON COLUMN project_scenarios.priority_strategy IS 'Strategy used for optimization: maximize_roi, fastest_timeline, all_must_haves, balanced, or custom';
COMMENT ON COLUMN project_scenarios.selected_item_ids IS 'Array of scope item IDs included in this scenario';
COMMENT ON COLUMN project_scenarios.total_value IS 'Cached total priority value score for performance';
COMMENT ON COLUMN project_scenarios.is_active IS 'Whether this scenario is currently applied to the project';
COMMENT ON COLUMN project_scenarios.is_baseline IS 'Whether this is the original baseline scenario';