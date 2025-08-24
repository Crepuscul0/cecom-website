// Google Tag Manager configuration
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const initGTM = () => {
  if (!GTM_ID) return;

  // GTM script
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);
};

// GTM event tracking
export const gtmEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!GTM_ID || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...parameters,
  });
};

// Specific GTM events for CECOM
export const gtmTrackPageView = (pagePath: string, pageTitle: string) => {
  gtmEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

export const gtmTrackContactForm = (formType: string) => {
  gtmEvent('form_submit', {
    form_type: formType,
    event_category: 'engagement',
    event_label: 'contact_form',
  });
};

export const gtmTrackProductView = (productId: string, productName: string, category: string) => {
  gtmEvent('view_item', {
    item_id: productId,
    item_name: productName,
    item_category: category,
    event_category: 'ecommerce',
  });
};

export const gtmTrackBlogRead = (postSlug: string, postTitle: string, category: string) => {
  gtmEvent('blog_read', {
    post_slug: postSlug,
    post_title: postTitle,
    post_category: category,
    event_category: 'content',
  });
};
