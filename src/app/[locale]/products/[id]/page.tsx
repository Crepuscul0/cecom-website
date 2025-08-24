import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProduct } from '@/lib/supabase-blog';
import { ProductSchema } from '@/components/seo/ProductSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { trackProductEvent } from '@/lib/analytics';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | CECOM',
      description: 'El producto solicitado no fue encontrado.'
    };
  }

  return {
    title: `${product.name} | CECOM - Soluciones Tecnológicas`,
    description: product.description || `${product.name} - ${product.brand}`,
    keywords: `${product.name}, ${product.brand}, ${product.category}, equipos de red, tecnología empresarial`,
    openGraph: {
      title: `${product.name} | CECOM`,
      description: product.description || `${product.name} - ${product.brand}`,
      type: 'website',
      locale: locale,
      images: product.image_url || product.external_image_url ? [{
        url: product.image_url || product.external_image_url || '',
        width: 800,
        height: 600,
        alt: product.name,
      }] : undefined,
    },
    alternates: {
      canonical: `/${locale}/products/${id}`,
      languages: {
        'es': `/es/products/${id}`,
        'en': `/en/products/${id}`,
      }
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const product = await getProduct(id);
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  if (!product) {
    notFound();
  }

  const breadcrumbItems = [
    { name: t('home'), url: `/${locale}` },
    { name: t('products'), url: `/${locale}/products` },
    { name: product.name, url: `/${locale}/products/${id}` }
  ];

  return (
    <>
      {/* Schema.org structured data */}
      <ProductSchema product={product} locale={locale} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbItems.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="ml-1 text-sm font-medium text-muted-foreground md:ml-2">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url}
                      className="ml-1 text-sm font-medium text-primary hover:text-primary/80 md:ml-2"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                {(product.image_url || product.external_image_url) ? (
                  <Image
                    src={product.image_url || product.external_image_url || ''}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-muted-foreground">{t('noImage')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{product.brand}</Badge>
                  <Badge variant="outline">{product.category}</Badge>
                  {product.model && <Badge variant="outline">{product.model}</Badge>}
                </div>
              </div>

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('description')}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.price && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('pricing')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {product.currency || 'DOP'} ${product.price.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => trackProductEvent('inquiry', product.id, product.name)}
                >
                  {t('requestQuote')}
                </Button>
                
                {product.datasheet_url && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    asChild
                    onClick={() => trackProductEvent('download', product.id, product.name)}
                  >
                    <Link href={product.datasheet_url} target="_blank">
                      {t('downloadDatasheet')}
                    </Link>
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link href={`/${locale}/contact`}>
                    {t('contactExpert')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
