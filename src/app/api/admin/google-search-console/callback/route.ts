import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  GSC_PROVIDER,
  GSC_SCOPE,
  getGscPropertyId,
  getGscRedirectUri,
  isOauthOwner,
} from '@/lib/google-search-console'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Defense in depth: also gate the callback by the owner allowlist so a
  // crafted redirect can't write a non-owner token.
  if (!isOauthOwner(auth.user.email)) {
    return NextResponse.redirect(
      new URL('/admin/exec-dashboard?gsc=error&reason=not_owner', request.url)
    )
  }

  const code = request.nextUrl.searchParams.get('code')
  const oauthError = request.nextUrl.searchParams.get('error')
  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/admin/exec-dashboard?gsc=error&reason=${encodeURIComponent(oauthError)}`, request.url)
    )
  }
  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set' }, { status: 500 })
  }

  const origin = `${request.nextUrl.protocol}//${request.headers.get('host')}`
  const redirectUri = getGscRedirectUri(origin)

  // Exchange the code for refresh + access tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => '')
    return NextResponse.json(
      { error: `Token exchange failed (${tokenRes.status})`, detail: text.slice(0, 500) },
      { status: 502 }
    )
  }

  const tokens = (await tokenRes.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    scope?: string
    token_type?: string
    id_token?: string
  }

  if (!tokens.refresh_token) {
    // Google only issues refresh tokens on first consent for a given client+account.
    // If this happens, the user needs to revoke at https://myaccount.google.com/permissions
    // and re-run the connect flow.
    return NextResponse.redirect(
      new URL('/admin/exec-dashboard?gsc=error&reason=no_refresh_token', request.url)
    )
  }

  // Decode id_token to extract email if present (no signature verification needed —
  // we trust this came directly from Google's token endpoint).
  let email: string | null = null
  if (tokens.id_token) {
    try {
      const payloadB64 = tokens.id_token.split('.')[1]
      const padded = payloadB64 + '='.repeat((4 - (payloadB64.length % 4)) % 4)
      const decoded = JSON.parse(Buffer.from(padded, 'base64url').toString('utf-8'))
      email = decoded.email ?? null
    } catch {
      email = null
    }
  }

  // Final guard: the Google account picked at the consent screen must also be
  // on the owner allowlist. Otherwise we'd write a foreign Google token into
  // the shared row and break the dashboard for everyone.
  if (!isOauthOwner(email)) {
    return NextResponse.redirect(
      new URL(
        `/admin/exec-dashboard?gsc=error&reason=wrong_google_account&email=${encodeURIComponent(email || 'unknown')}`,
        request.url
      )
    )
  }

  const property = getGscPropertyId()
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  // Upsert by (provider, property_id)
  const { data: existing } = await supabaseAdmin
    .from('admin_oauth_tokens')
    .select('id')
    .eq('provider', GSC_PROVIDER)
    .eq('property_id', property)
    .maybeSingle()

  const row = {
    provider: GSC_PROVIDER,
    property_id: property,
    scope: tokens.scope || GSC_SCOPE,
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token ?? null,
    access_token_expires_at: expiresAt,
    google_account_email: email,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    await supabaseAdmin.from('admin_oauth_tokens').update(row).eq('id', existing.id)
  } else {
    await supabaseAdmin.from('admin_oauth_tokens').insert(row)
  }

  return NextResponse.redirect(new URL('/admin/exec-dashboard?gsc=connected&tab=SEO', request.url))
}
