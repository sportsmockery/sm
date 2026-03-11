/**
 * Shared admin auth helper for API routes that require admin access.
 * Supports both cookie-based (web) and Bearer token (mobile) auth.
 * Returns the authenticated user or null.
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Authenticate the current request and return the user.
 * Checks Bearer token first (mobile), then cookies (web).
 */
export async function getAuthUser(request?: NextRequest) {
  // Try Bearer token auth (mobile app / API clients)
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) return user
    }
  }

  // Fall back to cookie-based auth (web)
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Cookies can't be set in some contexts (e.g. server components)
          }
        },
      },
    })
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

/**
 * Authenticate the current request and verify the user has admin role.
 * Returns { user } on success, or { error, status } on failure.
 */
export async function requireAdmin(request?: NextRequest): Promise<
  | { user: { id: string; email?: string }; error?: never; status?: never }
  | { user?: never; error: string; status: number }
> {
  const user = await getAuthUser(request)

  if (!user) {
    return { error: 'Authentication required', status: 401 }
  }

  // Check admin role in sm_users table using admin client
  const adminClient = createClient(supabaseUrl, supabaseServiceKey)
  const { data: userData } = await adminClient
    .from('sm_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return { error: 'Admin access required', status: 403 }
  }

  return { user: { id: user.id, email: user.email } }
}

/**
 * Verify cron secret for cron job endpoints.
 * Returns true if authorized, false otherwise.
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    // CRON_SECRET must be set in production
    console.error('[Cron Auth] CRON_SECRET environment variable is not set')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}
