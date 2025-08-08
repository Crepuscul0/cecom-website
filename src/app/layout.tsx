import type { Metadata } from 'next';
import './[locale]/globals.css';

export const metadata: Metadata = {
  title: 'CECOM - Technology Solutions',
  description:
    'Professional technology solutions for businesses in the Dominican Republic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}