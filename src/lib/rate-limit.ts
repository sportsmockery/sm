/**
 * Centralized rate limiting utility for API routes.
 *
 * Uses Upstash Redis for persistent, cross-instance rate limiting on Vercel serverless.
 * Falls back to in-memory Map when Redis is not configured (local development).
 *
 * Required env vars for production:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Redis client — lazy singleton
// ---------------------------------------------------------------------------

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

// ---------------------------------------------------------------------------
// In-memory fallback for when Redis is not configured (dev / CI)
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number // ms until reset
}

function memoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxRequests - 1, reset: windowMs }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, reset: entry.resetAt - now }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count, reset: entry.resetAt - now }
}

// Periodic cleanup of expired entries (every 5 minutes, max 1000 entries)
let lastCleanup = 0
function cleanupMemoryStore() {
  const now = Date.now()
  if (now - lastCleanup < 300_000) return
  lastCleanup = now
  for (const [key, entry] of memoryStore) {
    if (now >= entry.resetAt) memoryStore.delete(key)
  }
  // Hard cap to prevent unbounded growth
  if (memoryStore.size > 1000) {
    const keys = [...memoryStore.keys()]
    for (let i = 0; i < keys.length - 500; i++) {
      memoryStore.delete(keys[i])
    }
  }
}

// ---------------------------------------------------------------------------
// Pre-built rate limiters for common use cases
// ---------------------------------------------------------------------------

// Cache Upstash Ratelimit instances by prefix so we don't recreate them
const upstashLimiters = new Map<string, Ratelimit>()

function getUpstashLimiter(prefix: string, maxRequests: number, windowSec: number): Ratelimit | null {
  const r = getRedis()
  if (!r) return null

  const cacheKey = `${prefix}:${maxRequests}:${windowSec}`
  let limiter = upstashLimiters.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
      prefix: `rl:${prefix}`,
      analytics: false,
    })
    upstashLimiters.set(cacheKey, limiter)
  }
  return limiter
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CheckRateLimitOptions {
  /** Unique prefix for this limiter (e.g., 'fan-chat-ai', 'scout-track') */
  prefix: string
  /** The key to rate limit on (e.g., user ID, IP address) */
  key: string
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Window duration in seconds */
  windowSeconds: number
}

/**
 * Check rate limit for a given key. Returns { success, remaining, reset }.
 * Uses Upstash Redis in production, in-memory fallback in development.
 */
export async function checkRateLimitRedis(
  opts: CheckRateLimitOptions,
): Promise<RateLimitResult> {
  const { prefix, key, maxRequests, windowSeconds } = opts

  // Try Upstash first
  const limiter = getUpstashLimiter(prefix, maxRequests, windowSeconds)
  if (limiter) {
    try {
      const result = await limiter.limit(key)
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset - Date.now(),
      }
    } catch (err) {
      // Redis error — fall through to in-memory so requests aren't blocked
      console.error(`[RateLimit] Redis error for ${prefix}:${key}, falling back to memory:`, err)
    }
  }

  // In-memory fallback
  cleanupMemoryStore()
  return memoryRateLimit(`${prefix}:${key}`, maxRequests, windowSeconds * 1000)
}

/**
 * Extract client IP from request for use as rate limit key.
 */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  const real = request.headers.get('x-real-ip')
  return forwarded || real || 'unknown'
}

/**
 * Check if Redis is configured (useful for /admin/security status checks).
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
