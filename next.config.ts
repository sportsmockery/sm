import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
    ],
  },
};

export default nextConfig;
