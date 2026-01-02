import type { RedisOptions } from "ioredis";
import { REDIS_URL } from "./config";

function parseRedisUrl(urlString: string): RedisOptions {
  const url = new URL(urlString);
  const isTls = url.protocol === "rediss:";

  const dbFromPath = url.pathname?.replace("/", "");
  const db =
    dbFromPath && dbFromPath.length > 0 && !Number.isNaN(Number(dbFromPath))
      ? Number(dbFromPath)
      : undefined;

  const port = url.port ? Number(url.port) : 6379;

  const options: RedisOptions = {
    host: url.hostname,
    port,
    username: url.username || undefined,
    password: url.password || undefined,
    db,
    // BullMQ recommends disabling request retry limits to avoid unexpected errors.
    // https://docs.bullmq.io/guide/connections
    maxRetriesPerRequest: null,
  };

  if (isTls) {
    options.tls = {};
  }

  return options;
}

export const redisConnectionOptions: RedisOptions = parseRedisUrl(REDIS_URL);

