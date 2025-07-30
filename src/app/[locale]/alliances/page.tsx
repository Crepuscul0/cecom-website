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
    logo: '/logos/jabra',
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
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('ourAlliances')}
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            {t('partnerMessage')}
          </p>
        </div>
        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {alliances.map((alliance) => (
            <Card key={alliance.name}>
              <CardHeader>
                <div className="relative w-full h-40 bg-white rounded-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                  <Image
                    src={alliance.logo}
                    alt={alliance.name}
                    layout="fill"
                    objectFit="contain"
                    className="w-full h-full"
                  />
                </div>
                <CardTitle className="mt-6 text-sm text-gray-500">
                  <Link href="/contact">
                    <span className="absolute inset-0" />
                    {alliance.name}
                  </Link>
                </CardTitle>
                <CardDescription className="text-base font-semibold text-gray-900">
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
