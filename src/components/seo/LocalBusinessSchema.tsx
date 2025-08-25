interface LocalBusinessSchemaProps {
  locale: string;
}

export function LocalBusinessSchema({ locale }: LocalBusinessSchemaProps) {
  const isSpanish = locale === 'es';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CECOM",
    "description": isSpanish 
      ? "Proveedor líder de soluciones tecnológicas profesionales, ciberseguridad, redes e infraestructura IT para empresas en República Dominicana"
      : "Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic",
    "url": "https://cecom.com.do",
    "logo": "https://cecom.com.do/logos/cecom-logo.svg",
    "image": "https://cecom.com.do/hero-image.jpg",
    "telephone": "+1-809-688-4491", // Replace with actual phone
    "email": "info@cecom.do",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal #123", // Replace with actual address
      "addressLocality": "Santo Domingo",
      "addressRegion": "Distrito Nacional",
      "postalCode": "10101",
      "addressCountry": "DO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "18.4861", // Santo Domingo coordinates
      "longitude": "-69.9312"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "12:00"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/cecom-do",
      "https://www.facebook.com/cecom.do",
      "https://twitter.com/cecom_do"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Dominican Republic"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": isSpanish ? "Soluciones Tecnológicas" : "Technology Solutions",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": isSpanish ? "Ciberseguridad" : "Cybersecurity",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "WatchGuard Firewalls"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog", 
          "name": isSpanish ? "Redes y Conectividad" : "Networking",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Extreme Networks Solutions"
              }
            }
          ]
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "25",
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": "$$",
    "currenciesAccepted": "DOP, USD",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}
