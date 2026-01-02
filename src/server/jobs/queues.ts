import { Queue } from "bullmq";
import {
  JOB_DEFAULT_ATTEMPTS,
  JOB_DEFAULT_BACKOFF_DELAY_MS,
  JOB_REMOVE_ON_COMPLETE_AGE_SECONDS,
  JOB_REMOVE_ON_FAIL_AGE_SECONDS,
  REDIS_PREFIX,
} from "./config";
import { redisConnectionOptions } from "./redis";

export const QUEUE_NAME = {
  Email: "email",
  Notification: "notification",
  Compliance: "compliance",
  Reports: "reports",
} as const;

export type QueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME];

const defaultJobOptions = {
  attempts: JOB_DEFAULT_ATTEMPTS,
  backoff: { type: "exponential" as const, delay: JOB_DEFAULT_BACKOFF_DELAY_MS },
  removeOnComplete: { age: JOB_REMOVE_ON_COMPLETE_AGE_SECONDS },
  removeOnFail: { age: JOB_REMOVE_ON_FAIL_AGE_SECONDS },
};

export const emailQueue = new Queue(QUEUE_NAME.Email, {
  connection: redisConnectionOptions,
  prefix: REDIS_PREFIX,
  defaultJobOptions,
});

export const notificationQueue = new Queue(QUEUE_NAME.Notification, {
  connection: redisConnectionOptions,
  prefix: REDIS_PREFIX,
  defaultJobOptions,
});

export const complianceQueue = new Queue(QUEUE_NAME.Compliance, {
  connection: redisConnectionOptions,
  prefix: REDIS_PREFIX,
  defaultJobOptions,
});

export const reportsQueue = new Queue(QUEUE_NAME.Reports, {
  connection: redisConnectionOptions,
  prefix: REDIS_PREFIX,
  defaultJobOptions,
});

export const allQueues = {
  [QUEUE_NAME.Email]: emailQueue,
  [QUEUE_NAME.Notification]: notificationQueue,
  [QUEUE_NAME.Compliance]: complianceQueue,
  [QUEUE_NAME.Reports]: reportsQueue,
} as const;

