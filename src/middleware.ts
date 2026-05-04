import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { buildCspHeader, generateNonce } from '@/lib/security/csp'

// ─────────────────────────────────────────────────────────────────────────────
// SEO redirect rules (priority order — handled at the top of middleware()):
//   1. /author/[id] (numeric)        → 301 → /author/[slug]              (PR-4 — LIVE)
//   2. /author/[slug]/ (trailing /)  → 301 → /author/[slug] (no slash)   (PR-4 — LIVE)
//   3. /sitemap.xml                  → 301 → /sitemap_index.xml          (DEFERRED to cutover day)
//   4. (post-launch) www.* host      → 301 → apex                        (Vercel handles, NOT here)
// All redirects use NextResponse.redirect(url, 301) — explicit 301, never 308.
// ─────────────────────────────────────────────────────────────────────────────

// Tip #33 — paths classified gone_410 in audit/redirect-map-{date}.csv.
//   /tag/<slug>(/...)         WP tag archives — 6k+ entries, mostly noise
//   /app-pages(/...)          orphan WP container pages
//   /cart-2, /checkout, /apply, /advertise — WP-era commerce/marketing
//   /chat-*-rumors            rumor catch-all stubs collapsed into hubs
const LEGACY_GONE_410 =
  /^\/(?:tag\/[^/]+|app-pages(?:\/.*)?|cart-2|checkout|apply|advertise)\/?$/

// Pre-launch security: WP/secret probe paths return real 410 instead of
// a soft-200 article-not-found page. Audit finding #9 — list deliberately
// EXACT-MATCH only (or scoped subpath for /wp-admin) so we don't catch
// legitimate routes. Kept separate from LEGACY_GONE_410 so it doesn't
// conflict with PR #99 (which extends LEGACY_GONE_410 for toxic author
// backlink paths).
const WP_PROBE_GONE_410 = new Set<string>([
  '/wp-login.php',
  '/wp-login',
  '/wp-admin',
  '/wp-admin/',
  '/wp-admin.php',
  '/xmlrpc.php',
  '/wp-cron.php',
  '/wp-config.php',
  '/wp-config.php.bak',
  '/wp-config-sample.php',
  '/readme.html',
  '/license.txt',
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.git/HEAD',
  '/.git/config',
  '/.git/index',
  '/.htaccess',
  '/.aws/credentials',
  '/wp-content/debug.log',
])
const WP_ADMIN_SUBPATH = /^\/wp-admin(?:\/|$)/
const WP_INCLUDES_SUBPATH = /^\/wp-includes(?:\/|$)/
const GIT_SUBPATH = /^\/\.git(?:\/|$)/

const _supabaseSeoUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const _supabaseSeoKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const _supabaseForRedirects =
  _supabaseSeoUrl && _supabaseSeoKey ? createClient(_supabaseSeoUrl, _supabaseSeoKey) : null

async function lookupAuthorSlug(id: string): Promise<string | null> {
  if (!_supabaseForRedirects) return null
  try {
    const { data } = await _supabaseForRedirects
      .from('sm_authors')
      .select('slug')
      .eq('id', id)
      .maybeSingle()
    return (data?.slug as string | null) ?? null
  } catch {
    return null
  }
}

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
]

// Routes that start with these paths are public
const publicPaths = [
  '/bulls',
  '/cubs',
  '/whitesox',
  '/blackhawks',
  '/fire',
  '/chicago-bears',   // Team category pages
  '/chicago-bulls',
  '/chicago-cubs',
  '/chicago-white-sox',
  '/chicago-blackhawks',
  '/chicago-fire',
  '/author',
  '/authors',
  '/search',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/predictions',
  '/players',
  '/teams',
  '/scout-ai',        // Public content pages
  '/fan-chat',
  '/fan-zone',
  '/polls',
  '/mock-draft',
  '/bears-film-room',       // Show pages
  '/pinwheels-and-ivy',
  '/southside-behavior',
  '/subscription',
  '/api/public',
  '/api/bears',  // Bears data API (ticker, schedule, roster, etc.)
  '/api/feed',   // Oracle feed API
  '/api/audio',  // Audio TTS API
  '/api/cron',   // Vercel cron jobs
  '/gm',         // GM Trade Simulator (handles own auth)
  '/owner',      // Ownership report cards
  '/masters',    // Masters 2026 Intelligence dashboard
]


/**
 * Build a `NextResponse.next()` with security headers (CSP + nonce)
 * attached, and forward the nonce to the rendering pipeline via the
 * request header `x-csp-nonce` so server components can stamp it on
 * inline <script> / <Script> tags via `headers().get('x-csp-nonce')`.
 *
 * Audit finding #8 — adds the missing Content-Security-Policy header.
 */
function htmlResponse(request: NextRequest, nonce: string): NextResponse {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-csp-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const { headerName, headerValue } = buildCspHeader(nonce)
  response.headers.set(headerName, headerValue)
  response.headers.set('x-csp-nonce', nonce)

  return response
}

function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const nonce = generateNonce()

  // 0. masters.sportsmockery.com — rewrite all requests to /masters/*
  if (hostname === 'masters.sportsmockery.com' || hostname.startsWith('masters.sportsmockery.com:')) {
    // If already on /masters path, pass through
    if (pathname.startsWith('/masters')) {
      return htmlResponse(request, nonce)
    }
    // Rewrite root and all other paths to /masters/*
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/masters' : `/masters${pathname}`
    return NextResponse.rewrite(url)
  }

  // Pre-launch security: WP / secret-probe paths return real 410 Gone
  // instead of soft-404 (audit finding #9). Strict membership check or
  // narrow subpath regex — does NOT prefix-match general routes.
  if (
    WP_PROBE_GONE_410.has(pathname) ||
    WP_ADMIN_SUBPATH.test(pathname) ||
    WP_INCLUDES_SUBPATH.test(pathname) ||
    GIT_SUBPATH.test(pathname)
  ) {
    return new NextResponse('Gone', { status: 410 })
  }

  // ─── SEO redirect rules (run BEFORE the static-asset bypass below) ────────
  // Rule 3 (/sitemap.xml → /sitemap_index.xml) is intentionally NOT enabled —
  // the new sitemap stack ships on cutover day, not before. The legacy static
  // /sitemap.xml continues serving from public/ until then.

  // Rule 0: trailing-slash → no-slash (308). Skip the homepage and any path
  // that already looks like a static asset (contains a dot). 308 because it
  // preserves method on POST/PUT/etc., which a 301 does not guarantee.
  if (pathname !== '/' && pathname.endsWith('/') && !pathname.includes('.')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/\/+$/, '')
    return NextResponse.redirect(url, 308)
  }

  // Tip #33 — WP legacy patterns we explicitly do not migrate. Returning
  // 410 Gone tells search engines the URL is permanently removed, which
  // de-indexes faster than a soft 404 and preserves crawl budget.
  if (LEGACY_GONE_410.test(pathname)) {
    return new NextResponse(null, { status: 410 })
  }

  // Rule 1: /author/<numeric-id> → /author/<slug> (301)
  const numericAuthorMatch = pathname.match(/^\/author\/(\d+)\/?$/)
  if (numericAuthorMatch) {
    const slug = await lookupAuthorSlug(numericAuthorMatch[1])
    if (slug) {
      return NextResponse.redirect(new URL(`/author/${slug}`, request.url), 301)
    }
    // No slug found — fall through to the page component, which will notFound()
  }

  // Rule 2: /author/<slug>/ trailing slash → /author/<slug> (301)
  const trailingSlashAuthor = pathname.match(/^\/author\/([^\/]+)\/$/)
  if (trailingSlashAuthor && !/^\d+$/.test(trailingSlashAuthor[1])) {
    return NextResponse.redirect(
      new URL(`/author/${trailingSlashAuthor[1]}`, request.url),
      301
    )
  }
  // ──────────────────────────────────────────────────────────────────────────

  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')
  const isApiPath = pathname.startsWith('/api')
  const isHomePath = pathname === '/home' || pathname.startsWith('/home/')

  // 1. Allow static assets and API routes immediately (no CSP needed —
  //    these aren't HTML render targets).
  if (isStaticAsset || isApiPath) {
    return NextResponse.next()
  }

  // 2. Allow /home/* marketing pages through (no auth check needed).
  if (isHomePath) {
    return htmlResponse(request, nonce)
  }

  // 3. Allow public routes and content pages (articles, team pages, etc.)
  const isPublicRoute = publicRoutes.includes(pathname)
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicRoute || isPublicPath) {
    return htmlResponse(request, nonce)
  }

  // 4. Allow article URLs — any /{category}/{slug} pattern (2+ path segments)
  //    These are content pages that should always be accessible for SEO and sharing
  const segments = pathname.split('/').filter(Boolean)
  if (
    segments.length >= 2 &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/gm') &&
    !pathname.startsWith('/studio') &&
    !pathname.startsWith('/training')
  ) {
    return htmlResponse(request, nonce)
  }

  // 7. Admin + training route protection — require authentication.
  // Role enforcement happens in the page itself (admin → requireAdmin,
  // training → requireTrainingAccess) to mirror existing patterns.
  if (pathname.startsWith('/admin') || pathname.startsWith('/training')) {
    const { supabase, response } = createSupabaseMiddlewareClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Stamp CSP onto the authenticated admin/training response too.
    const { headerName, headerValue } = buildCspHeader(nonce)
    response.headers.set(headerName, headerValue)
    response.headers.set('x-csp-nonce', nonce)
    return response
  }

  return htmlResponse(request, nonce)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
