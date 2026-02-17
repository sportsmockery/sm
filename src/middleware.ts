import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  '/api/public',
  '/api/bears',  // Bears data API (ticker, schedule, roster, etc.)
  '/api/feed',   // Oracle feed API
  '/api/audio',  // Audio TTS API
  '/api/cron',   // Vercel cron jobs
]

// Paths that should never trigger the first-time visitor redirect
const SKIP_VISITOR_REDIRECT = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')
  const isApiPath = pathname.startsWith('/api')
  const isHomePath = pathname === '/home' || pathname.startsWith('/home/')

  // Allow static assets and API routes immediately
  if (isStaticAsset || isApiPath) {
    return NextResponse.next()
  }

  // --- First-time visitor redirect ---
  // If no sm_visited cookie, not on a /home page, and not an auth page → redirect to /home
  const hasVisited = request.cookies.get('sm_visited')?.value
  const isAuthPage = SKIP_VISITOR_REDIRECT.includes(pathname)

  if (!hasVisited && !isHomePath && !isAuthPage) {
    const response = NextResponse.redirect(new URL('/home', request.url))

    response.cookies.set('sm_visited', 'true', {
      maxAge: 60 * 60 * 24 * 10, // 10 days
      path: '/',
      sameSite: 'lax',
    })

    // Save intended destination (only valid paths, prevent open redirect)
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      response.cookies.set('sm_intended_destination', pathname, {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax',
      })
    }

    return response
  }

  // --- Existing public route logic ---
  const isPublicRoute = publicRoutes.includes(pathname)
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Allow public routes, home pages
  if (isPublicRoute || isPublicPath || isHomePath) {
    return NextResponse.next()
  }

  // Check authentication for protected routes (e.g., /admin/*)
  if (pathname.startsWith('/admin')) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

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
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
