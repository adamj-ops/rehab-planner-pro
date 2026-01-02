import { QueueEvents, Worker } from "bullmq";
import { REDIS_PREFIX } from "./config";
import { EmailJobName, ReportsJobName } from "./job-names";
import { getJobHandler } from "./handlers";
import { redisConnectionOptions } from "./redis";
import { emailQueue, reportsQueue } from "./queues";

async function withWorker(queueName: string) {
  const worker = new Worker(
    queueName,
    async (job) => {
      const handler = getJobHandler(job.name);
      if (!handler) throw new Error(`No handler for job name: ${job.name}`);
      return handler(job);
    },
    { connection: redisConnectionOptions, prefix: REDIS_PREFIX, concurrency: 2 }
  );
  await worker.waitUntilReady();
  return worker;
}

async function main() {
  const emailWorker = await withWorker("email");
  const reportsWorker = await withWorker("reports");
  const emailEvents = new QueueEvents("email", {
    connection: redisConnectionOptions,
    prefix: REDIS_PREFIX,
  });
  const reportsEvents = new QueueEvents("reports", {
    connection: redisConnectionOptions,
    prefix: REDIS_PREFIX,
  });
  await Promise.all([emailEvents.waitUntilReady(), reportsEvents.waitUntilReady()]);

  const emailJob = await emailQueue.add(EmailJobName.Send, {
    to: "test@example.com",
    subject: "BullMQ smoke test",
  });
  const reportJob = await reportsQueue.add(ReportsJobName.Generate, {
    reportType: "smoke",
  });

  const emailResult = await emailJob.waitUntilFinished(emailEvents);
  const reportResult = await reportJob.waitUntilFinished(reportsEvents);

  console.log("✅ Smoke test results:", { emailResult, reportResult });

  await Promise.allSettled([
    emailWorker.close(),
    reportsWorker.close(),
    emailEvents.close(),
    reportsEvents.close(),
    emailQueue.close(),
    reportsQueue.close(),
  ]);

  // BullMQ can keep Redis handles open in edge cases; force exit for a deterministic smoke run.
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ Smoke test failed:", err);
  await Promise.allSettled([emailQueue.close(), reportsQueue.close()]);
  process.exit(1);
});

