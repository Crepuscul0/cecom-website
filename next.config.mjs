import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  locales: ['en', 'es'],
  defaultLocale: 'en',
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
