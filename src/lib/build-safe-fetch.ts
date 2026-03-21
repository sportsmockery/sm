/**
 * Build-Safe Data Fetching Utility
 *
 * During Vercel builds, external services (Supabase, Datalab, ESPN) may be
 * unreachable or slow, causing static page generation to time out after 60s.
 *
 * This module provides a wrapper that:
 * 1. Detects build-time vs runtime environment
 * 2. Adds a configurable timeout (default 8s) to any async operation
 * 3. Returns a fallback value if the operation times out or fails
 *
 * Usage:
 *   const players = await buildSafeFetch(
 *     () => datalabAdmin.from('bears_players').select('*'),
 *     [],  // fallback: empty array
 *     { timeout: 5000, label: 'bears_players' }
 *   )
 */

/** True when running inside `next build` (Vercel or local) */
export const IS_BUILD_TIME =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.VERCEL_ENV)

/** Default timeout in ms — keep well under Vercel's 60s page gen limit */
const DEFAULT_TIMEOUT_MS = 8_000
const BUILD_TIMEOUT_MS = 5_000

interface BuildSafeFetchOptions {
  /** Timeout in ms (defaults to 8s at runtime, 5s at build) */
  timeout?: number
  /** Label for logging on timeout/error */
  label?: string
}

/**
 * Execute an async operation with timeout protection and fallback.
 * At build time, uses a shorter timeout and silently falls back.
 */
export async function buildSafeFetch<T>(
  fn: () => Promise<T>,
  fallback: T,
  options: BuildSafeFetchOptions = {}
): Promise<T> {
  const defaultTimeout = IS_BUILD_TIME ? BUILD_TIMEOUT_MS : DEFAULT_TIMEOUT_MS
  const timeout = options.timeout ?? defaultTimeout
  const label = options.label ?? 'data fetch'

  try {
    const result = await Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
      ),
    ])
    return result
  } catch (error: any) {
    const phase = IS_BUILD_TIME ? '[BUILD]' : '[RUNTIME]'
    // Only warn-level at build time to avoid noisy logs
    if (IS_BUILD_TIME) {
      console.warn(`${phase} ${label}: using fallback data (${error.message})`)
    } else {
      console.error(`${phase} ${label} failed:`, error.message)
    }
    return fallback
  }
}

/**
 * Wrap a Supabase query with timeout protection.
 * Automatically extracts .data from the response and falls back on error.
 * Accepts PromiseLike to work with Supabase's PostgrestFilterBuilder.
 */
export async function safeDatalabQuery<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: any }>,
  fallback: T,
  label?: string
): Promise<T> {
  return buildSafeFetch(
    async () => {
      const { data, error } = await queryFn()
      if (error) {
        throw new Error(error.message || 'Supabase query error')
      }
      return data ?? fallback
    },
    fallback,
    { label }
  )
}
