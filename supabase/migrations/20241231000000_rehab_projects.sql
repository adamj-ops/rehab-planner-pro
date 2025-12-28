-- ============================================================================
-- REHAB PROJECTS TABLE WITH SOFT DELETE
-- ============================================================================
-- This migration creates the core rehab_projects table that other Phase 2A
-- tables reference. It includes soft delete support via deleted_at column.
-- ============================================================================

-- ============================================================================
-- MAIN TABLE: rehab_projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS rehab_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,

  -- Project Identity
  project_name VARCHAR(200) NOT NULL,

  -- Address Fields
  address_street VARCHAR(200) NOT NULL DEFAULT '',
  address_city VARCHAR(100) NOT NULL DEFAULT '',
  address_state VARCHAR(50) NOT NULL DEFAULT '',
  address_zip VARCHAR(20) NOT NULL DEFAULT '',

  -- Property Details
  square_feet INT,
  year_built INT,
  property_type VARCHAR(50), -- 'single_family', 'multi_family', 'condo', 'townhouse'
  bedrooms INT,
  bathrooms DECIMAL(3,1),

  -- Investment Strategy
  investment_strategy VARCHAR(50), -- 'flip', 'rental', 'brrrr', 'airbnb', 'wholetail'
  target_buyer VARCHAR(50), -- 'first_time', 'move_up', 'investor', 'luxury'
  hold_period_months INT,
  target_roi DECIMAL(5,2),
  max_budget DECIMAL(12,2),

  -- Market Context
  arv DECIMAL(12,2), -- After Repair Value
  purchase_price DECIMAL(12,2),
  neighborhood_comp_avg DECIMAL(12,2),

  -- Status & Scoring
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'in_progress', 'completed', 'on_hold', 'archived'
  total_estimated_cost DECIMAL(12,2),
  total_actual_cost DECIMAL(12,2),
  estimated_days INT,
  priority_score DECIMAL(5,2),
  roi_score DECIMAL(5,2),

  -- Soft Delete
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User lookup (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_rehab_projects_user ON rehab_projects(user_id);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_rehab_projects_status ON rehab_projects(status);

-- Soft delete filter (most queries exclude deleted)
CREATE INDEX IF NOT EXISTS idx_rehab_projects_not_deleted ON rehab_projects(deleted_at) WHERE deleted_at IS NULL;

-- Strategy filtering
CREATE INDEX IF NOT EXISTS idx_rehab_projects_strategy ON rehab_projects(investment_strategy);

-- Sorting by updated
CREATE INDEX IF NOT EXISTS idx_rehab_projects_updated ON rehab_projects(updated_at DESC);

-- Combined user + not deleted (common query pattern)
CREATE INDEX IF NOT EXISTS idx_rehab_projects_user_active ON rehab_projects(user_id, deleted_at) WHERE deleted_at IS NULL;

-- Full text search on project name and address
CREATE INDEX IF NOT EXISTS idx_rehab_projects_search ON rehab_projects
  USING GIN (to_tsvector('english', COALESCE(project_name, '') || ' ' || COALESCE(address_street, '') || ' ' || COALESCE(address_city, '') || ' ' || COALESCE(address_state, '') || ' ' || COALESCE(address_zip, '')));

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

CREATE TRIGGER update_rehab_projects_updated_at
  BEFORE UPDATE ON rehab_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE rehab_projects ENABLE ROW LEVEL SECURITY;

-- Users can only view their own non-deleted projects
CREATE POLICY "Users can view their own active projects"
  ON rehab_projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Users can view their own deleted projects (for restore functionality)
CREATE POLICY "Users can view their own deleted projects"
  ON rehab_projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NOT NULL);

-- Users can insert their own projects
CREATE POLICY "Users can insert their own projects"
  ON rehab_projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own projects (including soft delete)
CREATE POLICY "Users can update their own projects"
  ON rehab_projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can hard delete their own projects (if needed)
CREATE POLICY "Users can delete their own projects"
  ON rehab_projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON rehab_projects TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON rehab_projects TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
