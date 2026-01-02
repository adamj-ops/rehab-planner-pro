export const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

/**
 * Prefix isolates BullMQ keys in Redis (helps prevent collisions between apps/environments).
 */
export const REDIS_PREFIX = process.env.REDIS_PREFIX ?? "rehab-estimator";

/**
 * Timezone for cron-style repeatable jobs. BullMQ uses this when `repeat.tz` is provided.
 */
export const JOB_TZ = process.env.JOB_TZ ?? "UTC";

export const JOB_REMOVE_ON_COMPLETE_AGE_SECONDS = Number(
  process.env.JOB_REMOVE_ON_COMPLETE_AGE_SECONDS ?? 60 * 60 * 24 * 7 // 7 days
);
export const JOB_REMOVE_ON_FAIL_AGE_SECONDS = Number(
  process.env.JOB_REMOVE_ON_FAIL_AGE_SECONDS ?? 60 * 60 * 24 * 30 // 30 days
);

export const JOB_DEFAULT_ATTEMPTS = Number(process.env.JOB_DEFAULT_ATTEMPTS ?? 5);
export const JOB_DEFAULT_BACKOFF_DELAY_MS = Number(
  process.env.JOB_DEFAULT_BACKOFF_DELAY_MS ?? 60_000
);

export const JOB_CONCURRENCY = Number(process.env.JOB_CONCURRENCY ?? 5);

/**
 * Optional: if set, workers will try to persist execution status in Supabase.
 * Uses service role key (RLS bypass) or will no-op.
 */
export const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

