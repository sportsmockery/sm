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
  '/scout-ai',        // Public content pages
  '/fan-chat',
  '/fan-zone',
  '/polls',
  '/mock-draft',
  '/bears-film-room',       // Show pages
  '/pinwheels-and-ivy',
  '/southside-behavior',
  '/untold-chicago-stories',
  '/subscription',
  '/api/public',
  '/api/bears',  // Bears data API (ticker, schedule, roster, etc.)
  '/api/feed',   // Oracle feed API
  '/api/audio',  // Audio TTS API
  '/api/cron',   // Vercel cron jobs
  '/gm',         // GM Trade Simulator (handles own auth)
  '/Owner',      // Ownership report cards
  '/home',       // Marketing pages
  '/fan-showcase', // Fan showcase
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

  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')
  const isApiPath = pathname.startsWith('/api')

  // 1. Allow static assets and API routes immediately
  if (isStaticAsset || isApiPath) {
    return NextResponse.next()
  }

  // 2. Allow public routes and content pages (articles, team pages, etc.)
  const isPublicRoute = publicRoutes.includes(pathname)
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicRoute || isPublicPath) {
    return NextResponse.next()
  }

  // 3. Allow article URLs — any /{category}/{slug} pattern (2+ path segments)
  //    These are content pages that should always be accessible for SEO and sharing
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length >= 2 && !pathname.startsWith('/admin') && !pathname.startsWith('/gm') && !pathname.startsWith('/studio')) {
    return NextResponse.next()
  }

  // 4. Admin route protection — require authentication
  if (pathname.startsWith('/admin')) {
    const { supabase, response } = createSupabaseMiddlewareClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
