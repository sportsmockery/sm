/**
 * Google Search Console — server-side helpers.
 *
 * Token storage: refresh tokens live in the `admin_oauth_tokens` Supabase
 * table (service-role only). Access tokens are minted on demand by exchanging
 * the refresh token; we cache them in the same row until 60s before expiry.
 */
import { supabaseAdmin } from './supabase-server'

export const GSC_PROVIDER = 'google_search_console'
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

export type GscTokenRow = {
  id: number
  provider: string
  property_id: string | null
  scope: string | null
  refresh_token: string
  access_token: string | null
  access_token_expires_at: string | null
  google_account_email: string | null
}

export type SearchAnalyticsRow = {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export function getGscPropertyId(): string {
  return process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY || 'sc-domain:sportsmockery.com'
}

export function getGscRedirectUri(originHeader: string | null): string {
  // Prefer an explicit override, otherwise derive from the incoming request
  // origin so this works on test.sportsmockery.com and prod alike — both
  // need to be authorized in the Google Cloud OAuth client.
  const fromEnv = process.env.GOOGLE_OAUTH_REDIRECT_BASE_URL
  const base = fromEnv || originHeader || 'https://test.sportsmockery.com'
  return base.replace(/\/+$/, '') + '/api/admin/google-search-console/callback'
}

export async function loadStoredTokens(): Promise<GscTokenRow | null> {
  const property = getGscPropertyId()
  const { data } = await supabaseAdmin
    .from('admin_oauth_tokens')
    .select('*')
    .eq('provider', GSC_PROVIDER)
    .eq('property_id', property)
    .maybeSingle()
  return (data as GscTokenRow | null) ?? null
}

async function exchangeRefreshToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set')
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Refresh-token exchange failed (${res.status}): ${text.slice(0, 300)}`)
  }
  return res.json()
}

export async function getValidAccessToken(): Promise<{
  accessToken: string
  property: string
  email: string | null
}> {
  const row = await loadStoredTokens()
  if (!row) throw new Error('GSC not connected. Visit /api/admin/google-search-console/connect to authorize.')

  const now = Date.now()
  const expiresAt = row.access_token_expires_at ? new Date(row.access_token_expires_at).getTime() : 0
  const stillFresh = row.access_token && expiresAt > now + 60_000

  if (stillFresh && row.access_token) {
    return {
      accessToken: row.access_token,
      property: row.property_id || getGscPropertyId(),
      email: row.google_account_email,
    }
  }

  const exchanged = await exchangeRefreshToken(row.refresh_token)
  const newExpiresAt = new Date(now + exchanged.expires_in * 1000).toISOString()
  await supabaseAdmin
    .from('admin_oauth_tokens')
    .update({
      access_token: exchanged.access_token,
      access_token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
  return {
    accessToken: exchanged.access_token,
    property: row.property_id || getGscPropertyId(),
    email: row.google_account_email,
  }
}

export async function querySearchAnalytics(opts: {
  startDate: string
  endDate: string
  dimensions?: Array<'date' | 'query' | 'page' | 'country' | 'device' | 'searchAppearance'>
  rowLimit?: number
}): Promise<SearchAnalyticsRow[]> {
  const { accessToken, property } = await getValidAccessToken()
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`
  const body = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    dimensions: opts.dimensions ?? [],
    rowLimit: opts.rowLimit ?? 1000,
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GSC searchAnalytics ${res.status}: ${text.slice(0, 300)}`)
  }
  const json = await res.json()
  return (json.rows || []) as SearchAnalyticsRow[]
}

/** Sum totals across rows (used when dimensions=[] returns one aggregate row). */
export function aggregateTotals(rows: SearchAnalyticsRow[]): {
  clicks: number
  impressions: number
  ctr: number
  position: number
} {
  if (rows.length === 0) return { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  let clicks = 0, impressions = 0, posSum = 0
  for (const r of rows) {
    clicks += r.clicks
    impressions += r.impressions
    posSum += r.position * r.impressions
  }
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? posSum / impressions : 0,
  }
}
