import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/supabase-blog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  locale: 'es' | 'en';
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const isSpanish = locale === 'es';

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-3">
          {(product.image_url || product.external_image_url) ? (
            <Image
              src={product.image_url || product.external_image_url || ''}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            {product.name}
          </h3>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {product.brand}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
            {product.description}
          </p>
        )}

        {product.price && (
          <div className="mb-4">
            <span className="text-lg font-bold text-primary">
              {product.currency || 'DOP'} ${product.price.toLocaleString()}
            </span>
          </div>
        )}

        <div className="space-y-2 mt-auto">
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
