import type { NextConfig } from 'next';
import path from 'node:path';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withBundleAnalyzer(nextConfig);
