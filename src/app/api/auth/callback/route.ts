import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sanitize the `next` redirect parameter to prevent open redirect attacks.
 * Only allows relative paths that start with a single `/` (not `//`).
 * Rejects absolute URLs, protocol-relative URLs, and other bypass attempts.
 * SEC-2026-003 fix.
 */
function sanitizeRedirectPath(next: string | null): string {
  const fallback = '/admin'
  if (!next) return fallback

  // Must start with exactly one forward slash (relative path)
  // Block: "//evil.com", "https://evil.com", "javascript:", "/\evil.com", etc.
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback
  }

  // Block protocol schemes embedded in path
  if (/^\/[a-z]+:/i.test(next)) {
    return fallback
  }

  return next
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = sanitizeRedirectPath(requestUrl.searchParams.get('next'))

  if (code) {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return to login with error
  return NextResponse.redirect(new URL('/login?error=auth', request.url))
}
