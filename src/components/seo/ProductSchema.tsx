import { CatalogProduct } from '@/lib/supabase/api';

interface ProductSchemaProps {
  product: CatalogProduct;
  locale: string;
}

export function ProductSchema({ product, locale }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - ${product.brand ?? product.vendor?.name ?? ''}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand ?? product.vendor?.name ?? 'CECOM'
    },
    "model": product.model ?? undefined,
    "category": product.category?.name,
    "image": product.image?.url,
    "offers": product.price != null ? {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency || 'DOP',
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "CECOM",
        "url": "https://cecom.do"
      }
    } : undefined,
    "manufacturer": {
      "@type": "Organization",
      "name": product.brand ?? product.vendor?.name ?? 'CECOM'
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  };

  // Remove undefined properties
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 2)
      }}
    />
  );
}
