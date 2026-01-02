-- ============================================================================
-- Add Google Places geocoding fields to rehab_projects
-- ============================================================================

ALTER TABLE rehab_projects
  ADD COLUMN IF NOT EXISTS address_place_id TEXT,
  ADD COLUMN IF NOT EXISTS address_formatted TEXT,
  ADD COLUMN IF NOT EXISTS address_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS address_lng DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_rehab_projects_place_id ON rehab_projects(address_place_id);

