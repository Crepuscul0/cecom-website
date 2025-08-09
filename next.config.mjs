import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

// Ensure timezone is set at process level for SSR and tooling
process.env.TZ = process.env.TZ || 'America/Santo_Domingo';

// Point the plugin to the request config which sets timeZone & messages
const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
