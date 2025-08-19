'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Building, Users, Award, CheckCircle, Calendar, TrendingUp, Trophy, Star, Building2 } from 'lucide-react';
import { FeaturedPartners } from './FeaturedPartners';
import { AdditionalCertifications } from './AdditionalCertifications';

export function CompanyCredibility() {
  const t = useTranslations('CompanyCredibility');

  const stats = [
    {
      key: 'yearsExperience',
      icon: Calendar,
      value: '20+',
      suffix: ''
    },
    {
      key: 'successfulProjects',
      icon: Trophy,
      value: '500+',
      suffix: ''
    },
    {
      key: 'satisfiedClients',
      icon: Users,
      value: '200+',
      suffix: ''
    },
    {
      key: 'certifications',
      icon: Star,
      value: '15+',
      suffix: ''
    }
  ];

  const milestones = [
    {
      key: 'founded',
      year: '2004'
    },
    {
      key: 'firstExpansion',
      year: '2010'
    },
    {
      key: 'majorContract',
      year: '2015'
    },
    {
      key: 'modernization',
      year: '2020'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Company History */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
              <div className="relative bg-primary p-4 rounded-full shadow-lg">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-foreground ml-4">
              {t('history.title')}
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('history.description')}
          </p>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.key}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="relative bg-card rounded-xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                        <div className="relative bg-primary p-3 rounded-full shadow-lg">
                          <IconComponent className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.value}{stat.suffix}
                    </div>
                    
                    <p className="text-muted-foreground font-medium">
                      {t(`stats.${stat.key}`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            {t('timeline.title')}
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('timeline.description')}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.key}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {milestone.year}
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t(`timeline.milestones.${milestone.key}.title`)}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(`timeline.milestones.${milestone.key}.description`)}
                    </p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                
                <div className="w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Certifications & Achievements */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
              <div className="relative bg-primary p-4 rounded-full shadow-lg">
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground ml-4">
              {t('achievements.title')}
            </h3>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('achievements.description')}
          </p>

          <FeaturedPartners />
          <AdditionalCertifications />
        </div>
      </motion.div>
    </div>
  );
}
