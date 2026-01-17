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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname)
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')

  // Allow public routes and static assets
  if (isPublicRoute || isPublicPath || isStaticAsset) {
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
