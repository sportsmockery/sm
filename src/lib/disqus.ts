/**
 * Disqus Integration Library
 *
 * Handles Disqus OAuth authentication and connection management.
 * Disqus uses OAuth 2.0 for authentication.
 */

// Disqus OAuth configuration
const DISQUS_PUBLIC_KEY = process.env.NEXT_PUBLIC_DISQUS_PUBLIC_KEY || ''
const DISQUS_SHORTNAME = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'sportsmockery'

export interface DisqusUser {
  id: string
  username: string
  name: string
  avatar: string
  profileUrl: string
}

export interface DisqusConnection {
  userId: string
  disqusUserId: string
  disqusUsername: string
  disqusName: string
  disqusAvatar: string | null
  accessToken: string
  refreshToken: string | null
  connectedAt: string
  expiresAt: string | null
}

/**
 * Generate the Disqus OAuth authorization URL
 */
export function getDisqusAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: DISQUS_PUBLIC_KEY,
    scope: 'read,write',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })

  return `https://disqus.com/api/oauth/2.0/authorize/?${params.toString()}`
}

/**
 * Check if Disqus is configured
 */
export function isDisqusConfigured(): boolean {
  return !!DISQUS_PUBLIC_KEY && !!DISQUS_SHORTNAME
}

/**
 * Get Disqus shortname for embedding
 */
export function getDisqusShortname(): string {
  return DISQUS_SHORTNAME
}

/**
 * Generate SSO payload for Disqus (if using SSO mode)
 * This allows users to be auto-logged into Disqus comments when they're logged into the site
 */
export function generateDisqusSSOPayload(user: {
  id: string
  username: string
  email: string
  avatar?: string
}): { message: string; hmac: string; timestamp: number } | null {
  // SSO requires server-side signing with the secret key
  // This is just a placeholder - actual implementation happens on the server
  return null
}

/**
 * Local storage keys for Disqus connection state
 */
const DISQUS_CONNECTION_KEY = 'sm_disqus_connection'
const DISQUS_PROMPT_DISMISSED_KEY = 'sm_disqus_prompt_dismissed'

/**
 * Check if user has dismissed the Disqus connection prompt
 */
export function isDisqusPromptDismissed(): boolean {
  if (typeof window === 'undefined') return false
  const dismissed = localStorage.getItem(DISQUS_PROMPT_DISMISSED_KEY)
  if (!dismissed) return false

  // Check if dismissal has expired (7 days)
  const dismissedAt = parseInt(dismissed, 10)
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - dismissedAt < sevenDaysMs
}

/**
 * Dismiss the Disqus connection prompt
 */
export function dismissDisqusPrompt(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DISQUS_PROMPT_DISMISSED_KEY, Date.now().toString())
}

/**
 * Clear the Disqus prompt dismissal
 */
export function clearDisqusPromptDismissal(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DISQUS_PROMPT_DISMISSED_KEY)
}

/**
 * Generate a random state parameter for OAuth
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Store OAuth state for verification
 */
export function storeOAuthState(state: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('disqus_oauth_state', state)
}

/**
 * Verify and consume OAuth state
 */
export function verifyOAuthState(state: string): boolean {
  if (typeof window === 'undefined') return false
  const storedState = sessionStorage.getItem('disqus_oauth_state')
  sessionStorage.removeItem('disqus_oauth_state')
  return storedState === state
}
