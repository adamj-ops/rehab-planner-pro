import { Worker } from "bullmq";
import { JOB_CONCURRENCY, REDIS_PREFIX } from "./config";
import { getJobHandler } from "./handlers";
import { upsertJobRun } from "./job-run-tracker";
import { redisConnectionOptions } from "./redis";
import { QUEUE_NAME, allQueues } from "./queues";

function createWorker(queueName: string) {
  const worker = new Worker(
    queueName,
    async (job) => {
      const handler = getJobHandler(job.name);
      if (!handler) {
        throw new Error(`No handler registered for job name: ${job.name}`);
      }
      return await handler(job);
    },
    {
      connection: redisConnectionOptions,
      prefix: REDIS_PREFIX,
      concurrency: JOB_CONCURRENCY,
    }
  );

  worker.on("active", async (job) => {
    console.log(`[${job.queueName}] active: ${job.name} (${job.id})`);
    await upsertJobRun({ job, status: "active", startedAt: new Date() });
  });

  worker.on("completed", async (job, result) => {
    console.log(`[${job.queueName}] completed: ${job.name} (${job.id})`);
    await upsertJobRun({
      job,
      status: "completed",
      finishedAt: new Date(),
      result,
      error: null,
    });
  });

  worker.on("failed", async (job, err) => {
    if (!job) return;
    console.warn(
      `[${job.queueName}] failed: ${job.name} (${job.id}) attempts=${job.attemptsMade} err=${err?.message}`
    );
    await upsertJobRun({
      job,
      status: "failed",
      finishedAt: new Date(),
      error: err?.message ?? "Unknown error",
    });
  });

  return worker;
}

async function main() {
  // Ensure queues are instantiated early (helps validate Redis connectivity).
  Object.values(allQueues);

  const workers = [
    createWorker(QUEUE_NAME.Email),
    createWorker(QUEUE_NAME.Notification),
    createWorker(QUEUE_NAME.Compliance),
    createWorker(QUEUE_NAME.Reports),
  ];

  await Promise.all(workers.map((w) => w.waitUntilReady()));

  console.log("✅ Workers started:", Object.values(QUEUE_NAME).join(", "));

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 ${signal} received, shutting down workers...`);
    await Promise.allSettled(workers.map((w) => w.close()));
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("❌ Worker bootstrap failed:", err);
  process.exitCode = 1;
});

