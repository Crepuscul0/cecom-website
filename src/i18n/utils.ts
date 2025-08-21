import { defaultLocale } from './config';

export async function getMessages(locale: string = defaultLocale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    return (await import(`../../messages/${defaultLocale}.json`)).default;
  }
}
