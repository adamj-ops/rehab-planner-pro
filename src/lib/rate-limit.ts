export interface RateLimitConfig {
  /** Maximum requests allowed per window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface Bucket {
  resetAt: number;
  count: number;
}

/**
 * Very small in-memory rate limiter.
 *
 * Notes:
 * - Works per server instance (OK for MVP).
 * - Uses fixed windows, which is predictable and cheap.
 */
export class FixedWindowRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private config: RateLimitConfig) {}

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const existing = this.buckets.get(key);
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const resetAt = windowStart + this.config.windowMs;

    if (!existing || existing.resetAt !== resetAt) {
      const next: Bucket = { resetAt, count: 1 };
      this.buckets.set(key, next);
      return { allowed: true, remaining: this.config.limit - 1, resetAt };
    }

    if (existing.count >= this.config.limit) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    this.buckets.set(key, existing);
    return { allowed: true, remaining: this.config.limit - existing.count, resetAt: existing.resetAt };
  }
}

