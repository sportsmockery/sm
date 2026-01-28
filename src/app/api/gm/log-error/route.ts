import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


// GET: Fetch errors for admin page
export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
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
    let userId: string | null = null
    try {
      const user = await getGMAuthUser(request)
      userId = user?.id || null
    } catch {}

    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      body = { error_message: 'Invalid JSON body' }
    }

    const { error } = await datalabAdmin.from('gm_errors').insert({
      user_id: userId,
      source: String(body.source || 'frontend').slice(0, 50),
      error_type: String(body.error_type || 'unknown').slice(0, 50),
      error_message: String(body.error_message || 'Unknown error').slice(0, 2000),
      route: body.route ? String(body.route).slice(0, 200) : null,
      request_payload: body.request_payload || null,
      metadata: body.metadata || null,
    })

    if (error) {
      console.error('GM log-error insert failed:', error.message, error.code)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GM log-error POST error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
