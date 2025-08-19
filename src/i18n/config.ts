import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'es'] as const;

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    messages
  };
});

// Global timezone configuration (env-driven with safe default)
export const timeZone = process.env.TZ || 'America/Santo_Domingo';