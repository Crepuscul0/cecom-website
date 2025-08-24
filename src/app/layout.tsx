import type { Metadata } from 'next';
import './[locale]/globals.css';
import { Analytics } from '@/components/Analytics';
import { WebVitals } from '@/components/performance/WebVitals';

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
      <head>
        <Analytics />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WV6M4MCS');`
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WV6M4MCS"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <WebVitals />
      </body>
    </html>
  );
}