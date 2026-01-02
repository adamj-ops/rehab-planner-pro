import { createClient } from "@supabase/supabase-js";
import type { Job } from "bullmq";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./config";

type JobRunStatus = "waiting" | "active" | "completed" | "failed";

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Best-effort persistence of job run status.
 * If credentials are missing, this becomes a no-op (workers still function).
 */
export async function upsertJobRun(params: {
  job: Job;
  status: JobRunStatus;
  startedAt?: Date;
  finishedAt?: Date;
  result?: unknown;
  error?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { job, status, startedAt, finishedAt, result, error } = params;

  const payload = {
    bullmq_job_id: String(job.id),
    queue_name: job.queueName,
    job_name: job.name,
    status,
    attempts_made: job.attemptsMade ?? 0,
    payload: job.data ?? null,
    result: result ?? null,
    error: error ?? null,
    started_at: startedAt?.toISOString() ?? null,
    finished_at: finishedAt?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("background_job_runs")
    .upsert(payload, { onConflict: "bullmq_job_id" });

  if (upsertError) {
    // Never crash the worker due to tracking failures.
    console.warn("Job run tracking upsert failed:", upsertError.message);
  }
}

