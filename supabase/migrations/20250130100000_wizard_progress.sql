-- ============================================================================
-- Wizard Progress Tracking Migration
-- Adds columns to rehab_projects for tracking wizard state and persistence
-- ============================================================================

-- Add wizard progress columns to rehab_projects
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS wizard_current_step INTEGER DEFAULT 1;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS wizard_completed_steps INTEGER[] DEFAULT '{}';
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS wizard_draft_data JSONB DEFAULT '{}';
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS wizard_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS wizard_completed_at TIMESTAMP WITH TIME ZONE;

-- Add project status column if not exists
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_rehab_projects_status ON rehab_projects(status);
CREATE INDEX IF NOT EXISTS idx_rehab_projects_user_status ON rehab_projects(user_id, status);

-- Comment on columns for documentation
COMMENT ON COLUMN rehab_projects.wizard_current_step IS 'Current step number in the wizard (1-7)';
COMMENT ON COLUMN rehab_projects.wizard_completed_steps IS 'Array of step numbers that have been completed';
COMMENT ON COLUMN rehab_projects.wizard_draft_data IS 'JSONB blob containing partial form data for each step';
COMMENT ON COLUMN rehab_projects.wizard_started_at IS 'Timestamp when wizard was first started';
COMMENT ON COLUMN rehab_projects.wizard_completed_at IS 'Timestamp when wizard was completed and project moved to planning/active';
COMMENT ON COLUMN rehab_projects.status IS 'Project status: draft, planning, active, paused, completed, archived';

-- Add constraint for valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rehab_projects_status_check'
    ) THEN
        ALTER TABLE rehab_projects 
        ADD CONSTRAINT rehab_projects_status_check 
        CHECK (status IN ('draft', 'planning', 'active', 'paused', 'completed', 'archived'));
    END IF;
END $$;

-- Create or update trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_rehab_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_rehab_projects_updated_at'
    ) THEN
        CREATE TRIGGER set_rehab_projects_updated_at
        BEFORE UPDATE ON rehab_projects
        FOR EACH ROW
        EXECUTE FUNCTION update_rehab_projects_updated_at();
    END IF;
END $$;
