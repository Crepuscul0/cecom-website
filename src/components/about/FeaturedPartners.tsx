'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { useTranslations } from 'next-intl';

export function FeaturedPartners() {
  const t = useTranslations('CompanyCredibility');

  const featuredPartners = [
    { name: 'Extreme Networks', logo: '/logos/extreme.png', key: 'extreme' },
    { name: 'WatchGuard', logo: '/logos/watchguard.svg', key: 'watchguard' },
    { name: 'Vertiv', logo: '/logos/vertiv.svg', key: 'vertiv' },
    { name: 'Avaya', logo: '/logos/avaya.jpg', key: 'avaya' }
  ];

  return (
    <div className="mb-8">
      <h4 className="text-xl font-semibold text-foreground mb-6">
        {t('achievements.featuredPartners')}
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {featuredPartners.map((partner, index) => (
          <motion.div
            key={partner.key}
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-muted rounded-xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="w-full flex-grow flex items-center justify-center">
                  <Logo logo={partner.logo} name={partner.name} />
                </div>
                <h5 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mt-4">
                  {partner.name}
                </h5>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
