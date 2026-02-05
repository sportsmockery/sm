import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * POST /api/v2/postiq/suggest
 * V2 PostIQ Suggestions with template engine
 * Uses internal API key for server-to-server auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify user is authenticated via SM's Supabase session
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

    // Require authenticated user
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - login required' },
        { status: 401 }
      )
    }

    // Call Datalab v2 endpoint with internal API key
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-PostIQ-Internal-Key': process.env.POSTIQ_INTERNAL_KEY || '',
    }

    // Include user_id in request body for logging on DataLab side
    const requestBody = {
      ...body,
      user_id: session.user.id,
    }

    const response = await fetch(`${DATALAB_API}/api/v2/postiq/suggest`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    // Pass through the response (including 503 with fallback_to_legacy)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/postiq/suggest] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions', fallback_to_legacy: true },
      { status: 503 }
    )
  }
}
