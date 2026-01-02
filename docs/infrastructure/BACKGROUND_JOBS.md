# Background Jobs (BullMQ + Redis)

This repo uses **BullMQ** for background jobs and **Redis** as the queue store.

## Local development

1) Start Redis:

```bash
docker compose -f docker-compose.redis.yml up -d
```

2) (Optional) Register scheduled/repeatable jobs:

```bash
npm run jobs:scheduler
```

3) Run workers (long-lived process):

```bash
npm run jobs:worker
```

4) Smoke test (runs a couple jobs end-to-end):

```bash
npm run jobs:smoke
```

## Configuration

Environment variables:

- `REDIS_URL` (default `redis://127.0.0.1:6379`)
- `REDIS_PREFIX` (default `rehab-estimator`)
- `JOB_TZ` (default `UTC`) – used for cron timezone in repeatable jobs
- `JOB_CONCURRENCY` (default `5`)
- `JOB_DEFAULT_ATTEMPTS` (default `5`)
- `JOB_DEFAULT_BACKOFF_DELAY_MS` (default `60000`) – exponential backoff base delay

Optional Supabase job status persistence (best-effort):

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_KEY`)

When provided, workers upsert job run status into `background_job_runs`.

## Scheduled jobs

Repeatable jobs are registered in `src/server/jobs/scheduler.ts`:

- Daily lease expiration check (8am)
- Monthly rent due reminders (1st of month)
- Daily late fee calculation (1am)
- Monthly security deposit interest calculation
- Daily license expiration check

These handlers are currently **safe stub implementations** until the property-management domain tables exist.

