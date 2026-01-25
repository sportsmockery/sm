/**
 * Frontend Error Logging Utility
 *
 * Logs errors to the shared scout_errors table in Supabase.
 * Use this for ALL frontend errors - Scout AI, API calls, data fetching, etc.
 *
 * Usage:
 * ```typescript
 * import { logFrontendError, getErrorType } from '@/lib/scoutErrorLogger'
 *
 * try {
 *   const response = await fetch('/api/endpoint')
 *   // ...
 * } catch (error) {
 *   await logFrontendError({
 *     errorType: getErrorType(error),
 *     errorMessage: error instanceof Error ? error.message : String(error),
 *     userQuery: query,
 *     responseTimeMs: Date.now() - startTime,
 *   })
 * }
 * ```
 */

import { datalabAdmin } from './supabase-datalab'

export type FrontendErrorType = 'timeout' | 'cors' | 'parse' | 'network' | 'api' | 'unknown'

export interface LogErrorParams {
  /** Type of error - use getErrorType() helper if unsure */
  errorType: FrontendErrorType
  /** The actual error message */
  errorMessage: string
  /** What the user was trying to do (query text, action, etc.) */
  userQuery?: string
  /** Session ID if available (e.g., Scout session) */
  sessionId?: string
  /** How long the request took in milliseconds */
  responseTimeMs?: number
  /** The request payload that was sent */
  requestPayload?: Record<string, unknown>
  /** The response received (if any) */
  responsePayload?: Record<string, unknown>
  /** Any additional context */
  metadata?: Record<string, unknown>
}

/**
 * Log a frontend error to the scout_errors table.
 * This function never throws - error logging should never break the app.
 */
export async function logFrontendError(params: LogErrorParams): Promise<void> {
  try {
    if (!datalabAdmin) {
      console.error('[Error Logger] Supabase client not available')
      return
    }

    const { error } = await datalabAdmin.from('scout_errors').insert({
      source: 'frontend',
      error_type: params.errorType,
      error_message: params.errorMessage,
      user_query: params.userQuery || null,
      session_id: params.sessionId || null,
      response_time_ms: params.responseTimeMs || null,
      request_payload: params.requestPayload || null,
      response_payload: params.responsePayload || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      metadata: params.metadata || null,
    })

    if (error) {
      console.error('[Error Logger] Failed to log error:', error.message)
    }
  } catch (e) {
    // Never throw from error logging
    console.error('[Error Logger] Exception:', e instanceof Error ? e.message : String(e))
  }
}

/**
 * Determine the error type from an error object.
 * Use this helper when you're not sure what type of error occurred.
 */
export function getErrorType(error: unknown): FrontendErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Timeout errors
    if (message.includes('timeout') || message.includes('aborted') || message.includes('timed out')) {
      return 'timeout'
    }

    // CORS errors
    if (message.includes('cors') || message.includes('cross-origin')) {
      return 'cors'
    }

    // Parse errors (JSON, etc.)
    if (message.includes('json') || message.includes('parse') || message.includes('unexpected token')) {
      return 'parse'
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return 'network'
    }

    // Check for HTTP status codes in error message
    if (/\b(4\d{2}|5\d{2})\b/.test(message)) {
      return 'api'
    }
  }

  // Check if it's a Response object (for fetch errors)
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status
    if (status >= 400) {
      return 'api'
    }
  }

  return 'unknown'
}

/**
 * Helper to create a standardized error logging wrapper for async functions.
 *
 * Usage:
 * ```typescript
 * const fetchWithLogging = withErrorLogging(
 *   async (query: string) => {
 *     const response = await fetch('/api/endpoint', { body: JSON.stringify({ query }) })
 *     return response.json()
 *   },
 *   (query) => ({ userQuery: query })
 * )
 * ```
 */
export function withErrorLogging<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  getLogParams?: (...args: TArgs) => Partial<LogErrorParams>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const startTime = Date.now()

    try {
      return await fn(...args)
    } catch (error) {
      const responseTimeMs = Date.now() - startTime
      const additionalParams = getLogParams?.(...args) || {}

      await logFrontendError({
        errorType: getErrorType(error),
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs,
        ...additionalParams,
      })

      throw error
    }
  }
}
