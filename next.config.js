/** @type {import('next').NextConfig} */
const nextConfig = {
  target: 'serverless',
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig
