import { Providers } from '@/components/providers';
import Header from '@/components/header';
import { getMessages } from 'next-intl/server';
import { timeZone } from '@/i18n/config';
import { getCurrentTime } from '@/lib/timezone';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
