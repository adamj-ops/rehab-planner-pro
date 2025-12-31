-- ============================================================================
-- DAILY SITE REPORTS
-- ============================================================================
-- This migration adds the daily site reports table for construction tracking.
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_site_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Report date
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Weather conditions
  weather_conditions VARCHAR(50), -- sunny, cloudy, rainy, snowy, mixed
  temperature_high INT,
  temperature_low INT,
  weather_notes TEXT,
  
  -- Crew information
  crew_count INT DEFAULT 0,
  vendors_on_site UUID[], -- Array of vendor IDs
  
  -- Work summary
  work_completed TEXT,
  work_planned_tomorrow TEXT,
  
  -- Issues and notes
  issues_encountered TEXT,
  safety_incidents TEXT,
  delays TEXT,
  general_notes TEXT,
  
  -- Linked data
  linked_tasks UUID[],   -- Tasks worked on today
  linked_photos UUID[],  -- Photos from today
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, submitted
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one report per project per day
  UNIQUE(project_id, report_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_reports_project ON daily_site_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_site_reports(project_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_site_reports(project_id, status);

-- RLS for daily_site_reports
ALTER TABLE daily_site_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for their projects"
  ON daily_site_reports FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage reports for their projects"
  ON daily_site_reports FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_daily_site_reports_updated_at
  BEFORE UPDATE ON daily_site_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT ALL ON daily_site_reports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_site_reports TO authenticated;

-- ============================================================================
-- REPORT TEMPLATES (for customization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Template configuration
  include_weather BOOLEAN DEFAULT true,
  include_crew BOOLEAN DEFAULT true,
  include_work_summary BOOLEAN DEFAULT true,
  include_issues BOOLEAN DEFAULT true,
  include_safety BOOLEAN DEFAULT true,
  include_photos BOOLEAN DEFAULT true,
  include_tasks BOOLEAN DEFAULT true,
  
  -- Custom fields (JSON array)
  custom_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Default template flag
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for report_templates
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
  ON report_templates FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT ALL ON report_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON report_templates TO authenticated;
