'use client';

import { useTranslations } from 'next-intl';
import { Target, Eye, Heart, Award, Lightbulb, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function MissionVisionValues() {
  const t = useTranslations('AboutUs');

  const values = [
    {
      key: 'excellence',
      icon: Award,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      key: 'innovation',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      shadowColor: 'shadow-yellow-500/25'
    },
    {
      key: 'integrity',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/25'
    },
    {
      key: 'commitment',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/25'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Mission and Vision - Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Mission */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <div className="relative bg-card dark:bg-card rounded-2xl p-8 h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative bg-primary p-4 rounded-full shadow-lg">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground ml-4 group-hover:text-primary transition-colors duration-300">
                {t('mission.title')}
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('mission.description')}
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <div className="relative bg-card dark:bg-card rounded-2xl p-8 h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative bg-primary p-4 rounded-full shadow-lg">
                  <Eye className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground ml-4 group-hover:text-primary transition-colors duration-300">
                {t('vision.title')}
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('vision.description')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Values Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
            <div className="relative bg-primary p-4 rounded-full shadow-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground ml-4">
            {t('values.title')}
          </h2>
        </div>
      </motion.div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => {
          const IconComponent = value.icon;
          return (
            <motion.div
              key={value.key}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="relative bg-card dark:bg-card rounded-xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                      <div className="relative bg-primary p-3 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 text-center group-hover:scale-105 transition-transform duration-300">
                    {t(`values.${value.key}.title`)}
                  </h3>
                  
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {t(`values.${value.key}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
