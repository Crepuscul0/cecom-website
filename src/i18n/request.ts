import { getRequestConfig } from 'next-intl/server';
import { timeZone, locales, defaultLocale } from './config';
import { getCurrentTime } from '../lib/timezone';

export default getRequestConfig(async ({ locale }) => {
  // Validate and sanitize locale to prevent invalid imports
  const validLocale = locale && locales.includes(locale as any) 
    ? locale 
    : defaultLocale;
  
  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
    timeZone,
    now: getCurrentTime(),
  };
});