import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const CUBEJS_BASE = 'https://analytics.pub.network/cubejs-api/v1'

async function proxy(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const auth = await requireAdmin(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const token = process.env.FREESTAR_API_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'FREESTAR_API_TOKEN not set on server' },
      { status: 500 }
    )
  }

  const { path } = await ctx.params
  const segments = path?.length ? path.join('/') : ''
  const upstreamUrl = `${CUBEJS_BASE}/${segments}${request.nextUrl.search}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }

  let body: string | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text()
    headers['Content-Type'] =
      request.headers.get('content-type') ?? 'application/json'
  }

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
    },
  })
}

export const GET = proxy
export const POST = proxy
