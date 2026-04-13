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
    // Optimize package imports — tree-shake heavy charting & utility libraries
    optimizePackageImports: [
      'date-fns',
      '@supabase/supabase-js',
      'recharts',
      'echarts-for-react',
      'd3',
      'framer-motion',
      'chart.js',
      'react-chartjs-2',
      'lucide-react',
    ],
  },

  // Redirects for legacy WordPress routes
  async redirects() {
    return [
      { source: '/category/chicago-bears/:path*', destination: '/chicago-bears', permanent: true },
      { source: '/category/chicago-bulls/:path*', destination: '/chicago-bulls', permanent: true },
      { source: '/category/chicago-cubs/:path*', destination: '/chicago-cubs', permanent: true },
      { source: '/category/chicago-white-sox/:path*', destination: '/chicago-white-sox', permanent: true },
      { source: '/category/chicago-blackhawks/:path*', destination: '/chicago-blackhawks', permanent: true },
      { source: '/category/:path*', destination: '/', permanent: true },
      { source: '/chat', destination: '/fan-chat', permanent: true },
      { source: '/war-room', destination: '/gm', permanent: false },
    ]
  },

  // Headers for caching and security
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
        // Cache fonts
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache team sidebar API (refreshed by ISR)
        source: '/api/team-sidebar',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        // Cache river/feed API
        source: '/api/river',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
      {
        // Cache SVG/logo assets
        source: '/:path*.svg',
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
