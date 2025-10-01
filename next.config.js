/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@supabase/ssr']
  }
}

module.exports = nextConfig
