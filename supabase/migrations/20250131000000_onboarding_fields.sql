-- ============================================================================
-- ONBOARDING FIELDS MIGRATION
-- ============================================================================
-- This migration adds onboarding-related fields to the users table
-- for tracking user preferences and onboarding completion status.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Add onboarding completion tracking
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- Add investor profile fields (collected during onboarding)
-- ---------------------------------------------------------------------------

-- Investor experience level: beginner, experienced, professional
ALTER TABLE users ADD COLUMN IF NOT EXISTS investor_type VARCHAR(50);

-- Primary investment strategy: fix_flip, brrrr, buy_hold, wholesale
ALTER TABLE users ADD COLUMN IF NOT EXISTS investment_strategy VARCHAR(50);

-- Property types the investor focuses on (can be multiple)
-- Values: single_family, multi_family, commercial, mixed
ALTER TABLE users ADD COLUMN IF NOT EXISTS property_types TEXT[];

-- Typical project budget range: under_50k, 50_150k, 150_300k, 300k_plus
ALTER TABLE users ADD COLUMN IF NOT EXISTS typical_budget VARCHAR(50);

-- Number of projects per year: 1_2, 3_5, 6_10, 10_plus
ALTER TABLE users ADD COLUMN IF NOT EXISTS projects_per_year VARCHAR(50);

-- ---------------------------------------------------------------------------
-- Indexes for common queries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_investor_type ON users(investor_type);
CREATE INDEX IF NOT EXISTS idx_users_investment_strategy ON users(investment_strategy);

-- ---------------------------------------------------------------------------
-- Comments for documentation
-- ---------------------------------------------------------------------------
COMMENT ON COLUMN users.onboarding_completed IS 'Whether user has completed the initial onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN users.investor_type IS 'Experience level: beginner, experienced, professional';
COMMENT ON COLUMN users.investment_strategy IS 'Primary strategy: fix_flip, brrrr, buy_hold, wholesale';
COMMENT ON COLUMN users.property_types IS 'Array of property types: single_family, multi_family, commercial, mixed';
COMMENT ON COLUMN users.typical_budget IS 'Budget range: under_50k, 50_150k, 150_300k, 300k_plus';
COMMENT ON COLUMN users.projects_per_year IS 'Project volume: 1_2, 3_5, 6_10, 10_plus';
