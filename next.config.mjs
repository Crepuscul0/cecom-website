import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

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
  webpack: (config, { isServer }) => {
    // Ignore scripts folder to prevent exposure of sensitive scripts
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/scripts/**', '**/docs/**', '**/.git/**', '**/node_modules/**'],
    };
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
};

export default withNextIntl(withPayload(nextConfig));
