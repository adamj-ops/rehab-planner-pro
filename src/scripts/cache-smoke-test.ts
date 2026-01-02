import assert from 'node:assert/strict'

import {
  CACHE_TTL_SECONDS,
  cacheDel,
  cacheGetJson,
  cacheKeys,
  cacheSetJson,
  getCacheMetrics,
  invalidateDealsCache,
  invalidateSearchCache,
  isRedisCacheEnabled,
} from '../server/cache'

async function main() {
  if (!isRedisCacheEnabled()) {
    // Don’t fail CI/dev if Redis isn’t configured in this environment.
    console.log('Redis cache not enabled; skipping cache smoke test.')
    return
  }

  // Basic hit/miss/set/del lifecycle
  const key = cacheKeys.searchResults({ userId: 'smoke-user', scope: 'smoke', query: { a: 1 } })
  await cacheDel(key)

  const miss = await cacheGetJson<{ ok: boolean }>(key)
  assert.equal(miss, undefined)

  await cacheSetJson(key, { ok: true }, 30)
  const hit = await cacheGetJson<{ ok: boolean }>(key)
  assert.deepEqual(hit, { ok: true })

  await cacheDel(key)
  const afterDel = await cacheGetJson<{ ok: boolean }>(key)
  assert.equal(afterDel, undefined)

  // Invalidation helpers (pattern + direct keys)
  const dealsListKey = cacheKeys.dealsList('smoke-user')
  const dealKey = cacheKeys.dealById('smoke-user', 'deal-123')

  await cacheSetJson(dealsListKey, [{ id: 'deal-123' }], CACHE_TTL_SECONDS.PROPERTY_LISTS)
  await cacheSetJson(dealKey, { id: 'deal-123' }, CACHE_TTL_SECONDS.PROPERTY_LISTS)
  await invalidateDealsCache('smoke-user', 'deal-123')

  assert.equal(await cacheGetJson(dealsListKey), undefined)
  assert.equal(await cacheGetJson(dealKey), undefined)

  const vendorKey = cacheKeys.searchResults({ userId: 'smoke-user', scope: 'vendors', query: {} })
  await cacheSetJson(vendorKey, [{ id: 'v1' }], CACHE_TTL_SECONDS.SEARCH_RESULTS)
  await invalidateSearchCache('smoke-user', 'vendors')
  assert.equal(await cacheGetJson(vendorKey), undefined)

  const metrics = await getCacheMetrics()
  assert.ok(metrics.hits >= 0 && metrics.misses >= 0)

  console.log('Cache smoke test passed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

