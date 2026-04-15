/**
 * In-memory rate limiter using sliding window.
 * Works per Vercel serverless function instance — not globally shared,
 * but still effective at reducing abuse from individual clients.
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - windowMs * 2
  for (const [key, entry] of store) {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      store.delete(key)
    }
  }
}

interface RateLimitOptions {
  /** Max requests allowed in the window */
  max: number
  /** Window size in milliseconds (default: 60_000 = 1 minute) */
  windowMs?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
}

/**
 * Check rate limit for a given key (e.g. user ID or IP).
 *
 * Usage:
 * ```ts
 * const result = checkRateLimit(`gm-grade:${userId}`, { max: 10 })
 * if (!result.allowed) {
 *   return NextResponse.json({ error: 'Too many requests' }, {
 *     status: 429,
 *     headers: { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) }
 *   })
 * }
 * ```
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { max, windowMs = 60_000 } = options
  const now = Date.now()

  cleanup(windowMs)

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remove timestamps outside the window
  const cutoff = now - windowMs
  entry.timestamps = entry.timestamps.filter(t => t > cutoff)

  if (entry.timestamps.length >= max) {
    const oldestInWindow = entry.timestamps[0]
    const resetMs = oldestInWindow + windowMs - now
    return { allowed: false, remaining: 0, resetMs }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: max - entry.timestamps.length,
    resetMs: windowMs,
  }
}

/**
 * Extract client IP from Next.js request for rate limiting.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers
  // Vercel sets x-forwarded-for; use first IP (client)
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  return '127.0.0.1'
}
