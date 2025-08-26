"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Home() {
  const t = useTranslations('Home');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';

  return (
    <div className="bg-background">
      <div className="relative bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat dark:brightness-90 dark:contrast-110">
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-background/70 via-background/60 to-background/70 dark:from-background/80 dark:via-background/70 dark:to-background/80"
          aria-hidden="true"
        />
        <main className="relative z-10 min-h-[calc(100dvh-80px)] flex items-center">
          <div className="mx-auto max-w-7xl w-full text-center">
            <div className="px-4 sm:px-8">
              <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">{t('title')}</span>{' '}
                <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {t('welcome')}
                </span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl md:mt-8">
                {t('description')}
              </p>
              
              {/* Products showcase text */}
              <div className="mt-8 max-w-2xl mx-auto p-6 bg-accent/50 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('productsShowcase')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('exploreProducts')}
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <div className="rounded-md shadow-lg">
                  <Link
                    href={`/${currentLocale}/solutions`}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
                  >
                    {t('getStarted')}
                  </Link>
                </div>
                <div className="rounded-md shadow-lg">
                  <Link
                    href={`/${currentLocale}/contact`}
                    className="w-full flex items-center justify-center px-8 py-3 border border-primary/20 text-base font-medium rounded-md text-primary bg-background hover:bg-accent transition-all duration-200 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
                  >
                    {t('liveDemo')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

