import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { loadActionItems } from '@/lib/exec-iq'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const sp = request.nextUrl.searchParams
  const status = sp.get('status') || undefined
  const limit = Math.min(parseInt(sp.get('limit') || '200', 10) || 200, 500)
  const items = await loadActionItems({ status, limit })
  return NextResponse.json({ items })
}
