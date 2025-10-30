import { useTranslations } from 'next-intl';
import { Network, Shield, Phone, Server } from 'lucide-react';
import Link from 'next/link';

export default function SolutionsSection() {
  const t = useTranslations('Home.solutions');
  const tCommon = useTranslations('Home');

  const solutions = [
    {
      icon: Network,
      title: t('networking.title'),
      description: t('networking.description'),
    },
    {
      icon: Shield,
      title: t('security.title'),
      description: t('security.description'),
    },
    {
      icon: Phone,
      title: t('communications.title'),
      description: t('communications.description'),
    },
    {
      icon: Server,
      title: t('infrastructure.title'),
      description: t('infrastructure.description'),
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <div
                key={index}
                className="relative group overflow-hidden rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-300 hover:border-primary/50"
              >
                <div className="p-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {solution.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/solutions"
            className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            {tCommon('liveDemo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
