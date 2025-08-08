import { Providers } from '@/components/providers';
import { getMessages } from 'next-intl/server';
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
  const messages = await getMessages();

  return (
    <Providers messages={messages} locale={locale}>
      {children}
    </Providers>
  );
}
