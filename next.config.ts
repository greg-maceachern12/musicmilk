import type { NextConfig } from "next";
const isMobile = process.env.NEXT_PUBLIC_IS_MOBILE === 'true';

const nextConfig = {
  ...(isMobile ? {output: 'export'} : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jswnswkwsrgbbwlptroi.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'visuai.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'musicmilk.co',
      },
    ],
  },
}

module.exports = nextConfig
