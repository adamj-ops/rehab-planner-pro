-- Background job run tracking (BullMQ)
-- This is intentionally server-only: RLS enabled with no policies.

CREATE TABLE IF NOT EXISTS background_job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bullmq_job_id TEXT NOT NULL,
  queue_name TEXT NOT NULL,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'completed', 'failed')),
  attempts_made INTEGER NOT NULL DEFAULT 0,
  payload JSONB,
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS background_job_runs_bullmq_job_id_key
  ON background_job_runs (bullmq_job_id);

CREATE INDEX IF NOT EXISTS background_job_runs_queue_idx
  ON background_job_runs (queue_name);

CREATE INDEX IF NOT EXISTS background_job_runs_status_idx
  ON background_job_runs (status);

ALTER TABLE background_job_runs ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at (reuses update_updated_at_column() if present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_background_job_runs_updated_at'
  ) THEN
    CREATE TRIGGER update_background_job_runs_updated_at
    BEFORE UPDATE ON background_job_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

