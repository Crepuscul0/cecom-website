import { getRequestConfig } from 'next-intl/server';
import { timeZone } from './config';
import { getCurrentTime } from '../lib/timezone';

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? 'en',
  messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  timeZone,
  now: getCurrentTime(),
}));