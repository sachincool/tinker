import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compress: true,

  async redirects() {
    return [
      {
        source: '/posts/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/post/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/blogs/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/tag/:tag',
        destination: '/tags/:tag',
        permanent: true,
      },
      {
        source: '/category/:tag',
        destination: '/tags/:tag',
        permanent: true,
      },
      {
        source: '/categories/:tag',
        destination: '/tags/:tag',
        permanent: true,
      },
      // Fix for common RSS/feed paths that Google is trying to access
      {
        source: '/index.xml',
        destination: '/rss.xml',
        permanent: true,
      },
      {
        source: '/feed',
        destination: '/rss.xml',
        permanent: true,
      },
      {
        source: '/feed.xml',
        destination: '/rss.xml',
        permanent: true,
      },
      // Fix for categories root path
      {
        source: '/categories',
        destination: '/tags',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/((?!api|rss|atom|_vercel).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;
// Temporarily disabled Million.js
// export default million.next(nextConfig, {
//   auto: { rsc: true }, // Enable automatic optimization for React Server Components
// });
