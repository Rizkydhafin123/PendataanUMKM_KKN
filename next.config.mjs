/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Netlify
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Add trailing slash for better compatibility
  trailingSlash: true,
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // ESLint configuration - ignore errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration - ignore errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Experimental features
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
