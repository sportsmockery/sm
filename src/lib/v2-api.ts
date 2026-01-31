/**
 * V2 API Integration Utilities
 *
 * Implements the v2 API pattern with feature flag checking and 503 fallback.
 * When a v2 endpoint returns 503 with fallback_to_legacy: true, automatically
 * falls back to the legacy endpoint.
 *
 * @see sm-data-lab/docs/FRONTEND_INTEGRATION.md
 */

const DATALAB_API = 'https://datalab.sportsmockery.com'

export interface FeatureFlags {
  gm_deterministic_validation?: boolean
  gm_auditor_symbolic_verification?: boolean
  scout_rag_layer?: boolean
  postiq_template_engine?: boolean
}

export interface V2ApiResponse<T> {
  data: T | null
  usedV2: boolean
  error: string | null
}

/**
 * Check feature flags for the current user
 */
export async function checkFeatureFlags(
  flagNames?: string[]
): Promise<FeatureFlags> {
  try {
    const url = '/api/feature-flags/check'

    if (flagNames && flagNames.length > 0) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagNames }),
      })
      if (!response.ok) return {}
      const data = await response.json()
      return data.flags || {}
    }

    const response = await fetch(url)
    if (!response.ok) return {}
    const data = await response.json()
    return data.flags || {}
  } catch {
    console.warn('[v2-api] Failed to check feature flags, defaulting to legacy')
    return {}
  }
}

/**
 * Call a v2 endpoint with automatic fallback to legacy
 *
 * @param v2Endpoint - The v2 API endpoint (e.g., '/api/v2/gm/grade')
 * @param legacyEndpoint - The legacy API endpoint (e.g., '/api/gm/grade')
 * @param options - Fetch options
 * @param featureFlag - Optional: specific feature flag to check first
 */
export async function callV2WithFallback<T>(
  v2Endpoint: string,
  legacyEndpoint: string,
  options: RequestInit = {},
  featureFlag?: keyof FeatureFlags
): Promise<V2ApiResponse<T>> {
  // If feature flag specified, check it first
  if (featureFlag) {
    const flags = await checkFeatureFlags([featureFlag as string])
    if (!flags[featureFlag]) {
      // Flag not enabled, go directly to legacy
      return callLegacy<T>(legacyEndpoint, options)
    }
  }

  try {
    const response = await fetch(v2Endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle 503 with fallback flag
    if (response.status === 503) {
      try {
        const errorData = await response.json()
        if (errorData.fallback_to_legacy) {
          console.log(`[v2-api] ${v2Endpoint} returned 503 with fallback flag, using legacy`)
          return callLegacy<T>(legacyEndpoint, options)
        }
      } catch {
        // If can't parse error, fall back anyway
        return callLegacy<T>(legacyEndpoint, options)
      }
      return { data: null, usedV2: false, error: 'Service unavailable' }
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        usedV2: true,
        error: errorData.error || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    return { data, usedV2: true, error: null }
  } catch (error) {
    console.warn(`[v2-api] ${v2Endpoint} failed, trying legacy:`, error)
    return callLegacy<T>(legacyEndpoint, options)
  }
}

/**
 * Call the legacy endpoint
 */
async function callLegacy<T>(
  endpoint: string,
  options: RequestInit
): Promise<V2ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        usedV2: false,
        error: errorData.error || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    return { data, usedV2: false, error: null }
  } catch (error) {
    return {
      data: null,
      usedV2: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================================
// Specific V2 API Wrappers
// ============================================================

/**
 * Grade a trade using v2 API with fallback
 */
export async function gradeTradeV2<T>(
  tradeData: Record<string, unknown>,
  accessToken?: string
): Promise<V2ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return callV2WithFallback<T>(
    '/api/v2/gm/grade',
    '/api/gm/grade',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(tradeData),
    },
    'gm_deterministic_validation'
  )
}

/**
 * Audit a trade using v2 API with fallback
 */
export async function auditTradeV2<T>(
  auditData: { trade_id: string; auto_correct?: boolean },
  accessToken?: string
): Promise<V2ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return callV2WithFallback<T>(
    '/api/v2/gm/audit',
    '/api/gm/audit',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(auditData),
    },
    'gm_auditor_symbolic_verification'
  )
}

/**
 * Query Scout AI using v2 API with fallback
 */
export async function queryScoutV2<T>(
  queryData: { query: string; sessionId?: string; team?: string },
  accessToken?: string
): Promise<V2ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return callV2WithFallback<T>(
    '/api/v2/scout/query',
    '/api/ask-ai',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(queryData),
    },
    'scout_rag_layer'
  )
}

/**
 * Get PostIQ suggestions using v2 API with fallback
 */
export async function suggestPostIQV2<T>(
  suggestData: Record<string, unknown>,
  accessToken?: string
): Promise<V2ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return callV2WithFallback<T>(
    '/api/v2/postiq/suggest',
    '/api/admin/ai',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(suggestData),
    },
    'postiq_template_engine'
  )
}

/**
 * Validate salary cap (v2 only - no legacy equivalent)
 */
export async function validateSalaryV2<T>(
  validationData: {
    sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
    team: string
    players_sent: { salary: number; is_rookie_deal?: boolean }[]
    players_received: { salary: number; is_rookie_deal?: boolean }[]
    current_cap_space?: number
  },
  accessToken?: string
): Promise<V2ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    const response = await fetch('/api/v2/gm/validate-salary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(validationData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        usedV2: true,
        error: errorData.error || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    return { data, usedV2: true, error: null }
  } catch (error) {
    return {
      data: null,
      usedV2: true,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}
