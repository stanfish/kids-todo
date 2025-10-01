import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  images: {
    unoptimized: true,
    domains: [],
  },
  // Set output file tracing root to silence warnings
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
