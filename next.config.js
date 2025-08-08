/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: 'export',
  
  // Disable server components for simpler deployment
  experimental: {
    appDir: true,
  },
  
  // Add environment variables
  env: {
    NEXT_PUBLIC_VERSION: '1.0.0',
  },
  
  // Ensure pages are found correctly
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Configure for Vercel deployment
  distDir: '.next',
}

module.exports = nextConfig