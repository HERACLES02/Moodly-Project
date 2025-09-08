/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix for Next.js 15 - moved from experimental to top level
  serverExternalPackages: ['bcryptjs'],
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org', 'i.scdn.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  }
}

module.exports = nextConfig