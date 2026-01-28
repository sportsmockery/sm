import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options) }) } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET: Fetch errors for admin page
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const errorType = request.nextUrl.searchParams.get('error_type')
    const source = request.nextUrl.searchParams.get('source')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '200'), 500)

    let query = datalabAdmin
      .from('gm_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (errorType) query = query.eq('error_type', errorType)
    if (source) query = query.eq('source', source)

    const { data: errors, error } = await query
    if (error) throw error

    return NextResponse.json({ errors: errors || [] })
  } catch (error) {
    console.error('GM log-error GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 })
  }
}

// POST: Log a new error (from frontend or backend)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    const body = await request.json()

    const { error } = await datalabAdmin.from('gm_errors').insert({
      user_id: user?.id || null,
      source: body.source || 'frontend',
      error_type: body.error_type || 'unknown',
      error_message: body.error_message || 'Unknown error',
      route: body.route || null,
      request_payload: body.request_payload || null,
      metadata: body.metadata || null,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GM log-error POST error:', error)
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 })
  }
}
