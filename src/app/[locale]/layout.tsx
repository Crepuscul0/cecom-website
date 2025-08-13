import { Providers } from '@/components/providers';
import { AdminLink } from '@/components/AdminLink';
import { getMessages } from 'next-intl/server';
import { timeZone } from '@/i18n/config';
import { getCurrentTime } from '@/lib/timezone';
import { notFound } from 'next/navigation';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['en', 'es'].includes(locale)) notFound();
  const messages = await getMessages({ locale });

  return (
    <Providers messages={messages} locale={locale} timeZone={timeZone} now={getCurrentTime()}>
      {children}
      <AdminLink />
    </Providers>
  );
}
