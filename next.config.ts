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
        hostname: 'siwoqfzzcxmngnseyzpv.supabase.co',
      },
    ],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Optimize device sizes for mobile-first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
      { source: '/home', destination: '/', permanent: true },
      { source: '/home/:path*', destination: '/', permanent: true },
      { source: '/category/chicago-bears/:path*', destination: '/chicago-bears', permanent: true },
      { source: '/category/chicago-bulls/:path*', destination: '/chicago-bulls', permanent: true },
      { source: '/category/chicago-cubs/:path*', destination: '/chicago-cubs', permanent: true },
      { source: '/category/chicago-white-sox/:path*', destination: '/chicago-white-sox', permanent: true },
      { source: '/category/chicago-blackhawks/:path*', destination: '/chicago-blackhawks', permanent: true },
      { source: '/category/:path*', destination: '/', permanent: true },
      { source: '/chat', destination: '/fan-chat', permanent: true },
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
    ];
  },
};

export default nextConfig;
