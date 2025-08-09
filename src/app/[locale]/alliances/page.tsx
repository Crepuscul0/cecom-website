'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const alliances = [
  {
    name: '3CX',
    logo: '/logos/3cx.png',
    descriptionKey: 'alliances.3cx',
  },
  {
    name: 'Avaya',
    logo: '/logos/avaya.png',
    descriptionKey: 'alliances.avaya',
  },
  {
    name: 'Axis',
    logo: '/logos/axis.png',
    descriptionKey: 'alliances.axis',
  },
  {
    name: 'Cambium Networks',
    logo: '/logos/cambium.png',
    descriptionKey: 'alliances.cambium',
  },
  {
    name: 'Dahua',
    logo: '/logos/dahua.png',
    descriptionKey: 'alliances.dahua',
  },
  {
    name: 'Eset',
    logo: '/logos/eset.png',
    descriptionKey: 'alliances.eset',
  },
  {
    name: 'Extreme Networks',
    logo: '/logos/extreme.png',
    descriptionKey: 'alliances.extreme',
  },
  {
    name: 'Hewlett Packard',
    logo: '/logos/hp.png',
    descriptionKey: 'alliances.hp',
  },
  {
    name: 'Jabra',
    logo: '/logos/jabra.png',
    descriptionKey: 'alliances.jabra',
  },
  {
    name: 'Lenovo',
    logo: '/logos/lenovo.png',
    descriptionKey: 'alliances.lenovo',
  },
  {
    name: 'Panduit',
    logo: '/logos/panduit.png',
    descriptionKey: 'alliances.panduit',
  },
  {
    name: 'Vertiv',
    logo: '/logos/vertiv.png',
    descriptionKey: 'alliances.vertiv',
  },
  {
    name: 'WatchGuard',
    logo: '/logos/watchguard.png',
    descriptionKey: 'alliances.watchguard',
  },
  {
    name: 'weBoost',
    logo: '/logos/weboost.png',
    descriptionKey: 'alliances.weboost',
  },
];

export default function Alliances() {
  const t = useTranslations('Alliances');

  return (
    <div className="bg-muted">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            {t('ourAlliances')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('partnerMessage')}
          </p>
        </div>
        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {alliances.map((alliance) => (
            <Card key={alliance.name} className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg">
              <CardHeader className="p-6">
                <div className="relative w-full h-40 bg-gradient-to-br from-muted to-muted rounded-lg overflow-hidden flex items-center justify-center p-4 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                  <img
                    src={alliance.logo}
                    alt={alliance.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <CardTitle className="mt-4 text-lg font-bold text-foreground text-center">
                  <Link href="./contact" className="hover:text-primary transition-colors duration-200">
                    {alliance.name}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground text-center leading-relaxed">
                  {t(alliance.descriptionKey)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
