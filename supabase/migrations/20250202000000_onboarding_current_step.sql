-- ============================================================================
-- ONBOARDING CURRENT STEP MIGRATION
-- ============================================================================
-- This migration adds the onboarding_current_step field to track which step
-- the user was last on, enabling them to resume onboarding from where they left.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Add current step tracking
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 1;

-- ---------------------------------------------------------------------------
-- Add constraint to ensure valid step values (1-6)
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD CONSTRAINT check_onboarding_step 
    CHECK (onboarding_current_step >= 1 AND onboarding_current_step <= 6);

-- ---------------------------------------------------------------------------
-- Indexes for common queries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_onboarding_current_step ON users(onboarding_current_step);

-- ---------------------------------------------------------------------------
-- Comments for documentation
-- ---------------------------------------------------------------------------
COMMENT ON COLUMN users.onboarding_current_step IS 'Last step user was on during onboarding (1-6), enables resume functionality';
