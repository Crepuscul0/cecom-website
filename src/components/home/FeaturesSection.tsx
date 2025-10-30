import { useTranslations } from 'next-intl';
import { Headphones, Award, Wrench, Truck } from 'lucide-react';

export default function FeaturesSection() {
  const t = useTranslations('Home.features');

  const features = [
    {
      icon: Headphones,
      title: t('expertSupport.title'),
      description: t('expertSupport.description'),
    },
    {
      icon: Award,
      title: t('trustedBrands.title'),
      description: t('trustedBrands.description'),
    },
    {
      icon: Wrench,
      title: t('customSolutions.title'),
      description: t('customSolutions.description'),
    },
    {
      icon: Truck,
      title: t('fastDelivery.title'),
      description: t('fastDelivery.description'),
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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative group bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
