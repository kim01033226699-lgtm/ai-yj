import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel에서는 output: 'export'를 사용하지 않음 (서버 사이드 렌더링 가능)
  // GitHub Pages 등 정적 호스팅을 사용할 때만 필요
  ...(process.env.VERCEL ? {} : process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  // Vercel에서는 basePath를 사용하지 않거나, 커스텀 도메인 사용 시 제거
  basePath: process.env.VERCEL ? '' : (process.env.NODE_ENV === 'production' ? '/ai-yj' : ''),
  assetPrefix: process.env.VERCEL ? '' : (process.env.NODE_ENV === 'production' ? '/ai-yj/' : ''),
  trailingSlash: true,
};

export default nextConfig;


