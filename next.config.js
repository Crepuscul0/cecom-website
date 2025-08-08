// Set timezone early in the process
process.env.TZ = 'America/Santo_Domingo';

const withNextIntl = require('next-intl/plugin')(
  // This is the default path to your i18n config file
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Ensure timezone is available as environment variable
    TZ: 'America/Santo_Domingo',
  }
}

module.exports = withNextIntl(nextConfig);