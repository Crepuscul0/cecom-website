import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function PartnersSection() {
  const t = useTranslations('Home.partners');

  const partners = [
    { name: 'WatchGuard', logo: '/logos/watchguard.svg' },
    { name: 'Extreme Networks', logo: '/logos/extreme.svg' },
    { name: 'HP', logo: '/logos/hp.svg' },
    { name: 'Lenovo', logo: '/logos/lenovo.svg' },
    { name: 'Panduit', logo: '/logos/panduit.svg' },
    { name: 'Vertiv', logo: '/logos/vertiv.svg' },
    { name: '3CX', logo: '/logos/3cx.png' },
    { name: 'ESET', logo: '/logos/eset.svg' },
    { name: 'Axis', logo: '/logos/axis.svg' },
    { name: 'Cambium', logo: '/logos/cambium.svg' },
    { name: 'Dahua', logo: '/logos/dahua.svg' },
    { name: 'weBoost', logo: '/logos/weboost.svg' },
  ];

  return (
    <section className="py-16 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
            >
              <div className="relative w-full h-16 grayscale group-hover:grayscale-0 dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0 transition-all duration-300">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
