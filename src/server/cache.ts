import crypto from 'node:crypto'
import { createClient, type RedisClientType } from 'redis'

/**
 * Redis-backed cache service.
 *
 * - Cache-aside pattern via `withCache()`
 * - Consistent key structure via `cacheKeys`
 * - TTL constants aligned to Linear EPM-5 acceptance criteria
 * - Hit/miss metrics stored in Redis (hash counters)
 * - Invalidation helpers (single key + pattern/prefix scanning)
 *
 * Notes:
 * - Requires Node.js runtime (not Next.js Edge runtime).
 * - Expects Redis URL in `REDIS_CACHE_URL` or `REDIS_URL`.
 * - Use a separate Redis DB/instance for caching vs background jobs.
 */

// ============================================================================
// CONFIG
// ============================================================================

export const CACHE_TTL_SECONDS = {
  /** Portfolio metrics (5 min TTL) */
  PORTFOLIO_METRICS: 5 * 60,
  /** Property lists (2 min TTL) */
  PROPERTY_LISTS: 2 * 60,
  /** Search results (1 min TTL) */
  SEARCH_RESULTS: 60,
  /** Computed fields (occupancy, balances, etc.) (1 hour TTL) */
  COMPUTED_FIELDS: 60 * 60,
} as const

const KEY_PREFIX = process.env.REDIS_CACHE_KEY_PREFIX?.trim() || 'epm:cache:v1'
const METRICS_KEY = `${KEY_PREFIX}:metrics`

function getRedisUrl(): string | undefined {
  const url = process.env.REDIS_CACHE_URL || process.env.REDIS_URL
  return url?.trim() ? url.trim() : undefined
}

export function isRedisCacheEnabled(): boolean {
  if (process.env.REDIS_CACHE_DISABLED === '1') return false
  // Edge runtime cannot use TCP-based Redis clients.
  if ((process.env.NEXT_RUNTIME || '').toLowerCase() === 'edge') return false
  return Boolean(getRedisUrl())
}

// ============================================================================
// INTERNAL: stable stringify + hashing for key parts
// ============================================================================

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>()

  const normalize = (v: unknown): unknown => {
    if (!v || typeof v !== 'object') return v
    if (seen.has(v as object)) return '[Circular]'
    seen.add(v as object)

    if (Array.isArray(v)) return v.map(normalize)

    const obj = v as Record<string, unknown>
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalize(obj[key])
        return acc
      }, {})
  }

  return JSON.stringify(normalize(value))
}

function hashObject(value: unknown): string {
  const str = stableStringify(value)
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 32)
}

// ============================================================================
// KEY STRUCTURE
// ============================================================================

export const cacheKeys = {
  /** Portfolio metrics (per-user) */
  portfolioMetrics: (userId: string) => `${KEY_PREFIX}:portfolio:metrics:user:${userId}`,

  /** “Property list” equivalents used in this codebase */
  dealsList: (userId: string) => `${KEY_PREFIX}:properties:list:deals:user:${userId}`,
  rehabProjectsList: (userId: string) => `${KEY_PREFIX}:properties:list:rehab-projects:user:${userId}`,

  /** Single record caches */
  dealById: (userId: string, id: string) => `${KEY_PREFIX}:properties:item:deal:user:${userId}:id:${id}`,
  rehabProjectById: (userId: string, id: string) =>
    `${KEY_PREFIX}:properties:item:rehab-project:user:${userId}:id:${id}`,

  /** Search results (scoped, per-user) */
  searchResults: (args: { userId: string; scope: string; query: Record<string, unknown> }) =>
    `${KEY_PREFIX}:search:${args.scope}:user:${args.userId}:q:${hashObject(args.query)}`,

  /** Computed fields (scoped, keyed by inputs) */
  computed: (args: { scope: string; entityId: string; inputs: unknown }) =>
    `${KEY_PREFIX}:computed:${args.scope}:id:${args.entityId}:v:${hashObject(args.inputs)}`,
} as const

// ============================================================================
// REDIS CLIENT (singleton)
// ============================================================================

type GlobalWithRedis = typeof globalThis & {
  __redisCacheClient?: RedisClientType
  __redisCacheClientPromise?: Promise<RedisClientType>
}

async function getRedisClient(): Promise<RedisClientType> {
  const g = globalThis as GlobalWithRedis

  if (g.__redisCacheClient && g.__redisCacheClient.isOpen) return g.__redisCacheClient
  if (g.__redisCacheClientPromise) return g.__redisCacheClientPromise

  const url = getRedisUrl()
  if (!url) {
    throw new Error('Redis cache is not configured (missing REDIS_CACHE_URL/REDIS_URL).')
  }

  g.__redisCacheClientPromise = (async () => {
    const client = createClient({ url })
    client.on('error', async (err) => {
      // Avoid throwing in event handler; record for diagnostics.
      try {
        if (client.isOpen) {
          await client.hSet(METRICS_KEY, {
            last_error: String(err instanceof Error ? err.message : err),
            last_error_at: new Date().toISOString(),
          })
          await client.hIncrBy(METRICS_KEY, 'errors', 1)
        }
      } catch {
        // ignore
      }
    })
    if (!client.isOpen) await client.connect()
    g.__redisCacheClient = client
    return client
  })()

  try {
    return await g.__redisCacheClientPromise
  } finally {
    g.__redisCacheClientPromise = undefined
  }
}

// ============================================================================
// METRICS
// ============================================================================

async function incrMetric(field: string, by = 1): Promise<void> {
  if (!isRedisCacheEnabled()) return
  const client = await getRedisClient()
  await client.hIncrBy(METRICS_KEY, field, by)
}

export async function getCacheMetrics(): Promise<{
  hits: number
  misses: number
  sets: number
  dels: number
  errors: number
  hitRate: number
  lastError?: string
  lastErrorAt?: string
}> {
  if (!isRedisCacheEnabled()) {
    return { hits: 0, misses: 0, sets: 0, dels: 0, errors: 0, hitRate: 0 }
  }

  const client = await getRedisClient()
  const raw = await client.hGetAll(METRICS_KEY)

  const hits = Number(raw.hits || 0)
  const misses = Number(raw.misses || 0)
  const sets = Number(raw.sets || 0)
  const dels = Number(raw.dels || 0)
  const errors = Number(raw.errors || 0)
  const denom = hits + misses
  const hitRate = denom > 0 ? hits / denom : 0

  return {
    hits,
    misses,
    sets,
    dels,
    errors,
    hitRate,
    lastError: raw.last_error || undefined,
    lastErrorAt: raw.last_error_at || undefined,
  }
}

// ============================================================================
// CACHE PRIMITIVES
// ============================================================================

function safeJsonParse<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export async function cacheGetJson<T>(key: string): Promise<T | undefined> {
  if (!isRedisCacheEnabled()) return undefined
  const client = await getRedisClient()

  const raw = await client.get(key)
  if (!raw) {
    await incrMetric('misses')
    return undefined
  }

  const parsed = safeJsonParse<T>(raw)
  if (parsed === undefined) {
    // Treat parse failure as miss so we fall back to recompute.
    await incrMetric('misses')
    return undefined
  }

  await incrMetric('hits')
  return parsed
}

export async function cacheSetJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!isRedisCacheEnabled()) return
  const client = await getRedisClient()
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds })
  await incrMetric('sets')
}

export async function cacheDel(keys: string | string[]): Promise<number> {
  if (!isRedisCacheEnabled()) return 0
  const client = await getRedisClient()
  const arr = Array.isArray(keys) ? keys : [keys]
  if (arr.length === 0) return 0
  const count = await client.del(arr)
  if (count > 0) await incrMetric('dels', count)
  return count
}

/**
 * Delete keys using SCAN + MATCH pattern.
 * Prefer narrow patterns (e.g., per-user prefixes).
 */
export async function cacheDelByPattern(pattern: string): Promise<number> {
  if (!isRedisCacheEnabled()) return 0
  const client = await getRedisClient()

  const batch: string[] = []
  let deleted = 0

  for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 500 })) {
    batch.push(String(key))
    if (batch.length >= 500) {
      deleted += await client.del(batch)
      batch.length = 0
    }
  }

  if (batch.length > 0) deleted += await client.del(batch)
  if (deleted > 0) await incrMetric('dels', deleted)
  return deleted
}

// ============================================================================
// CACHE-ASIDE
// ============================================================================

export async function withCache<T>(args: {
  key: string
  ttlSeconds: number
  loader: () => Promise<T>
}): Promise<T> {
  const cached = await cacheGetJson<T>(args.key)
  if (cached !== undefined) return cached

  const fresh = await args.loader()
  await cacheSetJson(args.key, fresh, args.ttlSeconds)
  return fresh
}

/**
 * “Warm” a cache entry: compute + set only if missing.
 */
export async function warmCache<T>(args: {
  key: string
  ttlSeconds: number
  loader: () => Promise<T>
}): Promise<{ warmed: boolean }> {
  const existing = await cacheGetJson<T>(args.key)
  if (existing !== undefined) return { warmed: false }
  const fresh = await args.loader()
  await cacheSetJson(args.key, fresh, args.ttlSeconds)
  return { warmed: true }
}

// ============================================================================
// INVALIDATION HELPERS
// ============================================================================

export async function invalidateDealsCache(userId: string, dealId?: string): Promise<void> {
  const keys: string[] = [cacheKeys.dealsList(userId)]
  if (dealId) keys.push(cacheKeys.dealById(userId, dealId))
  await cacheDel(keys)
}

export async function invalidateRehabProjectsCache(userId: string, projectId?: string): Promise<void> {
  const keys: string[] = [cacheKeys.rehabProjectsList(userId)]
  if (projectId) keys.push(cacheKeys.rehabProjectById(userId, projectId))
  await cacheDel(keys)
}

export async function invalidateSearchCache(userId: string, scope?: string): Promise<void> {
  if (!scope) {
    await cacheDelByPattern(`${KEY_PREFIX}:search:*:user:${userId}:q:*`)
    return
  }
  await cacheDelByPattern(`${KEY_PREFIX}:search:${scope}:user:${userId}:q:*`)
}

export async function invalidateComputedCache(scope: string, entityId?: string): Promise<void> {
  if (entityId) {
    await cacheDelByPattern(`${KEY_PREFIX}:computed:${scope}:id:${entityId}:v:*`)
    return
  }
  await cacheDelByPattern(`${KEY_PREFIX}:computed:${scope}:id:*:v:*`)
}

