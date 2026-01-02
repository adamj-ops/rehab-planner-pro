# CI/CD (GitHub Actions + Vercel + Supabase)

This repo uses GitHub Actions for CI and deployment.

## Workflows

- **CI**: `.github/workflows/ci.yml`
  - Runs on `pull_request` and pushes to `main`
  - Runs `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:integration`
  - Note: `typecheck` is currently **non-blocking** in CI while existing type errors are being addressed.

- **Deploy**: `.github/workflows/deploy.yml`
  - **Staging**: auto on push to `main` (i.e., PR merge)
  - **Production**: manual via *Run workflow* (uses GitHub **Environment** protection)
  - **Rollback**: manual via *Run workflow* (requires a Vercel deployment id/url)

## Required secrets / variables

### GitHub Environments

Create two GitHub Environments:

- `staging` (no approval required)
- `production` (configure required reviewers for manual approval)

### Vercel (deploy)

Add these as **Environment secrets** (recommended) or repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Optional environment variable (Environment **variable**):

- `STAGING_DOMAIN` (e.g. `staging.example.com`)  
  If set, the deploy job will alias the preview deployment to this domain.

### Supabase (migrations)

Optional (but recommended) as **Environment secrets**:

- `SUPABASE_DB_URL` (Postgres connection string for the target environment)

If `SUPABASE_DB_URL` is set, deployments run:

- `supabase migration up --db-url "$SUPABASE_DB_URL"`

### Slack (notifications)

Optional as **Environment secrets**:

- `SLACK_WEBHOOK_URL` (Incoming webhook)

## Notes

- CI uses dummy values for `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` to prevent runtime crashes during build/tests. For production deployments, Vercel should supply real values through its environment configuration.
- Backend deployment (Railway/Render) is not configured in this repo yet. When a backend service is added, we can extend `deploy.yml` with a `deploy_backend` job.

