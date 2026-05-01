import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { GSC_SCOPE, getGscRedirectUri, isOauthOwner, getOauthOwnerAllowlist } from '@/lib/google-search-console'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Lock connect/re-connect to the owner allowlist. The stored token is
  // shared across all admin viewers — letting any admin overwrite it would
  // silently break the dashboard for everyone else.
  if (!isOauthOwner(auth.user.email)) {
    return NextResponse.json(
      {
        error: 'Only the OAuth owner can connect Google for this dashboard.',
        owner: getOauthOwnerAllowlist(),
        you: auth.user.email,
        hint: 'Read access to dashboard data does not require connecting your own Google account — it is already shared via the owner token.',
      },
      { status: 403 }
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID not set' }, { status: 500 })
  }

  const origin = `${request.nextUrl.protocol}//${request.headers.get('host')}`
  const redirectUri = getGscRedirectUri(origin)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GSC_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
