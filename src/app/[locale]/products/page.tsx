import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/lib/supabase-blog';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; brand?: string; search?: string }>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  return {
    title: `${t('title')} | CECOM - Soluciones Tecnológicas`,
    description: t('description'),
    keywords: 'productos tecnológicos, equipos de red, ciberseguridad, Extreme Networks, WatchGuard, República Dominicana',
    openGraph: {
      title: `${t('title')} | CECOM`,
      description: t('description'),
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        'es': '/es/products',
        'en': '/en/products',
      }
    }
  };
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const { category, brand, search } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  // Load products from Supabase
  const products = await getProducts({
    category,
    brand,
    status: 'active'
  });

  // Filter by search if provided
  const filteredProducts = search 
    ? products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <ProductFilters 
          locale={locale}
          currentCategory={category}
          currentBrand={brand}
          currentSearch={search}
        />

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                locale={locale as 'es' | 'en'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {t('noProducts')}
            </h3>
            <p className="text-muted-foreground">
              {t('noProductsDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
