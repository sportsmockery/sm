import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DISQUS_API_KEY = process.env.DISQUS_API_KEY || ''
const DISQUS_API_SECRET = process.env.DISQUS_API_SECRET || ''

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('Disqus OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/profile?disqus_error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/profile?disqus_error=no_code', request.url)
    )
  }

  try {
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
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Server component, ignore
            }
          },
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?disqus_error=not_authenticated', request.url)
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://disqus.com/api/oauth/2.0/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: DISQUS_API_KEY,
        client_secret: DISQUS_API_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com'}/api/auth/disqus/callback`,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Disqus token exchange failed:', errorText)
      return NextResponse.redirect(
        new URL('/profile?disqus_error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in
    const userId = tokenData.user_id
    const username = tokenData.username

    if (!accessToken || !userId) {
      console.error('Invalid token response:', tokenData)
      return NextResponse.redirect(
        new URL('/profile?disqus_error=invalid_token_response', request.url)
      )
    }

    // Calculate expiration time
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null

    // Store connection in database
    const { error: upsertError } = await supabase
      .from('user_disqus_connections')
      .upsert(
        {
          user_id: user.id,
          disqus_user_id: userId.toString(),
          disqus_username: username || `user_${userId}`,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          expires_at: expiresAt,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )

    if (upsertError) {
      console.error('Error saving Disqus connection:', upsertError)
      return NextResponse.redirect(
        new URL('/profile?disqus_error=save_failed', request.url)
      )
    }

    // Redirect to profile with success
    return NextResponse.redirect(
      new URL('/profile?disqus_connected=true', request.url)
    )
  } catch (error) {
    console.error('Disqus callback error:', error)
    return NextResponse.redirect(
      new URL('/profile?disqus_error=callback_failed', request.url)
    )
  }
}
