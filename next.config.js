const withNextIntl = require('next-intl/plugin')(
  // This is the default path to your i18n config file
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}

module.exports = withNextIntl(nextConfig);