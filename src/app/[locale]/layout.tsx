import './globals.css';
import { Providers } from '@/components/providers';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Cecom',
  description: 'Cecom',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  if (!['en', 'es'].includes(locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body className="bg-white text-gray-900 antialiased" suppressHydrationWarning>
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
