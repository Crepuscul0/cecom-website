"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <div className="bg-white min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <main className="lg:relative">
          <div className="mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left">
            <div className="px-4 lg:w-1/2 sm:px-8 xl:pr-16">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">{t('title')}</span>{' '}
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent xl:inline">
                  {t('welcome')}
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl">
                {t('description')}
              </p>
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                <div className="rounded-md shadow-lg">
                  <Link
                    href="./contact"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
                  >
                    {t('getStarted')}
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow-lg sm:mt-0">
                  <Link
                    href="./solutions"
                    className="w-full flex items-center justify-center px-8 py-3 border border-blue-200 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
                  >
                    {t('liveDemo')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
            <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 to-transparent z-10"></div>
            <img
              className="absolute inset-0 w-full h-full object-cover rounded-l-3xl lg:rounded-l-none"
              src="/hero-image.jpg"
              alt="Professional team working with technology"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

