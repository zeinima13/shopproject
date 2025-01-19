/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          destination: '/:path*',
        },
      ],
    }
  },
  images: {
    domains: ['via.placeholder.com'],
  },
}

module.exports = nextConfig
