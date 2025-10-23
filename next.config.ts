import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@supabase/ssr']
  }
};

export default nextConfig;
