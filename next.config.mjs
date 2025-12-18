import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';
import webpack from 'next/dist/compiled/webpack/webpack-lib.js';

// Ensure timezone is set at process level for SSR and tooling
process.env.TZ = process.env.TZ || 'America/Santo_Domingo';

// Point the plugin to the request config which sets timeZone & messages
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@node-rs/argon2'],
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    reactCompiler: false,
  },
  // Exclude sensitive folders from build
  webpack: (config) => {
    // Ignore scripts folder to prevent exposure of sensitive scripts
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/scripts/**', '**/docs/**', '**/.git/**', '**/node_modules/**'],
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(?:\.\.\/)+scripts\//,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^scripts\//,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^docs\//,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^automation\//,
      })
    );
    return config;
  },
  images: {
    unoptimized: true, // Disable image optimization for cPanel performance
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['cecom.do', 'localhost'],
    // Allow images from any domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cecom.com.do https://*.supabase.co https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https: http: https://*.supabase.co https://cecom.com.do; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://cecom.com.do https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://www.google.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(withPayload(nextConfig));
