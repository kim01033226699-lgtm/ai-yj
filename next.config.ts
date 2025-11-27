import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/ai-yj' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ai-yj/' : '',
  trailingSlash: true,
};

export default nextConfig;

