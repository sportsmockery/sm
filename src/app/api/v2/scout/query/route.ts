import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * POST /api/v2/scout/query
 * V2 Scout Query with RAG layer
 * Feature flag: scout_rag_layer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    // Call Datalab v2 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/v2/scout/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    // Pass through the response (including 503 with fallback_to_legacy)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/scout/query] Error:', error)
    return NextResponse.json(
      { error: 'Failed to query Scout', fallback_to_legacy: true },
      { status: 503 }
    )
  }
}
