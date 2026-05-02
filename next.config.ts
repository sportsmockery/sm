import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sportsmockery.com',
      },
      {
        protocol: 'https',
        hostname: 'sportsmockery.com',
      },
      {
        protocol: 'https',
        hostname: 'izwhcuccuwvlqqhpprbb.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a.espn.com',
      },
      {
        protocol: 'https',
        hostname: 'siwoqfzzcxmngnseyzpv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.espn.com',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'test.sportsmockery.com',
      },
    ],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Optimize device sizes for mobile-first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year — they rarely change
    minimumCacheTTL: 31536000,
    // Allow SVG for team logos
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Enable production build optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['date-fns', '@supabase/supabase-js'],
  },

  // Redirects for legacy WordPress routes
  async redirects() {
    return [
      // SEO Tip #10 — collapse duplicate /bears hub into canonical /chicago-bears
      { source: '/bears', destination: '/chicago-bears', permanent: true },
      { source: '/bears/:path*', destination: '/chicago-bears/:path*', permanent: true },

      { source: '/category/chicago-bears/:path*', destination: '/chicago-bears', permanent: true },
      { source: '/category/chicago-bulls/:path*', destination: '/chicago-bulls', permanent: true },
      { source: '/category/chicago-cubs/:path*', destination: '/chicago-cubs', permanent: true },
      { source: '/category/chicago-white-sox/:path*', destination: '/chicago-white-sox', permanent: true },
      { source: '/category/chicago-blackhawks/:path*', destination: '/chicago-blackhawks', permanent: true },
      { source: '/category/:path*', destination: '/', permanent: true },
      { source: '/chat', destination: '/fan-chat', permanent: true },
      { source: '/war-room', destination: '/gm', permanent: false },

      // Old WordPress date-based URLs (2014–2020) → homepage
      { source: '/2014/:path*', destination: '/', permanent: true },
      { source: '/2015/:path*', destination: '/', permanent: true },
      { source: '/2016/:path*', destination: '/', permanent: true },
      { source: '/2017/:path*', destination: '/', permanent: true },
      { source: '/2018/:path*', destination: '/', permanent: true },
      { source: '/2019/:path*', destination: '/', permanent: true },
      { source: '/2020/:path*', destination: '/', permanent: true },

      // Old nested category/rumor URLs → team hub pages
      { source: '/chicago-bears/chicago-bears-rumors/:slug*', destination: '/chicago-bears', permanent: true },
      { source: '/chicago-cubs/chicago-cubs-rumors/:slug*', destination: '/chicago-cubs', permanent: true },
      { source: '/chicago-bulls-rumors/:slug*', destination: '/chicago-bulls', permanent: true },
      { source: '/chicago-blackhawks-rumors/:slug*', destination: '/chicago-blackhawks', permanent: true },
      { source: '/chicago-white-sox-rumors/:slug*', destination: '/chicago-white-sox', permanent: true },

      // Casino/betting/gambling content → homepage (E-E-A-T cleanup)
      { source: '/betmgm-illinois', destination: '/', permanent: true },
      { source: '/betmgm-illinois/:path*', destination: '/', permanent: true },
      { source: '/pointsbet-illinois-sportsbook', destination: '/', permanent: true },
      { source: '/pointsbet-illinois-sportsbook/:path*', destination: '/', permanent: true },
      { source: '/draftkings-illinois-sportsbook', destination: '/', permanent: true },
      { source: '/draftkings-illinois-sportsbook/:path*', destination: '/', permanent: true },
      { source: '/chicago-blackhawks-odds', destination: '/chicago-blackhawks', permanent: true },
      { source: '/chicago-blackhawks-odds/:path*', destination: '/chicago-blackhawks', permanent: true },
      { source: '/sports-betting/:path*', destination: '/', permanent: true },

      // Spam author pages → homepage
      { source: '/author/the-importance-reputable-casino-slot-play', destination: '/', permanent: true },
      { source: '/author/the-importance-reputable-casino-slot-play/:path*', destination: '/', permanent: true },
      { source: '/author/soccer-event-thats-bridging-continents', destination: '/', permanent: true },
      { source: '/author/soccer-event-thats-bridging-continents/:path*', destination: '/', permanent: true },
      { source: '/author/exploring-the-deliciou-world-of-hHC-infused-treat', destination: '/', permanent: true },
      { source: '/author/exploring-the-deliciou-world-of-hHC-infused-treat/:path*', destination: '/', permanent: true },
      { source: '/author/What-makes-the-Gems-and-Mines', destination: '/', permanent: true },
      { source: '/author/What-makes-the-Gems-and-Mines/:path*', destination: '/', permanent: true },

      // Old uncategorized content → homepage
      { source: '/uncategorized/:path*', destination: '/', permanent: true },

      // Tip #33 — WP legacy archive/index pages → team hub equivalents
      // (308 permanent via permanent: true, sourced from
      // audit/redirect-map-{date}.csv → category=wp_legacy_archive)
      { source: '/bears-news', destination: '/chicago-bears', permanent: true },
      { source: '/blackhawks-news', destination: '/chicago-blackhawks', permanent: true },
      { source: '/bulls-news', destination: '/chicago-bulls', permanent: true },
      { source: '/chicago-bears-history', destination: '/chicago-bears', permanent: true },
      { source: '/chicago-bears-odds', destination: '/chicago-bears', permanent: true },
      { source: '/chicago-bears-player', destination: '/chicago-bears', permanent: true },
      { source: '/chicago-bears-roster', destination: '/chicago-bears', permanent: true },
      { source: '/chicago-bears-schedule', destination: '/chicago-bears/schedule', permanent: true },
      { source: '/chicago-bears-scores', destination: '/chicago-bears/scores', permanent: true },
    ]
  },

  // Headers for caching, security, and Early Hints (SEO Tip #29)
  //
  // Font preloading:
  //   next/font/google (Space Grotesk) auto-emits a Link: rel=preload header
  //   for the self-hosted WOFF2 at /_next/static/media/<hash>.woff2.
  //   Vercel promotes Link headers into HTTP 103 Early Hints at the edge,
  //   so the browser begins downloading the font before the HTML arrives.
  //
  //   CSS bundles are also content-hashed; a static Link preload is infeasible
  //   and would break on every build. Next.js handles CSS preloading in <head>.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // SEO Tip #29 — Early Hints: preconnect to critical third-party origins
        // so the browser resolves DNS + TLS before the main response arrives.
        // Vercel promotes these Link headers into 103 Early Hints at the edge.
        source: '/:path((?:chicago-bears|chicago-bulls|chicago-cubs|chicago-blackhawks|chicago-white-sox|$).*)',
        headers: [
          {
            key: 'Link',
            value: [
              '<https://izwhcuccuwvlqqhpprbb.supabase.co>; rel=preconnect',
              '<https://a.espncdn.com>; rel=preconnect; crossorigin',
            ].join(', '),
          },
        ],
      },
      {
        // Cache static assets
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache self-hosted next/font files (Space Grotesk WOFF2)
        source: '/_next/static/media/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
