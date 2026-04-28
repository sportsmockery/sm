import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Production hosts that ARE allowed to be indexed by search engines.
// Any other hostname (test.sportsmockery.com, *.vercel.app preview URLs,
// localhost) gets an X-Robots-Tag: noindex, nofollow header injected on every
// response. This is the load-bearing protection that prevents staging from
// stealing production rankings if a sitemap or backlink leaks.
const INDEXABLE_HOSTS = new Set<string>([
  'sportsmockery.com',
  'www.sportsmockery.com',
  // Subdomain rewrites that surface to search engines as their own apex:
  'masters.sportsmockery.com',
])

function applyNoindexIfStaging(request: NextRequest, response: NextResponse): NextResponse {
  const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase()
  if (!INDEXABLE_HOSTS.has(hostname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
  return response
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
  '/bears',
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

  // 0. masters.sportsmockery.com — rewrite all requests to /masters/*
  if (hostname === 'masters.sportsmockery.com' || hostname.startsWith('masters.sportsmockery.com:')) {
    // If already on /masters path, pass through
    if (pathname.startsWith('/masters')) {
      return NextResponse.next()
    }
    // Rewrite root and all other paths to /masters/*
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/masters' : `/masters${pathname}`
    return NextResponse.rewrite(url)
  }

  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')
  const isApiPath = pathname.startsWith('/api')
  const isHomePath = pathname === '/home' || pathname.startsWith('/home/')

  // 1. Allow static assets and API routes immediately
  if (isStaticAsset || isApiPath) {
    return applyNoindexIfStaging(request, NextResponse.next())
  }

  // 2. Allow /home/* marketing pages through (no auth check needed)
  if (isHomePath) {
    return applyNoindexIfStaging(request, NextResponse.next())
  }

  // 3. Allow public routes and content pages (articles, team pages, etc.)
  const isPublicRoute = publicRoutes.includes(pathname)
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicRoute || isPublicPath) {
    return applyNoindexIfStaging(request, NextResponse.next())
  }

  // 4. Allow article URLs — any /{category}/{slug} pattern (2+ path segments)
  //    These are content pages that should always be accessible for SEO and sharing
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length >= 2 && !pathname.startsWith('/admin') && !pathname.startsWith('/gm') && !pathname.startsWith('/studio')) {
    return applyNoindexIfStaging(request, NextResponse.next())
  }

  // 7. Admin route protection — require authentication
  // Note: /admin/freestar was previously exempted but now requires auth like all admin pages
  if (pathname.startsWith('/admin')) {
    const { supabase, response } = createSupabaseMiddlewareClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return applyNoindexIfStaging(request, response)
  }

  return applyNoindexIfStaging(request, NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
