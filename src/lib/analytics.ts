// Google Analytics 4 configuration
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(arguments);
  };

  window.gtag('js', new Date().toISOString());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track conversions (form submissions, contact requests, etc.)
export const trackConversion = (conversionId: string, data?: any) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    ...data,
  });
};

// Track blog engagement
export const trackBlogEvent = (action: 'view' | 'share' | 'comment', postSlug: string, category?: string) => {
  trackEvent(action, 'blog', `${category ? `${category}/` : ''}${postSlug}`);
};

// Track product interactions
export const trackProductEvent = (action: 'view' | 'inquiry' | 'download', productId: string, productName?: string) => {
  trackEvent(action, 'product', productName || productId);
};

// Track contact form submissions
export const trackContactForm = (formType: 'contact' | 'quote' | 'support') => {
  trackEvent('form_submit', 'contact', formType);
  trackConversion('contact_form', { form_type: formType });
};
