import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * GET /api/feature-flags/check
 * Check all feature flags for the current user
 */
export async function GET() {
  try {
    // Get user session for passing to Datalab
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Call Datalab feature flags endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/feature-flags/check`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      // Return empty flags if Datalab is unavailable
      console.warn('[Feature Flags] Datalab unavailable, returning empty flags')
      return NextResponse.json({
        flags: {},
        timestamp: new Date().toISOString(),
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Feature Flags] Error:', error)
    // Return empty flags on error to allow legacy fallback
    return NextResponse.json({
      flags: {},
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * POST /api/feature-flags/check
 * Check specific feature flags
 * Body: { flagNames: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flagNames } = body

    if (!flagNames || !Array.isArray(flagNames)) {
      return NextResponse.json(
        { error: 'flagNames array is required' },
        { status: 400 }
      )
    }

    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Call Datalab feature flags endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/feature-flags/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ flagNames }),
    })

    if (!response.ok) {
      // Return empty flags if Datalab is unavailable
      console.warn('[Feature Flags] Datalab unavailable, returning empty flags')
      const emptyFlags: Record<string, boolean> = {}
      flagNames.forEach((name: string) => {
        emptyFlags[name] = false
      })
      return NextResponse.json({
        flags: emptyFlags,
        timestamp: new Date().toISOString(),
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Feature Flags] Error:', error)
    return NextResponse.json({
      flags: {},
      timestamp: new Date().toISOString(),
    })
  }
}
