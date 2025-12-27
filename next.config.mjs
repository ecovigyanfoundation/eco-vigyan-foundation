/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable source maps in production to avoid warnings
  productionBrowserSourceMaps: false,
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;