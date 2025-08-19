'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function AdditionalCertifications() {
  const t = useTranslations('CompanyCredibility');
  const [showAllCertifications, setShowAllCertifications] = useState(false);

  return (
    <div className="border-t border-border pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-foreground">
          {t('achievements.otherCertifications')}
        </h4>
        <button
          onClick={() => setShowAllCertifications(!showAllCertifications)}
          className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
        >
          {showAllCertifications ? t('achievements.showLess') : t('achievements.viewMore')}
        </button>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out overflow-hidden ${
        showAllCertifications ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <motion.div
            key={item}
            className="flex items-center p-3 bg-muted rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: showAllCertifications ? 1 : 0, 
              scale: showAllCertifications ? 1 : 0.9 
            }}
            transition={{ duration: 0.3, delay: showAllCertifications ? item * 0.05 : 0 }}
          >
            <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
            <span className="text-foreground font-medium text-sm">
              {t(`achievements.items.item${item}`)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
