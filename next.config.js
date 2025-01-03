/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = {
  ...nextConfig,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `http://localhost:3005/:path*`,
      },
    ]
  },
}

