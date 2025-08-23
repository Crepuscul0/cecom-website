import type { Metadata } from 'next';
import './[locale]/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CECOM - Technology Solutions | Dominican Republic',
    template: '%s | CECOM'
  },
  description: 'Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic. Authorized distributor of Extreme Networks, WatchGuard, and more.',
  keywords: ['technology solutions', 'cybersecurity', 'networking', 'IT infrastructure', 'Dominican Republic', 'Extreme Networks', 'WatchGuard', 'enterprise solutions'],
  authors: [{ name: 'CECOM' }],
  creator: 'CECOM',
  publisher: 'CECOM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'es-DO': '/es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_DO'],
    url: '/',
    siteName: 'CECOM',
    title: 'CECOM - Technology Solutions | Dominican Republic',
    description: 'Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CECOM Technology Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CECOM - Technology Solutions | Dominican Republic',
    description: 'Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.',
    images: ['/hero-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logos/favicon.svg',
    shortcut: '/logos/favicon.svg',
    apple: '/logos/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}