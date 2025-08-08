import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin({
  locales: ['en', 'es'],
  defaultLocale: 'en',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Payload CMS configuration
  experimental: {
    reactCompiler: false,
  },
  images: {
    domains: ['localhost'],
    // Add Supabase storage domain when available
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(withPayload(nextConfig));
