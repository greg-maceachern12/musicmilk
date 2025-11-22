import type { NextConfig } from "next";
const isMobile = process.env.NEXT_PUBLIC_IS_MOBILE === 'true';

const nextConfig = {
  ...(isMobile ? {output: 'export'} : {}),
  images: {
    unoptimized: true,
    domains: [
      // Replace with your actual Supabase project URL
      'jswnswkwsrgbbwlptroi.supabase.co', "visuai.blob.core.windows.net", "musicmilk.co"
    ],
  },
}

module.exports = nextConfig
