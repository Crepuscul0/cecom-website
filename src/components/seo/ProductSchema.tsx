import { Product } from '@/lib/supabase-blog';

interface ProductSchemaProps {
  product: Product;
  locale: string;
}

export function ProductSchema({ product, locale }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - ${product.brand}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "model": product.model,
    "category": product.category,
    "image": product.image_url || product.external_image_url,
    "offers": product.price ? {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency || "DOP",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "CECOM",
        "url": "https://cecom.do"
      }
    } : undefined,
    "manufacturer": {
      "@type": "Organization",
      "name": product.brand
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
