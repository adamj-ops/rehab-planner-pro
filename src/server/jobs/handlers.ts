import type { Job } from "bullmq";
import type { JobName } from "./job-names";

/**
 * NOTE:
 * The Property Management-specific jobs referenced in EPM-6 (leases/rent/late fees)
 * do not yet have backing domain tables in this repo. These handlers are safe no-ops
 * that log and return a structured result so the queue/worker/scheduler can be verified.
 *
 * When the property management schema is added, replace these with real queries + actions.
 */

type HandlerResult = Record<string, unknown>;
type Handler = (job: Job) => Promise<HandlerResult>;

function baseResult(job: Job): HandlerResult {
  return {
    ok: true,
    jobId: job.id,
    jobName: job.name,
    queueName: job.queueName,
    timestamp: new Date().toISOString(),
  };
}

const handlers: Record<JobName, Handler> = {
  "email.send": async (job) => ({
    ...baseResult(job),
    message: "Email queued (stub handler).",
    payload: job.data ?? null,
  }),
  "email.rentDueReminders": async (job) => ({
    ...baseResult(job),
    message: "Rent due reminders processed (stub handler).",
    payload: job.data ?? null,
  }),
  "notification.send": async (job) => ({
    ...baseResult(job),
    message: "Notification sent (stub handler).",
    payload: job.data ?? null,
  }),
  "compliance.dailyLeaseExpirationCheck": async (job) => ({
    ...baseResult(job),
    message: "Lease expiration check completed (stub handler).",
    payload: job.data ?? null,
  }),
  "compliance.dailyLateFeeCalculation": async (job) => ({
    ...baseResult(job),
    message: "Late fees calculated (stub handler).",
    payload: job.data ?? null,
  }),
  "compliance.monthlySecurityDepositInterestCalculation": async (job) => ({
    ...baseResult(job),
    message: "Security deposit interest calculated (stub handler).",
    payload: job.data ?? null,
  }),
  "compliance.dailyLicenseExpirationCheck": async (job) => ({
    ...baseResult(job),
    message: "License expiration check completed (stub handler).",
    payload: job.data ?? null,
  }),
  "reports.generate": async (job) => ({
    ...baseResult(job),
    message: "Report generated (stub handler).",
    payload: job.data ?? null,
  }),
};

export function getJobHandler(jobName: string): Handler | null {
  return (handlers as Record<string, Handler>)[jobName] ?? null;
}

