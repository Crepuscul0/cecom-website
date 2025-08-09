import { Pathnames, LocalePrefix } from 'next-intl/routing';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'es'] as const;

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/about': {
    en: '/about',
    es: '/nosotros'
  },
  '/contact': {
    en: '/contact', 
    es: '/contacto'
  },
  '/solutions': {
    en: '/solutions',
    es: '/soluciones'
  },
  '/alliances': {
    en: '/alliances',
    es: '/alianzas'
  }
};

export const localePrefix: LocalePrefix<typeof locales> = 'always';

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

// Global timezone configuration (env-driven with safe default)
export const timeZone = process.env.TZ || 'America/Santo_Domingo';