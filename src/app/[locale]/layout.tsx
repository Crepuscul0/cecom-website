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
  params: { locale: string };
}) {
  const messages = await getMessages();
  const { locale } = params;
  if (!['en', 'es'].includes(locale)) notFound();

  return (
    <Providers messages={messages} locale={locale}>
      {children}
    </Providers>
  );
}
