'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { gtmEvent } from '@/lib/gtm';

export function WebVitals() {
  useEffect(() => {
    // Track Core Web Vitals using the new API
    onCLS((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'CLS',
        value: Math.round(metric.value * 1000),
        custom_parameter_1: metric.rating,
      });
    });

    // INP replaced FID in newer versions
    onINP((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'INP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onFCP((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'FCP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onLCP((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'LCP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onTTFB((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'TTFB',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });
  }, []);

  return null;
}
