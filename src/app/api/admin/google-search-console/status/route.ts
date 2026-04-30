import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getGscPropertyId, loadStoredTokens } from '@/lib/google-search-console'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const row = await loadStoredTokens()
  return NextResponse.json({
    connected: !!row,
    property: getGscPropertyId(),
    email: row?.google_account_email ?? null,
  })
}
