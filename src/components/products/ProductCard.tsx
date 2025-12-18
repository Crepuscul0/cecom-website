import Image from 'next/image';
import Link from 'next/link';
import { CatalogProduct } from '@/lib/supabase/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: CatalogProduct;
  locale: 'es' | 'en';
  priority?: boolean;
}

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const isSpanish = locale === 'es';
  const brandLabel = product.brand || product.vendor?.name;
  const categoryLabel = product.category?.name;
  const imageSrc = product.image?.url;

  return (
    <Card className="relative h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
      {/* Full-card clickable overlay */}
      <Link
        href={`/${locale}/products/${product.id}`}
        aria-label={`${product.name} - ${isSpanish ? 'Ver detalles' : 'View details'}`}
        className="absolute inset-0 z-10"
      />
      <CardHeader className="p-4">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-3">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground text-sm">
                {isSpanish ? 'Sin imagen' : 'No image'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            <Link
              href={`/${locale}/products/${product.id}`}
              className="hover:underline"
              aria-label={`${product.name} - ${isSpanish ? 'Ver detalles' : 'View details'}`}
            >
              {product.name}
            </Link>
          </h3>

          <div className="flex flex-wrap gap-1">
            {brandLabel && (
              <Badge variant="secondary" className="text-xs">
                {brandLabel}
              </Badge>
            )}
            {categoryLabel && (
              <Badge variant="outline" className="text-xs">
                {categoryLabel}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
            {product.description}
          </p>
        )}

        {product.price != null && (
          <div className="mb-4">
            <span className="text-lg font-bold text-primary">
              {product.currency || 'DOP'} ${product.price.toLocaleString()}
            </span>
          </div>
        )}

        <div className="space-y-2 mt-auto relative z-20">
          <Button asChild className="w-full">
            <Link href={`/${locale}/products/${product.id}`}>
              {isSpanish ? 'Ver detalles' : 'View details'}
            </Link>
          </Button>

          <Button variant="outline" size="sm" className="w-full">
            {isSpanish ? 'Solicitar cotización' : 'Request quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
