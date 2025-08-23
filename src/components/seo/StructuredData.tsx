'use client'

interface OrganizationSchemaProps {
  locale: string
}

interface ArticleSchemaProps {
  title: string
  description: string
  publishedDate: string
  modifiedDate?: string
  author: string
  locale: string
  slug: string
  imageUrl?: string
}

interface LocalBusinessSchemaProps {
  locale: string
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CECOM",
    "alternateName": "CECOM Technology Solutions",
    "url": `${baseUrl}/${locale}`,
    "logo": `${baseUrl}/logos/cecom-logo.png`,
    "description": locale === 'es' 
      ? "Proveedor líder de soluciones tecnológicas profesionales, ciberseguridad, redes e infraestructura TI para empresas en República Dominicana."
      : "Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "DO",
      "addressRegion": "Santo Domingo",
      "addressLocality": "Santo Domingo"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/cecom-do",
      "https://www.facebook.com/cecom.do"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}

export function ArticleSchema({ 
  title, 
  description, 
  publishedDate, 
  modifiedDate, 
  author, 
  locale, 
  slug,
  imageUrl 
}: ArticleSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": `${baseUrl}/${locale}/blog/${slug}`,
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "CECOM",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logos/cecom-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/${locale}/blog/${slug}`
    },
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  )
}

export function LocalBusinessSchema({ locale }: LocalBusinessSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CECOM",
    "description": locale === 'es'
      ? "Soluciones tecnológicas profesionales en República Dominicana"
      : "Professional technology solutions in Dominican Republic",
    "url": `${baseUrl}/${locale}`,
    "telephone": "+1-809-XXX-XXXX", // TODO: Add real phone number
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal #123", // TODO: Add real address
      "addressLocality": "Santo Domingo",
      "addressRegion": "Distrito Nacional",
      "postalCode": "10101",
      "addressCountry": "DO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 18.4861,
      "longitude": -69.9312
    },
    "openingHoursSpecification": {
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
    "priceRange": "$$",
    "servesCuisine": null,
    "acceptsReservations": false
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
    />
  )
}

export function WebsiteSchema({ locale }: { locale: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CECOM",
    "url": `${baseUrl}/${locale}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${locale}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  )
}
