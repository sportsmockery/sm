import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { checkRateLimitRedis, getClientIp } from '@/lib/rate-limit'

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
    // Rate limit: 10 error logs per minute per IP to prevent log spam
    const rl = await checkRateLimitRedis({
      prefix: 'gm-log-error',
      key: getClientIp(request),
      maxRequests: 10,
      windowSeconds: 60,
    })
    if (!rl.success) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    // Enforce max request size to prevent log spam (10KB limit)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10240) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

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

    // Truncate request_payload to prevent DB bloat
    let payload = body.request_payload || null
    if (payload) {
      const payloadStr = JSON.stringify(payload)
      if (payloadStr.length > 5000) {
        payload = { truncated: true, preview: payloadStr.slice(0, 5000) }
      }
    }

    const { error } = await datalabAdmin.from('gm_errors').insert({
      user_id: userId,
      source: String(body.source || 'frontend').slice(0, 50),
      error_type: String(body.error_type || 'unknown').slice(0, 50),
      error_message: String(body.error_message || 'Unknown error').slice(0, 2000),
      request_payload: payload,
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
